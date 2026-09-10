import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  downloadWeights,
  fetchRange,
  summarizeProgress,
  type CacheLike,
  type ProgressSnapshot,
} from '../src/downloader.ts';
import { validateManifest, type CanisterManifest, type WeightShard } from '../src/manifest.ts';
import { sha256Hex } from '../src/hash.ts';

/** Deterministic pseudo-random bytes (NOT cryptographic). */
function fixtureBytes(length: number, seed: number): Uint8Array {
  const out = new Uint8Array(length);
  let s = seed >>> 0;
  for (let i = 0; i < length; i++) {
    s = (s * 1103515245 + 12345) >>> 0;
    out[i] = (s >>> 16) & 0xff;
  }
  return out;
}

function chunkedResponse(bytes: Uint8Array, chunkSize: number): Response {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (let i = 0; i < bytes.length; i += chunkSize) {
        controller.enqueue(bytes.slice(i, Math.min(i + chunkSize, bytes.length)));
      }
      controller.close();
    },
  });
  return new Response(stream, { headers: { 'Content-Type': 'application/octet-stream' } });
}

interface FakeFetchState {
  files: Map<string, Uint8Array>;
  calls: string[];
  tamper: Set<string>;
  chunkSize: number;
}

function makeFetch(state: FakeFetchState): typeof fetch {
  const fn = (async (input: string | URL | Request): Promise<Response> => {
    const url = String(input);
    state.calls.push(url);
    const bytes = state.files.get(url);
    if (!bytes) {
      return new Response('not found', { status: 404 });
    }
    const served = state.tamper.has(url)
      ? (() => {
          const copy = bytes.slice();
          copy[0] = ((copy[0] as number) + 1) & 0xff;
          return copy;
        })()
      : bytes;
    return chunkedResponse(served, state.chunkSize);
  }) as unknown as typeof fetch;
  return fn;
}

class FakeCache implements CacheLike {
  private store = new Map<string, Uint8Array>();
  async match(key: string): Promise<Response | undefined> {
    const hit = this.store.get(key);
    return hit ? new Response(hit.slice()) : undefined;
  }
  async put(key: string, response: Response): Promise<void> {
    this.store.set(key, new Uint8Array(await response.arrayBuffer()));
  }
  /** Test-only: plant a raw entry without verification. */
  plant(key: string, bytes: Uint8Array): void {
    this.store.set(key, bytes);
  }
  get size(): number {
    return this.store.size;
  }
}

async function testManifest(files: Map<string, Uint8Array>): Promise<CanisterManifest> {
  const shards: WeightShard[] = [];
  let i = 0;
  for (const [url, bytes] of files) {
    shards.push({
      name: `shard-${i}.bin`,
      url,
      bytes: bytes.byteLength,
      sha256: await sha256Hex(bytes),
    });
    i += 1;
  }
  return validateManifest({
    id: 'test-canister',
    name: 'Test',
    version: '0.0.1',
    wasmUrl: 'https://example.invalid/core.wasm',
    wasmSha256: 'e'.repeat(64),
    weights: shards,
  });
}

describe('summarizeProgress', () => {
  it('sums per-shard progress', () => {
    const s = summarizeProgress([
      { loaded: 30, total: 100 },
      { loaded: 150, total: 300 },
    ]);
    assert.equal(s.loadedBytes, 180);
    assert.equal(s.totalBytes, 400);
  });

  it('clamps negative inputs to zero', () => {
    const s = summarizeProgress([{ loaded: -5, total: 100 }]);
    assert.equal(s.loadedBytes, 0);
    assert.equal(s.totalBytes, 100);
  });

  it('handles the empty set', () => {
    assert.deepEqual(summarizeProgress([]), { loadedBytes: 0, totalBytes: 0 });
  });
});

