import { useState, useMemo, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/useToastWrapper';
import { useQueryClient } from '@tanstack/react-query';
import { CitationJob } from '@/features/search/hooks/useCitationJobs';
import { GroupedCitation } from '@/features/search/hooks/useCitationMatches';
import { CitationClientService } from '@/client/services/citation.client-service';
import { citationJobKeys } from '@/lib/queryKeys/citationKeys';
import { logger } from '@/utils/clientLogger';
import { useCitationStore } from '../store';

interface UseCitationJobsManagementProps {
  activeSearchId: string | null;
  citationJobsData: CitationJob[] | { jobs: CitationJob[] } | undefined;
  citationMatchesData: { groupedResults: GroupedCitation[] } | undefined;
  selectedReference: string | null;
}

export function useCitationJobsManagement({
  activeSearchId,
  citationJobsData,
  citationMatchesData,
  selectedReference,
}: UseCitationJobsManagementProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const getOptimisticRefsForSearch = useCitationStore(
    state => state.getOptimisticRefsForSearch
  );

  // Track rerun loading state
  const [isRerunningExtraction, setIsRerunningExtraction] = useState(false);

  // Track which job we're viewing (null means latest/current)
  const [viewingJobId, setViewingJobId] = useState<string | null>(null);

  // Get optimistic refs for the active search
  const optimisticRefs = activeSearchId
    ? getOptimisticRefsForSearch(activeSearchId)
    : {};

  // Get all jobs as array
  const allCitationJobs = useMemo(() => {
    return Array.isArray(citationJobsData)
      ? citationJobsData
      : citationJobsData?.jobs || [];
  }, [citationJobsData]);

  // Get latest jobs (one per reference)
  const citationJobs = useMemo(() => {
    const latestJobsByRef = new Map<string, CitationJob>();
    allCitationJobs.forEach((job: CitationJob) => {
      if (!job.referenceNumber) return;

      const existing = latestJobsByRef.get(job.referenceNumber);
      if (!existing || new Date(job.createdAt) > new Date(existing.createdAt)) {
        latestJobsByRef.set(job.referenceNumber, job);
      }
    });

    return Array.from(latestJobsByRef.values());
  }, [allCitationJobs]);

  // Build reference statuses
  const referenceStatuses = useMemo(() => {
    const realJobs: CitationJob[] = allCitationJobs;
    const optimistic = Object.keys(optimisticRefs);

    // Build a map of which references have actual citation match data
    const refsWithData = new Set<string>();
    if (citationMatchesData?.groupedResults) {
      citationMatchesData.groupedResults.forEach((group: GroupedCitation) => {
        group.matches.forEach(match => {
          if (match.referenceNumber) {
            refsWithData.add(match.referenceNumber);
          }
        });
      });
    }

    // Group jobs by reference number and keep only the latest one
    const latestJobsByRef = new Map<string, CitationJob>();
    realJobs.forEach((job: CitationJob) => {
      if (!job.referenceNumber) return;

      const existing = latestJobsByRef.get(job.referenceNumber);
      if (!existing || new Date(job.createdAt) > new Date(existing.createdAt)) {
        latestJobsByRef.set(job.referenceNumber, job);
      }
    });

    // Check if we're rerunning any references
    const rerunningRefs = new Set<string>();
    if (isRerunningExtraction && selectedReference) {
      rerunningRefs.add(selectedReference);
    }

    // Helper function to check if a completed job should still show as optimistic
    const shouldCompletedJobShowAsOptimistic = (job: CitationJob): boolean => {
      // If we have data, don't show as optimistic
      if (refsWithData.has(job.referenceNumber!)) {
        return false;
      }
      
      // If the job completed more than 5 minutes ago and we still have no data,
      // stop showing as optimistic to prevent infinite spinning
      if (job.completedAt) {
        const completedTime = new Date(job.completedAt).getTime();
        const now = Date.now();
        const fiveMinutesMs = 5 * 60 * 1000;
        
        if (now - completedTime > fiveMinutesMs) {
          return false;
        }
      }
      
      // For recently completed jobs (< 5 minutes), keep showing as optimistic
      // in case the data is still being processed
      return true;
    };

    // Create statuses from the latest jobs only
    const realStatuses = Array.from(latestJobsByRef.values()).map(
      (job: CitationJob) => ({
        referenceNumber: job.referenceNumber!,
        status: job.status,
        isOptimistic: false,
        showAsOptimistic:
          rerunningRefs.has(job.referenceNumber!) ||
          job.status === 'PENDING' ||
          job.status === 'RUNNING' ||
          job.status === 'PROCESSING' ||
          job.status === 'CREATED' ||
          (job.status === 'COMPLETED' && shouldCompletedJobShowAsOptimistic(job)),
      })
    );

    // Create optimistic statuses for refs that don't have real jobs yet
    const optimisticStatuses = optimistic
      .filter(ref => !latestJobsByRef.has(ref))
      .map(ref => ({
        referenceNumber: ref,
        status: 'PROCESSING',
        isOptimistic: true,
        showAsOptimistic: true,
      }));

    // Put optimistic statuses first, then real statuses
    return [...optimisticStatuses, ...realStatuses];
  }, [
    allCitationJobs,
    optimisticRefs,
    citationMatchesData,
    isRerunningExtraction,
    selectedReference,
  ]);

  // Clear optimistic refs when jobs appear OR when they fail
  useEffect(() => {
    if (!activeSearchId || Object.keys(optimisticRefs).length === 0) return;

    const clearSpecificOptimisticRefs =
      useCitationStore.getState().clearSpecificOptimisticRefs;

    // Find which optimistic refs now have real jobs OR failed jobs
    const refsWithJobs: string[] = [];
    const refsWithFailedJobs: string[] = [];
    
    Object.keys(optimisticRefs).forEach(ref => {
      const job = allCitationJobs.find(job => job.referenceNumber === ref);
      if (job) {
        if (job.status === 'FAILED' || job.status === 'ERROR') {
          refsWithFailedJobs.push(ref);
        } else {
          refsWithJobs.push(ref);
        }
      }
    });

    // Clear optimistic refs that now have real jobs or failed
    const refsToClean = [...refsWithJobs, ...refsWithFailedJobs];
    if (refsToClean.length > 0) {
      clearSpecificOptimisticRefs(activeSearchId, refsToClean);
      
      if (refsWithFailedJobs.length > 0) {
        logger.warn('[useCitationJobsManagement] Cleared optimistic refs for failed jobs', {
          failedRefs: refsWithFailedJobs,
          activeSearchId,
        });
      }
    }
  }, [activeSearchId, optimisticRefs, allCitationJobs]);

  // Build citation history for selected reference
  const citationHistory = useMemo(() => {
    if (!selectedReference) return [];

    // Get all jobs for this reference, sorted by creation date (newest first)
    const referenceJobs = allCitationJobs
      .filter(job => job.referenceNumber === selectedReference)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    // Find the currently displayed job (latest one)
    const currentJob = citationJobs.find(
      job => job.referenceNumber === selectedReference
    );

    return referenceJobs.map(job => ({
      id: job.id,
      createdAt: new Date(job.createdAt),
      status: job.status,
      isCurrent: viewingJobId
        ? job.id === viewingJobId
        : currentJob?.id === job.id,
    }));
  }, [selectedReference, allCitationJobs, citationJobs, viewingJobId]);

  // Handler for rerunning citation extraction
  const handleRerunCitationExtraction = useCallback(async () => {
    if (!selectedReference || !activeSearchId) {
      toast({
        title: 'No reference selected',
        description: 'Please select a reference to rerun citation extraction.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    logger.info('[CitationJobsManagement] Rerunning citation extraction', {
      reference: selectedReference,
      searchId: activeSearchId,
    });

    setIsRerunningExtraction(true);

    try {
      const result = await CitationClientService.createCitationJob(
        activeSearchId,
        selectedReference
      );

      if (result.success) {
        toast({
          title: 'Citation extraction started',
          description: `Rerunning extraction for ${selectedReference}. Results will appear shortly.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        queryClient.invalidateQueries({
          queryKey: citationJobKeys.list(activeSearchId),
        });
      } else {
        throw new Error('Failed to create citation job');
      }
    } catch (error) {
      logger.error('[CitationJobsManagement] Failed to rerun extraction', {
        error,
      });
      toast({
        title: 'Failed to start extraction',
        description:
          error instanceof Error
            ? error.message
            : 'An error occurred while starting citation extraction.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsRerunningExtraction(false);
    }
  }, [selectedReference, activeSearchId, toast, queryClient]);

  // Handler for viewing historical runs
  const handleViewHistoricalRun = useCallback(
    (jobId: string) => {
      logger.info('[CitationJobsManagement] View historical run', { jobId });

      setViewingJobId(jobId);

      const job = allCitationJobs.find(j => j.id === jobId);
      if (job) {
        toast({
          title: 'Viewing Historical Run',
          description: `Now viewing citation extraction from ${new Date(job.createdAt).toLocaleString()}`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [toast, allCitationJobs]
  );

  const handleReturnToLatest = useCallback(() => {
    setViewingJobId(null);
    toast({
      title: 'Returned to Latest',
      description: 'Now viewing the most recent citation extraction results.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  // Check if viewing historical (not the latest job)
  const isViewingHistorical = useMemo(() => {
    if (!viewingJobId || !selectedReference) return false;
    const latestJob = citationJobs.find(
      job => job.referenceNumber === selectedReference
    );
    return latestJob?.id !== viewingJobId;
  }, [viewingJobId, selectedReference, citationJobs]);

  // Get citation jobs for analysis (considering historical view)
  const citationJobsForAnalysis = useMemo(() => {
    if (!viewingJobId) {
      return citationJobs;
    }

    const historicalJob = allCitationJobs.find(job => job.id === viewingJobId);
    return historicalJob ? [historicalJob] : [];
  }, [viewingJobId, citationJobs, allCitationJobs]);

  return {
    referenceStatuses,
    citationJobs,
    allCitationJobs,
    citationHistory,
    viewingJobId,
    isViewingHistorical,
    isRerunningExtraction,
    citationJobsForAnalysis,
    handleRerunCitationExtraction,
    handleViewHistoricalRun,
    handleReturnToLatest,
  };
}
