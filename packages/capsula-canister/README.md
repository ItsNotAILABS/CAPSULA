# @capsula/canister

Browser WASM canister scaffolding: manifest validation, integrity-checked
weight downloads with Cache Storage, and a Web Worker host that instantiates a
WASM core inside the page.

**Mechanics only.** There are no real model weights and no real inference wired
here. The future inference core is the streaming-inference prototype in
`Auro14B/auro_native_llm/streaming/` — it has **not** been ported; this package
is the loading machinery it will eventually plug into.

## Install / build / test

```bash
cd packages/capsula-canister
node demo/build.mjs   # tsc compile -> dist/ + fixture verification
node --test tests/*.test.ts
```

Zero runtime dependencies. TypeScript strict. Works in browsers, module
workers, and Node 20+ (tests run on Node's built-in runner, no test framework
dependency).

## Integration contract (for the avatar-phone app)

```ts
import { loadCanister } from '@capsula/canister';

const handle = await loadCanister('/canister/avatar-phone.json', {
  onProgress: (p) => {
    // p: { loadedBytes, totalBytes, doneShards, totalShards,
    //      currentShard?, label?: 'wasm' | 'weights' }
    progressBar(p.loadedBytes / p.totalBytes);
  },
  // With Vite, pass the worker explicitly so it gets bundled:
  // createWorker: () => new Worker(
  //   new URL('@capsula/canister/dist/src/worker/canister-host.worker.js', import.meta.url),
  //   { type: 'module' },
  // ),
});

console.log(handle.wasmExports);   // e.g. ["infer", "memory"]
const out = await handle.infer([1, 2, 3]);  // RPC into the worker

// Reasoning session (streamed tokens), when the core exports
// canister_session_start / canister_session_step / canister_session_end:
const session = await handle.createSession({});
const summary = await session.generate([1, 2, 3], {
  maxTokens: 64,
  stopTokens: [0],          // optional early-stop token
  signal: abortController.signal,
  onToken: (token, index) => render(token),
});
await session.end();
handle.terminate();
```

### Core ABI (what the WASM module must export)

- `infer(input: i32...) -> i32` — single-shot path (kept working).
- `canister_session_start() -> i32` — returns a session handle (positive).
- `canister_session_step(handle: i32, token: i32) -> i32` — returns the next
  token, or a negative value for end-of-stream.
- `canister_session_end(handle: i32) -> i32` — closes the session.

Session params are currently opaque to the host (the start ABI takes no
arguments); a real core would thread params into the WASM somehow (future).
Imported functions other than `env.memory` are not yet supported: the host
synthesizes `env.memory` from the manifest's `memoryHints` (initial/max pages)
and fails loudly on any other unsupported import, listing what it saw.

### Manifest URL convention

```
https://<pages-domain>/canister/<canister-id>.json
```

Validated against `schema/canister.schema.json` (and `validateManifest()`):

```json
{
  "id": "avatar-phone",
  "name": "Avatar phone core",
  "version": "0.1.0",
  "wasmUrl": "https://<r2-public-base>/wasm/avatar-phone/0.1.0/core.wasm",
  "wasmSha256": "<64 hex chars>",
  "weights": [
    { "name": "shard-0.bin",
      "url": "https://<r2-public-base>/weights/avatar-phone/0.1.0/shard-0.bin",
      "bytes": 123456,
      "sha256": "<64 hex chars>" }
  ]
}
```

### URL security rule

Absolute URLs in the manifest must be `https:`, **except** plain `http:` on
`localhost` / `127.0.0.1` / `[::1]` (dev loopback only). Relative URLs are
same-origin. This blocks mixed-content and integrity downgrade when weights
come from a CDN.

### R2 layout

```
capsula-weights/
  wasm/<canister-id>/<version>/core.wasm
  weights/<canister-id>/<version>/<shard-name>.bin
```

See `cloudflare/canister/README.md` for bucket creation, CORS, and deploy
commands.

### Caching & integrity

- Each shard is cached in Cache Storage under
  `capsula-canister/v1/<id>/<version>/<shard-name>`. Bumping `version` busts it.
- A cache hit is only trusted after length + SHA-256 re-verification; corrupt
  entries are re-downloaded. Tampered network bytes are rejected and never cached.
- The worker re-verifies the WASM SHA-256 itself before `WebAssembly.compile`.
- Shard granularity is the resume unit. `fetchRange()` is exported for future
  paged loading (R2 serves `Range` requests; CORS exposes `Content-Range`).

## Demo

`demo/` is a synthetic end-to-end: mocked fetch, a 176-byte hand-assembled WASM
core whose `infer()` returns 42, and 2048 deterministic bytes as fake weights —
plus a **synthetic** deterministic session stepper (handle 1, echoes token+1
for 8 steps then end-of-stream). The stepper is a token echo, not language
modeling. It proves the machinery, not any model. See `demo/README.md`.

## Explicitly not yet

- **No real Auro weights wired.** Nothing downloads a model today.
- **No signed weight URLs.** Manifest URLs are public; add a Pages Function +
  the `WEIGHTS` R2 binding when gating is needed.
- **No streaming pager.** The Auro14B `streaming/` pager (LRU hot set,
  expert prefetch, receipts) is the future core — not ported.
- **No weight-to-memory mapping.** The worker instantiates the WASM module;
  mapping downloaded shard bytes into its linear memory is future work.
- **No Cloudflare account connected.** `cloudflare/canister/` is config only;
  nothing created, nothing deployed.
- **No avatar-phone app code.** It arrives separately and will consume this
  package via the contract above.
- **Session params are opaque.** The host passes params through to the
  `session_start` message, but the WASM ABI start function takes no arguments.
- **Host-side imports limited to `env.memory`.** Imported functions the WASM
  module asks for (other than memory) fail with a listed error, not silently.
- **Generation is single-worker.** Parallel sessions share one worker; no
  multi-worker scheduling.
