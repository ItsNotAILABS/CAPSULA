import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isHostMessage,
  isWorkerMessage,
  isGenerateSummary,
  newRequestId,
} from '../src/protocol.ts';

const V = 1;

describe('isHostMessage', () => {
  it('accepts init / infer / ping envelopes', () => {
    assert.ok(
      isHostMessage({
        kind: 'init',
        v: V,
        requestId: 'r1',
        wasmBytes: new ArrayBuffer(8),
        wasmSha256: 'a'.repeat(64),
      }),
    );
    assert.ok(isHostMessage({ kind: 'infer', v: V, requestId: 'r2', input: [1, 2] }));
    assert.ok(isHostMessage({ kind: 'infer', v: V, requestId: 'r2b' }));
    assert.ok(isHostMessage({ kind: 'ping', v: V, requestId: 'r3' }));
  });

  it('accepts the session messages', () => {
    assert.ok(
      isHostMessage({ kind: 'session_start', v: V, requestId: 'r1', params: {} }),
    );
    assert.ok(
      isHostMessage({
        kind: 'generate',
        v: V,
        requestId: 'r2',
        sessionId: 'sess-1',
        tokens: [1, 2],
        maxTokens: 8,
      }),
    );
    assert.ok(
      isHostMessage({
        kind: 'generate',
        v: V,
        requestId: 'r2b',
        sessionId: 'sess-1',
        tokens: [],
        maxTokens: 8,
        stopTokens: [3],
      }),
    );
    assert.ok(
      isHostMessage({ kind: 'session_end', v: V, requestId: 'r3', sessionId: 'sess-1' }),
    );
    assert.ok(
      isHostMessage({ kind: 'cancel', v: V, requestId: 'r4', targetRequestId: 'r2' }),
    );
  });

  it('rejects malformed envelopes', () => {
    assert.ok(!isHostMessage(null));
    assert.ok(!isHostMessage({ kind: 'init', v: V, requestId: 'r1' })); // missing bytes
    assert.ok(
      !isHostMessage({ kind: 'init', v: V, requestId: 'r1', wasmBytes: 'nope', wasmSha256: 'x' }),
    );
    assert.ok(!isHostMessage({ kind: 'infer', v: V, requestId: '' })); // empty requestId
    assert.ok(!isHostMessage({ kind: 'nope', v: V, requestId: 'r1' }));
  });

  it('rejects malformed session messages', () => {
    assert.ok(!isHostMessage({ kind: 'session_start', v: V, requestId: 'r1' })); // no params
    assert.ok(
      !isHostMessage({
        kind: 'generate',
        v: V,
        requestId: 'r2',
        sessionId: 'sess-1',
        tokens: [1, 'x'],
        maxTokens: 8,
      }),
    );
    assert.ok(
      !isHostMessage({
        kind: 'generate',
        v: V,
        requestId: 'r2',
        sessionId: 'sess-1',
        tokens: [],
        maxTokens: 0,
      }),
    );
    assert.ok(!isHostMessage({ kind: 'cancel', v: V, requestId: 'r4' })); // no target
  });

  it('rejects missing or wrong protocol versions', () => {
    assert.ok(
      !isHostMessage({
        kind: 'ping',
        requestId: 'r1', // no v
      }),
    );
    assert.ok(!isHostMessage({ kind: 'ping', v: 2, requestId: 'r1' }));
    assert.ok(!isHostMessage({ kind: 'ping', v: '1', requestId: 'r1' }));
  });
});

describe('isWorkerMessage', () => {
  it('accepts ready / pong / result / error envelopes', () => {
    assert.ok(isWorkerMessage({ kind: 'ready', v: V, requestId: 'r1', exports: ['infer'] }));
    assert.ok(isWorkerMessage({ kind: 'pong', v: V, requestId: 'r1' }));
    assert.ok(isWorkerMessage({ kind: 'result', v: V, requestId: 'r1', output: 42 }));
    assert.ok(isWorkerMessage({ kind: 'error', v: V, requestId: 'r1', message: 'boom' }));
  });

  it('accepts the session replies', () => {
    assert.ok(
      isWorkerMessage({ kind: 'session_ready', v: V, requestId: 'r1', sessionId: 'sess-1' }),
    );
    assert.ok(
      isWorkerMessage({
        kind: 'token',
        v: V,
        requestId: 'r2',
        sessionId: 'sess-1',
        token: 42,
        index: 0,
        done: false,
      }),
    );
    assert.ok(
      isWorkerMessage({ kind: 'ended', v: V, requestId: 'r3', sessionId: 'sess-1' }),
    );
    assert.ok(
      isWorkerMessage({
        kind: 'cancelled',
        v: V,
        requestId: 'r4',
        targetRequestId: 'r2',
        cancelled: true,
      }),
    );
  });

  it('rejects malformed envelopes', () => {
    assert.ok(!isWorkerMessage({ kind: 'ready', v: V, requestId: 'r1' })); // missing exports
    assert.ok(!isWorkerMessage({ kind: 'error', v: V, requestId: 'r1' })); // missing message
    assert.ok(!isWorkerMessage('garbage'));
    assert.ok(!isWorkerMessage({ kind: 'pong', requestId: 'r1' })); // no v
    assert.ok(!isWorkerMessage({ kind: 'pong', v: 0, requestId: 'r1' })); // wrong v
  });
});

describe('isGenerateSummary', () => {
  it('accepts a well-formed generate summary', () => {
    assert.ok(
      isGenerateSummary({ sessionId: 'sess-1', tokens: [1, 2, 3], stopReason: 'maxTokens' }),
    );
    assert.ok(
      isGenerateSummary({ sessionId: 'sess-1', tokens: [], stopReason: 'endOfStream' }),
    );
  });

  it('rejects malformed summaries', () => {
    assert.ok(!isGenerateSummary(null));
    assert.ok(!isGenerateSummary({ sessionId: 'sess-1', tokens: [1], stopReason: 'nope' }));
    assert.ok(!isGenerateSummary({ sessionId: 'sess-1', tokens: ['x'], stopReason: 'maxTokens' }));
  });
});

describe('newRequestId', () => {
  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 200 }, () => newRequestId()));
    assert.equal(ids.size, 200);
  });
});
