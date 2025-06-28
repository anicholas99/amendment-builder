/**
 * Tenant Debug Utilities
 *
 * Helper functions to debug and fix tenant context issues
 */

import { logger } from '@/lib/monitoring/logger';
import { resetTenantCache, getTenantSlugFromPath } from './tenant';
import { environment } from '@/config/environment';

export interface TenantDebugInfo {
  currentUrl: string;
  pathname: string;
  extractedTenant: string;
  cachedTenant: string | null;
  tenantFromContext?: string | null;
  apiHeaders?: Record<string, string>;
  windowAvailable: boolean;
  headers: Record<string, string>;
}

/**
 * Get comprehensive tenant debug information
 */
export function getTenantDebugInfo(): TenantDebugInfo {
  const currentUrl =
    typeof window !== 'undefined' ? window.location.href : 'N/A';
  const pathname =
    typeof window !== 'undefined' ? window.location.pathname : '';
  const extractedTenant = getTenantSlugFromPath() || 'null';

  // Access the cached tenant directly (we'll need to export this from tenant.ts)
  const cachedTenant = (window as any).__tenantCache?.cachedTenantSlug;

  return {
    currentUrl,
    pathname,
    extractedTenant,
    cachedTenant: cachedTenant || 'null',
    windowAvailable: typeof window !== 'undefined',
    headers:
      typeof window !== 'undefined' ? { 'x-tenant-slug': extractedTenant } : {},
  };
}

/**
 * Force reset tenant context and navigate to correct tenant
 */
export async function fixTenantContext(
  targetTenant: string = 'development'
): Promise<void> {
  logger.info(`[Tenant Debug] Fixing tenant context to: ${targetTenant}`);

  // 1. Reset the tenant cache
  resetTenantCache();

  // 2. Get current path without tenant
  const pathname = window.location.pathname;
  const pathParts = pathname.split('/').filter(Boolean);

  // Remove current tenant if present
  if (
    pathParts[0] === 'development' ||
    pathParts[0] === 'testing' ||
    pathParts[0] === 'oop'
  ) {
    pathParts.shift();
  }

  // 3. Build new path with correct tenant
  const newPath = `/${targetTenant}${pathParts.length > 0 ? '/' + pathParts.join('/') : ''}`;

  logger.info(`[Tenant Debug] Navigating from ${pathname} to ${newPath}`);

  // 4. Navigate to correct URL
  if (pathname !== newPath) {
    window.location.href = newPath;
  } else {
    // If we're already on the right path, just reload to clear any stale state
    window.location.reload();
  }
}

/**
 * Log all tenant-related information for debugging
 */
export function logTenantState(): void {
  const debugInfo = getTenantDebugInfo();

  console.group('🏢 Tenant Debug Information');
  console.log('Current URL:', debugInfo.currentUrl);
  console.log('Pathname:', debugInfo.pathname);
  console.log('Extracted Tenant:', debugInfo.extractedTenant);
  console.log('Cached Tenant:', debugInfo.cachedTenant);

  // Check localStorage for any tenant preferences
  const tenantPrefs = Object.keys(localStorage)
    .filter(key => key.includes('tenant'))
    .reduce(
      (acc, key) => {
        acc[key] = localStorage.getItem(key);
        return acc;
      },
      {} as Record<string, string | null>
    );

  if (Object.keys(tenantPrefs).length > 0) {
    console.log('Tenant preferences in localStorage:', tenantPrefs);
  }

  // Check React Query cache for tenant data
  if (
    typeof window !== 'undefined' &&
    (window as any).__REACT_QUERY_DEVTOOLS_GLOBAL_STORE__
  ) {
    const queryClient = (window as any).__REACT_QUERY_DEVTOOLS_GLOBAL_STORE__;
    console.log(
      'React Query tenant queries:',
      Array.from(queryClient?.getQueryCache?.()?.getAll() || [])
        .filter((query: { queryKey?: unknown[] }) => query.queryKey?.[0] && typeof query.queryKey[0] === 'string' && query.queryKey[0].includes('tenant'))
        .map((query: Record<string, unknown>) => ({
          key: query.queryKey,
          state: query.state.status,
          data: query.state.data,
        }))
    );
  }

  console.groupEnd();
}

/**
 * Clear all tenant-related caches and reload
 */
export function clearAllTenantCaches(): void {
  logger.info('[Tenant Debug] Clearing all tenant caches');

  // 1. Reset tenant cache
  resetTenantCache();

  // 2. Clear any tenant-related localStorage
  Object.keys(localStorage)
    .filter(key => key.includes('tenant'))
    .forEach(key => {
      logger.info(`[Tenant Debug] Removing localStorage key: ${key}`);
      localStorage.removeItem(key);
    });

  // 3. Clear React Query cache for tenant queries
  if (typeof window !== 'undefined' && (window as any).__queryClient) {
    const queryClient = (window as any).__queryClient;
    queryClient.removeQueries({ queryKey: ['tenants'] });
    queryClient.removeQueries({ queryKey: ['user-tenants'] });
  }

  logger.info('[Tenant Debug] All tenant caches cleared. Reloading...');
  window.location.reload();
}

/**
 * Clear project-specific caches without reloading
 */
export function clearProjectCaches(): void {
  logger.info('[Tenant Debug] Clearing project caches');

  if (typeof window !== 'undefined') {
    // Clear React Query cache for project queries
    const queryClient =
      (window as any).__REACT_QUERY_DEVTOOLS_GLOBAL_STORE__
        ?.getQueryCache?.()
        ?.getQueryClient?.() ||
      (window as any).__queryClient ||
      (window as any).queryClient;

    if (queryClient) {
      // Clear all project-related queries
      queryClient.removeQueries({ queryKey: ['projects'] });
      queryClient.removeQueries({ queryKey: ['project'] });
      queryClient.removeQueries({ queryKey: ['invention'] });
      queryClient.removeQueries({ queryKey: ['documents'] });
      queryClient.removeQueries({ queryKey: ['claims'] });

      // Invalidate to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['projects'] });

      logger.info('[Tenant Debug] Project caches cleared and invalidated');
    } else {
      logger.warn('[Tenant Debug] Could not find React Query client');
    }

    // Also clear any API client cache
    if ((window as any).__apiDebug?.clearCache) {
      (window as any).__apiDebug.clearCache();
      logger.info('[Tenant Debug] API cache cleared');
    }
  }
}

export function logTenantOperation(operation: string, data: Record<string, unknown> = {}) {
  // Only log in development to avoid performance issues
  if (!environment.isDevelopment) {
    return;
  }

  // ... existing code ...
}

// Expose debug functions to window in development
if (typeof window !== 'undefined' && environment.isDevelopment) {
  (window as any).__tenantDebug = {
    getTenantDebugInfo,
    fixTenantContext,
    logTenantState,
    clearAllTenantCaches,
    clearProjectCaches,
  };

  // Also expose the cache directly for inspection
  (window as any).__tenantCache = {
    get cachedTenantSlug() {
      // This will need to be exported from tenant.ts
      return null; // Placeholder
    },
  };
}
