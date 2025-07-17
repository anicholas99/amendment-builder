/**
 * Tenant Configuration
 *
 * Enforces explicit tenant context for all operations.
 * NO DEFAULT TENANTS - every request must specify its tenant explicitly.
 */

import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';

/**
 * Validate and extract tenant slug from request headers/query
 *
 * @param tenantSlug - The tenant slug from the request
 * @returns The validated tenant slug
 * @throws ApplicationError if no tenant slug is provided
 */
export function validateTenantSlug(
  tenantSlug: string | string[] | undefined
): string {
  const slug = Array.isArray(tenantSlug) ? tenantSlug[0] : tenantSlug;

  if (!slug || slug.trim() === '') {
    logger.error('Missing tenant context', {
      tenantSlug,
      type: typeof tenantSlug,
    });
    throw new ApplicationError(
      ErrorCode.TENANT_NOT_FOUND,
      'Tenant context is required for all operations'
    );
  }

  // Return the normalized slug - tenant existence validation happens in middleware
  return slug.trim();
}
