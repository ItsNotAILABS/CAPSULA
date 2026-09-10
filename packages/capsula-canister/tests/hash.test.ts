import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sha256Hex, _overrideSubtleForTests, _resetSubtleForTests } from '../src/hash.ts';

describe('sha256Hex', () => {
  it('matches the well-known SHA-256 of "abc"', async () => {
    const bytes = new TextEncoder().encode('abc');
    assert.equal(
      await sha256Hex(bytes),
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('accepts ArrayBuffer and Uint8Array views identically', async () => {
    const full = new TextEncoder().encode('hello-canister');
    const view = new Uint8Array(full.buffer, 2, 5); // a slice view, not a copy
    assert.equal(await sha256Hex(view), await sha256Hex(full.slice(2, 7)));
  });

  it('is deterministic across calls', async () => {
    const bytes = new TextEncoder().encode('deterministic');
    assert.equal(await sha256Hex(bytes), await sha256Hex(bytes));
  });

  it('throws a clear secure-context error when crypto.subtle is unavailable', async () => {
    _overrideSubtleForTests(undefined);
    try {
      await assert.rejects(
        () => sha256Hex(new TextEncoder().encode('x')),
        /requires a secure context/,
      );
    } finally {
      _resetSubtleForTests();
    }
  });

  it('accepts an injected subtle implementation', async () => {
    const real = (globalThis as unknown as { crypto: Crypto }).crypto.subtle;
    _overrideSubtleForTests(real);
    try {
      assert.equal(
        await sha256Hex(new TextEncoder().encode('abc')),
        'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
      );
    } finally {
      _resetSubtleForTests();
    }
  });
});
