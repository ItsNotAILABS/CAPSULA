/**
 * canister-host.worker.ts — Web Worker that hosts one WASM canister core.
 *
 * MECHANICS ONLY. This worker:
 *   - receives raw WASM bytes via postMessage (transferred, zero-copy),
 *   - re-verifies the SHA-256 itself before compiling,
 *   - inspects the module's imports BEFORE instantiating: a core that
 *     imports anything other than `env.memory` fails with a clear error
 *     listing the missing imports (the page cannot supply function
 *     imports — functions don't survive postMessage structured clone),
 *   - builds `env.memory` from the manifest's memory hints when imported,
 *   - instantiates the module and reports its exports,
 *   - serves single-shot `infer` RPCs,
 *   - serves reasoning sessions: `session_start` / `generate` (streamed
 *     `token` messages) / `session_end`, with `cancel` for in-flight
 *     generations.
 *
 * Reasoning core export contract (all optional as a set; if
 * `canister_session_start` is absent the core is honestly reported as
 * not supporting sessions):
 *   canister_session_start() -> i32          handle (>0), <=0 = failure
 *   canister_session_step(handle, token) -> i32
 *       advance one step on `token` (used both to ingest prompt tokens
 *       and to produce the next token); returns the next token, or a
 *       negative value to signal end-of-stream.
 *   canister_session_end(handle) -> i32      0 ok; optional
 *
 * It knows nothing about weights: the page downloads and verifies those
 * (see downloader.ts). A future real core will map weight bytes into the
 * module's linear memory; today the synthetic demo core just answers.
 *
 * Runs as a module worker: new Worker(url, { type: 'module' }).
 */

import {
  isHostMessage,
  PROTOCOL_VERSION,
  type CancelledReply,
  type EndedReply,
  type ErrorReply,
  type GenerateSummary,
  type HostMessage,
  type PongReply,
  type ReadyReply,
  type SessionReadyReply,
  type TokenMessage,
  type ResultReply,
  type WorkerMessage,
} from '../protocol.ts';
import { sha256Hex } from '../hash.ts';
import type { CanisterMemoryHints } from '../manifest.ts';

/** Minimal worker-global surface; avoids DOM/WebWorker lib conflicts. */
interface WorkerScope {
  onmessage: ((event: { data: unknown }) => void) | null;
  postMessage(message: unknown, transfer?: Transferable[]): void;
}

const scope = globalThis as unknown as WorkerScope;

let instance: WebAssembly.Instance | null = null;

interface SessionState {
  handle: number;
}

const sessions = new Map<string, SessionState>();
/** In-flight generate requestIds -> cancellation flags. */
const inflightGenerates = new Map<string, { cancelled: boolean }>();
let sessionCounter = 0;

function post(msg: WorkerMessage): void {
  scope.postMessage(msg);
}

function fail(requestId: string, message: string): void {
  const reply: ErrorReply = { kind: 'error', v: PROTOCOL_VERSION, requestId, message };
  post(reply);
}

/** Yield to the event loop so a posted `cancel` can be processed mid-generation. */
const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

function buildMemory(hints: CanisterMemoryHints | undefined): WebAssembly.Memory {
  const initial = hints?.initialPages ?? 16;
  const maximum = hints?.maximumPages;
  if (maximum !== undefined && maximum < initial) {
    throw new Error(
      `worker: memory hints invalid: maximumPages (${maximum}) < initial pages (${initial})`,
    );
  }
  return new WebAssembly.Memory(
    maximum === undefined ? { initial } : { initial, maximum },
  );
}

