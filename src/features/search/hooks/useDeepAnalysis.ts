import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { useCitationJobDetails } from './useCitationJobDetails';
import { parseDeepAnalysis } from '../utils/deepAnalysisUtils';
import { CitationJob } from '@/types/citation';
import { DeepAnalysisResult } from '@/types/domain/citation';
import { useRunDeepAnalysis } from '@/hooks/api/useDeepAnalysis';
// hasClaimSetVersionId removed - ClaimSetVersion no longer in codebase
import {
  StructuredDeepAnalysis,
  ParsedDeepAnalysis,
} from '../types/deepAnalysis';
import { useToast } from '@chakra-ui/react';
import { showSuccessToast, showErrorToast } from '@/utils/toast';

/**
 * Interface for the useDeepAnalysis hook parameters
 */
interface UseDeepAnalysisProps {
  /** The currently selected reference */
  selectedReference: string | null;
  /** The currently selected search ID */
  selectedSearchId: string | null;
  /** The currently selected claim set version ID */
  selectedClaimSetVersionId: string | undefined;
  /** Array of citation jobs */
  citationJobs: CitationJob[];
  /** Whether there are matches for the current version */
  hasMatchesForCurrentVersion: boolean;
}

/**
 * Hook to manage deep analysis functionality for citations.
 * This hook is responsible for the BUSINESS LOGIC of selecting the correct
 * citation job and managing the UI state for the deep analysis panel.
 * All data fetching is delegated to centralized API hooks.
 */
