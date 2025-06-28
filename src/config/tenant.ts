/**
 * Tenant Configuration
 *
 * Centralizes all tenant-related configuration to prevent hardcoded values
 * and make the multi-tenant architecture more maintainable.
 */

import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/lib/monitoring/logger';
import { environment } from './environment';

/**
 * Default tenant slug used ONLY for local development when no tenant is specified.
 *
 * ⚠️ WARNING: This should NEVER be used in production!
 * In production, all requests must include an explicit tenant context.
 */
export const DEFAULT_DEVELOPMENT_TENANT_SLUG = 'development';

/**
 * Get the tenant slug from the request or fall back to development default.
 *
 * @param tenantSlug - The tenant slug from the request
 * @returns The tenant slug to use
 * @throws Error in production if no tenant slug is provided
 */
export function getTenantSlugWithFallback(
  tenantSlug: string | string[] | undefined
): string {
  const slug = Array.isArray(tenantSlug) ? tenantSlug[0] : tenantSlug;

  if (!slug || slug.trim() === '') {
    // In production, missing tenant context is a critical error
    if (environment.isProduction) {
      throw new ApplicationError(
        ErrorCode.TENANT_NOT_FOUND,
        'Tenant context is required in production'
      );
    }

    // In development, use the configured default
    logger.warn('No tenant slug provided, using development default', {
      defaultTenantSlug: DEFAULT_DEVELOPMENT_TENANT_SLUG,
      environment: environment.env,
      warning: 'This should not happen in production!',
    });
    return DEFAULT_DEVELOPMENT_TENANT_SLUG;
  }

  // Return the normalized slug - tenant validation is handled elsewhere in the middleware chain
  return slug.trim();
}
