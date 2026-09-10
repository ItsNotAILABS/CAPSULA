import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadCanister, type MinimalWorker } from '../src/loader.ts';
import { validateManifest, type CanisterManifest } from '../src/manifest.ts';
import { sha256Hex } from '../src/hash.ts';

/** Hand-assembled synthetic WASM core: (func (export "infer") (result i32) i32.const 42) */
const SYNTH_WASM = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
  0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7f,
  0x03, 0x02, 0x01, 0x00,
  0x07, 0x09, 0x01, 0x05, 0x69, 0x6e, 0x66, 0x65, 0x72, 0x00, 0x00,
  0x0a, 0x06, 0x01, 0x04, 0x00, 0x41, 0x2a, 0x0b,
]);

/** In-process stand-in for a Web Worker: implements MinimalWorker and lets
 *  the test script the worker side of the protocol. */
class FakeWorker implements MinimalWorker {
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  terminated = false;
  onPost: ((data: unknown) => void) | null = null;
  /** Messages the page posted, in order (for asserting cancel/session flows). */
  posted: unknown[] = [];

  postMessage(data: unknown): void {
    this.posted.push(data);
    this.onPost?.(data);
  }
  terminate(): void {
    this.terminated = true;
  }
  emit(data: unknown): void {
    this.onmessage?.({ data });
  }
  /** Simulate a worker crash: the loader must fail pending RPCs loudly. */
  crash(): void {
    this.onerror?.({ type: 'error' });
  }
}

const V = 1;

/** Script the fake worker to answer init/infer/ping like the real host. */
function scriptHealthyHost(worker: FakeWorker): void {
  worker.onPost = (data: unknown) => {
    const m = data as { kind: string; requestId: string };
    if (m.kind === 'init') {
      worker.emit({ kind: 'ready', v: V, requestId: m.requestId, exports: ['infer'] });
    } else if (m.kind === 'infer') {
      worker.emit({ kind: 'result', v: V, requestId: m.requestId, output: 42 });
    } else if (m.kind === 'ping') {
      worker.emit({ kind: 'pong', v: V, requestId: m.requestId });
    }
  };
}

/**
 * Script the fake worker to emulate the synthetic session stepper:
 * session_start -> session_ready; generate ingests prompt tokens then
 * streams token+1 per step (8-step budget, then endOfStream); session_end
 * -> ended; cancel -> cancelled.
 */
function scriptSessionHost(worker: FakeWorker): void {
  worker.onPost = (data: unknown) => {
    const m = data as {
      kind: string;
      requestId: string;
      sessionId?: string;
      tokens?: number[];
      maxTokens?: number;
      targetRequestId?: string;
    };
    if (m.kind === 'init') {
      worker.emit({
        kind: 'ready',
        v: V,
        requestId: m.requestId,
        exports: [
          'infer',
          'canister_session_start',
          'canister_session_step',
          'canister_session_end',
        ],
      });
    } else if (m.kind === 'session_start') {
      worker.emit({ kind: 'session_ready', v: V, requestId: m.requestId, sessionId: 'sess-1' });
    } else if (m.kind === 'generate') {
      const sessionId = m.sessionId as string;
      let prev = (m.tokens as number[]).length
        ? (m.tokens as number[])[(m.tokens as number[]).length - 1] as number
        : 0;
      const maxTokens = m.maxTokens as number;
      const generated: number[] = [];
      let stopReason = 'maxTokens';
      const budget = Math.min(maxTokens, 8);
      for (let i = 0; i < budget; i++) {
        prev += 1;
        generated.push(prev);
        worker.emit({
          kind: 'token',
          v: V,
          requestId: m.requestId,
          sessionId,
          token: prev,
          index: i,
          done: false,
        });
      }
      if (budget < maxTokens) stopReason = 'endOfStream';
      worker.emit({
        kind: 'result',
        v: V,
        requestId: m.requestId,
        output: { sessionId, tokens: generated, stopReason },
      });
    } else if (m.kind === 'session_end') {
      worker.emit({ kind: 'ended', v: V, requestId: m.requestId, sessionId: m.sessionId });
    } else if (m.kind === 'cancel') {
      worker.emit({
        kind: 'cancelled',
        v: V,
        requestId: m.requestId,
        targetRequestId: m.targetRequestId,
        cancelled: true,
      });
    }
  };
}

const MANIFEST_URL = 'https://site.invalid/canister/test.json';
const WASM_URL = 'https://cdn.invalid/core.wasm';
const WEIGHT_URL = 'https://cdn.invalid/w0.bin';

async function testManifest(): Promise<CanisterManifest> {
  const weightBytes = new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2]);
  return validateManifest({
    id: 'test',
    name: 'Test canister',
    version: '0.0.1',
    wasmUrl: WASM_URL,
    wasmSha256: await sha256Hex(SYNTH_WASM),
    weights: [
      {
        name: 'shard-0.bin',
        url: WEIGHT_URL,
        bytes: weightBytes.byteLength,
        sha256: await sha256Hex(weightBytes),
      },
    ],
  });
}

