import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { ProjectApiService } from '@/client/services/project.client-service';
import { ClaimApiService } from '@/client/services/claim.client-service';
import { logger } from '@/lib/monitoring/logger';
import { API_ROUTES } from '@/constants/apiRoutes';
import { useApiQuery, useApiMutation } from '@/lib/api/queryClient';
import { useCallback } from 'react';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { claimHistoryQueryKeys } from './useClaimHistory';
import { delay } from '@/utils/delay';

// --- Query Keys ---
export const claimQueryKeys = {
  all: ['claims'] as const,
  list: (projectId: string) =>
    [...claimQueryKeys.all, 'list', projectId] as const,
  detail: (id: string) => [...claimQueryKeys.all, 'detail', id] as const,
};

// --- Custom Hooks ---

/**
 * Fetches all claims for a given project.
 * @param projectId The ID of the project.
 */
export const useClaimsQuery = (projectId: string) => {
  return useApiQuery([...claimQueryKeys.list(projectId)], {
    url: API_ROUTES.PROJECTS.CLAIMS.LIST(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes - prevent frequent refetches
    gcTime: 1000 * 60 * 10, // 10 minutes - keep in cache longer
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false, // Don't retry on error to prevent overwriting optimistic updates
  });
};

/**
 * Provides a mutation for updating a single claim's text.
 * Includes optimistic updates for a seamless user experience.
 */
export const useUpdateClaimMutation = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useApiMutation<any, { claimId: string; text: string }>({
    mutationFn: ({ claimId, text }) => {
      // Prevent updates on temporary IDs
      if (claimId.startsWith('temp-')) {
        logger.warn('Attempted to update temporary claim ID, skipping', {
          claimId,
        });
        // Return a resolved promise with a mock response to prevent errors
        return Promise.resolve({ id: claimId, text });
      }

      // Validate UUID format (basic check)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(claimId)) {
        logger.error('Invalid claim ID format', { claimId });
        return Promise.reject(new Error('Invalid claim ID format'));
      }

      logger.debug('Updating claim', { claimId, textLength: text.length });

      // Using the patchClaim method from ProjectApiService
      return ProjectApiService.patchClaim(claimId, text);
    },
    onMutate: async ({ claimId, text }) => {
      // Skip optimistic updates for temporary IDs
      if (claimId.startsWith('temp-')) {
        return { previousQueries: [] };
      }

      // Cancel any outgoing refetches to prevent them from overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: claimQueryKeys.all });

      // Snapshot all claim list queries
      const queries = queryClient.getQueriesData({
        queryKey: claimQueryKeys.all,
      });

      // Optimistically update all matching queries
      queries.forEach(([queryKey, data]) => {
        if (data && typeof data === 'object' && 'claims' in data) {
          // Handle response format with { claims: [...] }
          const typedData = data as { claims: any[] };
          queryClient.setQueryData(queryKey, {
            ...typedData,
            claims: typedData.claims.map((claim: any) =>
              claim.id === claimId ? { ...claim, text } : claim
            ),
          });
        } else if (Array.isArray(data)) {
          // Handle direct array format
          queryClient.setQueryData(
            queryKey,
            data.map((claim: any) =>
              claim.id === claimId ? { ...claim, text } : claim
            )
          );
        }
      });

      return { previousQueries: queries };
    },
    onError: (err: any, variables, context) => {
      // Type the context properly
      const ctx = context as { previousQueries?: any[] };

      // Check if this is a 404 error (stale claim ID)
      if (
        err?.details?.status === 404 ||
        err?.status === 404 ||
        err?.code === ErrorCode.DB_RECORD_NOT_FOUND
      ) {
        logger.info('Claim not found, likely stale ID - refreshing claims', {
          claimId: variables.claimId,
          error: err,
        });

        // Remove the non-existent claim from cache immediately
        const queries = queryClient.getQueriesData({
          queryKey: claimQueryKeys.all,
        });

        queries.forEach(([queryKey, data]) => {
          if (data && typeof data === 'object' && 'claims' in data) {
            const typedData = data as { claims: any[] };
            queryClient.setQueryData(queryKey, {
              ...typedData,
              claims: typedData.claims.filter(
                (claim: any) => claim.id !== variables.claimId
              ),
            });
          } else if (Array.isArray(data)) {
            queryClient.setQueryData(
              queryKey,
              data.filter((claim: any) => claim.id !== variables.claimId)
            );
          }
        });

        // Show informative toast
        toast({
          title: 'Claim not found',
          description:
            'This claim may have been deleted or updated. Refreshing claims...',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });

        // Force immediate refresh to sync with server
        queryClient.invalidateQueries({
          queryKey: claimQueryKeys.all,
          refetchType: 'active',
        });

        // Don't show error toast for stale IDs
        return;
      }

      // Rollback on failure for other errors
      if (ctx?.previousQueries) {
        ctx.previousQueries.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast({
        title: 'Update failed',
        description: err?.message || 'Your changes could not be saved.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      logger.error('Failed to update claim', {
        error: err,
        claimId: variables.claimId,
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Claim Saved',
        status: 'success',
        duration: 1500,
        isClosable: true,
        position: 'bottom-right',
      });

      // Immediately invalidate the claim history to update the count
      queryClient.invalidateQueries({
        queryKey: claimHistoryQueryKeys.list(variables.claimId),
        refetchType: 'active',
      });

      // Immediately invalidate to sync with server
      queryClient.invalidateQueries({
        queryKey: claimQueryKeys.all,
        refetchType: 'none',
      });
    },
    onSettled: undefined,
  });
};

