import { useState, useCallback, useEffect, useMemo } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { CitationJob } from '@/types/citation';
import { ExaminerAnalysisResult } from '@/types/domain/citation';
import { useCitationJobDetails } from './useCitationJobDetails';
import {
  useGetExaminerAnalysis,
  useRunExaminerAnalysis,
} from '@/hooks/api/useExaminerAnalysis';
import { useMutation, useQuery } from '@tanstack/react-query';

/**
 * Interface for the useExaminerAnalysis hook parameters
 */
interface UseExaminerAnalysisProps {
  /** The currently selected reference */
  selectedReference: string | null;
  /** The currently selected search ID */
  selectedSearchId: string | null;
  /** Array of citation jobs */
  citationJobs: CitationJob[];
  /** Whether there are matches for the current version */
  hasMatchesForCurrentVersion: boolean;
}

/**
 * Hook to manage examiner analysis functionality for citations.
 * This hook is now responsible only for business logic and UI state.
 */
export function useExaminerAnalysis({
  selectedReference,
  selectedSearchId,
  citationJobs,
  hasMatchesForCurrentVersion,
}: UseExaminerAnalysisProps) {
  const [showExaminerAnalysis, setShowExaminerAnalysis] =
    useState<boolean>(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Determine the best citation job ID based on selections
  useEffect(() => {
    if (!selectedReference || !selectedSearchId || !citationJobs.length) {
      setSelectedJobId(null);
      return;
    }
    const matchingJob = citationJobs.find(
      job =>
        job.referenceNumber === selectedReference &&
        job.searchHistoryId === selectedSearchId
    );
    setSelectedJobId(matchingJob ? matchingJob.id : null);
  }, [selectedReference, selectedSearchId, citationJobs]);

  const {
    data: citationJobDetails,
    isLoading: isLoadingJobDetails,
    error: jobDetailsError,
  } = useCitationJobDetails(selectedJobId);

  const { data: directExaminerAnalysis, refetch: refetchDirectAnalysis } =
    useGetExaminerAnalysis(selectedJobId, {
      enabled: showExaminerAnalysis && !!selectedJobId,
    });

  const {
    mutateAsync: runExaminerAnalysisMutation,
    isPending: isRunningExaminerAnalysis,
  } = useRunExaminerAnalysis();

  const parsedExaminerAnalysis = useMemo(() => {
    const examinerJson = (citationJobDetails as any)?.examinerAnalysisJson;
    if (!examinerJson) return null;
    try {
      return typeof examinerJson === 'string'
        ? JSON.parse(examinerJson)
        : examinerJson;
    } catch (error) {
      logger.error('[useExaminerAnalysis] Error parsing examinerAnalysisJson', {
        error,
      });
      return null;
    }
  }, [citationJobDetails]);

  const effectiveExaminerAnalysis =
    useMemo((): ExaminerAnalysisResult | null => {
      return parsedExaminerAnalysis || directExaminerAnalysis || null;
    }, [parsedExaminerAnalysis, directExaminerAnalysis]);

  const shouldShowExaminerAnalysisPanel = useMemo(() => {
    return (
      showExaminerAnalysis && !!selectedReference && hasMatchesForCurrentVersion
    );
  }, [showExaminerAnalysis, selectedReference, hasMatchesForCurrentVersion]);

  const hasHighImportanceFindings = useMemo(() => {
    if (!effectiveExaminerAnalysis) return false;
    return effectiveExaminerAnalysis.keyRejectionPoints.some(
      point =>
        point.type === '102 Anticipation' || point.type === '103 Obviousness'
    );
  }, [effectiveExaminerAnalysis]);

  const toggleExaminerAnalysis = useCallback(
    (shouldShow: boolean) => {
      setShowExaminerAnalysis(shouldShow);
      if (shouldShow && !parsedExaminerAnalysis && !directExaminerAnalysis) {
        refetchDirectAnalysis();
      }
    },
    [parsedExaminerAnalysis, directExaminerAnalysis, refetchDirectAnalysis]
  );

  const runExaminerAnalysis = useCallback(async (): Promise<void> => {
    if (!selectedJobId) {
      logger.warn(
        '[useExaminerAnalysis] Cannot run examiner analysis – no citationJobId'
      );
      return;
    }
    await runExaminerAnalysisMutation(selectedJobId);
  }, [selectedJobId, runExaminerAnalysisMutation]);

  return {
    showExaminerAnalysis,
    toggleExaminerAnalysis,
    effectiveExaminerAnalysis,
    shouldShowExaminerAnalysisPanel,
    hasHighImportanceFindings,
    runExaminerAnalysis,
    isRunningExaminerAnalysis,
    selectedJobId,
    isLoadingJobDetails,
    jobDetailsError,
  };
}
