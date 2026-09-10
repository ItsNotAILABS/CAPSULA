/**
 * signals.ts — AbortSignal composition helpers.
 *
 * Lets the loader combine three independent cancellation sources into one
 * signal handed to fetch/downloadWeights:
 *   - the user's own AbortSignal (optional),
 *   - an internal lifetime controller (aborted by terminate()),
 *   - a fetch timeout (AbortSignal.timeout) for calls that must not hang.
 *
 * Zero dependencies; works in browsers, workers, and Node 18+.
 */

/** Combine several signals: the result aborts when the first input aborts. */
export function combineSignals(
  signals: Array<AbortSignal | undefined>,
): AbortSignal {
  const active = signals.filter((s): s is AbortSignal => s !== undefined);
  if (active.length === 0) {
    return new AbortController().signal; // never aborts
  }
  if (active.length === 1) {
    return active[0] as AbortSignal;
  }
  const ctrl = new AbortController();
  for (const s of active) {
    if (s.aborted) {
      ctrl.abort(s.reason);
      break;
    }
    s.addEventListener('abort', () => ctrl.abort(s.reason), { once: true });
  }
  return ctrl.signal;
}

/**
 * A signal that aborts after `ms` milliseconds. Uses AbortSignal.timeout
 * when available, with a manual fallback so old runtimes don't break.
 */
export function timeoutSignal(ms: number): AbortSignal {
  if (typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms);
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => {
    ctrl.abort(new Error(`timed out after ${ms}ms`));
  }, ms);
  // Don't hold a Node process open for a pure timeout helper.
  (timer as unknown as { unref?: () => void }).unref?.();
  return ctrl.signal;
}
