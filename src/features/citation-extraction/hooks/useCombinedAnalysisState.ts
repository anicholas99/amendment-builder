import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import { useCombinedAnalysisMutation } from '@/hooks/api/useAI';
import { CitationJob } from '@/features/search/hooks/useCitationJobs';
import { StructuredCombinedAnalysis } from '@/client/services/patent/patentability/combined-analysis.client-service';

interface Claim {
  id?: string;
  number: number;
  text: string;
}

export interface UseCombinedAnalysisStateProps {
  activeSearchId: string | null;
  claim1Text: string;
  citationJobs: CitationJob[];
  allClaims?: Claim[];
  projectId?: string;
}

export function useCombinedAnalysisState({
  activeSearchId,
  claim1Text,
  citationJobs,
  allClaims,
  projectId,
}: UseCombinedAnalysisStateProps) {
  const toast = useToast();

  const [showCombinedAnalysis, setShowCombinedAnalysis] = useState(false);
  const [selectedReferencesForCombined, setSelectedReferencesForCombined] =
    useState<string[]>([]);
  const [combinedAnalysisResult, setCombinedAnalysisResult] =
    useState<StructuredCombinedAnalysis | null>(null);
  const [isCheckingFreshness, setIsCheckingFreshness] = useState(false);
  const [refreshingReferences, setRefreshingReferences] = useState<string[]>(
    []
  );
  const [isPreparingReferences, setIsPreparingReferences] = useState(false);

  // Use the proper mutation hook
  const combinedAnalysisMutation = useCombinedAnalysisMutation(
    (result: any) => {
      // Success callback
      let analysis: StructuredCombinedAnalysis;

      if (result && typeof result === 'object' && 'analysis' in result) {
        analysis = result.analysis as StructuredCombinedAnalysis;
      } else if (result && typeof result === 'object') {
        analysis = result as StructuredCombinedAnalysis;
      } else {
        logger.error(
          '[useCombinedAnalysisState] Invalid analysis result format',
          {
            result,
            hasAnalysis:
              result && typeof result === 'object' && 'analysis' in result,
            resultType: typeof result,
          }
        );
        return;
      }

      // Ensure required arrays exist with default values
      const safeAnalysis: StructuredCombinedAnalysis = {
        ...analysis,
        combinedReferences: analysis.combinedReferences || [],
        strategicRecommendations: analysis.strategicRecommendations || [],
        rejectionJustification: analysis.rejectionJustification || {
          motivationToCombine: null,
          claimElementMapping: [],
          fullNarrative: '',
        },
        completeDisclosureAnalysis: {
          singleReferences:
            analysis.completeDisclosureAnalysis?.singleReferences || [],
          minimalCombinations:
            analysis.completeDisclosureAnalysis?.minimalCombinations || [],
        },
      };

      setCombinedAnalysisResult(safeAnalysis);

      // Reset preparation state on success
      setIsPreparingReferences(false);
      setRefreshingReferences([]);
    }
  );

  const handleCombinedAnalysis = useCallback(() => {
    setShowCombinedAnalysis(true);
  }, []);

  const handleBackFromCombinedAnalysis = useCallback(() => {
    setShowCombinedAnalysis(false);
  }, []);

  // Reset function to force back to individual results view
  const resetToCitationResults = useCallback(() => {
    setShowCombinedAnalysis(false);
  }, []);

  const handleRunCombinedAnalysis = useCallback(
    async (selectedRefs: string[]) => {
      logger.info('[CombinedAnalysisState] handleRunCombinedAnalysis called', {
        selectedRefs,
        claim1Text: claim1Text ? 'present' : 'missing',
        citationJobsCount: citationJobs.length,
        activeSearchId,
        allClaimsCount: allClaims?.length || 0,
        projectId,
      });

      // Set loading state immediately for instant feedback
      setIsPreparingReferences(true);

      // Clear previous result when starting a new analysis
      setCombinedAnalysisResult(null);

      if (!claim1Text) {
        logger.warn('[CombinedAnalysisState] Missing claim 1 text');
        setIsPreparingReferences(false);
        toast({
          title: 'Unable to run analysis',
          description:
            'No Claim 1 found in the project. Please ensure you have generated claims first.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (selectedRefs.length < 2) {
        logger.warn('[CombinedAnalysisState] Insufficient references selected');
        setIsPreparingReferences(false);
        toast({
          title: 'Select more references',
          description:
            'Please select at least 2 references to run combined analysis.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (!activeSearchId) {
        logger.warn('[CombinedAnalysisState] No active search ID available');
        setIsPreparingReferences(false);
        toast({
          title: 'Unable to run analysis',
          description:
            'No active search selected. Please select a search first.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      setSelectedReferencesForCombined(selectedRefs);

      // Find existing citation jobs and missing references
      const existingJobs: CitationJob[] = [];
      const missingReferences: string[] = [];

      selectedRefs.forEach(refNumber => {
        const job = citationJobs.find(
          j => j.referenceNumber === refNumber && j.deepAnalysisJson
        );
        if (job) {
          existingJobs.push(job);
        } else {
          missingReferences.push(refNumber);
        }
      });

      logger.info('[CombinedAnalysisState] Reference analysis status', {
        totalSelected: selectedRefs.length,
        existingJobs: existingJobs.length,
        missingReferences: missingReferences.length,
        missingRefs: missingReferences,
      });

      // If we need to run deep analysis for some references
      if (missingReferences.length > 0) {
        // This is handled by the existing logic, isPreparingReferences is already true
        // ... existing missing references logic ...
      }

      // Check if we have enough existing jobs to proceed
      if (existingJobs.length < 2) {
        logger.warn(
          '[CombinedAnalysisState] Not enough citation jobs found for selected references'
        );
        setIsPreparingReferences(false);
        toast({
          title: 'Unable to run analysis',
          description:
            'Not enough references with deep analysis found. Please ensure the selected references have completed deep analysis.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Run the combined analysis
      try {
        logger.info(
          '[CombinedAnalysisState] Starting combined analysis API call'
        );

        // Show immediate loading feedback
        toast({
          title: 'Starting Analysis',
          description: 'Generating comprehensive combined analysis...',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });

        await combinedAnalysisMutation.mutateAsync({
          claim1Text,
          referenceIds: existingJobs.map(job => job.id),
          referenceNumbers: selectedRefs,
          searchHistoryId: activeSearchId,
          allClaims: allClaims || [],
        });

        logger.info(
          '[CombinedAnalysisState] Combined analysis completed successfully'
        );

        // Success will be handled by the mutation's onSuccess callback
      } catch (error) {
        logger.error('[CombinedAnalysisState] Combined analysis failed', {
          error,
        });

        // Reset loading states on error
        setIsPreparingReferences(false);
        setRefreshingReferences([]);

        // Show error toast
        toast({
          title: 'Analysis Failed',
          description:
            'Failed to generate combined analysis. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [
      claim1Text,
      citationJobs,
      activeSearchId,
      allClaims,
      combinedAnalysisMutation,
      toast,
    ]
  );

  const clearCombinedAnalysisResult = useCallback(() => {
    setCombinedAnalysisResult(null);
    combinedAnalysisMutation.reset();
  }, [combinedAnalysisMutation]);

  return {
    showCombinedAnalysis,
    selectedReferencesForCombined,
    combinedAnalysisResult,
    isLoadingCombinedAnalysis:
      combinedAnalysisMutation.isPending || isPreparingReferences,
    isCheckingFreshness,
    refreshingReferences,
    handleCombinedAnalysis,
    handleBackFromCombinedAnalysis,
    handleRunCombinedAnalysis,
    resetToCitationResults,
    clearCombinedAnalysisResult: () => setCombinedAnalysisResult(null),
  };
}
