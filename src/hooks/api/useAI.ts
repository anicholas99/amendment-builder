import { useApiMutation } from '@/lib/api/queryClient';
import { useToast } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  CombinedAnalysisParams,
  CombinedAnalysisResult,
  GenerateSuggestionsParams,
  GenerateSuggestionsResult,
} from '@/types/api/responses';
import { AiApiService } from '@/client/services/ai.client-service';
import { ApplicationError } from '@/lib/error';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { logger } from '@/lib/monitoring/logger';

export function useCombinedAnalysisMutation(
  onSuccess?: (data: CombinedAnalysisResult) => void
) {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useApiMutation<CombinedAnalysisResult, CombinedAnalysisParams>({
    mutationFn: params => AiApiService.getCombinedAnalysis(params),
    onSuccess: (data, variables) => {
      showSuccessToast(toast, 'Analysis completed successfully');

      // Invalidate combined analyses query to refresh the list
      // This follows the pattern from other mutations in the codebase
      if ('searchHistoryId' in variables) {
        queryClient.invalidateQueries({
          queryKey: ['combinedAnalyses', (variables as any).searchHistoryId],
        });
      }

      onSuccess?.(data);
    },
    onError: error => {
      logger.error('Combined analysis failed:', error);
      showErrorToast(toast, error.message || 'Analysis failed');
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
      showSuccessToast(toast, 'Suggestions generated successfully');
      onSuccess?.(data);
    },
    onError: error => {
      showErrorToast(toast, error.message || 'Failed to generate suggestions');
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
