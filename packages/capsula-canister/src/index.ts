/**
 * @capsula/canister — browser WASM canister scaffolding.
 *
 * MECHANICS ONLY: manifest validation, integrity-checked weight downloads
 * with Cache Storage, and a Web Worker host that instantiates a WASM core
 * in-page. No real model weights and no real inference are wired yet.
 */

export {
  validateManifest,
  ManifestValidationError,
  weightCacheKey,
  wasmCacheKey,
} from './manifest.ts';
export type {
  CanisterManifest,
  WeightShard,
  CanisterMemoryHints,
} from './manifest.ts';

export { downloadWeights, fetchRange, summarizeProgress, DOWNLOAD_CONCURRENCY } from './downloader.ts';
export type {
  ProgressSnapshot,
  DownloadOptions,
  CacheLike,
  DownloadedShard,
  ShardProgress,
} from './downloader.ts';

export { loadCanister } from './loader.ts';
export type {
  LoadOptions,
  CanisterHandle,
  MinimalWorker,
  CreateWorker,
  GenerateOptions,
  ReasoningSession,
} from './loader.ts';

export {
  isHostMessage,
  isWorkerMessage,
  isGenerateSummary,
  newRequestId,
  PROTOCOL_VERSION,
} from './protocol.ts';
export type {
  HostMessage,
  WorkerMessage,
  InitRequest,
  InferRequest,
  PingRequest,
  SessionStartRequest,
  GenerateRequest,
  SessionEndRequest,
  CancelRequest,
  ReadyReply,
  PongReply,
  ResultReply,
  ErrorReply,
  SessionReadyReply,
  TokenMessage,
  EndedReply,
  CancelledReply,
  GenerateSummary,
  SessionParams,
  StopReason,
} from './protocol.ts';

export { combineSignals, timeoutSignal } from './signals.ts';

export { sha256Hex, _overrideSubtleForTests, _resetSubtleForTests } from './hash.ts';

/** Package version. Bumped manually until release automation exists. */
export const CANISTER_PACKAGE_VERSION = '0.1.0';