describe('downloadWeights', () => {
  it('downloads shards with monotonic progress and caches them', async () => {
    const files = new Map([
      ['https://cdn.invalid/w0', fixtureBytes(100, 1)],
      ['https://cdn.invalid/w1', fixtureBytes(300, 2)],
    ]);
    const state: FakeFetchState = { files, calls: [], tamper: new Set(), chunkSize: 64 };
    const cache = new FakeCache();
    const events: ProgressSnapshot[] = [];
    const manifest = await testManifest(files);

    const out = await downloadWeights(manifest, {
      fetchImpl: makeFetch(state),
      cache,
      onProgress: (p) => events.push(p),
    });

    assert.equal(out.length, 2);
    assert.deepEqual(out[0]?.bytes, files.get('https://cdn.invalid/w0'));
    assert.deepEqual(out[1]?.bytes, files.get('https://cdn.invalid/w1'));
    assert.equal(out[0]?.fromCache, false);
    assert.equal(cache.size, 2);

    // Progress math: monotonic, ends exactly at total.
    assert.ok(events.length > 0);
    let prev = -1;
    for (const e of events) {
      assert.ok(e.loadedBytes >= prev, 'progress must not go backwards');
      assert.ok(e.loadedBytes <= e.totalBytes);
      prev = e.loadedBytes;
    }
    const last = events[events.length - 1] as ProgressSnapshot;
    assert.equal(last.totalBytes, 400);
    assert.equal(last.loadedBytes, 400);
    assert.equal(last.doneShards, 2);
    assert.equal(last.totalShards, 2);
  });

  it('serves repeat visits from cache without network', async () => {
    const files = new Map([['https://cdn.invalid/w0', fixtureBytes(64, 3)]]);
    const state: FakeFetchState = { files, calls: [], tamper: new Set(), chunkSize: 16 };
    const cache = new FakeCache();
    const manifest = await testManifest(files);
    const fetchImpl = makeFetch(state);

    await downloadWeights(manifest, { fetchImpl, cache });
    const callsAfterFirst = state.calls.length;
    assert.ok(callsAfterFirst > 0);

    const second = await downloadWeights(manifest, { fetchImpl, cache });
    assert.equal(state.calls.length, callsAfterFirst, 'no new fetches on repeat visit');
    assert.equal(second[0]?.fromCache, true);
    assert.deepEqual(second[0]?.bytes, files.get('https://cdn.invalid/w0'));
  });

  it('re-downloads when the cached entry is corrupt', async () => {
    const good = fixtureBytes(64, 4);
    const files = new Map([['https://cdn.invalid/w0', good]]);
    const state: FakeFetchState = { files, calls: [], tamper: new Set(), chunkSize: 16 };
    const cache = new FakeCache();
    const manifest = await testManifest(files);

    // Plant garbage under the exact cache key the downloader will use.
    const key = `capsula-canister/v1/test-canister/0.0.1/shard-0.bin`;
    cache.plant(key, new Uint8Array([1, 2, 3]));

    const out = await downloadWeights(manifest, { fetchImpl: makeFetch(state), cache });
    assert.ok(state.calls.length > 0, 'corrupt entry must trigger re-download');
    assert.deepEqual(out[0]?.bytes, good);
    assert.equal(out[0]?.fromCache, false);
  });

  it('refuses to cache bytes that fail sha256', async () => {
    const files = new Map([['https://cdn.invalid/w0', fixtureBytes(64, 5)]]);
    const state: FakeFetchState = {
      files,
      calls: [],
      tamper: new Set(['https://cdn.invalid/w0']),
      chunkSize: 16,
    };
    const cache = new FakeCache();
    const manifest = await testManifest(files);

    await assert.rejects(
      () => downloadWeights(manifest, { fetchImpl: makeFetch(state), cache }),
      /sha256 mismatch/,
    );
    assert.equal(cache.size, 0, 'tampered bytes must not be cached');
  });

  it('rejects shards whose length disagrees with the manifest', async () => {
    const files = new Map([['https://cdn.invalid/w0', fixtureBytes(64, 6)]]);
    const state: FakeFetchState = { files, calls: [], tamper: new Set(), chunkSize: 16 };
    const cache = new FakeCache();
    const manifest = await testManifest(files);
    // Lie about the length in the manifest copy.
    const lying = validateManifest({
      ...JSON.parse(JSON.stringify(manifest)),
      weights: [{ ...manifest.weights[0], bytes: 32 }],
    });

    await assert.rejects(
      () => downloadWeights(lying, { fetchImpl: makeFetch(state), cache }),
      /expected 32 bytes, got 64/,
    );
  });

  it('downloads many shards in parallel, keeps manifest order and correct totals', async () => {
    const files = new Map<string, Uint8Array>();
    let totalBytes = 0;
    for (let i = 0; i < 6; i++) {
      const b = fixtureBytes(40 + i * 10, 100 + i);
      files.set(`https://cdn.invalid/p${i}`, b);
      totalBytes += b.byteLength;
    }
    const state: FakeFetchState = { files, calls: [], tamper: new Set(), chunkSize: 16 };
    const cache = new FakeCache();
    const manifest = await testManifest(files);
    const events: ProgressSnapshot[] = [];

    const out = await downloadWeights(manifest, {
      fetchImpl: makeFetch(state),
      cache,
      onProgress: (p) => events.push(p),
    });

    // Manifest order preserved even though shards raced.
    assert.equal(out.length, 6);
    const expectedNames = [...files.keys()].map((_, i) => `shard-${i}.bin`);
    assert.deepEqual(
      out.map((o) => o.shard.name),
      expectedNames,
    );
    for (const [i, o] of out.entries()) {
      assert.deepEqual(o.bytes, files.get(`https://cdn.invalid/p${i}`));
      assert.equal(o.fromCache, false);
    }
    assert.equal(cache.size, 6);

    // Aggregate progress math: ends exactly at the total, never exceeds it.
    const last = events[events.length - 1] as ProgressSnapshot;
    assert.equal(last.totalBytes, totalBytes);
    assert.equal(last.loadedBytes, totalBytes);
    assert.equal(last.doneShards, 6);
    let prev = -1;
    for (const e of events) {
      assert.ok(e.loadedBytes >= prev, 'aggregate progress must not go backwards');
      assert.ok(e.loadedBytes <= e.totalBytes);
      prev = e.loadedBytes;
    }
  });

  it('aborts remaining shards when one fails integrity', async () => {
    const files = new Map([
      ['https://cdn.invalid/g0', fixtureBytes(64, 200)],
      ['https://cdn.invalid/g1', fixtureBytes(64, 201)],
    ]);
    const state: FakeFetchState = {
      files,
      calls: [],
      tamper: new Set(['https://cdn.invalid/g1']),
      chunkSize: 16,
    };
    const cache = new FakeCache();
    const manifest = await testManifest(files);

    await assert.rejects(
      () => downloadWeights(manifest, { fetchImpl: makeFetch(state), cache }),
      /sha256 mismatch/,
    );
    // The tampered shard must never be cached, even though a sibling may
    // legitimately complete (and cache) before the failure lands.
    const tamperedKey = 'capsula-canister/v1/test-canister/0.0.1/shard-1.bin';
    assert.equal(await cache.match(tamperedKey), undefined);
  });

  it('honors a user abort signal mid-download', async () => {
    const files = new Map([['https://cdn.invalid/h0', fixtureBytes(64, 300)]]);
    const manifest = await testManifest(files);
    const hangingFetch = ((_input: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject((init.signal as AbortSignal).reason ?? new Error('aborted'));
        });
      })) as unknown as typeof fetch;

    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(new Error('test abort')), 20);
    await assert.rejects(
      () =>
        downloadWeights(manifest, {
          fetchImpl: hangingFetch,
          cache: null,
          signal: ctrl.signal,
        }),
      /test abort/,
    );
  });
});

