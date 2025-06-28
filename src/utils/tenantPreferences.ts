/**
 * Tenant preference management utilities
 *
 * NOTE: Tenant preferences are now derived from the URL path only.
 * We no longer store tenant preferences client-side for security reasons.
 * The tenant context is determined by the URL structure: /{tenant}/...
 */

import { getTenantSlugFromPath } from './tenant';
import { logger } from '@/lib/monitoring/logger';

interface TenantPreferences {
  lastSelectedTenant?: string;
  lastAccessTime?: number;
}

/**
 * Get tenant preferences from the current URL
 * @deprecated Use getTenantSlugFromPath() directly instead
 */
export function getTenantPreferences(): TenantPreferences {
  logger.warn(
    'getTenantPreferences is deprecated. Use getTenantSlugFromPath() directly.'
  );

  const tenant = getTenantSlugFromPath();
  return {
    lastSelectedTenant: tenant || undefined,
    lastAccessTime: Date.now(),
  };
}

/**
 * Save tenant preferences - NO-OP for security
 * @deprecated Tenant is determined by URL, not stored preferences
 */
export function saveTenantPreferences(_preferences: TenantPreferences): void {
  logger.warn(
    'saveTenantPreferences is deprecated. Tenant is determined by URL path.'
  );
  // NO-OP - we don't store tenant preferences client-side
}

/**
 * Get the current tenant from URL
 */
export function getLastSelectedTenant(): string | null {
  return getTenantSlugFromPath();
}

/**
 * Save the last selected tenant - NO-OP for security
 * @deprecated Navigate to the tenant URL instead
 */
export function saveLastSelectedTenant(tenantSlug: string): void {
  logger.warn(
    `saveLastSelectedTenant is deprecated. Navigate to /${tenantSlug} instead.`
  );
  // NO-OP - we don't store tenant preferences client-side
}

/**
 * Clear tenant preferences - NO-OP for security
 * @deprecated No preferences are stored client-side
 */
export function clearTenantPreferences(): void {
  logger.warn(
    'clearTenantPreferences is deprecated. No tenant preferences are stored client-side.'
  );
  // NO-OP - nothing to clear
}