function makeFetch(manifest: CanisterManifest, weightBytes: Uint8Array): typeof fetch {
  return (async (input: string | URL | Request): Promise<Response> => {
    const url = String(input);
    if (url === MANIFEST_URL) return Response.json(JSON.parse(JSON.stringify(manifest)));
    if (url === WASM_URL) return new Response(SYNTH_WASM.slice());
    if (url === WEIGHT_URL) return new Response(weightBytes.slice());
    return new Response('not found', { status: 404 });
  }) as unknown as typeof fetch;
}

describe('loadCanister', () => {
  it('boots the full pipeline: manifest -> wasm -> worker -> weights -> infer', async () => {
    const manifest = await testManifest();
    const weightBytes = new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2]);
    const worker = new FakeWorker();
    scriptHealthyHost(worker);

    const handle = await loadCanister(MANIFEST_URL, {
      fetchImpl: makeFetch(manifest, weightBytes),
      cache: null,
      createWorker: () => worker,
    });

    assert.equal(handle.manifest.id, 'test');
    assert.deepEqual(handle.wasmExports, ['infer']);
    assert.equal(handle.shards.length, 1);
    assert.deepEqual(handle.shards[0]?.bytes, weightBytes);

    await handle.ping();
    assert.equal(await handle.infer([1, 2, 3]), 42);

    handle.terminate();
    assert.ok(worker.terminated);
    await assert.rejects(() => handle.infer(), /terminated/);
  });

  it('does not spawn a worker when the manifest is unreachable', async () => {
    let spawned = 0;
    const fetchImpl = (async () =>
      new Response('nope', { status: 404 })) as unknown as typeof fetch;
    await assert.rejects(
      () =>
        loadCanister(MANIFEST_URL, {
          fetchImpl,
          cache: null,
          createWorker: () => {
            spawned += 1;
            return new FakeWorker();
          },
        }),
      /manifest fetch failed/,
    );
    assert.equal(spawned, 0);
  });

  it('refuses to instantiate when the wasm hash mismatches', async () => {
    const manifest = await testManifest();
    const lying = validateManifest({
      ...JSON.parse(JSON.stringify(manifest)),
      wasmSha256: 'f'.repeat(64),
    });
    const weightBytes = new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2]);
    let spawned = 0;
    await assert.rejects(
      () =>
        loadCanister(MANIFEST_URL, {
          fetchImpl: makeFetch(lying, weightBytes),
          cache: null,
          createWorker: () => {
            spawned += 1;
            return new FakeWorker();
          },
        }),
      /wasm sha256 mismatch/,
    );
    assert.equal(spawned, 0);
  });

  it('terminates the worker when init fails inside the host', async () => {
    const manifest = await testManifest();
    const weightBytes = new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2]);
    const worker = new FakeWorker();
    worker.onPost = (data: unknown) => {
      const m = data as { kind: string; requestId: string };
      worker.emit({ kind: 'error', v: V, requestId: m.requestId, message: 'bad wasm' });
    };
    await assert.rejects(
      () =>
        loadCanister(MANIFEST_URL, {
          fetchImpl: makeFetch(manifest, weightBytes),
          cache: null,
          createWorker: () => worker,
        }),
      /worker init failed: bad wasm/,
    );
    assert.ok(worker.terminated);
  });

  it('surfaces infer errors from the worker', async () => {
    const manifest = await testManifest();
    const weightBytes = new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2]);
    const worker = new FakeWorker();
    worker.onPost = (data: unknown) => {
      const m = data as { kind: string; requestId: string };
      if (m.kind === 'init') {
        worker.emit({ kind: 'ready', v: V, requestId: m.requestId, exports: [] });
      } else if (m.kind === 'infer') {
        worker.emit({ kind: 'error', v: V, requestId: m.requestId, message: 'synthetic core blew up' });
      }
    };
    const handle = await loadCanister(MANIFEST_URL, {
      fetchImpl: makeFetch(manifest, weightBytes),
      cache: null,
      createWorker: () => worker,
    });
    await assert.rejects(() => handle.infer(), /infer failed: synthetic core blew up/);
    handle.terminate();
  });

  it('runs a full reasoning session: start -> streamed tokens in order -> end', async () => {
    const manifest = await testManifest();
    const weightBytes = new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2]);
    const worker = new FakeWorker();
    scriptSessionHost(worker);

    const handle = await loadCanister(MANIFEST_URL, {
      fetchImpl: makeFetch(manifest, weightBytes),
      cache: null,
      createWorker: () => worker,
    });

    const session = await handle.createSession({});
    assert.equal(session.id, 'sess-1');

    const streamed: Array<[number, number]> = [];
    const summary = await session.generate([10, 20], {
      maxTokens: 16,
      onToken: (token, index) => {
        streamed.push([token, index]);
      },
    });

    // Scripted stepper: ingests 10, 20 -> streams 21..28, then endOfStream.
    assert.deepEqual(
      streamed.map(([t]) => t),
      [21, 22, 23, 24, 25, 26, 27, 28],
    );
    assert.deepEqual(
      streamed.map(([, i]) => i),
      [0, 1, 2, 3, 4, 5, 6, 7],
    );
    assert.deepEqual(summary.tokens, [21, 22, 23, 24, 25, 26, 27, 28]);
    assert.equal(summary.stopReason, 'endOfStream');
    assert.equal(summary.sessionId, 'sess-1');

    await session.end();
    const kinds = worker.posted.map((m) => (m as { kind: string }).kind);
    assert.ok(kinds.includes('session_start'), 'expected session_start to be posted');
    assert.ok(kinds.includes('generate'), 'expected generate to be posted');
    assert.ok(kinds.includes('session_end'), 'expected session_end to be posted');

    // Double end is a safe no-op.
    await session.end();
    handle.terminate();
  });

  it('fails session creation honestly when the core has no session exports', async () => {
    const manifest = await testManifest();
    const weightBytes = new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2]);
    const worker = new FakeWorker();
    worker.onPost = (data: unknown) => {
      const m = data as { kind: string; requestId: string };
      if (m.kind === 'init') {
        worker.emit({ kind: 'ready', v: V, requestId: m.requestId, exports: ['infer'] });
      } else if (m.kind === 'session_start') {
        worker.emit({
          kind: 'error',
          v: V,
          requestId: m.requestId,
          message: 'worker: reasoning sessions not supported by this core',
        });
      }
    };
    const handle = await loadCanister(MANIFEST_URL, {
      fetchImpl: makeFetch(manifest, weightBytes),
      cache: null,
      createWorker: () => worker,
    });
    await assert.rejects(
      () => handle.createSession({}),
      /session_start failed: worker: reasoning sessions not supported/,
    );
    handle.terminate();
  });

  it('cancels an in-flight generate on AbortSignal and posts cancel', async () => {
    const manifest = await testManifest();
    const weightBytes = new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2]);
    const worker = new FakeWorker();
    worker.onPost = (data: unknown) => {
      const m = data as { kind: string; requestId: string };
      if (m.kind === 'init') {
        worker.emit({ kind: 'ready', v: V, requestId: m.requestId, exports: ['infer'] });
      } else if (m.kind === 'session_start') {
        worker.emit({ kind: 'session_ready', v: V, requestId: m.requestId, sessionId: 'sess-9' });
      } else if (m.kind === 'session_end') {
        worker.emit({ kind: 'ended', v: V, requestId: m.requestId, sessionId: 'sess-9' });
      }
      // generate intentionally never answers: the abort must win.
    };
    const handle = await loadCanister(MANIFEST_URL, {
      fetchImpl: makeFetch(manifest, weightBytes),
      cache: null,
      createWorker: () => worker,
      generateTimeoutMs: 5_000,
    });

    const session = await handle.createSession({});
    const ctrl = new AbortController();
    const pending = session.generate([1, 2], { maxTokens: 64, signal: ctrl.signal });
    ctrl.abort(new Error('user cancelled'));

    await assert.rejects(pending, /user cancelled/);
    const cancel = worker.posted.find(
      (m) => (m as { kind: string }).kind === 'cancel',
    ) as { kind: string; v: number; targetRequestId: string } | undefined;
    assert.ok(cancel, 'expected a cancel message to be posted');
    assert.equal(cancel.v, 1);
    assert.ok(typeof cancel.targetRequestId === 'string' && cancel.targetRequestId.length > 0);

    await session.end();
    handle.terminate();
  });

  it('fails pending RPCs with "worker crashed" when the worker dies', async () => {
    const manifest = await testManifest();
    const weightBytes = new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2]);
    const worker = new FakeWorker();
    worker.onPost = (data: unknown) => {
      const m = data as { kind: string; requestId: string };
      if (m.kind === 'init') {
        worker.emit({ kind: 'ready', v: V, requestId: m.requestId, exports: ['infer'] });
      }
      // infer intentionally never answers.
    };
    const handle = await loadCanister(MANIFEST_URL, {
      fetchImpl: makeFetch(manifest, weightBytes),
      cache: null,
      createWorker: () => worker,
      inferTimeoutMs: 30_000,
    });

    const pending = handle.infer([1, 2, 3]);
    worker.crash();
    await assert.rejects(pending, /worker crashed/);
    handle.terminate();
  });

  it('aborts a hanging manifest fetch on the user signal', async () => {
    const hangingFetch = ((_input: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject((init.signal as AbortSignal).reason ?? new Error('aborted'));
        });
      })) as unknown as typeof fetch;

    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(new Error('user gave up')), 20);
    let spawned = 0;
    await assert.rejects(
      () =>
        loadCanister(MANIFEST_URL, {
          fetchImpl: hangingFetch,
          cache: null,
          signal: ctrl.signal,
          createWorker: () => {
            spawned += 1;
            return new FakeWorker();
          },
        }),
      /user gave up/,
    );
    assert.equal(spawned, 0, 'no worker may spawn when the manifest never arrives');
  });
});
