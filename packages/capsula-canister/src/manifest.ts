/**
 * manifest.ts — canister manifest types + validation.
 *
 * A canister manifest is a small JSON document that tells the page:
 *   - which WASM core to load (wasmUrl + wasmSha256),
 *   - which weight shards to download (name/url/bytes/sha256),
 *   - optional WebAssembly memory hints.
 *
 * This module does NOT fetch anything; see loader.ts / downloader.ts.
 * The normative schema lives in schema/canister.schema.json — this
 * validator mirrors it. Both must agree; tests pin the behavior.
 */

export interface WeightShard {
  /** Shard file name, e.g. "shard-000.bin". Unique within a manifest. */
  name: string;
  /**
   * URL the browser fetches. Absolute URLs must be https:, except plain
   * http: on localhost/127.0.0.1 (dev only). Relative URLs are same-origin.
   */
  url: string;
  /** Exact expected byte length. */
  bytes: number;
  /** Lowercase hex SHA-256 of the exact bytes. */
  sha256: string;
}

export interface CanisterMemoryHints {
  initialPages?: number;
  maximumPages?: number;
}

export interface CanisterManifest {
  id: string;
  name: string;
  /** Semver, e.g. "0.1.0". Bumping busts the browser weight cache. */
  version: string;
  wasmUrl: string;
  wasmSha256: string;
  weights: WeightShard[];
  memory?: CanisterMemoryHints;
}

export class ManifestValidationError extends Error {
  readonly details: string[];
  constructor(details: string[]) {
    super(`invalid canister manifest: ${details.join('; ')}`);
    this.name = 'ManifestValidationError';
    this.details = details;
  }
}

const HEX64 = /^[0-9a-f]{64}$/;
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const ABSOLUTE_URL = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

/**
 * URL safety rule (mixed-content + integrity): absolute URLs must be
 * https:, EXCEPT plain http: on loopback hosts (localhost, 127.0.0.1,
 * ::1) for local development. Relative URLs are same-origin and allowed.
 */
function assertSafeUrl(
  field: string,
  url: string,
  errors: string[],
): void {
  if (!ABSOLUTE_URL.test(url)) return; // relative: same-origin, fine
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    errors.push(`${field}: malformed absolute URL`);
    return;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    errors.push(`${field}: absolute URLs must be http(s)`);
    return;
  }
  const loopback =
    parsed.hostname === 'localhost' ||
    parsed.hostname === '127.0.0.1' ||
    parsed.hostname === '::1' ||
    parsed.hostname === '[::1]'; // Node keeps brackets on IPv6 literals
  if (parsed.protocol === 'http:' && !loopback) {
    errors.push(
      `${field}: plain http: is only allowed for localhost/127.0.0.1 ` +
        '(mixed-content + integrity risk); use https:',
    );
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isPositiveInt(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v > 0;
}

/**
 * Validate unknown input (e.g. parsed manifest JSON) and return a typed
 * manifest. Throws ManifestValidationError listing every problem found.
 */
export function validateManifest(input: unknown): CanisterManifest {
  const errors: string[] = [];
  if (!isRecord(input)) {
    throw new ManifestValidationError(['manifest must be a JSON object']);
  }

  const { id, name, version, wasmUrl, wasmSha256, weights, memory } = input;

  if (!isNonEmptyString(id)) errors.push('id: required non-empty string');
  if (!isNonEmptyString(name)) errors.push('name: required non-empty string');
  if (!isNonEmptyString(version) || !SEMVER.test(version)) {
    errors.push('version: required semver string like "0.1.0"');
  }
  if (!isNonEmptyString(wasmUrl)) {
    errors.push('wasmUrl: required non-empty string');
  } else {
    assertSafeUrl('wasmUrl', wasmUrl, errors);
  }
  if (typeof wasmSha256 !== 'string' || !HEX64.test(wasmSha256.toLowerCase())) {
    errors.push('wasmSha256: required 64-char hex SHA-256');
  }

  const shards: WeightShard[] = [];
  if (!Array.isArray(weights) || weights.length === 0) {
    errors.push('weights: required non-empty array');
  } else {
    const seen = new Set<string>();
    weights.forEach((w: unknown, i: number) => {
      const at = `weights[${i}]`;
      if (!isRecord(w)) {
        errors.push(`${at}: must be an object`);
        return;
      }
      let ok = true;
      if (!isNonEmptyString(w['name'])) {
        errors.push(`${at}.name: required non-empty string`);
        ok = false;
      } else if (seen.has(w['name'])) {
        errors.push(`${at}.name: duplicate shard name "${w['name']}"`);
        ok = false;
      } else {
        seen.add(w['name']);
      }
      if (!isNonEmptyString(w['url'])) {
        errors.push(`${at}.url: required non-empty string`);
        ok = false;
      } else {
        assertSafeUrl(`${at}.url`, w['url'] as string, errors);
      }
      if (!isPositiveInt(w['bytes'])) {
        errors.push(`${at}.bytes: required positive integer`);
        ok = false;
      }
      if (typeof w['sha256'] !== 'string' || !HEX64.test(w['sha256'].toLowerCase())) {
        errors.push(`${at}.sha256: required 64-char hex SHA-256`);
        ok = false;
      }
      if (ok) {
        shards.push({
          name: w['name'] as string,
          url: w['url'] as string,
          bytes: w['bytes'] as number,
          sha256: (w['sha256'] as string).toLowerCase(),
        });
      }
    });
  }

  let mem: CanisterMemoryHints | undefined;
  if (memory !== undefined) {
    if (!isRecord(memory)) {
      errors.push('memory: must be an object');
    } else {
      const { initialPages, maximumPages } = memory;
      if (initialPages !== undefined && !isPositiveInt(initialPages)) {
        errors.push('memory.initialPages: must be a positive integer');
      }
      if (maximumPages !== undefined && !isPositiveInt(maximumPages)) {
        errors.push('memory.maximumPages: must be a positive integer');
      }
      if (
        isPositiveInt(initialPages) &&
        isPositiveInt(maximumPages) &&
        initialPages > maximumPages
      ) {
        errors.push('memory.initialPages must be <= memory.maximumPages');
      }
      mem = {};
      if (isPositiveInt(initialPages)) mem.initialPages = initialPages;
      if (isPositiveInt(maximumPages)) mem.maximumPages = maximumPages;
    }
  }

  if (errors.length > 0) {
    throw new ManifestValidationError(errors);
  }
  const out: CanisterManifest = {
    id: id as string,
    name: name as string,
    version: version as string,
    wasmUrl: wasmUrl as string,
    wasmSha256: (wasmSha256 as string).toLowerCase(),
    weights: shards,
  };
  if (mem !== undefined) out.memory = mem;
  return out;
}

/**
 * Versioned Cache Storage key for a weight shard.
 * Bumping the manifest version busts the cache; different canisters
 * and shards never collide.
 */
export function weightCacheKey(manifest: CanisterManifest, shard: WeightShard): string {
  return `capsula-canister/v1/${manifest.id}/${manifest.version}/${shard.name}`;
}

/** Versioned Cache Storage key for the WASM core bytes. */
export function wasmCacheKey(manifest: CanisterManifest): string {
  return `capsula-canister/v1/${manifest.id}/${manifest.version}/core.wasm`;
}
