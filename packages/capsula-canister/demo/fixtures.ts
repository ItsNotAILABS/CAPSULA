/**
 * fixtures.ts — SYNTHETIC demo fixtures. NOT model weights.
 *
 * synth-core.wasm is a hand-assembled 176-byte module whose only exports are
 * infer() -> i32.const 42 and a SYNTHETIC deterministic session stepper:
 * canister_session_start() -> 1, canister_session_step(handle, token) ->
 * token+1 for 8 steps then -1 (end-of-stream), canister_session_end() -> 0.
 * The stepper exercises the streaming session protocol end to end; it is a
 * token echo, NOT language modeling. weights-shard-0.bin is 2048
 * deterministic bytes with no learned content. Both exist so the
 * downloader / cache / worker mechanics can be exercised end-to-end
 * without any real model.
 *
 * Generated from the committed fixture files; demo/build.mjs re-verifies
 * the hashes on every build.
 */
import type { CanisterManifest } from '../src/manifest.ts';

export const DEMO_MANIFEST: CanisterManifest = {
  "id": "demo-synth",
  "memory": {
    "initialPages": 1,
    "maximumPages": 16
  },
  "name": "Synthetic demo core (mechanics only)",
  "version": "0.0.0-demo",
  "wasmSha256": "5a177367a825dc91036435fd47382ad1cd3fb229937b3aaf49f61f1a075486c1",
  "wasmUrl": "https://r2-weights.example.invalid/wasm/demo-synth/0.0.0-demo/core.wasm",
  "weights": [
    {
      "bytes": 2048,
      "name": "shard-0.bin",
      "sha256": "7c7272c96bd53928d659650ce0d351531ccca5b7ce618d14f48ec5c8ffd4919f",
      "url": "https://r2-weights.example.invalid/weights/demo-synth/0.0.0-demo/shard-0.bin"
    }
  ]
};

export const SYNTH_WASM_BASE64: string = 'AGFzbQEAAAABEANgAAF/YAF/AX9gAn9/AX8DBQQAAAIBBgYBfwFBAAsHUQQFaW5mZXIAABZjYW5pc3Rlcl9zZXNzaW9uX3N0YXJ0AAEVY2FuaXN0ZXJfc2Vzc2lvbl9zdGVwAAIUY2FuaXN0ZXJfc2Vzc2lvbl9lbmQAAwoyBAQAQSoLCABBACQAQQELGQAjAEEITgR/QX8FIwBBAWokACABQQFqCwsIAEEAJABBAAs=';

export const WEIGHTS_BASE64: string = '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';

/** Decode a base64 fixture to bytes. */
export function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
