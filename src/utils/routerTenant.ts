/**
 * Router Tenant Utilities
 *
 * Enforces explicit tenant context for all router operations.
 * NO FALLBACKS - every route must specify its tenant.
 */

import { NextRouter } from 'next/router';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/utils/clientLogger';

/**
 * Helper to safely get string values from router query
 */
function getQueryString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

/**
 * Extract tenant slug from router query
 *
 * @param router - Next.js router instance
 * @returns The tenant slug
 * @throws ApplicationError if tenant is missing
 */
export function getTenantFromRouter(router: NextRouter): string {
  const tenantSlug = getQueryString(router.query.tenant);

  if (!tenantSlug) {
    logger.error('Missing tenant in route', {
      path: router.pathname,
      query: router.query,
    });
    throw new ApplicationError(
      ErrorCode.TENANT_NOT_FOUND,
      'Tenant context is required in URL path'
    );
  }

  return tenantSlug;
}

/**
 * Extract tenant from router query object
 *
 * @param query - Router query object
 * @returns Object with tenant property
 * @throws ApplicationError if tenant is missing
 */
export function extractTenantFromQuery(query: NextRouter['query']): {
  tenant: string;
} {
  const tenantSlug = getQueryString(query.tenant);

  if (!tenantSlug) {
    logger.error('Missing tenant in query', { query });
    throw new ApplicationError(
      ErrorCode.TENANT_NOT_FOUND,
      'Tenant context is required in URL path'
    );
  }

  return { tenant: tenantSlug };
}
