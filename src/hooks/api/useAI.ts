import { useApiMutation } from '@/lib/api/queryClient';
import { useToast } from '@/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  CombinedAnalysisParams,
  CombinedAnalysisResult,
  GenerateSuggestionsParams,
  GenerateSuggestionsResult,
} from '@/types/api/responses';
import { AiApiService } from '@/client/services/ai.client-service';
import { ApplicationError } from '@/lib/error';
import { logger } from '@/utils/clientLogger';

export function useCombinedAnalysisMutation(
  onSuccess?: (data: CombinedAnalysisResult) => void
) {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useApiMutation<CombinedAnalysisResult, CombinedAnalysisParams>({
    mutationFn: params => AiApiService.getCombinedAnalysis(params),
    onSuccess: async (data, variables) => {
      toast.success('Analysis completed successfully');

      // Invalidate combined analyses query to refresh the list
      // Force active refetch to ensure new analysis appears immediately
      if ('searchHistoryId' in variables) {
        // Small delay to ensure API has fully processed the new analysis
        await new Promise(resolve => setTimeout(resolve, 100));

        queryClient.invalidateQueries({
          queryKey: ['combinedAnalyses', variables.searchHistoryId],
          refetchType: 'active', // Force immediate refetch
        });
      }

      onSuccess?.(data);
    },
    onError: error => {
      logger.error('Combined analysis failed:', error);
      toast.error(error.message || 'Analysis failed');
    },
  });
}

export function useGenerateSuggestionsMutation(
  onSuccess?: (data: GenerateSuggestionsResult) => void
) {
  const toast = useToast();

  return useApiMutation<GenerateSuggestionsResult, GenerateSuggestionsParams>({
    mutationFn: params => AiApiService.generateSuggestions(params),
    onSuccess: data => {
      toast.success('Suggestions generated successfully');
      onSuccess?.(data);
    },
    onError: error => {
      toast.error(error.message || 'Failed to generate suggestions');
    },
  });
}

export const useCombinedAnalysis = () => {
  return useApiMutation<CombinedAnalysisResult, CombinedAnalysisParams>({
    mutationFn: params => AiApiService.getCombinedAnalysis(params),
    onError: error => {
      logger.error('Combined analysis failed:', error);
    },
  });
};
