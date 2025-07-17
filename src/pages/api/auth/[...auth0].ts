/**
 * Dynamic auth route handler
 *
 * This route handles all auth operations (login, logout, callback, etc.)
 * and delegates to the auth manager which uses the configured auth provider.
 *
 * When switching auth providers, this file doesn't need to change at all.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { SecurePresets } from '@/server/api/securePresets';

/**
 * Create a dynamic handler that routes to the appropriate auth provider
 */
async function authHandler(req: NextApiRequest, res: NextApiResponse) {
  const { auth0 } = req.query;
  const action = Array.isArray(auth0) ? auth0[0] : auth0;

  // Dynamically import to avoid circular dependencies
  const { handleAuthCallback, handleLogout, getLoginUrl, getLogoutUrl } =
    await import('@/lib/auth/authManager');

  switch (action) {
    case 'login':
      // Redirect to login
      const loginReturnTo = req.query.returnTo as string;
      res.redirect(getLoginUrl(loginReturnTo));
      break;

    case 'logout':
      // Handle logout
      await handleLogout(req, res);
      break;

    case 'callback':
      // Handle auth callback
      const result = await handleAuthCallback(req, res);
      if (result.success) {
        // Redirect to return URL or home
        const returnTo = (req.query.returnTo as string) || '/';
        res.redirect(returnTo);
      } else {
        // Handle error
        res
          .status(400)
          .json({ error: result.error || 'Authentication failed' });
      }
      break;

    default:
      res.status(404).json({ error: 'Not found' });
  }
}

// Apply rate limiting to the auth handler
export default SecurePresets.public(authHandler, { rateLimit: 'auth' });
