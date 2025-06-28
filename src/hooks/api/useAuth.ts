import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useToast } from '@chakra-ui/react';
import { logger } from '@/lib/monitoring/logger';
import { authQueryKeys, tenantQueryKeys } from '@/lib/queryKeys';
import type { AppSession } from '@/lib/auth/getSession';
import { AuthApiService } from '@/client/services/auth.client-service';
import { STALE_TIME } from '@/constants/time';

/**
 * Hook for fetching the current user session
 */
export const useSessionQuery = () => {
  const router = useRouter();

  return useQuery<AppSession | null>({
    queryKey: authQueryKeys.session(),
    queryFn: async () => {
      try {
        const sessionData = await AuthApiService.getSession();
        if (sessionData) {
          logger.info('Session loaded successfully', {
            userId: sessionData.user.id,
            currentTenantId: sessionData.currentTenant?.id,
          });
        } else {
          logger.info('No active session found');
        }
        return sessionData;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load session';
        logger.error('Error fetching session:', err);

        // If we get a 401, redirect to login
        if (errorMessage.includes('401')) {
          logger.info('Session expired, redirecting to login');
          window.location.href = '/api/auth/login';
          return null;
        }

        throw new Error(errorMessage);
      }
    },
    staleTime: STALE_TIME.DEFAULT,
    retry: (failureCount, error) => {
      // Don't retry on 401s
      if (error.message?.includes('401')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook for switching the current tenant
 */
export const useSwitchTenantMutation = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (tenantId: string) => AuthApiService.switchTenant(tenantId),
    onSuccess: () => {
      // Invalidate session to refetch with new tenant
      queryClient.invalidateQueries({ queryKey: authQueryKeys.session() });
      // Also invalidate tenant queries
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.all });

      toast({
        title: 'Tenant switched',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: err => {
      logger.error('Error switching tenant:', err);
      toast({
        title: 'Error switching tenant',
        description: 'Failed to switch tenant. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });
};
