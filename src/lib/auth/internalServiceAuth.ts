/**
 * Internal Service Authentication
 *
 * Implements OAuth 2.0 Client Credentials flow for internal service authentication.
 * Uses short-lived JWT tokens for secure service-to-service communication.
 */

import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { logger } from '@/server/logger';
import { env } from '@/config/env';

// Cache for JWKS client
let jwksClientInstance: jwksClient.JwksClient | null = null;

/**
 * Service account information from JWT
 */
export interface ServiceAccount {
  clientId: string;
  tenantId?: string;
  permissions: string[];
  iat: number;
  exp: number;
}

/**
 * Initialize JWKS client for token verification
 */
function getJwksClient(): jwksClient.JwksClient {
  if (!jwksClientInstance) {
    const auth0Domain = env.AUTH0_DOMAIN;
    if (!auth0Domain) {
      throw new Error('AUTH0_DOMAIN is required for service authentication');
    }

    jwksClientInstance = jwksClient({
      jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
      cache: true,
      cacheMaxAge: 600000, // 10 minutes
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });
  }
  return jwksClientInstance;
}

/**
 * Get signing key from JWKS
 */
async function getSigningKey(kid: string): Promise<string> {
  const client = getJwksClient();
  const key = await client.getSigningKey(kid);
  return key.getPublicKey();
}

/**
 * Verify and decode service account JWT token
 */
export async function verifyServiceToken(
  token: string
): Promise<ServiceAccount | null> {
  try {
    const auth0Domain = env.AUTH0_DOMAIN;
    const auth0Audience = env.AUTH0_AUDIENCE;

    if (!auth0Domain || !auth0Audience) {
      logger.error(
        'Missing Auth0 configuration for service token verification'
      );
      return null;
    }

    // Decode token header to get key ID
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
      logger.warn('Invalid service token format');
      return null;
    }

    // Get public key from JWKS
    const publicKey = await getSigningKey(decoded.header.kid);

    // Verify token
    const verified = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      audience: auth0Audience,
      issuer: `https://${auth0Domain}/`,
    }) as any;

    // Extract service account information
    const serviceAccount: ServiceAccount = {
      clientId: verified.azp || verified.client_id,
      tenantId: verified['https://patentdraft/tenant_id'],
      permissions: verified.permissions || [],
      iat: verified.iat,
      exp: verified.exp,
    };

    logger.debug('Service token verified successfully', {
      clientId: serviceAccount.clientId,
      tenantId: serviceAccount.tenantId,
      expiresIn: serviceAccount.exp - Math.floor(Date.now() / 1000),
    });

    return serviceAccount;
  } catch (error) {
    logger.error('Service token verification failed', { error });
    return null;
  }
}

/**
 * Extract bearer token from Authorization header
 */
export function extractBearerToken(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Check if request is from an authenticated internal service
 * Only supports OAuth bearer tokens - legacy API key support has been removed
 */
export async function authenticateInternalService(
  req: NextApiRequest
): Promise<{
  isAuthenticated: boolean;
  isLegacy: boolean;
  serviceAccount?: ServiceAccount;
  tenantId?: string;
}> {
  // Only check for OAuth bearer tokens
  const bearerToken = extractBearerToken(req);
  if (bearerToken) {
    const serviceAccount = await verifyServiceToken(bearerToken);
    if (serviceAccount) {
      return {
        isAuthenticated: true,
        isLegacy: false,
        serviceAccount,
        tenantId: serviceAccount.tenantId,
      };
    }
  }

  return {
    isAuthenticated: false,
    isLegacy: false,
  };
}

/**
 * Service permissions that can be granted to internal services
 */
export const ServicePermissions = {
  // Read permissions
  READ_PROJECTS: 'read:projects',
  READ_CITATIONS: 'read:citations',
  READ_SEARCH_HISTORY: 'read:search_history',

  // Write permissions
  WRITE_CITATIONS: 'write:citations',
  WRITE_SEARCH_RESULTS: 'write:search_results',
  PROCESS_ASYNC_JOBS: 'process:async_jobs',

  // Admin permissions (rarely granted)
  MANAGE_TENANTS: 'manage:tenants',
  MANAGE_USERS: 'manage:users',
} as const;

/**
 * Check if service account has required permission
 */
export function hasServicePermission(
  serviceAccount: ServiceAccount,
  permission: string
): boolean {
  return serviceAccount.permissions.includes(permission);
}