/**
 * Provides a mutation for adding a new claim.
 */
export const useAddClaimMutation = (projectId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useApiMutation<any, { number: number; text: string }>({
    mutationFn: newClaim => ProjectApiService.addClaim(projectId, newClaim),
    onMutate: async newClaim => {
      // Cancel any in-flight queries
      await queryClient.cancelQueries({
        queryKey: claimQueryKeys.list(projectId),
      });

      // Snapshot the previous data
      const previousData = queryClient.getQueryData(
        claimQueryKeys.list(projectId)
      );

      // Optimistically add the new claim
      queryClient.setQueryData(claimQueryKeys.list(projectId), (old: any) => {
        if (!old) return old;

        // Generate a temporary ID for the optimistic update
        let tempId: string;
        if (typeof window !== 'undefined' && window.crypto) {
          // Use crypto.randomUUID if available
          tempId = `temp-${crypto.randomUUID()}`;
        } else {
          // Fallback to timestamp with crypto random values
          const randomArray = new Uint32Array(2);
          if (typeof window !== 'undefined' && window.crypto) {
            window.crypto.getRandomValues(randomArray);
          } else if (typeof global !== 'undefined' && global.crypto) {
            (global.crypto as any).getRandomValues(randomArray);
          } else {
            randomArray[0] = Date.now();
            randomArray[1] = Date.now() + 1;
          }
          tempId = `temp-${Date.now()}-${randomArray[0]}-${randomArray[1]}`;
        }

        // Handle wrapped response format
        if (
          typeof old === 'object' &&
          'claims' in old &&
          Array.isArray(old.claims)
        ) {
          const existingClaims = old.claims;

          // Check if a claim with this number already exists (excluding temp claims)
          const existingNumbers = new Set(
            existingClaims
              .filter((c: any) => !c.id.startsWith('temp-'))
              .map((c: any) => c.number)
          );
          let finalNumber = newClaim.number;

          // If the number is taken, find the next available one
          while (existingNumbers.has(finalNumber)) {
            finalNumber++;
          }

          const tempClaim = {
            id: tempId,
            ...newClaim,
            number: finalNumber, // Use the adjusted number
            inventionId: null, // Will be set by the server
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return {
            ...old,
            claims: [...existingClaims, tempClaim].sort(
              (a, b) => a.number - b.number
            ),
          };
        }

        // Handle direct array format (shouldn't happen but for safety)
        if (Array.isArray(old)) {
          const tempClaim = {
            id: tempId,
            ...newClaim,
            inventionId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return [...old, tempClaim].sort(
            (a: any, b: any) => a.number - b.number
          );
        }

        return old;
      });

      return { previousData };
    },
    onError: (err: any, _variables, context) => {
      // Rollback on error
      const ctx = context as { previousData?: any };
      if (ctx?.previousData) {
        queryClient.setQueryData(
          claimQueryKeys.list(projectId),
          ctx.previousData
        );
      }

      toast({
        title: 'Failed to add claim',
        description: err.message || 'An unexpected error occurred.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      logger.error('Failed to add claim', { error: err });
    },
    onSuccess: (_data, _variables) => {
      // Get fresh data from server and completely replace cache
      // This ensures we don't have any stale or deleted claims
      const fetchFreshData = async () => {
        try {
          const freshData = await queryClient.fetchQuery({
            queryKey: claimQueryKeys.list(projectId),
            queryFn: () => ProjectApiService.getClaims(projectId),
            staleTime: 0,
          });
          logger.debug('[useAddClaimMutation] Fetched fresh claims after add', {
            claimCount: Array.isArray(freshData)
              ? freshData.length
              : freshData?.claims?.length,
          });
        } catch (error) {
          logger.error('[useAddClaimMutation] Failed to fetch fresh claims', {
            error,
          });
        }
      };

      // Explicitly handle the promise to satisfy ESLint
      void fetchFreshData();

      // Show simple success toast
      toast({
        title: 'Claim Added',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    },
    // Remove onSettled - don't invalidate at all to preserve optimistic updates
  });
};

/**
 * Provides a mutation for deleting a claim.
 */
export const useDeleteClaimMutation = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useApiMutation<any, string>({
    mutationFn: async (claimId: string) => {
      // Skip API call for temporary claims - they only exist in the cache
      if (claimId && claimId.startsWith('temp-')) {
        logger.debug('Skipping API call for temporary claim deletion', {
          claimId,
        });
        return { success: true, message: 'Temporary claim removed' };
      }

      // Validate claim ID format
      if (!claimId) {
        throw new ApplicationError(ErrorCode.INVALID_INPUT, 'Invalid claim ID');
      }

      // Check if we have a tenant slug in the URL
      const pathname =
        typeof window !== 'undefined' ? window.location.pathname : '';
      const pathParts = pathname.split('/');
      const hasTenant = pathParts.length > 1 && pathParts[1] !== '';

      if (!hasTenant) {
        throw new ApplicationError(
          ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
          'Cannot delete claim without active tenant context. Please refresh the page.'
        );
      }

      return ClaimApiService.deleteClaim(claimId);
    },
    onMutate: async claimId => {
      // Cancel any in-flight queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: claimQueryKeys.all });

      // Get all queries that contain claims data
      const previousQueries = queryClient.getQueriesData({
        queryKey: claimQueryKeys.all,
      });

      // Optimistically update each query
      previousQueries.forEach(([queryKey, data]) => {
        if (!data) return;

        // Handle the wrapped response format { claims: [...] }
        if (
          typeof data === 'object' &&
          'claims' in data &&
          Array.isArray((data as any).claims)
        ) {
          const typed = data as { claims: any[] };
          queryClient.setQueryData(queryKey, {
            ...typed,
            claims: typed.claims.filter(c => c.id !== claimId),
          });
        }
        // Handle direct array format (shouldn't happen with current API, but for safety)
        else if (Array.isArray(data)) {
          queryClient.setQueryData(
            queryKey,
            (data as any[]).filter(c => c.id !== claimId)
          );
        }
      });

      return { previousQueries };
    },
    onError: (err: any, variables, context) => {
      // Rollback optimistic updates on error
      const ctx = context as { previousQueries?: any[] };
      if (ctx?.previousQueries) {
        ctx.previousQueries.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Check for specific error types
      const isTenantError =
        err?.statusCode === 403 ||
        err?.code === ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS;
      const isNotFoundError =
        err?.statusCode === 404 || err?.code === ErrorCode.DB_RECORD_NOT_FOUND;

      let errorMessage = 'Could not delete the claim';
      if (isTenantError) {
        errorMessage =
          'Unable to delete claim. Please refresh the page and try again.';
      } else if (isNotFoundError) {
        errorMessage = 'Claim not found. It may have already been deleted.';
      } else if (err?.message) {
        errorMessage = err.message;
      }

      toast({
        title: 'Delete failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      logger.error('Failed to delete claim', {
        error: err,
        claimId: variables,
        statusCode: err?.statusCode,
        errorCode: err?.code,
      });

      // Force refresh claims to ensure UI is in sync with server
      if (isTenantError) {
        const runRefreshSync = async () => {
          try {
            await delay(500);
            await queryClient.invalidateQueries({
              queryKey: claimQueryKeys.all,
              refetchType: 'active',
            });
          } catch (error) {
            logger.error('[DeleteClaimMutation] Failed to invalidate queries', {
              error,
            });
          }
        };

        // Explicitly handle the promise to satisfy ESLint
        void runRefreshSync();
      }
    },
    onSuccess: () => {
      toast({
        title: 'Claim deleted',
        status: 'success',
        duration: 1500,
        isClosable: true,
      });

      // Use soft invalidation to mark as stale without forcing immediate refetch
      // This ensures consistency while preventing UI flicker
      queryClient.invalidateQueries({
        queryKey: claimQueryKeys.all,
        refetchType: 'none',
      });
    },
    onSettled: undefined,
  });
};

/**
 * Hook to manually refresh claims data
 * Use this when you need to sync with the server
 */
export const useRefreshClaims = (projectId: string) => {
  const queryClient = useQueryClient();

  return useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: claimQueryKeys.list(projectId),
      refetchType: 'active',
    });
  }, [queryClient, projectId]);
};
