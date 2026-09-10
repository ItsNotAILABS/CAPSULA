/**
 * Ambient declarations for the Node built-ins used in tests.
 * Kept minimal on purpose: the package ships zero dependencies,
 * so @types/node is deliberately NOT installed.
 */

declare module 'node:test' {
  export function describe(name: string, fn: () => void | Promise<void>): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
  export function test(name: string, fn: () => void | Promise<void>): void;
}

declare module 'node:assert/strict' {
  export function equal(actual: unknown, expected: unknown, message?: string): void;
  export function deepEqual(actual: unknown, expected: unknown, message?: string): void;
  export function ok(value: unknown, message?: string): asserts value;
  export function throws(
    fn: () => unknown,
    expected?: RegExp | ((e: unknown) => boolean),
    message?: string,
  ): void;
  export function rejects(
    fn: (() => Promise<unknown>) | Promise<unknown>,
    expected?: RegExp | ((e: unknown) => boolean),
    message?: string,
  ): Promise<void>;
  export function doesNotThrow(fn: () => unknown, message?: string): void;
  const def: {
    equal: typeof equal;
    deepEqual: typeof deepEqual;
    ok: typeof ok;
    throws: typeof throws;
    rejects: typeof rejects;
    doesNotThrow: typeof doesNotThrow;
  };
  export default def;
}
