/**
 * loader.ts — one-call canister bootstrap for the page.
 *
 *   const handle = await loadCanister('/canister/avatar-phone.json', {
 *     onProgress,            // bytes loaded / total across wasm + weights
 *     createWorker,          // optional; defaults to the bundled worker file
 *   });
 *   const out = await handle.infer([1, 2, 3]);
 *
 *   // Reasoning workloads:
 *   const session = await handle.createSession({});
 *   const summary = await session.generate([10, 20], {
 *     maxTokens: 32,
 *     onToken: (token, index) => render(token),
 *     signal: abortController.signal,   // aborts -> worker gets `cancel`
 *   });
 *   await session.end();
 *   handle.terminate();
 *
 * Steps: fetch + validate manifest -> fetch + verify WASM core ->
 * spawn worker, transfer WASM bytes, await ready -> download + verify +
 * cache weight shards. Any integrity failure aborts before instantiate.
 *
 * Cancellation: an internal lifetime controller is combined with the
 * user's signal (and a 15s timeout on the manifest fetch when the user
 * passes no signal). terminate() aborts the lifetime controller, so any
 * in-flight fetch — manifest, wasm, or weight shards — is torn down.
 *
 * Bundler note: the default worker URL is
 *   new URL('./worker/canister-host.worker.js', import.meta.url)
 * which is correct for the compiled dist layout. With Vite, prefer passing
 *   createWorker: () => new Worker(new URL('./worker/canister-host.worker.ts', import.meta.url), { type: 'module' })
 * so the worker is bundled with the app.
 */

import { sha256Hex } from './hash.ts';
import { validateManifest, type CanisterManifest } from './manifest.ts';
import { combineSignals, timeoutSignal } from './signals.ts';
import {
  downloadWeights,
  type CacheLike,
  type DownloadedShard,
  type ProgressSnapshot,
} from './downloader.ts';
import {
  isGenerateSummary,
  isWorkerMessage,
  newRequestId,
  PROTOCOL_VERSION,
  type CancelRequest,
  type ErrorReply,
  type GenerateRequest,
  type GenerateSummary,
  type HostMessage,
  type InferRequest,
  type InitRequest,
  type PingRequest,
  type ReadyReply,
  type SessionParams,
  type SessionReadyReply,
  type SessionStartRequest,
  type TokenMessage,
  type WorkerMessage,
} from './protocol.ts';

/** Minimal Worker surface the loader needs (the DOM Worker satisfies this). */
export interface MinimalWorker {
  postMessage(message: unknown, transfer?: Transferable[]): void;
  // `any` event here is deliberate DOM interop: the DOM Worker's onmessage
  // takes a MessageEvent while test fakes post plain { data } objects.
  onmessage: ((event: any) => void) | null; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Set by the loader: on a worker crash every pending RPC fails loudly. */
  onerror: ((event: any) => void) | null; // eslint-disable-line @typescript-eslint/no-explicit-any
  terminate(): void;
}

export type CreateWorker = () => MinimalWorker;

export interface LoadOptions {
  onProgress?: (p: ProgressSnapshot) => void;
  fetchImpl?: typeof fetch;
  cache?: CacheLike | null;
  signal?: AbortSignal;
  createWorker?: CreateWorker;
  initTimeoutMs?: number;
  inferTimeoutMs?: number;
  /** Timeout for a generate() stream. Defaults to inferTimeoutMs. */
  generateTimeoutMs?: number;
}

export interface GenerateOptions {
  maxTokens?: number;
  stopTokens?: number[];
  onToken?: (token: number, index: number) => void;
  /** Aborting sends `cancel` for the in-flight generate and rejects. */
  signal?: AbortSignal;
}

export interface ReasoningSession {
  readonly id: string;
  generate(tokens: number[], options?: GenerateOptions): Promise<GenerateSummary>;
  end(): Promise<void>;
}

