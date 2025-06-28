/**
 * Tenant utilities for query keys
 * Separate file to avoid circular dependencies
 */

import { getTenantSlugFromPath } from '@/utils/tenant';

/**
 * Helper to get current tenant slug for query key isolation
 * This ensures complete data separation between tenants in the cache
 */
export const getCurrentTenant = () => getTenantSlugFromPath() || 'no-tenant';
