/**
 * React Query hooks for rejection analysis
 * 
 * Provides hooks for analyzing Office Action rejections
 * with caching, optimistic updates, and error handling
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/utils/clientLogger';
import { ApplicationError } from '@/lib/error';
import { RejectionAnalysisApiService } from '@/services/api/rejectionAnalysisApiService';
import type {
  RejectionAnalysisResult,
  StrategyRecommendation,
} from '@/types/domain/rejection-analysis';

// ============ QUERY KEYS ============

export const rejectionAnalysisKeys = {
  all: ['rejection-analysis'] as const,
  byOfficeAction: (officeActionId: string) => 
    [...rejectionAnalysisKeys.all, 'office-action', officeActionId] as const,
  byRejection: (rejectionId: string) => 
    [...rejectionAnalysisKeys.all, 'rejection', rejectionId] as const,
};

// ============ HOOKS ============

/**
 * Hook to analyze all rejections for an Office Action
 */
export function useAnalyzeOfficeActionRejections(
  projectId: string,
  officeActionId: string
) {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options?: { includeClaimCharts?: boolean }) => {
      logger.info('[useAnalyzeOfficeActionRejections] Starting analysis', {
        projectId,
        officeActionId,
        options,
      });

      return RejectionAnalysisApiService.analyzeOfficeActionRejections(
        projectId,
        officeActionId,
        options
      );
    },
    onMutate: async () => {
      // Show loading toast
      toast.info('Analyzing Rejections', {
        description: 'Evaluating examiner reasoning and generating strategy recommendations...',
      });
    },
    onSuccess: (data) => {
      logger.info('[useAnalyzeOfficeActionRejections] Analysis completed', {
        rejectionCount: data.analyses.length,
        overallStrategy: data.overallStrategy.primaryStrategy,
      });

      // Cache the result
      queryClient.setQueryData(
        rejectionAnalysisKeys.byOfficeAction(officeActionId),
        data
      );

      // Show success toast
      toast.success('Analysis Complete', {
        description: `Analyzed ${data.analyses.length} rejections. Recommended strategy: ${data.overallStrategy.primaryStrategy}`,
      });
    },
    onError: (error) => {
      logger.error('[useAnalyzeOfficeActionRejections] Analysis failed', { error });
      
      toast.error('Analysis Failed', {
        description: error instanceof Error ? error.message : 'Failed to analyze rejections',
      });
    },
  });
}

/**
 * Hook to get saved rejection analysis (fetches from server if not cached)
 */
export function useRejectionAnalysis(
  projectId: string | null, 
  officeActionId: string | null
) {
  return useQuery({
    queryKey: rejectionAnalysisKeys.byOfficeAction(officeActionId || ''),
    queryFn: async () => {
      if (!projectId || !officeActionId) {
        return null;
      }

      logger.info('[useRejectionAnalysis] Fetching saved analysis', {
        projectId,
        officeActionId,
      });

      return RejectionAnalysisApiService.getSavedOfficeActionAnalysis(
        projectId,
        officeActionId
      );
    },
    enabled: !!projectId && !!officeActionId, // Auto-fetch when both IDs are available
    staleTime: 5 * 60 * 1000, // 5 minutes - analysis can be cached for a while
    retry: (failureCount, error) => {
      // Don't retry on 404 (no saved analysis)
      if (error instanceof ApplicationError && error.statusCode === 404) {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
  });
}

/**
 * Hook to analyze a single rejection
 */
export function useAnalyzeRejection(
  projectId: string,
  officeActionId: string
) {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rejectionId,
      options,
    }: {
      rejectionId: string;
      options?: {
        includeClaimChart?: boolean;
        includePriorArtFullText?: boolean;
      };
    }) => {
      logger.info('[useAnalyzeRejection] Analyzing rejection', {
        projectId,
        officeActionId,
        rejectionId,
        options,
      });

      return RejectionAnalysisApiService.analyzeRejection(
        projectId,
        officeActionId,
        rejectionId,
        options
      );
    },
    onSuccess: (data, variables) => {
      logger.info('[useAnalyzeRejection] Rejection analyzed', {
        rejectionId: data.rejectionId,
        strength: data.strength,
        strategy: data.recommendedStrategy,
      });

      // Update cache
      queryClient.setQueryData(
        rejectionAnalysisKeys.byRejection(variables.rejectionId),
        data
      );

      // Also update the office action analysis if it exists
      const officeActionKey = rejectionAnalysisKeys.byOfficeAction(officeActionId);
      const existingData = queryClient.getQueryData<{
        analyses: RejectionAnalysisResult[];
        overallStrategy: StrategyRecommendation;
      }>(officeActionKey);

      if (existingData) {
        const updatedAnalyses = existingData.analyses.map(analysis =>
          analysis.rejectionId === data.rejectionId ? data : analysis
        );
        queryClient.setQueryData(officeActionKey, {
          ...existingData,
          analyses: updatedAnalyses,
        });
      }
    },
    onError: (error) => {
      logger.error('[useAnalyzeRejection] Failed to analyze rejection', { error });
      
      toast.error('Analysis Failed', {
        description: error instanceof Error ? error.message : 'Failed to analyze rejection',
      });
    },
  });
} 