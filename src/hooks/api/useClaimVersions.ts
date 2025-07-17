import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import {
  ClaimVersionApiService,
  ClaimVersion,
  CreateClaimVersionPayload,
  RestoreClaimVersionPayload,
} from '@/services/api/claimVersionApiService';
import { claimQueryKeys } from '@/hooks/api/useClaims';

/**
 * Query key factory for claim versions
 */
export const claimVersionQueryKeys = {
  all: ['claimVersions'] as const,
  lists: () => [...claimVersionQueryKeys.all, 'list'] as const,
  list: (inventionId: string) =>
    [...claimVersionQueryKeys.lists(), inventionId] as const,
  details: () => [...claimVersionQueryKeys.all, 'detail'] as const,
  detail: (versionId: string) =>
    [...claimVersionQueryKeys.details(), versionId] as const,
};

/**
 * Hook to fetch all claim versions for an invention
 */
export const useClaimVersions = (inventionId: string) => {
  return useQuery({
    queryKey: claimVersionQueryKeys.list(inventionId),
    queryFn: () => ClaimVersionApiService.getVersions(inventionId),
    enabled: !!inventionId,
    staleTime: 1000 * 30, // Consider data fresh for 30 seconds to reduce flickering
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    refetchOnMount: false, // Don't automatically refetch on mount - use manual refetch instead
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect to avoid flickering
    // Enable immediate updates when cache changes
    notifyOnChangeProps: ['data', 'error'],
    // Configure retry behavior
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors, but retry on network/server errors
      const status = (error as any)?.details?.status;
      if (status && status >= 400 && status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });
};

/**
 * Hook to fetch a specific claim version with snapshots
 */
export const useClaimVersion = (versionId: string) => {
  return useQuery({
    queryKey: claimVersionQueryKeys.detail(versionId),
    queryFn: () => ClaimVersionApiService.getVersion(versionId),
    enabled: !!versionId,
  });
};

/**
 * Hook to create a new claim version
 */
export const useCreateClaimVersion = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: CreateClaimVersionPayload) => {
      // Add validation before API call
      if (!payload.inventionId) {
        logger.error('[useCreateClaimVersion] No inventionId provided');
        return Promise.reject(
          new Error('Cannot create claim version: inventionId is required')
        );
      }

      return ClaimVersionApiService.createVersion(payload);
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({
        queryKey: claimVersionQueryKeys.list(variables.inventionId),
      });

      // Snapshot the previous value for rollback
      const previousVersions = queryClient.getQueryData(
        claimVersionQueryKeys.list(variables.inventionId)
      );

      // Optimistically update the cache with the new version
      const optimisticVersion: ClaimVersion = {
        id: `temp-${Date.now()}`, // Temporary ID
        inventionId: variables.inventionId,
        userId: 'current-user', // Will be updated when real response comes back
        name: variables.name || null,
        createdAt: new Date().toISOString(),
        user: undefined,
        snapshots: undefined,
      };

      queryClient.setQueryData(
        claimVersionQueryKeys.list(variables.inventionId),
        (old: ClaimVersion[] | undefined) => {
          const existingVersions = old || [];
          return [optimisticVersion, ...existingVersions];
        }
      );

      return { previousVersions };
    },
    onSuccess: async (version, variables, context) => {
      // Update the cache with the real version data
      queryClient.setQueryData(
        claimVersionQueryKeys.list(variables.inventionId),
        (old: ClaimVersion[] | undefined) => {
          const existingVersions = old || [];
          // Remove the optimistic version and add the real one
          const withoutOptimistic = existingVersions.filter(
            v => !v.id.startsWith('temp-')
          );
          return [version, ...withoutOptimistic];
        }
      );

      // Only invalidate, don't force immediate refetch to reduce flickering
      queryClient.invalidateQueries({
        queryKey: claimVersionQueryKeys.list(variables.inventionId),
        refetchType: 'none', // Don't refetch immediately, just mark as stale
      });

      // Emit event to notify components that a version was created
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('claimVersionCreated', {
            detail: {
              inventionId: variables.inventionId,
              versionId: version.id,
              versionName: version.name,
            },
          })
        );
      }

      toast({
        title: 'Version Saved',
        description: version.name
          ? `Version "${version.name}" has been created`
          : 'Claim version has been created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      logger.info('[useCreateClaimVersion] Created version', {
        versionId: version.id,
        inventionId: variables.inventionId,
      });
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousVersions) {
        queryClient.setQueryData(
          claimVersionQueryKeys.list(variables.inventionId),
          context.previousVersions
        );
      }

      logger.error('[useCreateClaimVersion] Failed to create version', {
        error,
      });

      toast({
        title: 'Failed to Save Version',
        description:
          error instanceof Error ? error.message : 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    onSettled: (data, error, variables) => {
      // Ensure queries are re-enabled after mutation
      queryClient.resumePausedMutations();
    },
  });
};