describe('fetchRange', () => {
  it('requests a byte range and returns exactly it', async () => {
    const bytes = fixtureBytes(100, 7);
    let seenRange = '';
    const fetchImpl = (async (input: string | URL | Request, init?: RequestInit) => {
      seenRange = (init?.headers as Record<string, string>)['Range'] ?? '';
      // Simulate an R2-style 206 with just the requested window.
      const m = /bytes=(\d+)-(\d+)/.exec(seenRange);
      const start = Number(m?.[1] ?? 0);
      const end = Number(m?.[2] ?? 0);
      return new Response(bytes.slice(start, end + 1), { status: 206 });
    }) as unknown as typeof fetch;

    const window = await fetchRange('https://cdn.invalid/w0', 10, 20, fetchImpl);
    assert.equal(seenRange, 'bytes=10-29');
    assert.deepEqual(window, bytes.slice(10, 30));
  });

  it('falls back to slicing when the server ignores ranges', async () => {
    const bytes = fixtureBytes(100, 8);
    const fetchImpl = (async () =>
      new Response(bytes.slice(), { status: 200 })) as unknown as typeof fetch;
    const window = await fetchRange('https://cdn.invalid/w0', 10, 20, fetchImpl);
    assert.deepEqual(window, bytes.slice(10, 30));
  });

  it('validates its arguments', async () => {
    const fetchImpl = (async () => new Response()) as unknown as typeof fetch;
    await assert.rejects(() => fetchRange('https://x.invalid', -1, 10, fetchImpl), /positive integers/);
    await assert.rejects(() => fetchRange('https://x.invalid', 0, 0, fetchImpl), /positive integers/);
  });
});
