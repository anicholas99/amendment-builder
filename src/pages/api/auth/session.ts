import { getSession } from '@/lib/auth/getSession';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { SecurePresets } from '@/lib/api/securePresets';

const apiLogger = createApiLogger('auth/session');

/**
 * Session endpoint that provides normalized session data to the frontend
 * This abstracts away Auth0 specifics and provides a consistent interface
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);

  if (req.method !== 'GET') {
    apiLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);

    if (!session) {
      apiLogger.info('No session found');
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    apiLogger.info('Session retrieved successfully', {
      userId: session.user.id,
      currentTenantId: session.currentTenant?.id,
      tenantsCount: session.tenants.length,
    });

    // Add cache headers to reduce redundant calls
    // Cache for 30 seconds on the client side, but always revalidate with the server
    res.setHeader('Cache-Control', 'private, max-age=30, must-revalidate');
    res.setHeader('Vary', 'Cookie'); // Cache varies based on cookies

    return res.status(200).json(session);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    apiLogger.errorSafe('Error retrieving session', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Use SecurePresets for a public session endpoint
export default SecurePresets.public(handler, { rateLimit: 'critical-auth' });
