/**
 * Centralized hook for Prior Art API operations
 *
 * This hook provides a type-safe interface to all prior art operations
 * with proper error handling, loading states, and cache management.
 */

import { useApiQuery, useApiMutation } from '@/lib/api/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/utils/toast';
import { logger } from '@/utils/clientLogger';
import { PriorArtApiService } from '@/client/services/prior-art.client-service';
import { PriorArtDataToSave } from '@/types/domain/priorArt';
import {
  ClaimRefinementAnalysisParams,
  ClaimRefinementAnalysisResult,
} from '@/types/api/responses';
import { projectKeys, priorArtKeys } from '@/lib/queryKeys';
import { searchHistoryDataQueryKeys } from '@/hooks/api/useSearchHistoryData';
import { API_ROUTES } from '@/constants/apiRoutes';
import { clearApiCacheForUrl } from '@/lib/api/apiClient';
import { processSavedPriorArtArray } from '@/features/search/utils/priorArt';
import { ProcessedSavedPriorArt } from '@/types/domain/priorArt';
import { CreatePriorArtResponse } from '@/types/api/responses';

/**
 * Query key factory for prior art queries
 */
export const priorArtQueryKeys = {
  all: ['priorArt'] as const,
  byProject: (projectId: string) =>
    [...priorArtQueryKeys.all, projectId] as const,
  project: (projectId: string) => ['priorArt', 'project', projectId] as const,
  details: (projectId: string, priorArtId: string) =>
    [...priorArtQueryKeys.byProject(projectId), priorArtId] as const,
  exclusions: (projectId: string) => ['projectExclusions', projectId] as const,
};

/**
 * Hook to fetch prior art for a project
 */
export function useProjectPriorArt(projectId: string | null) {
  return useApiQuery<
    { priorArt: ProcessedSavedPriorArt[] },
    ProcessedSavedPriorArt[]
  >([...priorArtQueryKeys.project(projectId || 'none')], {
    url: projectId ? API_ROUTES.PROJECTS.PRIOR_ART.LIST(projectId) : '',
    enabled: !!projectId,
    select: data => {
      // Process the prior art array to ensure consistent field names
      return processSavedPriorArtArray(data.priorArt);
    },
  });
}

/**
 * Hook to get prior art data with loading and error states
 */
export function usePriorArtWithStatus(projectId: string | null) {
  const { data, isLoading, error, refetch } = useProjectPriorArt(projectId);

  return {
    priorArt: data || [],
    isLoading,
    error,
    refetch,
    isEmpty: !isLoading && (!data || data.length === 0),
    hasData: !isLoading && data && data.length > 0,
  };
}

export function useProjectExclusions(projectId: string | null) {
  interface ExclusionResponse {
    exclusions: string[];
  }

  return useApiQuery<ExclusionResponse, Set<string>>(
    [...priorArtQueryKeys.exclusions(projectId || 'none')],
    {
      url: projectId ? API_ROUTES.PROJECTS.EXCLUSIONS(projectId) : '',
      enabled: !!projectId,
      select: data => new Set(data.exclusions || []),
    }
  );
}

/**
 * Hook to save prior art
 */
