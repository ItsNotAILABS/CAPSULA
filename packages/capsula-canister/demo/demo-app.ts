/**
 * demo-app.ts — SYNTHETIC MECHANICS DEMO. Not real inference.
 *
 * Exercises the full pipeline in a real browser page with a mocked fetch:
 *   manifest -> WASM download -> worker spawn -> sha256 verify ->
 *   weight download (chunked, with progress) -> Cache Storage ->
 *   instantiate in worker -> infer RPC ->
 *   reasoning session: session_start -> streamed generate tokens -> session_end.
 *
 * The "model" is a 176-byte hand-assembled WASM module whose infer() always
 * returns 42, plus a SYNTHETIC deterministic session stepper that echoes
 * token+1 for 8 steps and then ends the stream. The "weights" are 2048
 * deterministic bytes with no learned content. Nothing here demonstrates
 * model quality — only that the machinery moves bytes, verifies them,
 * caches them, talks to the worker correctly, and streams session tokens.
 */

import { loadCanister, type ProgressSnapshot } from '../src/index.ts';
import { DEMO_MANIFEST, SYNTH_WASM_BASE64, WEIGHTS_BASE64, b64ToBytes } from './fixtures.ts';

const MANIFEST_URL = 'https://demo.invalid/canister/demo-synth.json';

const wasmBytes = b64ToBytes(SYNTH_WASM_BASE64);
const weightBytes = b64ToBytes(WEIGHTS_BASE64);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Serve a fixture as artificially chunked stream so progress is visible. */
function chunked(body: Uint8Array, chunkSize: number, delayMs: number): Response {
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (let i = 0; i < body.length; i += chunkSize) {
        controller.enqueue(body.slice(i, Math.min(i + chunkSize, body.length)));
        await sleep(delayMs);
      }
      controller.close();
    },
  });
  return new Response(stream, { headers: { 'Content-Type': 'application/octet-stream' } });
}

async function mockFetch(input: string | URL | Request): Promise<Response> {
  const url = String(input);
  if (url === MANIFEST_URL) return Response.json(DEMO_MANIFEST);
  if (url === DEMO_MANIFEST.wasmUrl) return chunked(wasmBytes, 16, 80);
  if (url === DEMO_MANIFEST.weights[0]?.url) return chunked(weightBytes, 256, 60);
  throw new Error(`demo mockFetch: unexpected URL ${url}`);
}

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`missing #${id}`);
  return node as T;
}

function log(message: string): void {
  const pre = el<HTMLPreElement>('log');
  pre.textContent += message + '\n';
  pre.scrollTop = pre.scrollHeight;
}

async function run(): Promise<void> {
  const btn = el<HTMLButtonElement>('runBtn');
  const bar = el<HTMLDivElement>('bar');
  btn.disabled = true;
  el<HTMLPreElement>('log').textContent = '';
  bar.style.width = '0%';

  let lastLoggedShard = -1;
  const seenUrls = new Set<string>();
  const countingFetch = (async (input: string | URL | Request): Promise<Response> => {
    seenUrls.add(String(input));
    return mockFetch(input);
  }) as typeof fetch;

  try {
    log('SYNTHETIC DEMO — mocked fetch, fake weights, fake WASM core.');
    log(`manifest: ${MANIFEST_URL}`);
    const handle = await loadCanister(MANIFEST_URL, {
      fetchImpl: countingFetch,
      createWorker: () =>
        new Worker(new URL('../src/worker/canister-host.worker.js', import.meta.url), {
          type: 'module',
        }),
      onProgress: (p: ProgressSnapshot) => {
        const pct = p.totalBytes > 0 ? (p.loadedBytes / p.totalBytes) * 100 : 0;
        bar.style.width = `${pct.toFixed(1)}%`;
        if (p.doneShards !== lastLoggedShard) {
          lastLoggedShard = p.doneShards;
          log(
            `progress [${p.label ?? '?'}] ${p.loadedBytes}/${p.totalBytes} bytes, ` +
              `${p.doneShards}/${p.totalShards} shards done` +
              (p.currentShard ? ` (current: ${p.currentShard})` : ''),
          );
        }
      },
    });

    log(`worker ready. wasm exports: [${handle.wasmExports.join(', ')}]`);
    log(
      `weights: ${handle.shards
        .map((s) => `${s.shard.name} (${s.bytes.byteLength}B, fromCache=${s.fromCache})`)
        .join(', ')}`,
    );
    const out = await handle.infer([7, 8, 9]);
    log(`infer([7,8,9]) => ${String(out)}  (synthetic core returns constant 42 — NOT inference)`);
    await handle.ping();
    log('ping ok.');

    // Reasoning session against the SYNTHETIC stepper: prompt tokens are
    // ingested, then the core echoes token+1 per step (8-step budget).
    const session = await handle.createSession({});
    log(`session started: ${session.id}`);
    const streamed: number[] = [];
    const summary = await session.generate([10, 20], {
      maxTokens: 16,
      onToken: (token, index) => {
        streamed.push(token);
        log(`  token[${index}] = ${token}`);
      },
    });
    log(
      `generate done: tokens=[${summary.tokens.join(', ')}] ` +
        `stopReason=${summary.stopReason} (streamed ${streamed.length} via onToken)`,
    );
    await session.end();
    log('session ended.');

    handle.terminate();
    log('terminated. Run again: weights should now come from Cache Storage.');
    log(`network calls this run: ${seenUrls.size} (${[...seenUrls].join(', ') || 'none'})`);
  } catch (e) {
    log(`ERROR: ${e instanceof Error ? e.message : String(e)}`);
  } finally {
    btn.disabled = false;
  }
}

el<HTMLButtonElement>('runBtn').addEventListener('click', () => {
  void run();
});
log('Ready. Serve this package directory over http (see README) and press Run.');
