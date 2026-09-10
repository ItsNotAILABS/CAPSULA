import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateManifest,
  ManifestValidationError,
  weightCacheKey,
  wasmCacheKey,
} from '../src/manifest.ts';
import type { CanisterManifest } from '../src/manifest.ts';

function goodManifest(): Record<string, unknown> {
  return {
    id: 'demo-synth',
    name: 'Synthetic demo core',
    version: '0.1.0',
    wasmUrl: 'https://example.invalid/core.wasm',
    wasmSha256: 'a'.repeat(64),
    weights: [
      { name: 'shard-0.bin', url: 'https://example.invalid/w0.bin', bytes: 16, sha256: 'b'.repeat(64) },
      { name: 'shard-1.bin', url: 'https://example.invalid/w1.bin', bytes: 32, sha256: 'C'.repeat(64) },
    ],
    memory: { initialPages: 16, maximumPages: 256 },
  };
}

describe('validateManifest', () => {
  it('accepts a valid manifest and normalizes hashes to lowercase', () => {
    const m = validateManifest(goodManifest());
    assert.equal(m.id, 'demo-synth');
    assert.equal(m.weights.length, 2);
    assert.equal(m.weights[1]?.sha256, 'c'.repeat(64));
    assert.equal(m.memory?.initialPages, 16);
  });

  it('accepts a manifest without the optional memory block', () => {
    const input = goodManifest();
    delete input['memory'];
    const m = validateManifest(input);
    assert.equal(m.memory, undefined);
  });

  it('rejects a non-object', () => {
    assert.throws(() => validateManifest('nope'), /must be a JSON object/);
    assert.throws(
      () => validateManifest(null),
      (e) => e instanceof ManifestValidationError,
    );
  });

  it('collects every problem instead of failing on the first', () => {
    const input = { id: '', version: 'not-semver', weights: [] };
    try {
      validateManifest(input);
      assert.ok(false, 'should have thrown');
    } catch (e) {
      assert.ok(e instanceof ManifestValidationError);
      assert.ok(e.details.length >= 4, `expected several details, got: ${e.details.join(' | ')}`);
    }
  });

  it('rejects bad sha256 shapes', () => {
    const input = goodManifest();
    input['wasmSha256'] = 'xyz';
    assert.throws(() => validateManifest(input), /wasmSha256/);
  });

  it('rejects empty weights and duplicate shard names', () => {
    const empty = goodManifest();
    empty['weights'] = [];
    assert.throws(() => validateManifest(empty), /weights: required non-empty array/);

    const dupe = goodManifest();
    (dupe['weights'] as unknown[]).push({
      name: 'shard-0.bin',
      url: 'https://example.invalid/w2.bin',
      bytes: 8,
      sha256: 'd'.repeat(64),
    });
    assert.throws(() => validateManifest(dupe), /duplicate shard name/);
  });

  it('rejects non-positive byte counts', () => {
    const input = goodManifest();
    ((input['weights'] as Record<string, unknown>[])[0] as Record<string, unknown>)['bytes'] = 0;
    assert.throws(() => validateManifest(input), /bytes: required positive integer/);
  });

  it('rejects non-http absolute wasm URLs', () => {
    const input = goodManifest();
    input['wasmUrl'] = 'ftp://example.invalid/core.wasm';
    assert.throws(() => validateManifest(input), /absolute URLs must be http/);
  });

  it('rejects plain http: wasm URLs except on loopback', () => {
    const bad = goodManifest();
    bad['wasmUrl'] = 'http://example.invalid/core.wasm';
    assert.throws(() => validateManifest(bad), /plain http: is only allowed/);

    for (const host of ['localhost', '127.0.0.1', '[::1]']) {
      const okInput = goodManifest();
      okInput['wasmUrl'] = `http://${host}:8788/core.wasm`;
      assert.equal(validateManifest(okInput).wasmUrl, `http://${host}:8788/core.wasm`);
    }
  });

  it('rejects plain http: shard URLs except on loopback', () => {
    const bad = goodManifest();
    ((bad['weights'] as Record<string, unknown>[])[0] as Record<string, unknown>)['url'] =
      'http://cdn.invalid/w0.bin';
    assert.throws(() => validateManifest(bad), /plain http: is only allowed/);

    const okInput = goodManifest();
    ((okInput['weights'] as Record<string, unknown>[])[0] as Record<string, unknown>)['url'] =
      'http://localhost:8788/w0.bin';
    assert.doesNotThrow(() => validateManifest(okInput));
  });

  it('still accepts https: and relative URLs', () => {
    const https = goodManifest();
    https['wasmUrl'] = 'https://cdn.invalid/core.wasm';
    assert.doesNotThrow(() => validateManifest(https));

    const relative = goodManifest();
    relative['wasmUrl'] = '/canister/core.wasm';
    ((relative['weights'] as Record<string, unknown>[])[0] as Record<string, unknown>)['url'] =
      'weights/w0.bin';
    assert.doesNotThrow(() => validateManifest(relative));
  });

  it('rejects inverted memory page hints', () => {
    const input = goodManifest();
    input['memory'] = { initialPages: 256, maximumPages: 16 };
    assert.throws(() => validateManifest(input), /initialPages must be <=/);
  });
});

describe('cache keys', () => {
  const manifest = validateManifest(goodManifest()) as CanisterManifest;

  it('is namespaced by canister id, version, and shard name', () => {
    const key = weightCacheKey(manifest, manifest.weights[0] as { name: string; url: string; bytes: number; sha256: string });
    assert.equal(key, 'capsula-canister/v1/demo-synth/0.1.0/shard-0.bin');
  });

  it('bumping the version busts the cache', () => {
    const v2 = { ...manifest, version: '0.2.0' };
    const shard = manifest.weights[0] as { name: string; url: string; bytes: number; sha256: string };
    assert.ok(weightCacheKey(v2, shard) !== weightCacheKey(manifest, shard));
  });

  it('wasm core has its own versioned key', () => {
    assert.equal(wasmCacheKey(manifest), 'capsula-canister/v1/demo-synth/0.1.0/core.wasm');
  });
});
