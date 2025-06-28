/**
 * Centralized hook for Prior Art API operations
 *
 * This hook provides a type-safe interface to all prior art operations
 * with proper error handling, loading states, and cache management.
 */

import { useApiQuery, useApiMutation } from '@/lib/api/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { logger } from '@/lib/monitoring/logger';
import { PriorArtApiService } from '@/client/services/prior-art.client-service';
import {
  SavedPriorArt,
  PriorArtReference,
  PriorArtDataToSave,
} from '@/types/domain/priorArt';
import {
  ClaimRefinementAnalysisParams,
  ClaimRefinementAnalysisResult,
} from '@/types/api/responses';
import { ApplicationError } from '@/lib/error';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { projectKeys, priorArtKeys } from '@/lib/queryKeys';
import { searchHistoryDataQueryKeys } from '@/hooks/api/useSearchHistoryData';
import { FullAnalysisResponse } from '@/types/priorArtAnalysisTypes';
import { API_ROUTES } from '@/constants/apiRoutes';
import { clearApiCacheForUrl } from '@/lib/api/apiClient';

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
  return useApiQuery<{ priorArt: SavedPriorArt[] }, SavedPriorArt[]>(
    [...priorArtQueryKeys.project(projectId || 'none')],
    {
      url: projectId ? API_ROUTES.PROJECTS.PRIOR_ART.LIST(projectId) : '',
      enabled: !!projectId,
      select: data => data.priorArt,
    }
  );
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
  return useApiQuery<any, any>(
    [...priorArtQueryKeys.exclusions(projectId || 'none')],
    {
      url: projectId ? API_ROUTES.PROJECTS.EXCLUSIONS(projectId) : '',
      enabled: !!projectId,
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

  return useApiMutation<any, SaveVariables>({
    mutationFn: async ({ projectId, priorArt }) =>
      PriorArtApiService.savePriorArt(projectId!, priorArt),
    onMutate: async variables => {
      const { projectId, priorArt } = variables;

      await queryClient.cancelQueries({
        queryKey: priorArtQueryKeys.project(projectId),
      });
      await queryClient.cancelQueries({
        queryKey: priorArtKeys.saved.byProject(projectId),
      });

      const previousPriorArtLegacy = queryClient.getQueryData(
        priorArtQueryKeys.project(projectId)
      );
      const previousPriorArtUnified = queryClient.getQueryData(
        priorArtKeys.saved.byProject(projectId)
      );

      const optimisticItem: SavedPriorArt = {
        id: `optimistic-${Date.now()}`,
        projectId,
        patentNumber: priorArt.patentNumber,
        title: priorArt.title || null,
        abstract: priorArt.abstract || null,
        url: priorArt.url || null,
        notes: priorArt.notes || null,
        authors: priorArt.authors || null,
        publicationDate: priorArt.publicationDate || null,
        savedAt: new Date().toISOString(),
        savedCitationsData: priorArt.savedCitationsData || null,
        claim1: priorArt.claim1 || null,
        summary: priorArt.summary || null,
      };

      const applyOptimisticUpdate = (oldData: any) => {
        if (Array.isArray(oldData)) {
          return [...oldData, optimisticItem];
        }
        return [optimisticItem];
      };

      queryClient.setQueryData(
        priorArtQueryKeys.project(projectId),
        applyOptimisticUpdate
      );

      queryClient.setQueryData(
        priorArtKeys.saved.byProject(projectId),
        applyOptimisticUpdate
      );

      return {
        previousPriorArtLegacy: previousPriorArtLegacy,
        previousPriorArtUnified: previousPriorArtUnified,
      };
    },
    onError: (_err, variables, context: any) => {
      if (context?.previousPriorArtLegacy !== undefined) {
        queryClient.setQueryData(
          priorArtQueryKeys.project(variables.projectId),
          context.previousPriorArtLegacy
        );
      }
      if (context?.previousPriorArtUnified !== undefined) {
        queryClient.setQueryData(
          priorArtKeys.saved.byProject(variables.projectId),
          context.previousPriorArtUnified
        );
      }
      showErrorToast(toast, 'Failed to save prior art');
    },
    onSuccess: (data, variables) => {
      // If API returns the saved item, merge it into both caches to avoid flicker
      if (data && (data as any).savedPriorArt) {
        const rawItem = (data as any).savedPriorArt as SavedPriorArt;
        const savedItem: SavedPriorArt = {
          ...rawItem,
          authors: Array.isArray(rawItem.authors)
            ? rawItem.authors.join(', ')
            : rawItem.authors || null,
        };
        const mergeFn = (oldData: any) => {
          if (Array.isArray(oldData)) {
            // Avoid duplicates by checking patent number instead of ID
            // This prevents the optimistic item with temporary ID from causing duplicates
            const normalizedPatentNumber = savedItem.patentNumber
              .replace(/-/g, '')
              .toUpperCase();
            const filteredData = oldData.filter((x: any) => {
              const existingNormalized = x.patentNumber
                ?.replace(/-/g, '')
                .toUpperCase();
              return existingNormalized !== normalizedPatentNumber;
            });
            // Add the new saved item (replacing any optimistic version)
            return [...filteredData, savedItem];
          }
          return [savedItem];
        };
        queryClient.setQueryData(
          priorArtKeys.saved.byProject(variables.projectId),
          mergeFn
        );
        queryClient.setQueryData(
          priorArtQueryKeys.project(variables.projectId),
          mergeFn
        );
      }

      showSuccessToast(toast, 'Prior art saved successfully');
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: priorArtQueryKeys.project(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: priorArtKeys.saved.byProject(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: searchHistoryDataQueryKeys.byProject(variables.projectId),
      });
    },
  });
}

/**
 * Hook to remove prior art
 */
export function useDeletePriorArt() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useApiMutation<any, { projectId: string; priorArtId: string }>({
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
      const previousLegacy = queryClient.getQueryData<unknown>(
        priorArtQueryKeys.project(projectId)
      );
      const previousUnified = queryClient.getQueryData<unknown>(
        priorArtKeys.saved.byProject(projectId)
      );

      // Optimistically remove the item from caches
      const removeFn = (oldData: any) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.filter((item: any) => item.id !== priorArtId);
      };

      queryClient.setQueryData(priorArtQueryKeys.project(projectId), removeFn);
      queryClient.setQueryData(
        priorArtKeys.saved.byProject(projectId),
        removeFn
      );

      return { previousLegacy, previousUnified };
    },
    onError: (_error, variables, context: any) => {
      // Rollback changes on error
      const { projectId } = variables;
      if (context?.previousLegacy !== undefined) {
        queryClient.setQueryData(
          priorArtQueryKeys.project(projectId),
          context.previousLegacy
        );
      }
      if (context?.previousUnified !== undefined) {
        queryClient.setQueryData(
          priorArtKeys.saved.byProject(projectId),
          context.previousUnified
        );
      }
      showErrorToast(toast, _error?.message || 'Failed to delete prior art');
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
      showSuccessToast(toast, 'Prior art deleted successfully');
    },
  });
}

export const useAddProjectExclusion = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useApiMutation<
    any,
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
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: priorArtQueryKeys.exclusions(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: searchHistoryDataQueryKeys.byProject(variables.projectId),
      });
      showSuccessToast(toast, 'Added to exclusions');
    },
    onError: error => {
      logger.error('Failed to add project exclusion:', error);
      showErrorToast(toast, error.message || 'Failed to add to exclusions');
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
