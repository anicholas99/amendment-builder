/**
 * Session wrapper that provides a consistent interface regardless of auth provider
 *
 * This file now just re-exports from the auth manager for backward compatibility.
 * All auth operations go through the auth manager.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession as getAuthManagerSession } from './authManager';
import { AuthSession, AuthUser, AuthTenant } from './types';

// Re-export types for backward compatibility
export type AppUser = AuthUser;
export type AppTenant = AuthTenant;
export type AppSession = AuthSession;

/**
 * Get the current session from the auth manager
 *
 * This function maintains the same signature as before but now delegates
 * to the auth manager which handles provider-specific logic.
 */
export async function getSession(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AppSession | null> {
  return getAuthManagerSession(req, res);
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
