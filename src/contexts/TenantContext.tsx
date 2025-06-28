import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import { logger } from '@/lib/monitoring/logger';
import {
  useUserTenantsQuery,
  useSetActiveTenantMutation,
} from '@/hooks/api/useTenants';
import { useQueryClient } from '@tanstack/react-query';
import { resetTenantCache } from '@/utils/tenant';
import { clearApiCache } from '@/lib/api/apiClient';

// @ts-nocheck
// TODO: Remove ts-nocheck after tenant typing cleanup

interface Tenant {
  id: string;
  name: string;
  slug: string;
  settings?: Record<string, unknown>;
}

interface TenantContextType {
  currentTenant: Tenant | null;
  userTenants: Tenant[];
  setCurrentTenant: (tenant: Tenant) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Fallback tenants to use if API fails to load
const FALLBACK_TENANTS: Tenant[] = [
  {
    id: 'development',
    name: 'Development',
    slug: 'development',
    settings: {},
  },
  {
    id: 'testing',
    name: 'Testing',
    slug: 'testing',
    settings: {},
  },
];

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const {
    user,
    tenants: authTenants,
    currentTenant: authCurrentTenant,
    isLoading: isUserLoading,
  } = useAuth();

  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);

  // Use React Query hooks
  const {
    data: apiTenants = [],
    isLoading: isTenantsLoading,
    error: tenantsError,
  } = useUserTenantsQuery(!isUserLoading && !!user);
  const setActiveTenantMutation = useSetActiveTenantMutation();

  // Only log errors
  useEffect(() => {
    if (tenantsError) {
      logger.error('Failed to load tenants:', tenantsError);
    }
  }, [tenantsError]);

  // Refs for tracking state
  const isUpdatingFromUrl = useRef(false);
  const lastTenantSlug = useRef<string | null>(null);

  // Determine which tenants to use (prefer auth tenants if available)
  const userTenants = useMemo(() => {
    // Ensure we always return an array
    if (authTenants && Array.isArray(authTenants) && authTenants.length > 0) {
      return authTenants as Tenant[];
    }
    if (Array.isArray(apiTenants) && apiTenants.length > 0) {
      return apiTenants;
    }
    // Return empty array instead of undefined/null
    return [];
  }, [authTenants, apiTenants]);

  // Initialize current tenant from URL first, then fall back to auth
  useEffect(() => {
    if (!currentTenant && userTenants.length > 0 && router.isReady) {
      const pathParts = router.asPath.split('/');

      // First, try to find tenant from URL
      let urlTenant: Tenant | null = null;
      for (const part of pathParts) {
        const tenant = userTenants.find(t => t.slug === part);
        if (tenant) {
          urlTenant = tenant;
          break;
        }
      }

      if (urlTenant && !currentTenant) {
        // URL tenant takes priority, but only set if we don't already have a tenant
        logger.info('Initializing tenant from URL:', { slug: urlTenant.slug });
        setCurrentTenant(urlTenant);
        lastTenantSlug.current = urlTenant.slug;
      } else if (authCurrentTenant && !currentTenant) {
        // Fall back to auth tenant only if no URL tenant and no current tenant
        logger.info('Initializing tenant from auth:', {
          slug: authCurrentTenant.slug,
        });
        setCurrentTenant(authCurrentTenant as Tenant);
        lastTenantSlug.current = authCurrentTenant.slug;
      } else if (!currentTenant && userTenants.length === 1) {
        // Single tenant user - auto-select
        logger.info('Initializing with only available tenant');
        setCurrentTenant(userTenants[0]);
        lastTenantSlug.current = userTenants[0].slug;
      }
    }
  }, [
    currentTenant,
    userTenants,
    authCurrentTenant,
    router.isReady,
    router.asPath,
  ]);

  // Handle URL-based tenant updates
  useEffect(() => {
    if (
      router.isReady &&
      userTenants.length > 0 &&
      !isUpdatingFromUrl.current
    ) {
      const pathParts = router.asPath.split('/');

      // Look for any tenant slug from userTenants in the URL
      let urlTenant: string | null = null;
      let matchedTenant: Tenant | null = null;

      // Check if any part of the URL matches a tenant slug
      for (const part of pathParts) {
        const tenant = userTenants.find(t => t.slug === part);
        if (tenant) {
          urlTenant = part;
          matchedTenant = tenant;
          break;
        }
      }

      if (
        matchedTenant &&
        urlTenant &&
        (!currentTenant || currentTenant.slug !== urlTenant) &&
        lastTenantSlug.current !== urlTenant
      ) {
        logger.info(
          `URL-based tenant update: ${currentTenant?.slug} -> ${urlTenant}`
        );

        isUpdatingFromUrl.current = true;
        lastTenantSlug.current = urlTenant;

        // Update state with new tenant
        setCurrentTenant(matchedTenant);

        // Reset caches when tenant changes via URL
        resetTenantCache();
        clearApiCache();

        // Invalidate all queries to force refetch with new tenant context
        queryClient.invalidateQueries();

        // Clean up old queries after a delay (safety measure)
        if (currentTenant && currentTenant.slug !== urlTenant) {
          setTimeout(() => {
            logger.info('Cleaning up old tenant queries after URL change');
            queryClient.removeQueries({
              predicate: query => {
                const queryKey = query.queryKey as string[];
                // Remove any queries whose key contains the old tenant slug
                return queryKey?.includes(currentTenant.slug);
              },
            });
          }, 5000);
        }

        // Reset flag after delay
        setTimeout(() => {
          isUpdatingFromUrl.current = false;
        }, 500);
      }
    }
  }, [router.isReady, router.asPath, userTenants, currentTenant, queryClient]);

  const handleSetCurrentTenant = async (tenant: Tenant) => {
    if (isUpdatingFromUrl.current || currentTenant?.slug === tenant.slug) {
      logger.info('Skipping tenant update:', {
        isUpdating: isUpdatingFromUrl.current,
        isSame: currentTenant?.slug === tenant.slug,
      });
      return;
    }

    logger.info('Switching tenant:', {
      from: currentTenant?.slug,
      to: tenant.slug,
    });

    try {
      isUpdatingFromUrl.current = true;
      lastTenantSlug.current = tenant.slug;

      // Update local state immediately
      setCurrentTenant(tenant);

      // Update on server
      await setActiveTenantMutation.mutateAsync(tenant);

      // Reset flag after delay
      setTimeout(() => {
        isUpdatingFromUrl.current = false;
      }, 500);
    } catch (error) {
      logger.error('Error switching tenant:', error);
      isUpdatingFromUrl.current = false;
    }
  };

  const contextValue = useMemo<TenantContextType>(
    () => ({
      currentTenant,
      userTenants,
      setCurrentTenant: handleSetCurrentTenant,
      isLoading: isUserLoading || isTenantsLoading,
    }),
    [
      currentTenant,
      userTenants,
      isUserLoading,
      isTenantsLoading,
      handleSetCurrentTenant,
    ]
  );

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

export default TenantContext;
