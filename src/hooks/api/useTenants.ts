import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TenantsApiService } from '@/client/services/tenants.client-service';
import { tenantQueryKeys } from '@/lib/queryKeys';
import { useToast } from '@chakra-ui/react';
import { logger } from '@/lib/monitoring/logger';
import { STALE_TIME } from '@/constants/time';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  settings?: Record<string, unknown>;
}

/**
 * Hook for fetching user's tenants
 */
export const useUserTenantsQuery = (enabled: boolean = true) => {
  return useQuery<Tenant[]>({
    queryKey: tenantQueryKeys.userTenants(),
    queryFn: () => TenantsApiService.getUserTenants(),
    enabled,
    staleTime: STALE_TIME.DEFAULT,
    retry: 2,
  });
};

/**
 * Hook for setting the active tenant
 */
export const useSetActiveTenantMutation = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (tenant: Tenant) =>
      TenantsApiService.setActiveTenant(tenant.id),
    onSuccess: (_, tenant) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.all });

      logger.info('Active tenant set successfully', { tenantId: tenant.id });

      toast({
        title: 'Tenant activated',
        description: `Switched to ${tenant.name}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: error => {
      logger.error('Failed to set active tenant:', error);
      toast({
        title: 'Error',
        description: 'Failed to set active tenant',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });
};

/**
 * Hook for switching tenants (alias for auth switch)
 */
export const useSwitchTenantMutation = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (tenantId: string) => TenantsApiService.switchTenant(tenantId),
    onSuccess: () => {
      // Invalidate all queries to refresh with new tenant context
      queryClient.invalidateQueries();

      toast({
        title: 'Tenant switched',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: error => {
      logger.error('Failed to switch tenant:', error);
      toast({
        title: 'Error switching tenant',
        description: 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });
};

/**
 * Hook for creating a project in a specific tenant context
 */
export const useCreateProjectInTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tenantSlug,
      projectData,
    }: {
      tenantSlug: string;
      projectData: any;
    }) => TenantsApiService.createProject(tenantSlug, projectData),
    onSuccess: () => {
      // Invalidate project queries to show the new project
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
