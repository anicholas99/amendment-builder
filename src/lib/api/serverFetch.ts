import { logger } from '@/server/logger';
import { randomUUID } from 'crypto';

/**
 * Lightweight wrapper around the global `fetch` for server-side code.
 *
 *  – Adds an `x-request-id` header (if not already present) so calls can
 *    be correlated across logs.
 *  – Logs URL, status and duration for observability.
 *  – Retries transient errors (network failure or 5xx) a configurable number
 *    of times with exponential back-off.
 *
 * NOTE: This is **NOT** intended for calls to our own Next.js API – those
 * should stay client-side via `apiFetch`.  `serverFetch` is for outbound
 * third-party services (OpenAI, malware scanner, etc.).
 */
export async function serverFetch(
  url: string,
  init: RequestInit = {},
  opts: { retries?: number; baseDelayMs?: number } = {}
): Promise<Response> {
  const { retries = 2, baseDelayMs = 300 } = opts;

  // Inject request-id if caller hasn't set one.
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  };
  if (!headers['x-request-id']) headers['x-request-id'] = randomUUID();

  let attempt = 0;
  const start = Date.now();

  while (true) {
    try {
      const res = await fetch(url, { ...init, headers });
      const duration = Date.now() - start;
      logger.info('[serverFetch] completed', {
        url,
        status: res.status,
        attempt,
        durationMs: duration,
      });

      // Retry on 5xx errors (except 501) if attempts remain
      if (res.status >= 500 && res.status !== 501 && attempt < retries) {
        attempt++;
        await wait(baseDelayMs * attempt);
        continue;
      }

      return res;
    } catch (err) {
      logger.warn('[serverFetch] network error', { url, attempt, err });
      if (attempt < retries) {
        attempt++;
        await wait(baseDelayMs * attempt);
        continue;
      }
      throw err;
    }
  }
}

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