export function useSavePriorArt() {
  const queryClient = useQueryClient();
  const toast = useToast();

  type SaveVariables = { projectId: string; priorArt: PriorArtDataToSave };
  return useApiMutation<CreatePriorArtResponse, SaveVariables>({
    mutationFn: async ({ projectId, priorArt }) =>
      PriorArtApiService.savePriorArt(projectId, priorArt),
    onMutate: async variables => {
      const { projectId } = variables;

      // Cancel any outgoing refetches to prevent interference
      await queryClient.cancelQueries({
        queryKey: priorArtQueryKeys.project(projectId),
      });
      await queryClient.cancelQueries({
        queryKey: priorArtKeys.saved.byProject(projectId),
      });

      // Snapshot the previous values
      const previousProject = queryClient.getQueryData(
        priorArtQueryKeys.project(projectId)
      );
      const previousSaved = queryClient.getQueryData(
        priorArtKeys.saved.byProject(projectId)
      );

      // Optimistically add the new prior art so UI updates immediately
      const normalizedNumber = variables.priorArt.patentNumber
        .replace(/-/g, '')
        .toUpperCase();

      const optimisticEntry: ProcessedSavedPriorArt = {
        id: `temp-${Date.now()}`,
        projectId,
        patentNumber: normalizedNumber,
        title: variables.priorArt.title || '',
        abstract: variables.priorArt.abstract || '',
        url: variables.priorArt.url || '',
        notes: undefined,
        authors: variables.priorArt.authors || '',
        publicationDate: variables.priorArt.publicationDate || '',
        savedAt: new Date().toISOString(),
        priorArtData: {
          number: normalizedNumber,
          patentNumber: normalizedNumber,
          title: variables.priorArt.title || '',
          abstract: variables.priorArt.abstract,
          source: 'Manual',
          relevance: 100,
        },
        savedCitations: [],
      };

      const addOptimistic = (
        old: ProcessedSavedPriorArt[] | undefined
      ): ProcessedSavedPriorArt[] => {
        if (!Array.isArray(old)) return [optimisticEntry];
        if (old.some(item => item.patentNumber === normalizedNumber)) {
          return old;
        }
        return [optimisticEntry, ...old];
      };

      queryClient.setQueryData(
        priorArtQueryKeys.project(projectId),
        addOptimistic
      );
      queryClient.setQueryData(
        priorArtKeys.saved.byProject(projectId),
        addOptimistic
      );

      // Return context object
      return { previousProject, previousSaved, projectId };
    },
    onError: (_err, _variables, context) => {
      const ctx = context as
        | {
            previousProject?: unknown;
            previousSaved?: unknown;
            projectId: string;
          }
        | undefined;
      // Roll back to the previous values on error
      if (ctx?.previousProject !== undefined) {
        queryClient.setQueryData(
          priorArtQueryKeys.project(ctx.projectId),
          ctx.previousProject
        );
      }
      if (ctx?.previousSaved !== undefined) {
        queryClient.setQueryData(
          priorArtKeys.saved.byProject(ctx.projectId),
          ctx.previousSaved
        );
      }
      toast.error('Failed to save prior art');
    },
    onSuccess: (_response, _variables, _context) => {
      toast.success('Citation saved');

      // Don't update cache manually - let the invalidation handle it
      // This prevents double processing and potential blocking
    },
    onSettled: (_data, _error, variables) => {
      // Only invalidate the specific query that needs updating
      // This prevents cascading refetches that block navigation
      const projectId = variables.projectId;

      // Invalidate both query keys used for saved prior art data
      queryClient.invalidateQueries({
        queryKey: priorArtQueryKeys.project(projectId),
        exact: true,
        refetchType: 'none', // Don't automatically refetch
      });
      queryClient.invalidateQueries({
        queryKey: priorArtKeys.saved.byProject(projectId),
        exact: true,
        refetchType: 'none', // Don't automatically refetch
      });

      logger.info(
        '[useSavePriorArt] Marked both prior art query keys as stale',
        {
          projectQueryKey: priorArtQueryKeys.project(projectId),
          savedQueryKey: priorArtKeys.saved.byProject(projectId),
        }
      );
    },
  });
}

/**
 * Hook to remove prior art
 */
