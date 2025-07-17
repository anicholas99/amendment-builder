/**
 * Auth Manager - Single source of truth for authentication
 *
 * To swap auth providers:
 * 1. Create a new provider implementing AuthProvider interface
 * 2. Change the provider initialization in getAuthProvider()
 * 3. That's it!
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { AuthProvider, AuthSession } from './types';
import { Auth0Provider } from './providers/auth0.provider';
// import { MockProvider } from './providers/mock.provider';
// Future: import { IPDProvider } from './providers/ipd.provider';

let authProvider: AuthProvider | null = null;

/**
 * Get the current auth provider instance
 * THIS IS THE ONLY PLACE TO CHANGE WHEN SWAPPING AUTH PROVIDERS
 */
function getAuthProvider(): AuthProvider {
  if (!authProvider) {
    // To swap providers, just change this line:
    authProvider = new Auth0Provider({});

    // For local development without Auth0:
    // authProvider = new MockProvider({});

    // Future IPD swap would be:
    // authProvider = new IPDProvider({});
  }
  return authProvider;
}

/**
 * Get the current session - used by all API routes and middleware
 */
export async function getSession(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthSession | null> {
  const provider = getAuthProvider();
  return provider.getSession(req, res);
}

/**
 * Handle auth callback - used by the auth API route
 */
export async function handleAuthCallback(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const provider = getAuthProvider();
  return provider.handleCallback(req, res);
}

/**
 * Handle logout - used by the logout API route
 */
export async function handleLogout(req: NextApiRequest, res: NextApiResponse) {
  const provider = getAuthProvider();
  return provider.handleLogout(req, res);
}

/**
 * Get login URL - used by frontend
 */
export function getLoginUrl(returnTo?: string): string {
  const provider = getAuthProvider();
  return provider.getLoginUrl(returnTo);
}

/**
 * Get logout URL - used by frontend
 */
export function getLogoutUrl(returnTo?: string): string {
  const provider = getAuthProvider();
  return provider.getLogoutUrl(returnTo);
}

/**
 * Validate if a session is still valid
 */
export async function validateSession(session: AuthSession): Promise<boolean> {
  const provider = getAuthProvider();
  return provider.validateSession(session);
}

/**
 * Get the current auth provider name
 */
export function getAuthProviderName(): string {
  const provider = getAuthProvider();
  return provider.name;
}