/**
 * Hook to restore claims from a version
 */
export const useRestoreClaimVersion = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      versionId,
      payload,
    }: {
      versionId: string;
      payload: RestoreClaimVersionPayload & { projectId?: string };
    }) => ClaimVersionApiService.restoreVersion(versionId, payload),
    onMutate: async variables => {
      // Cancel any outgoing refetches to prevent race conditions
      const projectId = variables.payload.projectId;
      if (projectId) {
        await queryClient.cancelQueries({
          queryKey: claimQueryKeys.list(projectId),
        });
      }

      // Return context to use in onError if needed
      return { projectId };
    },
    onSuccess: async (restoredClaims, variables) => {
      const projectId = variables.payload.projectId;

      if (!projectId || !Array.isArray(restoredClaims)) {
        logger.warn(
          '[useRestoreClaimVersion] Invalid response or missing projectId',
          {
            hasProjectId: !!projectId,
            isArray: Array.isArray(restoredClaims),
          }
        );
        return;
      }

      // Format the claims data to match the expected structure
      const formattedClaims = restoredClaims.map((claim: any) => ({
        id: claim.id,
        claimNumber: claim.number || claim.claimNumber,
        number: claim.number || claim.claimNumber,
        text: claim.text,
        inventionId: claim.inventionId,
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt,
      }));

      // Update the cache with the restored claims
      queryClient.setQueryData(claimQueryKeys.list(projectId), {
        claims: formattedClaims,
      });

      logger.info('[useRestoreClaimVersion] Cache updated successfully', {
        projectId,
        claimCount: formattedClaims.length,
        firstClaimText: formattedClaims[0]?.text?.substring(0, 50) + '...',
      });

      // Just invalidate version list, don't force refetch to reduce flickering
      queryClient.invalidateQueries({
        queryKey: claimVersionQueryKeys.list(variables.payload.inventionId),
        refetchType: 'none',
      });

      // Emit a custom event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('claimsRestored', {
            detail: {
              projectId,
              versionId: variables.versionId,
              claimCount: formattedClaims.length,
            },
          })
        );
      }

      toast({
        title: 'Claims Restored',
        description: `Restored ${Array.isArray(restoredClaims) ? restoredClaims.length : 0} claims from the selected version`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      logger.info('[useRestoreClaimVersion] Restored claims', {
        versionId: variables.versionId,
        inventionId: variables.payload.inventionId,
        projectId: projectId,
        claimCount: Array.isArray(restoredClaims) ? restoredClaims.length : 0,
      });
    },
    onError: error => {
      logger.error('[useRestoreClaimVersion] Failed to restore version', {
        error,
      });

      toast({
        title: 'Failed to Restore Claims',
        description: 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    onSettled: (_data, _error, variables) => {
      // Ensure queries are not cancelled after mutation completes
      const projectId = variables.payload.projectId;
      if (projectId) {
        // Allow queries to resume normal behavior
        queryClient.resumePausedMutations();
      }
    },
  });
};

/**
 * Hook to delete a claim version
 */
export const useDeleteClaimVersion = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (versionId: string) =>
      ClaimVersionApiService.deleteVersion(versionId),
    onSuccess: async (_, versionId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: claimVersionQueryKeys.detail(versionId),
      });

      // Force immediate refetch of all version lists and wait for completion
      await queryClient.refetchQueries({
        queryKey: claimVersionQueryKeys.lists(),
      });

      toast({
        title: 'Version Deleted',
        description: 'The claim version has been deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      logger.info('[useDeleteClaimVersion] Deleted version', { versionId });
    },
    onError: error => {
      logger.error('[useDeleteClaimVersion] Failed to delete version', {
        error,
      });

      toast({
        title: 'Failed to Delete Version',
        description: 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });
};
