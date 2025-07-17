import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { SecurePresets } from '@/server/api/securePresets';
import { CSRF_CONFIG } from '@/config/security';
import { env } from '@/config/env';
import { apiResponse } from '@/utils/api/responses';

const apiLogger = createApiLogger('csrf-token');

/**
 * CSRF token endpoint
 * Returns a CSRF token for the client to use in subsequent requests
 * This is a public endpoint that doesn't require authentication
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);

  // Add cache headers to reduce redundant calls
  // Cache for 1 minute on the client side
  res.setHeader('Cache-Control', 'private, max-age=60');
  res.setHeader('Vary', 'Cookie'); // Cache varies based on cookies

  // Get or generate CSRF token
  let csrfToken = req.cookies[CSRF_CONFIG.COOKIE_NAME];

  if (!csrfToken) {
    // Generate a new token if none exists
    csrfToken = crypto.randomBytes(32).toString('hex');

    // Set the cookie with appropriate security settings
    const isProd = env.NODE_ENV === 'production';
    const cookieOptions = [
      `${CSRF_CONFIG.COOKIE_NAME}=${csrfToken}`,
      'Path=/',
      'SameSite=Lax',
      'HttpOnly',
      isProd ? 'Secure' : '',
      'Max-Age=3600', // 1 hour
    ]
      .filter(Boolean)
      .join('; ');

    res.setHeader('Set-Cookie', cookieOptions);
  }

  // Always return the token in the response header for the client to capture
  res.setHeader(CSRF_CONFIG.HEADER_NAME, csrfToken);

  const response = {
    ok: true,
    message: 'CSRF token available',
    // Don't expose the actual token value in the JSON response for security
  };

  apiLogger.logResponse(200, response);
  return apiResponse.ok(res, response);
}

// SECURITY: This is a public endpoint that provides CSRF tokens
// It uses the critical-auth rate limit for protection
export default SecurePresets.public(handler, { rateLimit: 'critical-auth' });
