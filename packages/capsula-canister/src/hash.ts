/**
 * hash.ts — SHA-256 helper over WebCrypto.
 *
 * Works in browsers, Web Workers, and Node 20+. No dependencies.
 *
 * Secure-context requirement: crypto.subtle only exists in secure contexts
 * (https://, localhost, or file:// in some browsers). In a non-secure
 * context this module throws a clear error naming the requirement instead
 * of dying with a confusing TypeError on `undefined.digest`.
 */

const HEX = '0123456789abcdef';

type SubtleLike = Pick<SubtleCrypto, 'digest'>;

/**
 * Test seam. Pass a stub to simulate environments with/without
 * crypto.subtle; pass undefined (via _resetSubtleForTests) to restore the
 * real global lookup.
 */
let testOverride: { subtle: SubtleLike | undefined } | undefined;

export function _overrideSubtleForTests(subtle: SubtleLike | undefined): void {
  testOverride = { subtle };
}

export function _resetSubtleForTests(): void {
  testOverride = undefined;
}

function getSubtle(): SubtleLike {
  const subtle =
    testOverride !== undefined
      ? testOverride.subtle
      : (globalThis as unknown as { crypto?: { subtle?: SubtleLike } }).crypto
          ?.subtle;
  if (!subtle) {
    throw new Error(
      'sha256Hex requires a secure context (https:// or localhost): ' +
        'crypto.subtle is unavailable in this context, so integrity ' +
        'verification cannot run',
    );
  }
  return subtle;
}

/** Hex-encoded SHA-256 of the given bytes. */
export async function sha256Hex(data: ArrayBuffer | Uint8Array): Promise<string> {
  const view = data instanceof Uint8Array ? data : new Uint8Array(data);
  // Copy so subtle.digest always sees a clean, exact-size buffer.
  const clean = new Uint8Array(view.byteLength);
  clean.set(view);
  const digest = await getSubtle().digest('SHA-256', clean.buffer as ArrayBuffer);
  const bytes = new Uint8Array(digest);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    const b: number = bytes[i] ?? 0;
    out += HEX.charAt(b >> 4) + HEX.charAt(b & 15);
  }
  return out;
}