async function handleInit(
  requestId: string,
  wasmBytes: ArrayBuffer,
  wasmSha256: string,
  memoryHints: CanisterMemoryHints | undefined,
): Promise<void> {
  try {
    // Defense in depth: the page already verified, the worker verifies again.
    const digest = await sha256Hex(wasmBytes);
    if (digest !== wasmSha256.toLowerCase()) {
      fail(requestId, 'worker: wasm sha256 mismatch — refusing to instantiate');
      return;
    }
    const mod = await WebAssembly.compile(wasmBytes);

    // Inspect imports BEFORE instantiating: a real core with imports dies
    // with a confusing LinkError otherwise. The page cannot supply function
    // imports (functions don't survive structured clone), so anything the
    // host can't synthesize is a loud, actionable failure.
    const imports = WebAssembly.Module.imports(mod);
    const importObject: Record<string, Record<string, WebAssembly.Memory>> = {};
    const missing: string[] = [];
    for (const imp of imports) {
      if (imp.module === 'env' && imp.kind === 'memory') {
        (importObject['env'] ??= {}).memory = buildMemory(memoryHints);
      } else {
        missing.push(`${imp.module}.${imp.name as string}`);
      }
    }
    if (missing.length > 0) {
      fail(
        requestId,
        `worker: core requires imports the host cannot supply: ${missing.join(
          ', ',
        )} — rebuild the core with no imports, or vendor them into the module`,
      );
      return;
    }

    instance = await WebAssembly.instantiate(mod, importObject);
    const reply: ReadyReply = {
      kind: 'ready',
      v: PROTOCOL_VERSION,
      requestId,
      exports: Object.keys(instance.exports),
    };
    post(reply);
  } catch (e) {
    fail(requestId, e instanceof Error ? e.message : String(e));
  }
}

function handleSessionStart(requestId: string, _params: Record<string, unknown>): void {
  if (!instance) {
    fail(requestId, 'worker: canister not initialized — send init first');
    return;
  }
  const startFn = (instance.exports as Record<string, unknown>)['canister_session_start'];
  if (typeof startFn !== 'function') {
    fail(
      requestId,
      'worker: reasoning sessions not supported by this core ' +
        '(missing canister_session_start export)',
    );
    return;
  }
  let handle: number;
  try {
    handle = (startFn as () => number)();
  } catch (e) {
    fail(
      requestId,
      `worker: canister_session_start threw: ${e instanceof Error ? e.message : String(e)}`,
    );
    return;
  }
  if (!Number.isInteger(handle) || handle <= 0) {
    fail(
      requestId,
      `worker: canister_session_start returned an invalid handle (${String(handle)})`,
    );
    return;
  }
  sessionCounter += 1;
  const sessionId = `sess-${sessionCounter}`;
  sessions.set(sessionId, { handle });
  const reply: SessionReadyReply = {
    kind: 'session_ready',
    v: PROTOCOL_VERSION,
    requestId,
    sessionId,
  };
  post(reply);
}

async function handleGenerate(
  requestId: string,
  sessionId: string,
  tokens: number[],
  maxTokens: number,
  stopTokens: number[] | undefined,
): Promise<void> {
  const sess = sessions.get(sessionId);
  if (!sess) {
    fail(requestId, `worker: unknown session "${sessionId}"`);
    return;
  }
  if (!instance) {
    fail(requestId, 'worker: canister not initialized — send init first');
    return;
  }
  const stepFn = (instance.exports as Record<string, unknown>)['canister_session_step'];
  if (typeof stepFn !== 'function') {
    fail(
      requestId,
      'worker: session started but canister_session_step export is missing — ' +
        'the core does not implement the full reasoning contract',
    );
    return;
  }
  const step = stepFn as (handle: number, token: number) => number;
  const stop = new Set(stopTokens ?? []);
  const flag = { cancelled: false };
  inflightGenerates.set(requestId, flag);

  try {
    // Ingest prompt tokens through the stepper so the core's state advances.
    let prev = 0;
    for (const t of tokens) {
      prev = step(sess.handle, t);
      if (prev < 0 || flag.cancelled) break;
    }

    const generated: number[] = [];
    let stopReason: GenerateSummary['stopReason'] = flag.cancelled
      ? 'cancelled'
      : 'maxTokens';
    if (!flag.cancelled) {
      for (let i = 0; i < maxTokens; i++) {
        await tick(); // let a posted cancel land between tokens
        if (flag.cancelled) {
          stopReason = 'cancelled';
          break;
        }
        const next = step(sess.handle, prev);
        if (next < 0) {
          stopReason = 'endOfStream';
          break;
        }
        generated.push(next);
        const tokenMsg: TokenMessage = {
          kind: 'token',
          v: PROTOCOL_VERSION,
          requestId,
          sessionId,
          token: next,
          index: i,
          done: false,
        };
        post(tokenMsg);
        if (stop.has(next)) {
          stopReason = 'stopToken';
          break;
        }
        prev = next;
      }
    }

    const summary: GenerateSummary = { sessionId, tokens: generated, stopReason };
    const reply: ResultReply = {
      kind: 'result',
      v: PROTOCOL_VERSION,
      requestId,
      output: summary,
    };
    post(reply);
  } catch (e) {
    fail(requestId, e instanceof Error ? e.message : String(e));
  } finally {
    inflightGenerates.delete(requestId);
  }
}

