import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToastWrapper';
import { ProjectApiService } from '@/client/services/project.client-service';
import { ClaimApiService } from '@/client/services/claim.client-service';
import { ClaimsClientService } from '@/client/services/claims.client-service';
import { logger } from '@/utils/clientLogger';
import { API_ROUTES } from '@/constants/apiRoutes';
import { useApiQuery, useApiMutation } from '@/lib/api/queryClient';
import { useCallback } from 'react';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { delay } from '@/utils/delay';
import { projectKeys } from '@/lib/queryKeys';
import { useMutation } from '@tanstack/react-query';
import { ClaimData } from '@/types/claimTypes';

// Define the Claim interface locally to avoid importing from Prisma on client-side
interface Claim {
  id: string;
  number: number;
  text: string;
  inventionId: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Query Keys ---
export const claimQueryKeys = {
  all: ['claims'] as const,
  list: (projectId: string) =>
    [...claimQueryKeys.all, 'list', projectId] as const,
  detail: (id: string) => [...claimQueryKeys.all, 'detail', id] as const,
};

// --- Helper Functions ---

/**
 * Find the project ID associated with a claim from the cache
 */
const findProjectIdFromCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  claimId: string
): string | null => {
  const queries = queryClient.getQueriesData({ queryKey: claimQueryKeys.all });

  for (const [queryKey, data] of queries) {
    // Extract projectId from query key if it's a list query
    if (
      Array.isArray(queryKey) &&
      queryKey.includes('list') &&
      queryKey.length > 3
    ) {
      const projectId = queryKey[3] as string;

      // Check if this claim exists in this project's data
      if (data && typeof data === 'object') {
        const claims = extractClaims(data as ClaimsQueryData);
        if (claims.some(c => c.id === claimId)) {
          return projectId;
        }
      } else if (Array.isArray(data)) {
        if ((data as ClaimData[]).some(c => c.id === claimId)) {
          return projectId;
        }
      }
    }
  }

  return null;
};

/**
 * Update a specific claim in the cache
 */
// Define types for claim query data
type ClaimsQueryData =
  | { success: boolean; data: { claims: ClaimData[] } }
  | { claims: ClaimData[] }
  | ClaimData[]
  | undefined;
type ClaimQueryKeys =
  | readonly ['claims']
  | readonly ['claims', 'list', string]
  | readonly ['claims', 'detail', string];

// Helper function to extract claims from both new and legacy response formats
const extractClaims = (data: ClaimsQueryData): ClaimData[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if ('data' in data && data.data) {
    return (data as { success: boolean; data: { claims: ClaimData[] } }).data
      .claims;
  }
  if ('claims' in data) {
    return (data as { claims: ClaimData[] }).claims;
  }
  return [];
};

const _updateClaimInCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
  updatedClaim: ClaimData
) => {
  queryClient.setQueryData(claimQueryKeys.list(projectId), old => {
    if (!old) return old;

    const typedOld = old as ClaimsQueryData;

    if (typedOld && typeof typedOld === 'object' && 'claims' in typedOld) {
      return {
        ...typedOld,
        claims: typedOld.claims
          .map(claim => (claim.id === updatedClaim.id ? updatedClaim : claim))
          .sort((a, b) => a.number - b.number),
      };
    } else if (Array.isArray(typedOld)) {
      return typedOld
        .map(claim => (claim.id === updatedClaim.id ? updatedClaim : claim))
        .sort((a, b) => a.number - b.number);
    }

    return old;
  });
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
    staleTime: 0, // Always consider data stale so invalidation triggers refetch
    gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache much longer
    refetchOnMount: 'always', // Always refetch on mount to ensure fresh data
    refetchOnWindowFocus: false, // Keep this false to avoid too many refetches
    refetchOnReconnect: false,
    retry: 1, // Allow one retry to handle transient errors
    retryDelay: 1000, // Wait 1 second before retry
    // Allow invalidation to trigger immediate refetch
    notifyOnChangeProps: ['data', 'error', 'isLoading', 'isRefetching'],
    // Add network mode to handle offline scenarios
    networkMode: 'online',
  });
};

/**
 * Provides a mutation for updating a single claim's text.
 * Includes optimistic updates for a seamless user experience.
 */
