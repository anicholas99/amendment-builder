/**
 * @fileoverview Query key factory for tenant-related queries
 */

import { getCurrentTenant } from './tenant';

export const tenantQueryKeys = {
  all: ['tenants'] as const,
  userTenants: () =>
    [getCurrentTenant(), ...tenantQueryKeys.all, 'user'] as const,
  active: () => [getCurrentTenant(), ...tenantQueryKeys.all, 'active'] as const,
};
