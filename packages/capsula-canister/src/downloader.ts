/**
 * downloader.ts — weight shard downloader.
 *
 * For each shard in the manifest:
 *   1. Look in Cache Storage under a versioned key. A hit is only trusted
 *      after the bytes match the expected length AND sha256.
 *   2. On miss (or corrupt entry), fetch the shard with streaming progress,
 *      verify length + sha256, then store it in the cache.
 *
 * Shard granularity is the resume unit: a failed shard is re-fetched whole,
 * successfully cached shards are never re-downloaded. Range requests are
 * supported via fetchRange() for future paged loading (R2 serves ranges);
 * the bulk path intentionally downloads whole shards so each cached entry
 * is independently verifiable.
 */

import { sha256Hex } from './hash.ts';
import { weightCacheKey, type CanisterManifest, type WeightShard } from './manifest.ts';
import { combineSignals } from './signals.ts';

export interface ShardProgress {
  loaded: number;
  total: number;
}

/** Pure progress math, unit-tested separately. */
export function summarizeProgress(shards: ShardProgress[]): {
  loadedBytes: number;
  totalBytes: number;
} {
  let loadedBytes = 0;
  let totalBytes = 0;
  for (const s of shards) {
    loadedBytes += Math.max(0, s.loaded);
    totalBytes += Math.max(0, s.total);
  }
  return { loadedBytes, totalBytes };
}

export interface ProgressSnapshot {
  loadedBytes: number;
  totalBytes: number;
  doneShards: number;
  totalShards: number;
  /** Shard currently transferring, if any. */
  currentShard?: string;
  /** Caller-defined phase label, e.g. "wasm" or "weights". */
  label?: string;
}

/** Minimal Cache Storage surface, so tests can inject a fake. */
export interface CacheLike {
  match(key: string): Promise<Response | undefined>;
  put(key: string, response: Response): Promise<void>;
}

export interface DownloadOptions {
  onProgress?: (p: ProgressSnapshot) => void;
  fetchImpl?: typeof fetch;
  /**
   * Cache to use. Defaults to Cache Storage ("capsula-canister-weights-v1")
   * when available, else an in-memory Map (documented: does NOT survive
   * reloads — fine for tests and non-secure contexts). Pass null to disable.
   */
  cache?: CacheLike | null;
  signal?: AbortSignal;
}

export interface DownloadedShard {
  shard: WeightShard;
  bytes: Uint8Array;
  fromCache: boolean;
}

/** In-memory fallback when Cache Storage is unavailable. NOT persistent. */
class MemoryCache implements CacheLike {
  private store = new Map<string, Uint8Array>();
  async match(key: string): Promise<Response | undefined> {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    return new Response(hit.slice(), {
      headers: { 'Content-Type': 'application/octet-stream' },
    });
  }
  async put(key: string, response: Response): Promise<void> {
    this.store.set(key, new Uint8Array(await response.arrayBuffer()));
  }
}

function defaultCache(): CacheLike {
  const cachesApi = (globalThis as unknown as { caches?: CacheStorage }).caches;
  if (cachesApi && typeof cachesApi.open === 'function') {
    let opened: Promise<Cache> | null = null;
    const get = (): Promise<Cache> => {
      if (!opened) opened = cachesApi.open('capsula-canister-weights-v1');
      return opened;
    };
    return {
      match: (key: string) => get().then((c) => c.match(key)),
      put: (key: string, response: Response) => get().then((c) => c.put(key, response)),
    };
  }
  return new MemoryCache();
}

async function fetchWithProgress(
  url: string,
  onChunk: (receivedBytes: number) => void,
  fetchImpl: typeof fetch,
  signal?: AbortSignal,
): Promise<Uint8Array> {
  const res = await fetchImpl(url, { signal });
  if (!res.ok) {
    throw new Error(`weight fetch failed: HTTP ${res.status} (${url})`);
  }
  if (!res.body) {
    const buf = new Uint8Array(await res.arrayBuffer());
    onChunk(buf.byteLength);
    return buf;
  }
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value && value.byteLength > 0) {
      chunks.push(value);
      received += value.byteLength;
      onChunk(received);
    }
  }
  const out = new Uint8Array(received);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}

/**
 * Download one byte range with an HTTP Range request. R2 and most CDNs
 * honor this (206). If the server ignores ranges and returns 200, the
 * requested window is sliced client-side. This is the primitive the
 * future streaming pager will build on; the bulk downloader below
 * does not use it.
 */
