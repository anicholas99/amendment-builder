/**
 * Debug utility for verifying tenant isolation in query keys
 */

import { projectKeys } from './projectKeys';
import { inventionQueryKeys } from './inventionKeys';
import { citationKeys } from './citationKeys';
import { searchKeys } from './searchKeys';
import { getTenantSlugFromPath, getCachedTenantSlug } from '@/utils/tenant';

/**
 * Debug function to verify all query keys include current tenant
 * Call this in browser console: window.__debugTenantKeys()
 */
export function debugTenantKeys() {
  const currentTenant = getTenantSlugFromPath();
  const cachedTenant = getCachedTenantSlug();

  console.group('🔍 Tenant Query Key Debug');

  console.log('Current URL:', window.location.pathname);
  console.log('Current Tenant (from URL):', currentTenant);
  console.log('Cached Tenant:', cachedTenant);
  console.log('Match:', currentTenant === cachedTenant ? '✅' : '❌ MISMATCH!');

  console.group('Sample Query Keys:');
  console.log('Projects List:', projectKeys.lists());
  console.log('Project Detail:', projectKeys.detail('test-id'));
  console.log('Invention Detail:', inventionQueryKeys.detail('test-id'));
  console.log('Citation Jobs:', citationKeys.jobs.all());
  console.log('Search History:', searchKeys.history.all());
  console.groupEnd();

  // Check if all keys include the tenant
  const sampleKeys = [
    projectKeys.lists(),
    projectKeys.detail('test'),
    inventionQueryKeys.detail('test'),
    citationKeys.jobs.all(),
    searchKeys.history.all(),
  ];

  const allIncludeTenant = sampleKeys.every(
    key => Array.isArray(key) && key[0] === (currentTenant || 'no-tenant')
  );

  console.log(
    '\nAll keys include tenant:',
    allIncludeTenant ? '✅ YES' : '❌ NO'
  );

  if (!allIncludeTenant) {
    console.error('Some query keys are missing tenant isolation!');
  }

  console.groupEnd();

  return {
    currentTenant,
    cachedTenant,
    match: currentTenant === cachedTenant,
    allKeysIsolated: allIncludeTenant,
  };
}

// Expose to window in development
if (typeof window !== 'undefined') {
  (window as any).__debugTenantKeys = debugTenantKeys;
}