export interface CanisterHandle {
  readonly manifest: CanisterManifest;
  /** Names exported by the instantiated WASM core (e.g. ["infer", "memory"]). */
  readonly wasmExports: string[];
  /** Weight shards in manifest order, with bytes (post-download). */
  readonly shards: DownloadedShard[];
  infer(input?: number[]): Promise<unknown>;
  ping(): Promise<void>;
  /**
   * Open a reasoning session against the core. Throws when the core does
   * not export canister_session_start (honest "not supported" from the
   * worker, not a hang).
   */
  createSession(params?: SessionParams): Promise<ReasoningSession>;
  terminate(): void;
}

function defaultCreateWorker(): MinimalWorker {
  const url = new URL('./worker/canister-host.worker.js', import.meta.url);
  return new Worker(url, { type: 'module' }) as unknown as MinimalWorker;
}

interface RpcPending {
  mode: 'rpc';
  resolve: (m: WorkerMessage) => void;
  reject: (e: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

interface StreamPending {
  mode: 'stream';
  onToken: (token: number, index: number) => void;
  resolve: (m: WorkerMessage) => void;
  reject: (e: Error) => void;
  timer: ReturnType<typeof setTimeout>;
  cleanup: () => void;
}

type Pending = RpcPending | StreamPending;

function asError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}

export async function loadCanister(
  manifestUrl: string,
  options: LoadOptions = {},
): Promise<CanisterHandle> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const createWorker = options.createWorker ?? defaultCreateWorker;
  const initTimeoutMs = options.initTimeoutMs ?? 30_000;
  const inferTimeoutMs = options.inferTimeoutMs ?? 120_000;
  const generateTimeoutMs = options.generateTimeoutMs ?? inferTimeoutMs;
  const onProgress = options.onProgress;

  // Lifetime controller: aborted by terminate(). Combined with the user's
  // signal (and a manifest-fetch timeout) for every fetch below, so
  // terminate() tears down in-flight downloads instead of orphaning them.
  const lifetime = new AbortController();
  const manifestSignal = combineSignals([
    options.signal,
    options.signal === undefined ? timeoutSignal(15_000) : undefined,
    lifetime.signal,
  ]);
  const transferSignal = combineSignals([options.signal, lifetime.signal]);

  // 1. Manifest (own timeout when the caller passes no signal).
  const manifestRes = await fetchImpl(manifestUrl, { signal: manifestSignal });
  if (!manifestRes.ok) {
    throw new Error(`manifest fetch failed: HTTP ${manifestRes.status} (${manifestUrl})`);
  }
  const manifest: CanisterManifest = validateManifest(await manifestRes.json());

  // 2. WASM core bytes (small; fetched whole, verified before instantiate).
  onProgress?.({
    loadedBytes: 0,
    totalBytes: 1,
    doneShards: 0,
    totalShards: 1,
    label: 'wasm',
    currentShard: 'core.wasm',
  });
  const wasmRes = await fetchImpl(manifest.wasmUrl, { signal: transferSignal });
  if (!wasmRes.ok) {
    throw new Error(`wasm fetch failed: HTTP ${wasmRes.status} (${manifest.wasmUrl})`);
  }
  const wasmBytes = new Uint8Array(await wasmRes.arrayBuffer());
  if (wasmBytes.byteLength === 0) {
    throw new Error('wasm core is empty — refusing to instantiate');
  }
  const wasmDigest = await sha256Hex(wasmBytes);
  if (wasmDigest !== manifest.wasmSha256) {
    throw new Error('wasm sha256 mismatch — refusing to instantiate');
  }
  onProgress?.({
    loadedBytes: 1,
    totalBytes: 1,
    doneShards: 1,
    totalShards: 1,
    label: 'wasm',
    currentShard: 'core.wasm',
  });

  // 3. Worker host + RPC plumbing.
  const worker = createWorker();
  const pending = new Map<string, Pending>();
  const openSessions = new Set<string>();

  const failAllPending = (e: Error): void => {
    for (const [id, p] of pending) {
      pending.delete(id);
      clearTimeout(p.timer);
      if (p.mode === 'stream') p.cleanup();
      p.reject(e);
    }
  };

  // A crashed worker never answers: fail everything pending NOW with a
  // clear cause instead of letting each RPC hang until its timeout.
  worker.onerror = () => {
    failAllPending(new Error('worker crashed: pending RPCs failed'));
  };

