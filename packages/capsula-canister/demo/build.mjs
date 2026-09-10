#!/usr/bin/env node
/**
 * demo/build.mjs — compile @capsula/canister and verify the demo fixtures.
 *
 * Steps:
 *   1. tsc -p tsconfig.json  (locates tsc via TSC_BIN env, a local
 *      node_modules/.bin/tsc walking up, or npx --yes typescript@5.9)
 *   2. Recompute sha256 of the committed fixture binaries and assert the
 *      compiled fixtures module agrees with them.
 *   3. Prove the synthetic WASM core compiles, instantiates, and that its
 *      infer() export returns 42.
 *   4. Assert fixtures/sample-manifest.json matches the compiled manifest.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const demoDir = dirname(fileURLToPath(import.meta.url));
const pkgDir = resolve(demoDir, '..');

function findTsc() {
  if (process.env.TSC_BIN && existsSync(process.env.TSC_BIN)) return process.env.TSC_BIN;
  let dir = pkgDir;
  for (;;) {
    const candidate = join(dir, 'node_modules', '.bin', 'tsc');
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

const tsc = findTsc();
if (tsc) {
  console.log(`compiling with ${tsc}`);
  execFileSync(tsc, ['-p', 'tsconfig.json'], { cwd: pkgDir, stdio: 'inherit' });
} else {
  console.log('no local tsc; fetching typescript@5.9 via npx (one-time)');
  execFileSync('npx', ['--yes', '-p', 'typescript@5.9', 'tsc', '-p', 'tsconfig.json'], {
    cwd: pkgDir,
    stdio: 'inherit',
  });
}
console.log('tsc build ok -> dist/');

const wasm = readFileSync(join(demoDir, 'fixtures', 'synth-core.wasm'));
const weights = readFileSync(join(demoDir, 'fixtures', 'weights-shard-0.bin'));
const sha = (b) => createHash('sha256').update(b).digest('hex');

// The synthetic core must actually be a valid module.
const mod = await WebAssembly.compile(wasm);
const inst = await WebAssembly.instantiate(mod, {});
if (typeof inst.exports.infer !== 'function' || inst.exports.infer() !== 42) {
  throw new Error('synthetic core self-check failed: infer() did not return 42');
}
console.log('synthetic WASM core verified: exports infer(), returns 42');

// The synthetic session stepper must behave deterministically:
// start -> handle 1, step echoes token+1 for 8 steps, then -1, end -> 0.
const ex = inst.exports;
if (
  typeof ex.canister_session_start !== 'function' ||
  typeof ex.canister_session_step !== 'function' ||
  typeof ex.canister_session_end !== 'function'
) {
  throw new Error('synthetic core self-check failed: missing canister_session_* exports');
}
if (ex.canister_session_start() !== 1) {
  throw new Error('synthetic core self-check failed: session_start did not return 1');
}
const echoed = [];
for (let i = 0; i < 8; i++) echoed.push(ex.canister_session_step(1, 100 + i));
const want = [101, 102, 103, 104, 105, 106, 107, 108];
if (JSON.stringify(echoed) !== JSON.stringify(want)) {
  throw new Error(`synthetic core self-check failed: stepper echoed ${JSON.stringify(echoed)}`);
}
if (ex.canister_session_step(1, 999) !== -1) {
  throw new Error('synthetic core self-check failed: stepper did not end with -1');
}
if (ex.canister_session_end(1) !== 0) {
  throw new Error('synthetic core self-check failed: session_end did not return 0');
}
console.log('synthetic session stepper verified: echo token+1 x8, then -1, end -> 0');

const fixtures = await import(join(pkgDir, 'dist', 'demo', 'fixtures.js'));
const m = fixtures.DEMO_MANIFEST;
if (m.wasmSha256 !== sha(wasm)) throw new Error('fixtures.ts wasmSha256 disagrees with synth-core.wasm');
if (m.weights[0].sha256 !== sha(weights)) throw new Error('fixtures.ts weight sha256 disagrees with shard file');
if (m.weights[0].bytes !== weights.byteLength) throw new Error('fixtures.ts weight bytes disagree with shard file');

const sample = JSON.parse(readFileSync(join(demoDir, 'fixtures', 'sample-manifest.json'), 'utf8'));
if (JSON.stringify(sample) !== JSON.stringify(m)) {
  throw new Error('fixtures/sample-manifest.json disagrees with fixtures.ts DEMO_MANIFEST');
}
console.log('fixtures verified against binaries and sample-manifest.json');
console.log('demo ready: serve the package dir over http and open demo/demo.html');
