export type CapsulaMessage = { type: 'ping' | 'score' | 'manifest'; payload?: Record<string, unknown> };

function post(type: string, payload: Record<string, unknown>) {
  self.postMessage({ type, payload });
}

self.onmessage = (event: MessageEvent<CapsulaMessage>) => {
  const { type, payload = {} } = event.data;
  if (type === 'ping') post('pong', { ok: true, worker: 'capsula.worker' });
  else if (type === 'score') {
    const targets = Array.isArray(payload.targets) ? payload.targets.length : 1;
    const workers = Array.isArray(payload.workers) ? payload.workers.length : 1;
    post('score-result', { score: Math.min(99, 52 + targets * 7 + workers * 6) });
  } else if (type === 'manifest') post('manifest-result', { ok: true, manifest: payload, generatedAt: new Date().toISOString() });
  else post('error', { message: 'unknown message' });
};

export {};