  worker.onmessage = (event: { data: unknown }) => {
    const msg = event.data;
    if (!isWorkerMessage(msg)) return;
    const p = pending.get(msg.requestId);
    if (!p) return;
    if (msg.kind === 'token' && p.mode === 'stream') {
      const tm = msg as TokenMessage;
      p.onToken(tm.token, tm.index);
      return;
    }
    if (msg.kind === 'error' && p.mode === 'stream') {
      // generate() rejects with context; single-shot RPCs resolve the
      // error reply so each caller can wrap it with its own context.
      pending.delete(msg.requestId);
      clearTimeout(p.timer);
      p.cleanup();
      p.reject(new Error(`generate failed: ${(msg as ErrorReply).message}`));
      return;
    }
    pending.delete(msg.requestId);
    clearTimeout(p.timer);
    if (p.mode === 'stream') p.cleanup();
    p.resolve(msg);
  };

  const rpc = (message: HostMessage, timeoutMs: number): Promise<WorkerMessage> =>
    new Promise<WorkerMessage>((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(message.requestId);
        reject(new Error(`worker RPC timed out after ${timeoutMs}ms (kind=${message.kind})`));
      }, timeoutMs);
      pending.set(message.requestId, { mode: 'rpc', resolve, reject, timer });
      try {
        const transfer =
          message.kind === 'init' ? [(message as InitRequest).wasmBytes] : undefined;
        worker.postMessage(message, transfer);
      } catch (e) {
        clearTimeout(timer);
        pending.delete(message.requestId);
        reject(asError(e));
      }
    });

  let terminated = false;
  const terminate = (): void => {
    if (terminated) return;
    terminated = true;
    lifetime.abort(new Error('canister terminated'));
    openSessions.clear();
    failAllPending(new Error('canister terminated'));
    worker.terminate();
  };

  let wasmExports: string[];
  try {
    // Copy the exact bytes for transfer; the worker takes ownership.
    const buf = wasmBytes.buffer.slice(
      wasmBytes.byteOffset,
      wasmBytes.byteOffset + wasmBytes.byteLength,
    ) as ArrayBuffer;
    const initMsg: InitRequest = {
      kind: 'init',
      v: PROTOCOL_VERSION,
      requestId: newRequestId(),
      wasmBytes: buf,
      wasmSha256: manifest.wasmSha256,
      memory: manifest.memory,
    };
    const reply = await rpc(initMsg, initTimeoutMs);
    if (reply.kind === 'error') {
      throw new Error(`worker init failed: ${(reply as ErrorReply).message}`);
    }
    wasmExports = (reply as ReadyReply).exports;
  } catch (e) {
    terminate();
    throw e;
  }

  // 4. Weight shards (streaming progress, integrity-checked, cached).
  let shards: DownloadedShard[];
  try {
    shards = await downloadWeights(manifest, {
      fetchImpl,
      cache: options.cache,
      signal: transferSignal,
      onProgress: onProgress
        ? (p: ProgressSnapshot) => onProgress({ ...p, label: 'weights' })
        : undefined,
    });
  } catch (e) {
    terminate();
    throw e;
  }

  const createSession = async (params: SessionParams = {}): Promise<ReasoningSession> => {
    if (terminated) throw new Error('canister terminated');
    const startMsg: SessionStartRequest = {
      kind: 'session_start',
      v: PROTOCOL_VERSION,
      requestId: newRequestId(),
      params,
    };
    const reply = await rpc(startMsg, initTimeoutMs);
    if (reply.kind === 'error') {
      throw new Error(`session_start failed: ${(reply as ErrorReply).message}`);
    }
    const sessionId = (reply as SessionReadyReply).sessionId;
    openSessions.add(sessionId);
    let ended = false;

    const session: ReasoningSession = {
      id: sessionId,
      generate: (tokens: number[], genOptions: GenerateOptions = {}) =>
        new Promise<GenerateSummary>((resolve, reject) => {
          if (terminated) {
            reject(new Error('canister terminated'));
            return;
          }
          if (ended) {
            reject(new Error('session ended'));
            return;
          }
          const signal = genOptions.signal;
          if (signal?.aborted) {
            reject(asError(signal.reason ?? new Error('generate aborted')));
            return;
          }
          const requestId = newRequestId();
          const genMsg: GenerateRequest = {
            kind: 'generate',
            v: PROTOCOL_VERSION,
            requestId,
            sessionId,
            tokens,
            maxTokens: genOptions.maxTokens ?? 64,
            ...(genOptions.stopTokens !== undefined
              ? { stopTokens: genOptions.stopTokens }
              : {}),
          };

          let settled = false;
          const timer = setTimeout(() => {
            if (settled) return;
            settled = true;
            pending.delete(requestId);
            signal?.removeEventListener('abort', onAbort);
            reject(
              new Error(`worker RPC timed out after ${generateTimeoutMs}ms (kind=generate)`),
            );
          }, generateTimeoutMs);

          const onAbort = (): void => {
            if (settled) return;
            settled = true;
            // Tell the worker to stop the in-flight generation, then
            // reject locally with the abort reason. Late worker messages
            // for this requestId are ignored (entry already removed).
            const cancelMsg: CancelRequest = {
              kind: 'cancel',
              v: PROTOCOL_VERSION,
              requestId: newRequestId(),
              targetRequestId: requestId,
            };
            try {
              worker.postMessage(cancelMsg);
            } catch {
              // Worker may already be gone; the local reject stands.
            }
            clearTimeout(timer);
            pending.delete(requestId);
            reject(asError(signal?.reason ?? new Error('generate aborted')));
          };

          pending.set(requestId, {
            mode: 'stream',
            onToken: genOptions.onToken ?? (() => undefined),
            resolve: (m) => {
              if (settled) return;
              settled = true;
              clearTimeout(timer);
              signal?.removeEventListener('abort', onAbort);
              if (m.kind !== 'result' || !isGenerateSummary((m as { output: unknown }).output)) {
                reject(new Error('malformed generate result from worker'));
                return;
              }
              resolve((m as { output: GenerateSummary }).output);
            },
            reject: (e) => {
              if (settled) return;
              settled = true;
              clearTimeout(timer);
              signal?.removeEventListener('abort', onAbort);
              reject(e);
            },
            timer,
            cleanup: () => {
              signal?.removeEventListener('abort', onAbort);
            },
          });

          signal?.addEventListener('abort', onAbort, { once: true });
          try {
            worker.postMessage(genMsg);
          } catch (e) {
            settled = true;
            clearTimeout(timer);
            signal?.removeEventListener('abort', onAbort);
            pending.delete(requestId);
            reject(asError(e));
          }
        }),
      end: async (): Promise<void> => {
        if (ended) return;
        ended = true;
        openSessions.delete(sessionId);
        if (terminated) return;
        const endMsg = {
          kind: 'session_end',
          v: PROTOCOL_VERSION,
          requestId: newRequestId(),
          sessionId,
        } as const;
        const replyMsg = await rpc(endMsg, initTimeoutMs);
        if (replyMsg.kind === 'error') {
          throw new Error(`session_end failed: ${(replyMsg as ErrorReply).message}`);
        }
      },
    };
    return session;
  };

  return {
    manifest,
    wasmExports,
    shards,
    infer: async (input: number[] = []): Promise<unknown> => {
      if (terminated) throw new Error('canister terminated');
      const msg: InferRequest = {
        kind: 'infer',
        v: PROTOCOL_VERSION,
        requestId: newRequestId(),
        input,
      };
      const reply = await rpc(msg, inferTimeoutMs);
      if (reply.kind === 'error') {
        throw new Error(`infer failed: ${(reply as ErrorReply).message}`);
      }
      return reply.kind === 'result' ? (reply as { output: unknown }).output : undefined;
    },
    ping: async (): Promise<void> => {
      if (terminated) throw new Error('canister terminated');
      const pingMsg: PingRequest = {
        kind: 'ping',
        v: PROTOCOL_VERSION,
        requestId: newRequestId(),
      };
      const reply = await rpc(pingMsg, initTimeoutMs);
      if (reply.kind === 'error') {
        throw new Error(`ping failed: ${(reply as ErrorReply).message}`);
      }
    },
    createSession,
    terminate,
  };
}
