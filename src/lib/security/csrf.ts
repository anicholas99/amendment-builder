import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { CSRF_CONFIG } from '@/config/security';
import { AuthenticatedRequest } from '@/types/middleware';
import { env } from '@/config/env';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { authenticateInternalService } from '@/lib/auth/internalServiceAuth';

/**
 * The name of the cookie that stores the CSRF token.
 * We keep it HTTP-only so it cannot be accessed with document.cookie,
 * preventing token extraction via XSS.
 */
const CSRF_COOKIE_NAME = CSRF_CONFIG.COOKIE_NAME;

/**
 * The request header expected to carry the CSRF token for state-changing requests.
 */
const CSRF_HEADER_NAME = CSRF_CONFIG.HEADER_NAME;

/**
 * Secure wrapper that adds CSRF protection to any Next.js API handler.
 *
 * Safe HTTP methods (GET | HEAD | OPTIONS) automatically receive a CSRF cookie.
 * Unsafe methods (POST | PUT | PATCH | DELETE) must provide the same token
 *   via `x-csrf-token` header and the `csrfToken` cookie.
 *
 * If validation fails, the wrapper responds with HTTP 403.
 */
export function withCsrf<Req extends NextApiRequest = AuthenticatedRequest>(
  handler: (req: Req, res: NextApiResponse) => void | Promise<void>
): (req: Req, res: NextApiResponse) => Promise<void> {
  return async function csrfWrappedHandler(
    req: Req,
    res: NextApiResponse
  ): Promise<void> {
    const method = req.method?.toUpperCase() ?? 'GET';

    // Step 1 – on safe methods, ensure the browser has a CSRF cookie
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      ensureCsrfCookie(req, res);
      await handler(req, res);
      return;
    }

    // Allow authenticated internal services to bypass CSRF
    const internalAuth = await authenticateInternalService(req);
    if (internalAuth.isAuthenticated) {
      await handler(req, res);
      return;
    }

    // Step 2 – on unsafe methods, verify token
    const tokenFromCookie = req.cookies?.[CSRF_COOKIE_NAME];
    const tokenFromHeader =
      (req.headers[CSRF_HEADER_NAME] as string | undefined) ??
      req.headers[CSRF_HEADER_NAME.toLowerCase()];

    if (
      !tokenFromCookie ||
      !tokenFromHeader ||
      tokenFromCookie !== tokenFromHeader
    ) {
      res.status(403).json({ error: 'Invalid CSRF token' });
      return;
    }

    await handler(req, res);
  };
}

function ensureCsrfCookie<Req extends NextApiRequest = NextApiRequest>(
  req: Req,
  res: NextApiResponse
) {
  let token = req.cookies?.[CSRF_COOKIE_NAME];
  if (!token) {
    token = crypto.randomBytes(32).toString('hex');
    const isProd = env.NODE_ENV === 'production';
    const cookie = `${CSRF_COOKIE_NAME}=${token}; Path=/; SameSite=Lax; HttpOnly; ${isProd ? 'Secure; ' : ''}Max-Age=3600`;
    res.setHeader('Set-Cookie', cookie.trim());
  }

  // Always expose the token via response header so the frontend can capture it.
  res.setHeader(CSRF_HEADER_NAME, token as string);
}