export function useDeletePriorArt() {
  const queryClient = useQueryClient();
  const toast = useToast();

  interface DeleteResponse {
    success: boolean;
  }

  return useApiMutation<
    DeleteResponse,
    { projectId: string; priorArtId: string }
  >({
    mutationFn: ({ projectId, priorArtId }) =>
      PriorArtApiService.removePriorArt(projectId, priorArtId),
    onMutate: async variables => {
      const { projectId, priorArtId } = variables;

      // Cancel outgoing queries for both legacy and unified keys
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: priorArtQueryKeys.project(projectId),
        }),
        queryClient.cancelQueries({
          queryKey: priorArtKeys.saved.byProject(projectId),
        }),
      ]);

      // Snapshot previous data for rollback
      const previousLegacy = queryClient.getQueryData<ProcessedSavedPriorArt[]>(
        priorArtQueryKeys.project(projectId)
      );
      const previousUnified = queryClient.getQueryData<
        ProcessedSavedPriorArt[]
      >(priorArtKeys.saved.byProject(projectId));

      // Optimistically remove the item from caches
      const removeFn = (oldData: ProcessedSavedPriorArt[] | undefined) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.filter(item => item.id !== priorArtId);
      };

      queryClient.setQueryData(priorArtQueryKeys.project(projectId), removeFn);
      queryClient.setQueryData(
        priorArtKeys.saved.byProject(projectId),
        removeFn
      );

      return { previousLegacy, previousUnified };
    },
    onError: (_error, variables, context) => {
      const ctx = context as
        | {
            previousLegacy?: ProcessedSavedPriorArt[];
            previousUnified?: ProcessedSavedPriorArt[];
          }
        | undefined;
      // Rollback changes on error
      const { projectId } = variables;
      if (ctx?.previousLegacy !== undefined) {
        queryClient.setQueryData(
          priorArtQueryKeys.project(projectId),
          ctx.previousLegacy
        );
      }
      if (ctx?.previousUnified !== undefined) {
        queryClient.setQueryData(
          priorArtKeys.saved.byProject(projectId),
          ctx.previousUnified
        );
      }
      toast.error(_error?.message || 'Failed to delete prior art');
    },
    onSuccess: (_, variables) => {
      // Clear RequestManager cache for the list endpoint to avoid stale responses
      clearApiCacheForUrl(
        API_ROUTES.PROJECTS.PRIOR_ART.LIST(variables.projectId)
      );

      queryClient.invalidateQueries({
        queryKey: priorArtQueryKeys.project(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: priorArtKeys.saved.byProject(variables.projectId),
      });
      toast.success('Prior art deleted successfully');

      // Invalidate project lists to update modified time
      queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
        exact: false,
        refetchType: 'active',
      });
    },
  });
}

export const useAddProjectExclusion = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  interface ExclusionResponse {
    message: string;
    added: number;
    skipped: number;
  }

  return useApiMutation<
    ExclusionResponse,
    {
      projectId: string;
      patentNumbers: string[];
      metadata?: Record<string, unknown>;
    }
  >({
    mutationFn: async ({ projectId, patentNumbers, metadata }) => {
      return PriorArtApiService.addProjectExclusion(
        projectId,
        patentNumbers,
        metadata
      ) as Promise<ExclusionResponse>;
    },
    onSuccess: (data, variables) => {
      // Handle the new response format
      if (data.added !== undefined) {
        queryClient.invalidateQueries({
          queryKey: priorArtQueryKeys.exclusions(variables.projectId),
        });
        queryClient.invalidateQueries({
          queryKey: searchHistoryDataQueryKeys.byProject(variables.projectId),
        });
        toast.success('Added to exclusions');
      }
    },
    onError: error => {
      logger.error('Failed to add project exclusion:', error);
      toast.error(error.message || 'Failed to add to exclusions');
    },
  });
};

interface AnalyzePriorArtVariables extends ClaimRefinementAnalysisParams {
  // Just extending the base type since it has all required fields
}

export const useAnalyzePriorArtMutation = () => {
  const queryClient = useQueryClient();

  return useApiMutation<
    ClaimRefinementAnalysisResult,
    AnalyzePriorArtVariables
  >({
    mutationFn: params => PriorArtApiService.analyzePriorArt(params),
    onSuccess: (data, variables) => {
      // Invalidate queries that may be affected by this mutation
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.projectId),
      });
    },
  });
};