export const useUpdateClaimMutation = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      claimId,
      text,
    }: {
      claimId: string;
      text: string;
    }) => {
      if (!claimId) {
        throw new Error('Claim ID is required');
      }
      if (!text || text.trim() === '') {
        throw new Error('Claim text cannot be empty');
      }
      const result = await ClaimsClientService.updateClaimText(claimId, text);
      // Transform dates to strings if needed
      return {
        ...result,
        createdAt:
          result.createdAt instanceof Date
            ? result.createdAt.toISOString()
            : result.createdAt,
        updatedAt:
          result.updatedAt instanceof Date
            ? result.updatedAt.toISOString()
            : result.updatedAt,
      };
    },
    onMutate: async ({ claimId, text }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: claimQueryKeys.all });

      // Get all queries that contain claims data
      const previousQueries = queryClient.getQueriesData({
        queryKey: claimQueryKeys.all,
      });

      // Find the project ID from cache
      const _projectId = findProjectIdFromCache(queryClient, claimId);

      // Optimistically update each query
      previousQueries.forEach(([queryKey, data]) => {
        if (!data) return;

        // Handle the wrapped response format { claims: [...] }
        const typedData = data as ClaimsQueryData;
        if (
          typedData &&
          typeof typedData === 'object' &&
          'claims' in typedData &&
          Array.isArray(typedData.claims)
        ) {
          const updatedClaims = typedData.claims.map(claim =>
            claim.id === claimId
              ? { ...claim, text, updatedAt: new Date().toISOString() }
              : claim
          );
          queryClient.setQueryData(queryKey, {
            ...typedData,
            claims: updatedClaims,
          });
        }
        // Handle direct array format
        else if (Array.isArray(typedData)) {
          const updatedClaims = typedData.map(claim =>
            claim.id === claimId
              ? { ...claim, text, updatedAt: new Date().toISOString() }
              : claim
          );
          queryClient.setQueryData(queryKey, updatedClaims);
        }
      });

      return { previousQueries };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic updates on error
      const ctx = context as { previousQueries?: Array<[unknown, unknown]> };
      if (ctx?.previousQueries) {
        ctx.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey as ClaimQueryKeys, data);
        });
      }

      logger.error('[useClaims] Failed to update claim', { error });
      toast({
        title: 'Failed to update claim',
        description:
          error instanceof Error ? error.message : 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    onSuccess: (updatedClaim: Claim, _variables) => {
      logger.info('[useClaims] Claim updated successfully', {
        claimId: updatedClaim.id,
      });

      // Find the project ID from the cache
      const projectId = findProjectIdFromCache(queryClient, updatedClaim.id);

      if (projectId) {
        // Directly set the updated data in all relevant queries
        const queries = queryClient.getQueriesData({
          queryKey: claimQueryKeys.list(projectId),
        });

        queries.forEach(([queryKey, data]) => {
          if (!data) return;

          const typedData = data as ClaimsQueryData;
          if (
            typedData &&
            typeof typedData === 'object' &&
            'claims' in typedData &&
            Array.isArray(typedData.claims)
          ) {
            const updatedClaims = typedData.claims.map(claim =>
              claim.id === updatedClaim.id ? updatedClaim : claim
            );
            queryClient.setQueryData(queryKey, {
              ...typedData,
              claims: updatedClaims,
            });
          } else if (Array.isArray(typedData)) {
            const updatedClaims = typedData.map(claim =>
              claim.id === updatedClaim.id ? updatedClaim : claim
            );
            queryClient.setQueryData(queryKey, updatedClaims);
          }
        });

        // Just mark as stale for background refetch, don't force immediate refetch
        // This preserves optimistic updates while ensuring eventual consistency
        queryClient.invalidateQueries({
          queryKey: claimQueryKeys.list(projectId),
          refetchType: 'none', // Don't force refetch - let React Query handle it based on staleTime
        });
      }

      // Don't show toast for every update as it's too noisy with autosave
      // Only show for critical updates
    },
  });
};

/**
 * Mutation hook for updating a claim's number
 */
