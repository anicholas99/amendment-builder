/**
 * Service Token Client
 *
 * Helper for internal services to obtain OAuth tokens using the Client Credentials flow.
 * This should be used by background workers and other internal services.
 */

import { env, getServiceAccountCredentials } from '@/config/env';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

// Token cache to avoid unnecessary token requests
const tokenCache = new Map<string, CachedToken>();

/**
 * Get an OAuth token for an internal service
 *
 * @param clientId - The OAuth client ID for the service
 * @param clientSecret - The OAuth client secret for the service
 * @param tenantId - Optional tenant ID to include in the token
 * @returns The access token or null if authentication fails
 */
export async function getServiceToken(
  clientId: string,
  clientSecret: string,
  tenantId?: string
): Promise<string | null> {
  const cacheKey = `${clientId}:${tenantId || 'global'}`;

  // Check cache first
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }

  try {
    const auth0Domain = env.AUTH0_DOMAIN;
    const auth0Audience = env.AUTH0_AUDIENCE;

    if (!auth0Domain || !auth0Audience) {
      // Error logging removed for client compatibility
      return null;
    }

    const tokenUrl = `https://${auth0Domain}/oauth/token`;

    const body = {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      audience: auth0Audience,
    };

    // Add tenant context if provided
    if (tenantId) {
      (body as any)['https://patentdraft/tenant_id'] = tenantId;
    }

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      // Error logging removed for client compatibility
      return null;
    }

    const data: TokenResponse = await response.json();

    // Cache the token (expire 5 minutes before actual expiration)
    const expiresAt = Date.now() + (data.expires_in - 300) * 1000;
    tokenCache.set(cacheKey, {
      token: data.access_token,
      expiresAt,
    });
    // Debug logging removed for client compatibility

    return data.access_token;
  } catch (error) {
    // Error logging removed for client compatibility
    return null;
  }
}

/**
 * Create authorization header for internal service requests
 *
 * @param token - The OAuth access token
 * @returns Headers object with Authorization header
 */
export function createServiceAuthHeaders(
  token: string
): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Environment variables for service authentication
 * These should be set for each internal service
 */
export interface ServiceCredentials {
  clientId: string;
  clientSecret: string;
  tenantId?: string;
}

/**
 * Get service credentials from environment variables
 *
 * @param serviceName - The name of the service (used for env var prefix)
 * @returns Service credentials or null if not configured
 */
export function getServiceCredentials(
  serviceName: string
): ServiceCredentials | null {
  const prefix = serviceName.toUpperCase().replace(/-/g, '_');

  // Get credentials using the helper function from env
  const credentials = getServiceAccountCredentials(prefix);

  if (!credentials.clientId || !credentials.clientSecret) {
    // Warning logging removed for client compatibility
    return null;
  }

  return credentials;
}
