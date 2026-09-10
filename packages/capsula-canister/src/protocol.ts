/**
 * protocol.ts — postMessage RPC envelope between the page (loader.ts)
 * and the canister host worker (worker/canister-host.worker.ts).
 *
 * Protocol version 2. Every message carries `v: 1` in both directions;
 * validators reject any other (or missing) version so a page and worker
 * from different releases fail loudly instead of misinterpreting fields.
 *
 * Every request carries a requestId; every reply echoes it so the page
 * can match concurrent in-flight calls. `generate` is the streaming
 * exception: the worker posts one `token` message per produced token
 * (same requestId), then a final `result`. All messages are
 * structured-clone safe (no functions, no DOM nodes).
 */

export const PROTOCOL_VERSION = 1;

/** Session parameters passed to the core on session_start. Opaque to the host. */
export type SessionParams = Record<string, unknown>;

export type StopReason = 'maxTokens' | 'stopToken' | 'cancelled' | 'endOfStream';

/** Summary the worker posts as the final `result` of a `generate` request. */
export interface GenerateSummary {
  sessionId: string;
  tokens: number[];
  stopReason: StopReason;
}

// -- page -> worker ---------------------------------------------------------

export interface InitRequest {
  kind: 'init';
  v: 1;
  requestId: string;
  /** Raw WASM bytes, transferred (zero-copy) to the worker. */
  wasmBytes: ArrayBuffer;
  /** Expected hex SHA-256; the worker refuses to instantiate on mismatch. */
  wasmSha256: string;
  /** WebAssembly.Memory hints, forwarded from the manifest. */
  memory?: import('./manifest.ts').CanisterMemoryHints;
}

export interface InferRequest {
  kind: 'infer';
  v: 1;
  requestId: string;
  /** Reserved for the real core. The synthetic demo core ignores it. */
  input: number[];
}

export interface PingRequest {
  kind: 'ping';
  v: 1;
  requestId: string;
}

export interface SessionStartRequest {
  kind: 'session_start';
  v: 1;
  requestId: string;
  params: SessionParams;
}

export interface GenerateRequest {
  kind: 'generate';
  v: 1;
  requestId: string;
  sessionId: string;
  /** Prompt tokens; the core ingests them through canister_session_step. */
  tokens: number[];
  maxTokens: number;
  stopTokens?: number[];
}

export interface SessionEndRequest {
  kind: 'session_end';
  v: 1;
  requestId: string;
  sessionId: string;
}

export interface CancelRequest {
  kind: 'cancel';
  v: 1;
  requestId: string;
  /** The requestId of the in-flight generate to abort. */
  targetRequestId: string;
}

export type HostMessage =
  | InitRequest
  | InferRequest
  | PingRequest
  | SessionStartRequest
  | GenerateRequest
  | SessionEndRequest
  | CancelRequest;

// -- worker -> page ---------------------------------------------------------

export interface ReadyReply {
  kind: 'ready';
  v: 1;
  requestId: string;
  exports: string[];
}

export interface PongReply {
  kind: 'pong';
  v: 1;
  requestId: string;
}

export interface ResultReply {
  kind: 'result';
  v: 1;
  requestId: string;
  output: unknown;
}

export interface ErrorReply {
  kind: 'error';
  v: 1;
  requestId: string;
  message: string;
}

export interface SessionReadyReply {
  kind: 'session_ready';
  v: 1;
  requestId: string;
  sessionId: string;
}

export interface TokenMessage {
  kind: 'token';
  v: 1;
  requestId: string;
  sessionId: string;
  token: number;
  /** 0-based index within this generation. */
  index: number;
  done: false;
}

export interface EndedReply {
  kind: 'ended';
  v: 1;
  requestId: string;
  sessionId: string;
}

export interface CancelledReply {
  kind: 'cancelled';
  v: 1;
  requestId: string;
  targetRequestId: string;
  cancelled: boolean;
}

export type WorkerMessage =
  | ReadyReply
  | PongReply
  | ResultReply
  | ErrorReply
  | SessionReadyReply
  | TokenMessage
  | EndedReply
  | CancelledReply;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function hasRequestId(v: Record<string, unknown>): boolean {
  return typeof v['requestId'] === 'string' && (v['requestId'] as string).length > 0;
}

function hasVersion(v: Record<string, unknown>): boolean {
  return v['v'] === PROTOCOL_VERSION;
}

function isNumberArray(v: unknown): v is number[] {
  return (
    Array.isArray(v) && v.every((x) => typeof x === 'number' && Number.isFinite(x))
  );
}

function isPositiveInt(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v > 0;
}

/** True when v is a well-formed page -> worker message (protocol v1). */
export function isHostMessage(v: unknown): v is HostMessage {
  if (!isRecord(v) || !hasRequestId(v) || !hasVersion(v)) return false;
  switch (v['kind']) {
    case 'ping':
      return true;
    case 'infer':
      return v['input'] === undefined || isNumberArray(v['input']);
    case 'init':
      return (
        v['wasmBytes'] instanceof ArrayBuffer &&
        typeof v['wasmSha256'] === 'string'
      );
    case 'session_start':
      return isRecord(v['params']);
    case 'generate':
      return (
        typeof v['sessionId'] === 'string' &&
        v['sessionId'].length > 0 &&
        isNumberArray(v['tokens']) &&
        isPositiveInt(v['maxTokens']) &&
        (v['stopTokens'] === undefined || isNumberArray(v['stopTokens']))
      );
    case 'session_end':
      return typeof v['sessionId'] === 'string' && v['sessionId'].length > 0;
    case 'cancel':
      return (
        typeof v['targetRequestId'] === 'string' &&
        (v['targetRequestId'] as string).length > 0
      );
    default:
      return false;
  }
}

/** True when v is a well-formed worker -> page message (protocol v1). */
export function isWorkerMessage(v: unknown): v is WorkerMessage {
  if (!isRecord(v) || !hasRequestId(v) || !hasVersion(v)) return false;
  switch (v['kind']) {
    case 'ready':
      return Array.isArray(v['exports']);
    case 'session_ready':
      return typeof v['sessionId'] === 'string' && v['sessionId'].length > 0;
    case 'token':
      return (
        typeof v['sessionId'] === 'string' &&
        typeof v['token'] === 'number' &&
        Number.isInteger(v['index']) &&
        (v['index'] as number) >= 0 &&
        v['done'] === false
      );
    case 'ended':
      return typeof v['sessionId'] === 'string' && v['sessionId'].length > 0;
    case 'cancelled':
      return (
        typeof v['targetRequestId'] === 'string' &&
        typeof v['cancelled'] === 'boolean'
      );
    case 'pong':
    case 'result':
      return true;
    case 'error':
      return typeof v['message'] === 'string';
    default:
      return false;
  }
}

/** Type guard for the `output` of a generate `result` reply. */
export function isGenerateSummary(v: unknown): v is GenerateSummary {
  if (!isRecord(v)) return false;
  return (
    typeof v['sessionId'] === 'string' &&
    isNumberArray(v['tokens']) &&
    (v['stopReason'] === 'maxTokens' ||
      v['stopReason'] === 'stopToken' ||
      v['stopReason'] === 'cancelled' ||
      v['stopReason'] === 'endOfStream')
  );
}

let counter = 0;

/** Unique request id for RPC matching. */
export function newRequestId(): string {
  counter += 1;
  return `req-${Date.now().toString(36)}-${counter.toString(36)}-${Math.floor(
    Math.random() * 0xffffff,
  ).toString(36)}`;
}
