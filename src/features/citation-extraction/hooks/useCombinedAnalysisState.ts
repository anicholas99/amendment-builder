import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useCombinedAnalysisMutation } from '@/hooks/api/useAI';
import { logger } from '@/lib/monitoring/logger';
import { CitationJob } from '@/features/search/hooks/useCitationJobs';

interface UseCombinedAnalysisStateProps {
  activeSearchId: string | null;
  claim1Text: string;
  citationJobs: CitationJob[];
}

export function useCombinedAnalysisState({
  activeSearchId,
  claim1Text,
  citationJobs,
}: UseCombinedAnalysisStateProps) {
  const toast = useToast();

  const [showCombinedAnalysis, setShowCombinedAnalysis] = useState(false);
  const [selectedReferencesForCombined, setSelectedReferencesForCombined] =
    useState<string[]>([]);
  const [combinedAnalysisResult, setCombinedAnalysisResult] =
    useState<any>(null);

  // Use the proper mutation hook
  const combinedAnalysisMutation = useCombinedAnalysisMutation(result => {
    // Extract the analysis from the result
    const analysis = result.analysis || result;
    setCombinedAnalysisResult(analysis);
  });

  const handleCombinedAnalysis = useCallback(() => {
    setShowCombinedAnalysis(true);
  }, []);

  const handleBackFromCombinedAnalysis = useCallback(() => {
    setShowCombinedAnalysis(false);
  }, []);

  const handleRunCombinedAnalysis = useCallback(
    async (selectedRefs: string[]) => {
      logger.info('[CombinedAnalysisState] handleRunCombinedAnalysis called', {
        selectedRefs,
        claim1Text: claim1Text ? 'present' : 'missing',
        citationJobsCount: citationJobs.length,
        activeSearchId,
      });

      // Clear previous result when starting a new analysis
      setCombinedAnalysisResult(null);

      if (!claim1Text) {
        logger.warn('[CombinedAnalysisState] Missing claim 1 text');
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

      setSelectedReferencesForCombined(selectedRefs);

      // Find the citation jobs for the selected references
      const jobsToAnalyze = citationJobs.filter(job => {
        const matches = selectedRefs.includes(job.referenceNumber || '');
        logger.debug('[CombinedAnalysisState] Checking job', {
          jobId: job.id,
          jobRef: job.referenceNumber,
          selectedRefs,
          matches,
        });
        return matches;
      });

      logger.info('[CombinedAnalysisState] Jobs to analyze', {
        selectedRefs,
        jobsToAnalyze: jobsToAnalyze.map(j => ({
          id: j.id,
          ref: j.referenceNumber,
        })),
        citationJobsRefs: citationJobs.map(j => j.referenceNumber),
      });

      if (jobsToAnalyze.length < 2) {
        logger.warn(
          '[CombinedAnalysisState] Not enough citation jobs found for selected references'
        );
        toast({
          title: 'Unable to run analysis',
          description:
            'Could not find citation jobs for the selected references. Please ensure the references have completed deep analysis.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Use the mutation hook with proper parameters
      combinedAnalysisMutation.mutate({
        claim1Text,
        referenceIds: jobsToAnalyze.map(job => job.id),
        referenceNumbers: jobsToAnalyze.map(job =>
          (job.referenceNumber || '').replace(/-/g, '')
        ),
        searchHistoryId: activeSearchId!,
      });
    },
    [claim1Text, citationJobs, activeSearchId, toast, combinedAnalysisMutation]
  );

  const clearCombinedAnalysisResult = useCallback(() => {
    setCombinedAnalysisResult(null);
    combinedAnalysisMutation.reset();
  }, [combinedAnalysisMutation]);

  return {
    showCombinedAnalysis,
    selectedReferencesForCombined,
    combinedAnalysisResult,
    isRunningCombinedAnalysis: combinedAnalysisMutation.isPending,
    handleCombinedAnalysis,
    handleBackFromCombinedAnalysis,
    handleRunCombinedAnalysis,
    clearCombinedAnalysisResult,
  };
}