export const useUpdateClaimNumberMutation = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      claimId,
      number,
    }: {
      claimId: string;
      number: number;
    }) => {
      if (!claimId) {
        throw new Error('Claim ID is required');
      }
      if (!number || number < 1) {
        throw new Error('Claim number must be a positive integer');
      }
      const result = await ClaimsClientService.updateClaimNumber(
        claimId,
        number
      );
      // Transform dates to strings if needed
      return {
        ...result,
        createdAt:
          result.createdAt instanceof Date
            ? result.createdAt.toISOString()
            : result.createdAt,
        updatedAt:
          result.updatedAt instanceof Date
            ? result.updatedAt.toISOString()
            : result.updatedAt,
      };
    },
    onMutate: async ({ claimId, number: newNumber }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: claimQueryKeys.all });

      // Snapshot all claim queries
      const previousQueries = queryClient.getQueriesData({
        queryKey: claimQueryKeys.all,
      });

      // Update all matching queries optimistically
      previousQueries.forEach(([queryKey, data]) => {
        if (!data) return;

        // Handle wrapped response format
        const typedData = data as ClaimsQueryData;
        if (
          typedData &&
          typeof typedData === 'object' &&
          'claims' in typedData &&
          Array.isArray(typedData.claims)
        ) {
          const claims = [...typedData.claims];

          // Find the claim being updated
          const claimIndex = claims.findIndex(c => c.id === claimId);
          if (claimIndex === -1) return;

          const oldNumber = claims[claimIndex].number;

          // Find if another claim has the target number
          const conflictIndex = claims.findIndex(
            c => c.number === newNumber && c.id !== claimId
          );

          if (conflictIndex !== -1) {
            // Swap the numbers
            claims[claimIndex] = { ...claims[claimIndex], number: newNumber };
            claims[conflictIndex] = {
              ...claims[conflictIndex],
              number: oldNumber,
            };
          } else {
            // Simple update
            claims[claimIndex] = { ...claims[claimIndex], number: newNumber };
          }

          // Sort by claim number
          claims.sort((a, b) => a.number - b.number);

          queryClient.setQueryData(queryKey, {
            ...typedData,
            claims,
          });
        }
        // Handle direct array format
        else if (Array.isArray(data)) {
          const claims = [...(data as Claim[])];

          const claimIndex = claims.findIndex(c => c.id === claimId);
          if (claimIndex === -1) return;

          const oldNumber = claims[claimIndex].number;
          const conflictIndex = claims.findIndex(
            c => c.number === newNumber && c.id !== claimId
          );

          if (conflictIndex !== -1) {
            claims[claimIndex] = { ...claims[claimIndex], number: newNumber };
            claims[conflictIndex] = {
              ...claims[conflictIndex],
              number: oldNumber,
            };
          } else {
            claims[claimIndex] = { ...claims[claimIndex], number: newNumber };
          }

          claims.sort((a, b) => a.number - b.number);
          queryClient.setQueryData(queryKey, claims);
        }
      });

      return { previousQueries };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      const ctx = context as { previousQueries?: Array<[unknown, unknown]> };
      if (ctx?.previousQueries) {
        ctx.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey as ClaimQueryKeys, data);
        });
      }

      logger.error('[useClaims] Failed to update claim number', { error });
      toast({
        title: 'Failed to update claim number',
        description:
          error instanceof Error ? error.message : 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    onSuccess: (updatedClaim: Claim) => {
      logger.info('[useClaims] Claim number updated successfully', {
        claimId: updatedClaim.id,
        newNumber: updatedClaim.number,
      });

      toast({
        title: 'Claim number updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });

      // Soft invalidation to sync with server without immediate refetch
      queryClient.invalidateQueries({
        queryKey: claimQueryKeys.all,
        refetchType: 'none',
      });
    },
  });
};

/**
 * Provides a mutation for adding a new claim.
 */
export const useAddClaimMutation = (projectId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useApiMutation<
    { claims: ClaimData[] },
    { number: number; text: string }
  >({
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
      queryClient.setQueryData(claimQueryKeys.list(projectId), old => {
        if (!old) return old;

        const typedOld = old as ClaimsQueryData;

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
            const globalCrypto = global.crypto as Crypto;
            globalCrypto.getRandomValues(randomArray);
          } else {
            randomArray[0] = Date.now();
            randomArray[1] = Date.now() + 1;
          }
          tempId = `temp-${Date.now()}-${randomArray[0]}-${randomArray[1]}`;
        }

        // Handle wrapped response format
        if (
          typedOld &&
          typeof typedOld === 'object' &&
          'claims' in typedOld &&
          Array.isArray(typedOld.claims)
        ) {
          const existingClaims = typedOld.claims;

          // Check if a claim with this number already exists (excluding temp claims)
          const existingNumbers = new Set(
            existingClaims
              .filter(c => !c.id.startsWith('temp-'))
              .map(c => c.number)
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
            ...typedOld,
            claims: [...existingClaims, tempClaim].sort(
              (a, b) => a.number - b.number
            ),
          };
        }

        // Handle direct array format (shouldn't happen but for safety)
        if (Array.isArray(typedOld)) {
          const tempClaim = {
            id: tempId,
            ...newClaim,
            inventionId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return [...typedOld, tempClaim].sort((a, b) => a.number - b.number);
        }

        return typedOld;
      });

      return { previousData };
    },
    onError: (err: unknown, _variables, context) => {
      // Rollback on error
      const ctx = context as { previousData?: ClaimsQueryData };
      if (ctx?.previousData) {
        queryClient.setQueryData(
          claimQueryKeys.list(projectId),
          ctx.previousData
        );
      }

      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      toast({
        title: 'Failed to add claim',
        description: errorMessage,
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
            claimCount: freshData?.length || 0,
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
        position: 'bottom-right',
      });

      // Invalidate project lists to update modified time
      queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
        exact: false,
        refetchType: 'active',
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

  return useApiMutation<
    {
      success: boolean;
      message: string;
      deletedClaimNumber?: number;
      renumberedCount?: number;
      claims?: Claim[];
    },
    { claimId: string; renumber?: boolean; projectId?: string }
  >({
    mutationFn: async ({ claimId, renumber = false }) => {
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

      return ClaimApiService.deleteClaim(claimId, renumber);
    },
    onMutate: async ({ claimId, renumber: _renumber, projectId }) => {
      // Cancel any in-flight queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: claimQueryKeys.all });

      // Get all queries that contain claims data
      const previousQueries = queryClient.getQueriesData({
        queryKey: claimQueryKeys.all,
      });

      // Always do optimistic deletion - remove the claim immediately
      // If renumbering happens, we'll replace the entire cache with the server response
      previousQueries.forEach(([queryKey, data]) => {
        if (!data) return;

        // Handle the wrapped response format { claims: [...] }
        const typedData = data as ClaimsQueryData;
        if (
          typedData &&
          typeof typedData === 'object' &&
          'claims' in typedData &&
          Array.isArray(typedData.claims)
        ) {
          queryClient.setQueryData(queryKey, {
            ...typedData,
            claims: typedData.claims.filter(c => c.id !== claimId),
          });
        }
        // Handle direct array format (shouldn't happen with current API, but for safety)
        else if (Array.isArray(typedData)) {
          queryClient.setQueryData(
            queryKey,
            typedData.filter(c => c.id !== claimId)
          );
        }
      });

      return { previousQueries, projectId };
    },
    onError: (err: unknown, variables, context) => {
      // Rollback optimistic updates on error
      const ctx = context as { previousQueries?: Array<[unknown, unknown]> };
      if (ctx?.previousQueries) {
        ctx.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey as ClaimQueryKeys, data);
        });
      }

      // Check for specific error types
      const errorObj = err as {
        statusCode?: number;
        code?: string;
        message?: string;
      };
      const isTenantError =
        errorObj?.statusCode === 403 ||
        errorObj?.code === ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS;
      const isNotFoundError =
        errorObj?.statusCode === 404 ||
        errorObj?.code === ErrorCode.DB_RECORD_NOT_FOUND;

      let errorMessage = 'Could not delete the claim';
      if (isTenantError) {
        errorMessage =
          'Unable to delete claim. Please refresh the page and try again.';
      } else if (isNotFoundError) {
        errorMessage = 'Claim not found. It may have already been deleted.';
      } else if (errorObj?.message) {
        errorMessage = errorObj.message;
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
        claimId: variables.claimId,
        renumber: variables.renumber,
        statusCode: errorObj?.statusCode,
        errorCode: errorObj?.code,
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
    onSuccess: (data, variables, context) => {
      const ctx = context as { projectId?: string };

      // If we have renumbered claims, update the cache with the new data
      if (data.claims && data.claims.length > 0 && variables.renumber) {
        // Try to find project ID from context, variables, or cache
        let projectId = ctx?.projectId || variables.projectId;

        if (!projectId) {
          // Try to find from existing queries
          const queries = queryClient.getQueriesData({
            queryKey: claimQueryKeys.all,
          });
          for (const [queryKey] of queries) {
            if (
              Array.isArray(queryKey) &&
              queryKey.includes('list') &&
              queryKey.length > 3
            ) {
              projectId = queryKey[3] as string;
              break;
            }
          }
        }

        if (projectId) {
          // Directly set the new claims data
          queryClient.setQueryData(claimQueryKeys.list(projectId), {
            claims: data.claims,
          });

          logger.info(
            '[DeleteClaimMutation] Updated cache with renumbered claims',
            {
              projectId,
              claimCount: data.claims.length,
              renumberedCount: data.renumberedCount,
            }
          );
        } else {
          logger.warn(
            '[DeleteClaimMutation] Could not find project ID for cache update'
          );
          // Force a refetch if we can't update the cache directly
          queryClient.invalidateQueries({
            queryKey: claimQueryKeys.all,
            refetchType: 'active',
          });
        }

        toast({
          title: 'Claim deleted',
          description: data.renumberedCount
            ? `${data.renumberedCount} claims were renumbered`
            : undefined,
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'bottom-right',
        });
      } else {
        // Simple deletion
        toast({
          title: 'Claim deleted',
          status: 'success',
          duration: 1500,
          isClosable: true,
          position: 'bottom-right',
        });

        // Use soft invalidation for simple deletions
        queryClient.invalidateQueries({
          queryKey: claimQueryKeys.all,
          refetchType: 'none',
        });
      }

      // Always invalidate project lists to update modified time
      queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
        exact: false,
        refetchType: 'active',
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
