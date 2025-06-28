/**
 * Tenant Hook for Patent Drafter AI
 *
 * This hook provides access to tenant-related functionality
 * for use throughout the application.
 *
 * IMPORTANT: This is a temporary implementation for development only.
 * In production, this will be integrated with IPD's multi-tenant system.
 */

import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/monitoring/logger';
import { useRouter } from 'next/router';
import { environment } from '@/config/environment';

// Import mock auth only for development
const mockAuthService = environment.isDevelopment
  ? require('../lib/development/mockAuth').default
  : null;

// Import mock tenants only for development
const MOCK_TENANTS = environment.isDevelopment
  ? require('../lib/development/mockAuth').MOCK_TENANTS
  : [];

/**
 * Hook for accessing tenant-related functionality
 * Now using the normalized auth context instead of Auth0 specifics
 */
export function useTenant() {
  const {
    currentTenant,
    tenants,
    isLoading,
    switchTenant: authSwitchTenant,
  } = useAuth();

  const router = useRouter();
  const tenantSlug = router.query.tenant as string;

  /**
   * Get the current tenant ID from the normalized auth context
   */
  const getCurrentTenantId = useCallback((): string | null => {
    return currentTenant?.id || null;
  }, [currentTenant]);

  /**
   * Get the current tenant name from the normalized auth context
   */
  const getCurrentTenantName = useCallback((): string => {
    return currentTenant?.name || 'Unknown Tenant';
  }, [currentTenant]);

  /**
   * Get the current tenant slug for use in URLs
   */
  const getCurrentTenantSlug = useCallback((): string | null => {
    return currentTenant?.slug || null;
  }, [currentTenant]);

  /**
   * Get all available tenants from the normalized auth context
   */
  const getAvailableTenants = useCallback(() => {
    return tenants || [];
  }, [tenants]);

  /**
   * Switch to a different tenant using the auth context
   */
  const switchTenant = useCallback(
    async (tenantId: string) => {
      try {
        const success = await authSwitchTenant(tenantId);
        if (success) {
          logger.info('Tenant switched successfully', { tenantId });
          return true;
        } else {
          logger.warn('Tenant switch failed', { tenantId });
          return false;
        }
      } catch (error) {
        logger.error('Error switching tenant:', error);
        return false;
      }
    },
    [authSwitchTenant]
  );

  /**
   * Check if a resource belongs to the current tenant
   */
  const isInCurrentTenant = useCallback(
    (resourceTenantId?: string) => {
      const currentTenantId = getCurrentTenantId();
      if (!resourceTenantId || !currentTenantId) return false;
      return resourceTenantId === currentTenantId;
    },
    [getCurrentTenantId]
  );

  if (!tenantSlug) {
    // In development, this is common during initial page loads
    if (environment.isDevelopment) {
      logger.debug('[useTenant] No tenant slug found in URL');
    }
    return {
      // Functions
      getCurrentTenantId,
      getCurrentTenantName,
      getCurrentTenantSlug,
      getAvailableTenants,
      switchTenant,
      isInCurrentTenant,

      // Convenience properties
      currentTenantId: getCurrentTenantId(),
      currentTenantName: getCurrentTenantName(),
      currentTenantSlug: getCurrentTenantSlug(),
      availableTenants: getAvailableTenants(),
      isLoading,
    };
  }

  if (environment.isDevelopment) {
    logger.debug('[useTenant] Current tenant:', { tenantSlug });
  }

  return {
    // Functions
    getCurrentTenantId,
    getCurrentTenantName,
    getCurrentTenantSlug,
    getAvailableTenants,
    switchTenant,
    isInCurrentTenant,

    // Convenience properties
    currentTenantId: getCurrentTenantId(),
    currentTenantName: getCurrentTenantName(),
    currentTenantSlug: getCurrentTenantSlug(),
    availableTenants: getAvailableTenants(),
    isLoading,
  };
}

export default useTenant;
