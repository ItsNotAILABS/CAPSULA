# Synthetic mechanics demo

**Not real inference.** This demo proves the canister machinery end-to-end in a
real browser page with a mocked `fetch`:

manifest → WASM download → worker spawn → SHA-256 verify → chunked weight
download with progress → Cache Storage → instantiate in worker → `infer` RPC
→ reasoning session (`session_start` → streamed `generate` tokens → `session_end`).

The "core" is a 176-byte hand-assembled WASM module whose `infer()` always
returns 42, plus a SYNTHETIC deterministic session stepper (`canister_session_start`
→ handle 1, `canister_session_step` echoes token+1 for 8 steps then returns -1,
`canister_session_end` → 0). The stepper is a token echo, NOT language modeling.
The "weights" are 2048 deterministic bytes with no learned content.

## Run it

```bash
cd packages/capsula-canister
node demo/build.mjs        # tsc compile + fixture verification
npx wrangler pages dev . --port 8788   # or: python3 -m http.server 8788
# open http://localhost:8788/demo/demo.html and press "Run end-to-end"
```

Press **Run** twice: the second run serves the weight shard from Cache Storage
(the log shows `fromCache=true` and zero weight network calls).

## Fixtures

- `fixtures/synth-core.wasm` — hand-assembled `(func (export "infer") (result i32) i32.const 42)`
  plus the synthetic session stepper (`canister_session_start/step/end`)
- `fixtures/weights-shard-0.bin` — 2048 deterministic bytes, **not model weights**
- `fixtures/sample-manifest.json` — copy-pasteable manifest shape with real hashes
- `fixtures.ts` — generated from the files above; `build.mjs` re-verifies every hash
