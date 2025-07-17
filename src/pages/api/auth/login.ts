// TODO: Delete this route after IPD Identity is live - login will be handled by IPD OAuth flow
import { handleLogin } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { environment } from '@/config/environment';
import { SecurePresets } from '@/server/api/securePresets';

const apiLogger = createApiLogger('auth/login');

// Define query schema for validation
const querySchema = z.object({
  returnTo: z.string().url().optional(), // Validate returnTo is a valid URL if provided
});

/**
 * Auth0 login handler
 * Initiates the Auth0 login flow with optional returnTo URL
 * This is a public endpoint that doesn't require authentication
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);

  if (req.method !== 'GET') {
    apiLogger.warn('Method not allowed', { method: req.method });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate query parameters
  const validation = querySchema.safeParse(req.query);
  if (!validation.success) {
    return res.status(400).json({
      error: 'Invalid query parameters',
      details: validation.error.flatten(),
    });
  }
  const { returnTo } = validation.data;

  apiLogger.info('Initiating Auth0 login', {
    returnTo: returnTo || '/',
    hasAudience: !!environment.auth.audience,
  });

  // Call Auth0's handleLogin with the returnTo parameter
  // Note: handleLogin takes control of the response, so we don't need to return anything
  await handleLogin(req, res, {
    returnTo: returnTo || '/',
    authorizationParams: {
      // Add any additional authorization parameters here
      prompt: 'login', // Always show the login prompt
      response_type: 'code',
      scope: 'openid profile email',
      audience: environment.auth.audience,
      connection: 'Username-Password-Authentication',
    },
  });

  // Auth0's handleLogin manages the response, so this may not be reached
  apiLogger.info('Auth0 login handler completed');
}

// Use SecurePresets for a public auth login endpoint
export default SecurePresets.public(handler);