export function useDeepAnalysis({
  selectedReference,
  selectedSearchId,
  selectedClaimSetVersionId,
  citationJobs,
  hasMatchesForCurrentVersion,
}: UseDeepAnalysisProps) {
  const [showDeepAnalysis, setShowDeepAnalysis] = useState<boolean>(false);
  const [isProcessingAnalysis, setIsProcessingAnalysis] =
    useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toast = useToast();

  // Find the job from the passed citationJobs array
  const selectedJob = useMemo(() => {
    if (
      !selectedReference ||
      !selectedSearchId ||
      !citationJobs ||
      citationJobs.length === 0
    ) {
      logger.debug(
        '[useDeepAnalysis] Job selection failed - missing prerequisites',
        {
          selectedReference,
          selectedSearchId,
          citationJobsCount: citationJobs?.length || 0,
        }
      );
      return null;
    }

    const normaliseRef = (ref: string | null | undefined) =>
      (ref || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const wantedRef = normaliseRef(selectedReference);

    // Find matching job
    const match = citationJobs.find(
      job =>
        normaliseRef(job.referenceNumber) === wantedRef &&
        job.searchHistoryId === selectedSearchId
    );

    if (!match) {
      logger.debug('[useDeepAnalysis] No matching job found', {
        wantedRef,
        selectedSearchId,
        availableJobs: citationJobs.map(j => ({
          ref: normaliseRef(j.referenceNumber),
          searchId: j.searchHistoryId,
        })),
      });
    }

    return match || null;
  }, [selectedReference, selectedSearchId, citationJobs]);

  const selectedJobId = selectedJob?.id || null;
  const hasExistingDeepAnalysis = selectedJob?.deepAnalysisJson ? true : false;

  const { mutate: runDeepAnalysisMutation, isPending: isMutationPending } =
    useRunDeepAnalysis();

  // Reset processing state when key dependencies change, but keep panel open
  useEffect(() => {
    // Only reset processing state, not the show state
    setIsProcessingAnalysis(false);
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [selectedReference, selectedSearchId, selectedClaimSetVersionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Fetch job details with polling when processing
  const {
    data: citationJobDetails,
    isLoading: isLoadingJobDetails,
    error: jobDetailsError,
    refetch: refetchJobDetails,
  } = useCitationJobDetails(
    showDeepAnalysis || isProcessingAnalysis ? selectedJobId : null,
    {
      // Poll every 3 seconds when processing
      refetchInterval: isProcessingAnalysis ? 3000 : false,
    }
  );

  // Check if analysis completed when job details update
  useEffect(() => {
    if (isProcessingAnalysis && citationJobDetails?.deepAnalysisJson) {
      logger.info('[useDeepAnalysis] Deep analysis completed');
      setIsProcessingAnalysis(false);
      setShowDeepAnalysis(true);
      showSuccessToast(
        toast,
        'Deep analysis completed!',
        'You can now view the detailed analysis results.'
      );

      // Clear timeout if analysis completed
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [isProcessingAnalysis, citationJobDetails?.deepAnalysisJson, toast]);

  const parsedDeepAnalysis = useMemo(() => {
    if (!citationJobDetails?.deepAnalysisJson) return null;
    try {
      return parseDeepAnalysis(citationJobDetails.deepAnalysisJson);
    } catch (error) {
      logger.error('[useDeepAnalysis] Error parsing deepAnalysisJson', {
        error,
      });
      return null;
    }
  }, [citationJobDetails?.deepAnalysisJson]);

  const effectiveDeepAnalysis = useMemo(():
    | ParsedDeepAnalysis
    | StructuredDeepAnalysis
    | DeepAnalysisResult
    | null => {
    return parsedDeepAnalysis || null;
  }, [parsedDeepAnalysis]);

  const shouldShowDeepAnalysisPanel = useMemo(() => {
    return (
      showDeepAnalysis && !!selectedReference && hasMatchesForCurrentVersion
    );
  }, [showDeepAnalysis, selectedReference, hasMatchesForCurrentVersion]);

  const hasHighRelevanceAnalysis = useMemo(() => {
    if (!effectiveDeepAnalysis) return false;

    // Check if it's a DeepAnalysisResult (has overallAssessment)
    if (
      'elementAnalysis' in effectiveDeepAnalysis &&
      'overallAssessment' in effectiveDeepAnalysis &&
      typeof effectiveDeepAnalysis.overallAssessment === 'object'
    ) {
      // Check for high relevance in the proper format
      if ('relevanceLevel' in effectiveDeepAnalysis.overallAssessment) {
        return (
          effectiveDeepAnalysis.overallAssessment.relevanceLevel === 'high'
        );
      }
      // Check patentability score as fallback
      if ('patentabilityScore' in effectiveDeepAnalysis.overallAssessment) {
        return (
          effectiveDeepAnalysis.overallAssessment.patentabilityScore >= 0.7
        );
      }
    }

    // For ParsedDeepAnalysis format, check string values
    const values = Object.values(effectiveDeepAnalysis as ParsedDeepAnalysis);
    return values.some(
      value =>
        typeof value === 'string' &&
        /high|strong|clear|direct|exact|explicit|significant concern/i.test(
          value
        )
    );
  }, [effectiveDeepAnalysis]);

  const runDeepAnalysis = useCallback(async (): Promise<void> => {
    if (!selectedJobId) {
      logger.warn(
        '[useDeepAnalysis] Cannot run deep analysis – no citationJobId'
      );
      return;
    }

    logger.info('[useDeepAnalysis] Starting deep analysis', { selectedJobId });
    setIsProcessingAnalysis(true);
    setShowDeepAnalysis(true); // Show the panel immediately

    // Set a timeout to stop processing after 90 seconds
    timeoutRef.current = setTimeout(() => {
      setIsProcessingAnalysis(false);
      showErrorToast(
        toast,
        'Deep analysis timeout',
        'The analysis is taking longer than expected. Please try again later.'
      );
    }, 90000); // 90 seconds

    runDeepAnalysisMutation(selectedJobId, {
      onError: () => {
        setIsProcessingAnalysis(false);
        showErrorToast(
          toast,
          'Failed to start deep analysis',
          'Please try again or contact support if the issue persists.'
        );

        // Clear timeout on error
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      },
    });
  }, [selectedJobId, runDeepAnalysisMutation, toast]);

  const toggleDeepAnalysis = useCallback((shouldShow: boolean) => {
    setShowDeepAnalysis(shouldShow);
  }, []);

  // Combined loading state
  const isRunningDeepAnalysis = isMutationPending || isProcessingAnalysis;

  return {
    showDeepAnalysis,
    toggleDeepAnalysis,
    effectiveDeepAnalysis,
    shouldShowDeepAnalysisPanel,
    hasHighRelevanceAnalysis,
    runDeepAnalysis,
    isRunningDeepAnalysis,
    selectedJobId,
    isLoadingJobDetails,
    jobDetailsError,
    hasExistingDeepAnalysis,
  };
}