function handleSessionEnd(requestId: string, sessionId: string): void {
  const sess = sessions.get(sessionId);
  if (!sess) {
    fail(requestId, `worker: unknown session "${sessionId}"`);
    return;
  }
  if (instance) {
    const endFn = (instance.exports as Record<string, unknown>)['canister_session_end'];
    if (typeof endFn === 'function') {
      try {
        (endFn as (handle: number) => number)(sess.handle);
      } catch {
        // Best effort: a throwing end must not leak the session entry.
      }
    }
  }
  sessions.delete(sessionId);
  const reply: EndedReply = {
    kind: 'ended',
    v: PROTOCOL_VERSION,
    requestId,
    sessionId,
  };
  post(reply);
}

function handleCancel(requestId: string, targetRequestId: string): void {
  const flag = inflightGenerates.get(targetRequestId);
  if (flag) flag.cancelled = true;
  const reply: CancelledReply = {
    kind: 'cancelled',
    v: PROTOCOL_VERSION,
    requestId,
    targetRequestId,
    cancelled: flag !== undefined,
  };
  post(reply);
}

async function handle(msg: HostMessage): Promise<void> {
  switch (msg.kind) {
    case 'ping': {
      const reply: PongReply = { kind: 'pong', v: PROTOCOL_VERSION, requestId: msg.requestId };
      post(reply);
      return;
    }
    case 'init':
      await handleInit(msg.requestId, msg.wasmBytes, msg.wasmSha256, msg.memory);
      return;
    case 'infer': {
      if (!instance) {
        fail(msg.requestId, 'worker: canister not initialized — send init first');
        return;
      }
      const fn = (instance.exports as Record<string, unknown>)['infer'];
      if (typeof fn !== 'function') {
        fail(
          msg.requestId,
          'worker: synthetic core has no "infer" export — no real inference is wired',
        );
        return;
      }
      try {
        const output = (fn as (...args: number[]) => unknown)(...(msg.input ?? []));
        const reply: ResultReply = {
          kind: 'result',
          v: PROTOCOL_VERSION,
          requestId: msg.requestId,
          output,
        };
        post(reply);
      } catch (e) {
        fail(msg.requestId, e instanceof Error ? e.message : String(e));
      }
      return;
    }
    case 'session_start':
      handleSessionStart(msg.requestId, msg.params);
      return;
    case 'generate':
      await handleGenerate(
        msg.requestId,
        msg.sessionId,
        msg.tokens,
        msg.maxTokens,
        msg.stopTokens,
      );
      return;
    case 'session_end':
      handleSessionEnd(msg.requestId, msg.sessionId);
      return;
    case 'cancel':
      handleCancel(msg.requestId, msg.targetRequestId);
      return;
  }
}

scope.onmessage = (event: { data: unknown }): void => {
  const msg = event.data;
  // Without a valid envelope there is no requestId to route an error to.
  if (!isHostMessage(msg)) return;
  void handle(msg).catch((e: unknown) => {
    fail(msg.requestId, e instanceof Error ? e.message : String(e));
  });
};
