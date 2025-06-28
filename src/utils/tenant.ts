/**
 * Utility functions for tenant-related operations
 */

import { logger } from '@/lib/monitoring/logger';
import { environment } from '@/config/environment';

// Cache for tenant slug to avoid repeated expensive operations
let cachedTenantSlug: string | null = null;
let lastPathChecked: string | null = null;

/**
 * Extract tenant slug from the current URL path
 * @returns The tenant slug or null if not found
 */
export function getTenantSlugFromPath(): string | null {
  if (typeof window === 'undefined') {
    logger.warn(
      '[getTenantSlugFromPath] Called on server side - returning null'
    );
    return null;
  }

  const currentPath = window.location.pathname;

  // If the path changed, invalidate the cache
  if (lastPathChecked !== currentPath) {
    cachedTenantSlug = null;
  }

  // Return cached value if we have it and path hasn't changed
  if (cachedTenantSlug && lastPathChecked === currentPath) {
    return cachedTenantSlug;
  }

  lastPathChecked = currentPath;

  const pathParts = currentPath.split('/');

  // Extract the first path segment as the tenant slug
  let tenantSlug: string | null = null;

  if (pathParts.length > 1 && pathParts[1] !== '') {
    // We have a tenant in the URL
    tenantSlug = pathParts[1];
  } else {
    // No tenant in URL - return null (no fallback)
    logger.debug('No tenant specified in URL');
    tenantSlug = null;
  }

  cachedTenantSlug = tenantSlug;

  return tenantSlug;
}

/**
 * Add tenant slug to request headers
 * @param pathname The URL pathname to extract tenant from
 * @param headers Existing headers or empty object
 * @returns Headers object with x-tenant-slug added
 */
export function addTenantToHeaders(
  pathname: string,
  headers: Record<string, string> = {}
): Record<string, string> {
  const tenantSlug = getTenantSlugFromPath();

  if (!tenantSlug) {
    // No tenant means the request is invalid
    logger.debug('No tenant specified - request may fail');
    // Don't add the header at all - let the backend handle the error appropriately
    return headers;
  }

  return {
    ...headers,
    'x-tenant-slug': tenantSlug,
  };
}

/**
 * Reset the tenant cache - call this when tenant changes
 */
export function resetTenantCache(): void {
  cachedTenantSlug = null;
  lastPathChecked = null;
  logger.debug('Tenant cache reset');
}

/**
 * Get the current cached tenant slug (for debugging)
 */
export function getCachedTenantSlug(): string | null {
  return cachedTenantSlug;
}

/**
 * Get the last path checked (for debugging)
 */
export function getLastPathChecked(): string | null {
  return lastPathChecked;
}

// Expose cache values to window for debugging in development
if (typeof window !== 'undefined' && environment.isDevelopment) {
  (window as any).__tenantCache = {
    get cachedTenantSlug() {
      return cachedTenantSlug;
    },
    get lastPathChecked() {
      return lastPathChecked;
    },
    reset: resetTenantCache,
  };
}
