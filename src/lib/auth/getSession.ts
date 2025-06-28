// TODO(migration): Remove when IPD Identity integration is complete
// This file handles Auth0 sessions which will be replaced by IPD Identity OAuth flow
import { getSession as getAuth0Session } from '@auth0/nextjs-auth0';
import type { NextApiRequest, NextApiResponse } from 'next';

export interface AppUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

export interface AppTenant {
  id: string;
  slug: string;
  name: string;
}

export interface AppSession {
  user: AppUser;
  currentTenant?: AppTenant;
  permissions: string[];
  tenants: AppTenant[];
}

/**
 * Generic session wrapper that abstracts away Auth0 specifics
 * This allows us to swap auth providers later with minimal changes
 *
 * Supports both:
 * - Cookie-based sessions (current Auth0 implementation)
 * - Bearer token in Authorization header (future OAuth support)
 */
export async function getSession(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AppSession | null> {
  // TODO(migration): When IPD Identity is ready, check for bearer token first
  // This will allow API clients to authenticate directly with IPD tokens
  // without going through the Auth0 session flow

  const session = await getAuth0Session(req, res);
  if (!session?.user) return null;

  // Extract Auth0-specific fields and normalize them
  const user: AppUser = {
    id: session.user.sub!,
    email: session.user.email!,
    name: session.user.name || undefined,
    picture: session.user.picture || undefined,
  };

  // Extract tenant information from Auth0 custom claims
  const currentTenant: AppTenant | undefined = session.user[
    'https://patentdraft/tenant_id'
  ]
    ? {
        id: session.user['https://patentdraft/tenant_id'],
        slug: session.user['https://patentdraft/tenant_slug'] || '',
        name: session.user['https://patentdraft/tenant_name'] || '',
      }
    : undefined;

  // Extract permissions and tenants arrays
  const permissions: string[] =
    session.user['https://patentdraft/permissions'] || [];
  const tenants: AppTenant[] =
    session.user['https://patentdraft/tenants'] || [];

  return {
    user,
    currentTenant,
    permissions,
    tenants,
  };
}

/**
 * Utility to check if user has a specific permission
 */
export function hasPermission(
  session: AppSession | null,
  permission: string
): boolean {
  return session?.permissions.includes(permission) || false;
}

/**
 * Utility to check if user belongs to a specific tenant
 */
export function belongsToTenant(
  session: AppSession | null,
  tenantId: string
): boolean {
  return session?.tenants.some(tenant => tenant.id === tenantId) || false;
}
