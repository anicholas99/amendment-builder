import React, { useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import AuthContext, { AuthContextType } from './AuthContext';
import { useSessionQuery, useSwitchTenantMutation } from '@/hooks/api/useAuth';
import { logger } from '@/lib/monitoring/logger';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();

  // Use React Query hooks for data fetching
  const {
    data: session,
    isLoading,
    error,
    refetch: refetchSession,
  } = useSessionQuery();
  const switchTenantMutation = useSwitchTenantMutation();

  // Utility functions - wrapped in useCallback to maintain stable references
  const hasPermission = useCallback(
    (permission: string): boolean => {
      return session?.permissions.includes(permission) || false;
    },
    [session?.permissions]
  );

  const belongsToTenant = useCallback(
    (tenantId: string): boolean => {
      return session?.tenants.some(tenant => tenant.id === tenantId) || false;
    },
    [session?.tenants]
  );

  // Wrapper for tenant switching that returns a boolean
  const switchTenant = useCallback(
    async (tenantId: string): Promise<boolean> => {
      try {
        await switchTenantMutation.mutateAsync(tenantId);
        return true;
      } catch (error) {
        return false;
      }
    },
    [switchTenantMutation]
  );

  // Wrapper for refetchSession to match expected signature
  const refetchSessionWrapper = useCallback(async (): Promise<void> => {
    await refetchSession();
  }, [refetchSession]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<AuthContextType>(
    () => ({
      // Session data - handle undefined by converting to null
      session: session ?? null,
      user: session?.user || null,
      currentTenant: session?.currentTenant || null,
      permissions: session?.permissions || [],
      tenants: session?.tenants || [],

      // Loading states
      isLoading,
      error: error?.message || null,

      // Actions
      refetchSession: refetchSessionWrapper,
      switchTenant,

      // Utilities
      hasPermission,
      belongsToTenant,
    }),
    [
      session,
      isLoading,
      error,
      refetchSessionWrapper,
      switchTenant,
      hasPermission,
      belongsToTenant,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
