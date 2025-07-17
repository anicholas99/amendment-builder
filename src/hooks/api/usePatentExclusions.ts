/**
 * Centralized hook for managing patent exclusions.
 * Encapsulates all query and mutation logic for project-level patent exclusions.
 */
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { useToast } from '@/utils/toast';
import {
  PatentExclusionsService,
  ProjectExclusion,
  AddExclusionResponse,
  RemoveExclusionResponse,
} from '@/client/services/patent-exclusions.client-service';
import { ApplicationError } from '@/lib/error';
import { searchHistoryDataQueryKeys } from './useSearchHistoryData';
import { priorArtQueryKeys } from './usePriorArt';
import { exclusionKeys } from '@/lib/queryKeys/projectKeys';
import { exclusionKeys as exclusionKeysLib } from '@/lib/queryKeys/exclusionKeys';

import { STALE_TIME } from '@/constants/time';
import { logger } from '@/utils/clientLogger';

/**
 * Query key factory for patent exclusion queries.
 */
export const patentExclusionQueryKeys = {
  all: ['patentExclusions'] as const,
  list: (projectId: string) =>
    [...patentExclusionQueryKeys.all, 'list', projectId] as const,
};

/**
 * Helper function to invalidate all exclusion-related query keys
 * This ensures all components using different exclusion hooks stay in sync
 */
const invalidateAllExclusionQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
  refetchType: 'active' | 'none' = 'active'
) => {
  const queriesToInvalidate = [
    // Main exclusions hook (for modal)
    patentExclusionQueryKeys.list(projectId),
    // Search history data hook (for search history components)
    searchHistoryDataQueryKeys.byProject(projectId),
    // Prior art exclusions hook (legacy)
    priorArtQueryKeys.exclusions(projectId),
    // Project exclusions hook (features/projects)
    exclusionKeys.all(projectId),
    // Exclusions lib hook
    exclusionKeysLib.byProject(projectId),
  ];

  queriesToInvalidate.forEach(queryKey => {
    queryClient.invalidateQueries({
      queryKey,
      refetchType,
    });
  });
};

/**
 * Hook to fetch the list of patent exclusions for a project.
 */
export function usePatentExclusions(
  projectId: string | undefined,
  options?: Omit<
    UseQueryOptions<ProjectExclusion[], ApplicationError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: patentExclusionQueryKeys.list(projectId || ''),
    queryFn: () => {
      if (!projectId) return [];
      return PatentExclusionsService.getProjectExclusions(projectId);
    },
    enabled: !!projectId,
    staleTime: STALE_TIME.DEFAULT,
    ...options,
  });
}

/**
 * Hook to add patent exclusions to a project.
 */
export function useAddPatentExclusion(
  options?: Omit<
    UseMutationOptions<
      AddExclusionResponse,
      ApplicationError,
      {
        projectId: string;
        patentNumbers: string[];
        metadata?: Record<string, unknown>;
      }
    >,
    'mutationFn' | 'onMutate' | 'onError' | 'onSuccess'
  >
) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      projectId,
      patentNumbers,
      metadata,
    }: {
      projectId: string;
      patentNumbers: string[];
      metadata?: Record<string, unknown>;
    }) =>
      PatentExclusionsService.addProjectExclusion(
        projectId,
        patentNumbers,
        metadata
      ),
    onMutate: async ({ projectId, patentNumbers, metadata }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: patentExclusionQueryKeys.list(projectId),
      });

      // Snapshot the previous value
      const previousExclusions = queryClient.getQueryData<ProjectExclusion[]>(
        patentExclusionQueryKeys.list(projectId)
      );

      // Optimistically update by adding new exclusions
      queryClient.setQueryData<ProjectExclusion[]>(
        patentExclusionQueryKeys.list(projectId),
        old => {
          // Handle empty cache case - initialize with empty array if no data exists
          const currentExclusions = old || [];

          // Create temporary exclusions with optimistic data
          const newExclusions = patentNumbers.map(patentNumber => ({
            id: `temp-${patentNumber}-${Date.now()}`, // Temporary ID
            projectId,
            patentNumber,
            metadata: metadata || {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));

          logger.debug('[useAddPatentExclusion] Adding optimistic exclusions', {
            count: newExclusions.length,
            patentNumbers,
            hadExistingData: !!old,
          });

          return [...currentExclusions, ...newExclusions];
        }
      );

      // Return context for potential rollback
      return { previousExclusions };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousExclusions !== undefined) {
        // Restore the previous data (could be an array or undefined)
        queryClient.setQueryData(
          patentExclusionQueryKeys.list(variables.projectId),
          context.previousExclusions
        );
      } else {
        // If there was no previous data, remove the optimistic data from cache
        queryClient.removeQueries({
          queryKey: patentExclusionQueryKeys.list(variables.projectId),
        });
      }

      toast.error(
        error.message || 'Failed to exclude patents. Please try again.'
      );
    },
    onSuccess: (data, variables) => {
      // The new response format has "added" and "skipped" fields instead of "success"
      if (data.added !== undefined) {
        toast.success('Patents excluded successfully.');

        // Invalidate all exclusion-related query keys to ensure all components sync
        invalidateAllExclusionQueries(
          queryClient,
          variables.projectId,
          'active'
        );
      } else {
        toast.error('Failed to exclude patents.');
      }
    },
    ...options,
  });
}

/**
 * Hook to remove a patent exclusion from a project.
 */
export function useRemovePatentExclusion(
  options?: Omit<
    UseMutationOptions<
      RemoveExclusionResponse,
      ApplicationError,
      { projectId: string; patentNumber: string }
    >,
    'mutationFn' | 'onMutate' | 'onError' | 'onSuccess'
  >
) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      projectId,
      patentNumber,
    }: {
      projectId: string;
      patentNumber: string;
    }) =>
      PatentExclusionsService.removeProjectExclusion(projectId, patentNumber),
    onMutate: async ({ projectId, patentNumber }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: patentExclusionQueryKeys.list(projectId),
      });

      // Snapshot the previous value
      const previousExclusions = queryClient.getQueryData<ProjectExclusion[]>(
        patentExclusionQueryKeys.list(projectId)
      );

      // Optimistically remove the exclusion
      queryClient.setQueryData<ProjectExclusion[]>(
        patentExclusionQueryKeys.list(projectId),
        old => {
          if (!old) return old;

          logger.debug(
            '[useRemovePatentExclusion] Removing exclusion optimistically',
            {
              patentNumber,
              currentCount: old.length,
            }
          );

          return old.filter(
            exclusion => exclusion.patentNumber !== patentNumber
          );
        }
      );

      // Return a context object with the snapshot value
      return { previousExclusions };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousExclusions !== undefined) {
        // Restore the previous data (could be an array or undefined)
        queryClient.setQueryData(
          patentExclusionQueryKeys.list(variables.projectId),
          context.previousExclusions
        );
      } else {
        // If there was no previous data, remove the optimistic data from cache
        queryClient.removeQueries({
          queryKey: patentExclusionQueryKeys.list(variables.projectId),
        });
      }

      toast.error(
        error.message || 'Failed to remove exclusion. Please try again.'
      );
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success('Exclusion removed successfully.');

        // Invalidate all exclusion-related query keys to ensure all components sync
        invalidateAllExclusionQueries(queryClient, variables.projectId, 'none');
      } else {
        toast.error('Failed to remove exclusion.');
      }
    },
    ...options,
  });
}