export async function fetchRange(
  url: string,
  start: number,
  length: number,
  fetchImpl: typeof fetch = fetch,
): Promise<Uint8Array> {
  if (!Number.isInteger(start) || start < 0 || !Number.isInteger(length) || length <= 0) {
    throw new Error('fetchRange: start and length must be positive integers');
  }
  const res = await fetchImpl(url, {
    headers: { Range: `bytes=${start}-${start + length - 1}` },
  });
  if (res.status === 206) {
    return new Uint8Array(await res.arrayBuffer());
  }
  if (res.status === 200) {
    const all = new Uint8Array(await res.arrayBuffer());
    return all.slice(start, start + length);
  }
  throw new Error(`range request failed: HTTP ${res.status} (${url})`);
}

/**
 * Max concurrent shard fetches. Bounded so a many-shard manifest doesn't
 * open dozens of connections at once; 4 keeps HTTP/2 multiplexing happy
 * while still overlapping the slow parts (TLS + first byte) of each shard.
 */
export const DOWNLOAD_CONCURRENCY = 4;

/**
 * Download every weight shard in the manifest, verifying integrity and
 * caching under versioned keys. Shards download with bounded parallelism
 * (DOWNLOAD_CONCURRENCY); the returned array is always in manifest order.
 *
 * Progress stays aggregate-correct: perShard[i].loaded is only ever
 * written by the worker owning shard i, and the sums only increase.
 */
export async function downloadWeights(
  manifest: CanisterManifest,
  options: DownloadOptions = {},
): Promise<DownloadedShard[]> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const cache = options.cache === undefined ? defaultCache() : options.cache;

  const perShard: ShardProgress[] = manifest.weights.map((w) => ({ loaded: 0, total: w.bytes }));
  let doneShards = 0;
  const report = (currentShard?: string): void => {
    if (!options.onProgress) return;
    const { loadedBytes, totalBytes } = summarizeProgress(perShard);
    options.onProgress({
      loadedBytes,
      totalBytes,
      doneShards,
      totalShards: manifest.weights.length,
      currentShard,
    });
  };

  // Aborts the remaining in-flight shards on the first failure.
  const failFast = new AbortController();
  const signal = combineSignals([options.signal, failFast.signal]);

  const results: Array<DownloadedShard | undefined> = new Array(
    manifest.weights.length,
  );
  let next = 0;
  let firstError: unknown = null;

  const downloadOne = async (i: number): Promise<DownloadedShard> => {
    const shard = manifest.weights[i] as WeightShard;
    const key = weightCacheKey(manifest, shard);
    const entry = perShard[i] as ShardProgress;
    let bytes: Uint8Array | null = null;
    let fromCache = false;

    if (cache) {
      try {
        const hit = await cache.match(key);
        if (hit) {
          const cached = new Uint8Array(await hit.arrayBuffer());
          if (
            cached.byteLength === shard.bytes &&
            (await sha256Hex(cached)) === shard.sha256
          ) {
            bytes = cached;
            fromCache = true;
          }
          // Corrupt or stale entry: fall through and re-download.
        }
      } catch {
        // Cache read failure: fall through and re-download.
      }
    }

    if (!bytes) {
      const fetched = await fetchWithProgress(
        shard.url,
        (received) => {
          entry.loaded = received;
          report(shard.name);
        },
        fetchImpl,
        signal,
      );
      if (fetched.byteLength !== shard.bytes) {
        throw new Error(
          `shard "${shard.name}": expected ${shard.bytes} bytes, got ${fetched.byteLength}`,
        );
      }
      const digest = await sha256Hex(fetched);
      if (digest !== shard.sha256) {
        throw new Error(`shard "${shard.name}": sha256 mismatch — refusing to cache`);
      }
      bytes = fetched;
      if (cache) {
        try {
          await cache.put(
            key,
            new Response(bytes.slice(), {
              headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Length': String(bytes.byteLength),
              },
            }),
          );
        } catch {
          // Cache write failure is non-fatal; the bytes are still returned.
        }
      }
    }

    entry.loaded = shard.bytes;
    return { shard, bytes, fromCache };
  };

  const pump = async (): Promise<void> => {
    for (;;) {
      if (firstError !== null) return; // a sibling failed; stop scheduling
      const i = next;
      next += 1;
      if (i >= manifest.weights.length) return;
      try {
        results[i] = await downloadOne(i);
      } catch (e) {
        if (firstError === null) {
          firstError = e;
          failFast.abort();
        }
        return;
      }
      doneShards += 1;
      report((manifest.weights[i] as WeightShard).name);
    }
  };

  const lanes = Math.min(DOWNLOAD_CONCURRENCY, manifest.weights.length);
  await Promise.all(Array.from({ length: lanes }, () => pump()));

  if (firstError !== null) {
    throw firstError;
  }
  return results as DownloadedShard[];
}
