import type { NextApiRequest, NextApiResponse } from 'next';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { SecurePresets } from '@/lib/api/securePresets';
import { withCsrf } from '@/lib/security/csrf';
import { withRateLimit } from '@/middleware/rateLimiter';
import { withErrorHandling } from '@/middleware/errorHandling';

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

  // The withCsrf middleware will handle setting the cookie and response header.
  const response = { ok: true, message: 'CSRF token set in cookies' };
  apiLogger.logResponse(200, response);
  return res.status(200).json(response);
}

// Apply withCsrf directly along with rate limiting and error handling
export default withErrorHandling(
  withRateLimit(withCsrf(handler), 'critical-auth') as any
) as (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
