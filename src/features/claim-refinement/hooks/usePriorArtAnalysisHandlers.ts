import { useCallback } from 'react';
import { useAnalyzePriorArtMutation } from '@/hooks/api/usePriorArt';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import { InventionData } from '@/types';
import { FullAnalysisResponse } from '@/types/priorArtAnalysisTypes';
import {
  extractClaim1Text,
  constructDependentClaimsText,
  getInventionContext,
  validatePriorArtAnalysisInputs,
} from '../utils/inventionHelpers';
import { TOAST_DURATIONS, TOAST_MESSAGES } from '../constants';

interface PriorArtAnalysisHandlersProps {
  projectId: string;
  analyzedInvention: InventionData | null;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisData: (data: FullAnalysisResponse | null) => void;
  startLoading: (message: string) => void;
  stopLoading: () => void;
}

interface PriorArtAnalysisHandlers {
  handleAnalyzePriorArt: (
    searchHistoryId: string,
    selectedReferenceNumbers: string[],
    forceRefresh: boolean
  ) => Promise<void>;
}

export function usePriorArtAnalysisHandlers({
  projectId,
  analyzedInvention,
  setIsAnalyzing,
  setAnalysisData,
  startLoading,
  stopLoading,
}: PriorArtAnalysisHandlersProps): PriorArtAnalysisHandlers {
  const toast = useToast();
  const analyzePriorArtMutation = useAnalyzePriorArtMutation();

  const handleAnalyzePriorArt = useCallback(
    async (
      searchHistoryId: string,
      selectedReferenceNumbers: string[],
      forceRefresh: boolean
    ) => {
      logger.info('[handleAnalyzePriorArt] Triggered', {
        searchHistoryId,
        selectedReferenceNumbers,
        forceRefresh,
      });

      // Extract and validate inputs
      const claim1Text = extractClaim1Text(analyzedInvention);
      const validation = validatePriorArtAnalysisInputs(
        searchHistoryId,
        selectedReferenceNumbers,
        claim1Text
      );

      if (!validation.isValid || !claim1Text) {
        toast({
          title: 'Error',
          description: validation.errorMessage,
          status: 'error',
          duration: TOAST_DURATIONS.MEDIUM,
        });
        return;
      }

      // Construct analysis inputs
      const existingDependentClaimsText =
        constructDependentClaimsText(analyzedInvention);
      const inventionDetailsContext = getInventionContext(analyzedInvention);

      setIsAnalyzing(true);
      setAnalysisData(null);
      startLoading(TOAST_MESSAGES.INFO.ANALYZING);

      const variables = {
        searchHistoryId,
        selectedReferenceNumbers,
        forceRefresh,
        claim1Text: claim1Text,
        projectId,
        existingDependentClaimsText,
        inventionDetailsContext,
      };

      try {
        const responseData =
          await analyzePriorArtMutation.mutateAsync(variables);

        logger.info('[Analyze] API Success:', { responseData });
        setAnalysisData(responseData as unknown as FullAnalysisResponse);

        // Show warning if not all references were analyzed
        if (
          responseData.referencesAnalyzedCount !== undefined &&
          responseData.referencesRequestedCount !== undefined &&
          responseData.referencesAnalyzedCount <
            responseData.referencesRequestedCount
        ) {
          toast({
            title: 'Note',
            description: TOAST_MESSAGES.WARNING.PARTIAL_ANALYSIS(
              responseData.referencesAnalyzedCount,
              responseData.referencesRequestedCount
            ),
            status: 'warning',
            duration: TOAST_DURATIONS.LONG,
            isClosable: true,
          });
        }
      } catch (error) {
        logger.error('[Analyze] Error:', error);
        setAnalysisData(null);
      } finally {
        setIsAnalyzing(false);
        stopLoading();
      }
    },
    [
      analyzedInvention,
      projectId,
      toast,
      analyzePriorArtMutation,
      setIsAnalyzing,
      setAnalysisData,
      startLoading,
      stopLoading,
    ]
  );

  return {
    handleAnalyzePriorArt,
  };
}
