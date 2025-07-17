import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useCitationMatches } from '@/features/search/hooks/useCitationMatches';
import { useCitationStore } from '../store';
import { useCitationPolling } from '../hooks/useCitationPolling';
import { useCitationStatus } from '../hooks/useCitationStatus';
import { useSearchHistory } from '@/hooks/api/useSearchHistory';
import { useDeepAnalysis } from '@/features/search/hooks/useDeepAnalysis';
import CombinedAnalysisInTabView from '@/features/search/components/CombinedAnalysisInTabView';
import { ProcessedCitationMatch } from '@/types/domain/citation';
import { useSaveCitation } from '@/hooks/api/useSaveCitation';
import { useProjectPriorArt } from '@/hooks/api/usePriorArt';
import { CitationJobWithAnalysis } from '@/types/api/citation';
import type { CitationJob } from '@/features/search/hooks/useCitationJobs';
// Removed direct Prisma type import to satisfy eslint-rule `local/no-direct-prisma-import`
import { useCitationJobsManagement } from '../hooks/useCitationJobsManagement';
import { useCombinedAnalysisState } from '../hooks/useCombinedAnalysisState';
import { useReferenceActions } from '../hooks/useReferenceActions';
import { useClaimsData } from '../hooks/useClaimsData';
import { useAddClaimMutation, useClaimsQuery } from '@/hooks/api/useClaims';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import { useSavedCitationState } from '../hooks/useSavedCitationState';
import { useQueryClient } from '@tanstack/react-query';
import { getCurrentTenant } from '@/lib/queryKeys/tenant';
import { subscribeToCitationEvents } from '@/utils/events/citationEvents';

// Components
import { HistoricalViewBanner } from './HistoricalViewBanner';
import { CitationMainView } from './CitationMainView';

interface CitationsTabContainerProps {
  isActive?: boolean;
  projectId: string;
  /**
   * @deprecated No longer used for ordering. Citation elements maintain their
   * original extraction order - frozen in time from when citations were extracted.
   * Kept for backward compatibility but will be removed in future versions.
   */
  parsedElements?: string[];
  /**
   * Callback function to apply amendments to claim 1
   */
  onApplyAmendmentToClaim1?: (original: string, revised: string) => void;
  /**
   * Exposes the reset function to parent components for navigation control
   */
  onResetToCitationResults?: (resetFn: () => void) => void;
}

// ------------------------------
// Utility helpers
// ------------------------------

/**
 * Supported job status values returned from the backend once they have been
 * normalised for the UI layer. Note that `undefined` is used when we cannot
 * confidently map an incoming status string.
 */
type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

/**
 * Convert an arbitrary status string from the backend into a `JobStatus` value
 * that is understood by the presentation layer.
 *
 * "RUNNING" & "CREATED" are treated as aliases for the generic
 * "PROCESSING" state so that the UI can reuse the existing loading styling.
 * Any *unknown* status will return `undefined` which allows a safe fallback
 * path in rendering logic.
 */
const mapJobStatus = (status: string): JobStatus | undefined => {
  switch (status) {
    case 'PENDING':
    case 'PROCESSING':
    case 'COMPLETED':
    case 'FAILED':
      return status as JobStatus;
    case 'RUNNING':
    case 'CREATED':
      return 'PROCESSING';
    default:
      return undefined;
  }
};

// Type for a claim object
interface Claim {
  id: string;
  number: number;
  text: string;
  inventionId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Type for claims data response
type ClaimsData = Claim[] | { claims: Claim[] } | undefined;

const CitationsTabContainer: React.FC<CitationsTabContainerProps> = ({
  isActive = false,
  projectId,
  onApplyAmendmentToClaim1,
  onResetToCitationResults,
}) => {
  // Use individual selectors to avoid re-renders and infinite loops
  const activeSearchId = useCitationStore(state => state.activeSearchId);
  const selectedReference = useCitationStore(state => state.selectedReference);
  const setActiveSearchId = useCitationStore(state => state.setActiveSearchId);
  const setSelectedReference = useCitationStore(
    state => state.setSelectedReference
  );
  const clearAllState = useCitationStore(state => state.clearAllState);
  const queryClient = useQueryClient();

  // Clear citation store when project changes to prevent data leakage
  useEffect(() => {
    // Reset citation store state when switching projects
    clearAllState();

    // Invalidate all citation-related queries to prevent stale data
    const tenant = getCurrentTenant();
    queryClient.invalidateQueries({ queryKey: [tenant, 'citationJobs'] });
    queryClient.invalidateQueries({ queryKey: [tenant, 'citationMatches'] });
    queryClient.invalidateQueries({ queryKey: [tenant, 'examinerAnalysis'] });
    queryClient.invalidateQueries({ queryKey: [tenant, 'deepAnalysis'] });
    queryClient.invalidateQueries({ queryKey: [tenant, 'citations'] });
    queryClient.invalidateQueries({ queryKey: [tenant, 'citationTopMatches'] });

    logger.info(
      '[CitationsTabContainer] Project changed, clearing citation state',
      {
        projectId,
        tenant,
      }
    );
  }, [projectId, clearAllState, queryClient]);

  // Subscribe to citation events to stay synchronized with other views
  useEffect(() => {
    if (!projectId) return;

    const unsubscribe = subscribeToCitationEvents(detail => {
      // Only refresh if the event is for the current project
      if (detail.projectId === projectId && detail.type === 'citation-saved') {
        logger.info(
          '[CitationsTabContainer] Citation saved event received, refreshing data',
          { ...detail }
        );

        // Invalidate prior art queries to get fresh saved citations data
        const tenant = getCurrentTenant();
        queryClient.invalidateQueries({
          queryKey: ['priorArt', 'project', projectId],
          refetchType: 'all',
        });
        queryClient.invalidateQueries({
          queryKey: [tenant, 'savedPriorArt', 'project', projectId],
          refetchType: 'all',
        });
      }
    });

    return unsubscribe;
  }, [projectId, queryClient]);

  // Fetch search history
  const { data: searchHistoryData } = useSearchHistory(projectId);
  const currentSearchHistory = searchHistoryData || [];

  // Enable polling when there are optimistic refs
  useCitationPolling();

  // Fetch citation data
  const {
    data: citationJobsData,
    isLoading: isLoadingJobs,
    error: jobsError,
  } = useCitationStatus({
    searchHistoryId: activeSearchId,
    enabled: isActive,
  });

  const {
    data: citationMatchesResponse,
    isLoading: isLoadingCitationMatches,
    error: citationMatchesError,
  } = useCitationMatches(activeSearchId);

  // Convert null to undefined for type compatibility
  const citationMatchesData = citationMatchesResponse || undefined;

  // Simple logging when citation matches appear
  useEffect(() => {
    if (!isActive || !citationMatchesData || !activeSearchId) return;

    const totalMatches =
      citationMatchesData.groupedResults?.reduce(
        (total, group) => total + group.matches.length,
        0
      ) || 0;

    // Only log if we have matches (indicating extraction completed)
    if (totalMatches > 0) {
      logger.info(
        '[CitationsTabContainer] 🎉 Citation extraction complete with matches',
        {
          searchId: activeSearchId,
          totalMatches,
          groupCount: citationMatchesData.groupedResults?.length || 0,
        }
      );
    }
  }, [citationMatchesData, activeSearchId, isActive]);

  // Custom hooks
  const {
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
  } = useCitationJobsManagement({
    activeSearchId,
    citationJobsData,
    citationMatchesData,
    selectedReference,
  });

  const { claim1Text } = useClaimsData({ projectId });
  const { data: claimsData } = useClaimsQuery(projectId);
  const { mutate: addClaim } = useAddClaimMutation(projectId);
  const toast = useToast();

  // Track previous job statuses to detect completion transitions
  const previousJobStatusesRef = useRef<Map<string, string>>(new Map());

  // Toast notification when citation extraction transitions to complete
  useEffect(() => {
    if (!isActive || !citationJobsData || !activeSearchId) return;

    const jobsArray: CitationJob[] = Array.isArray(citationJobsData)
      ? citationJobsData
      : citationJobsData?.jobs || [];
    const currentJobStatuses = new Map<string, string>();

    // Track current job statuses
    jobsArray.forEach(job => {
      if (job.referenceNumber) {
        currentJobStatuses.set(job.referenceNumber, job.status);
      }
    });

    // Check for jobs that transitioned to COMPLETED
    const newlyCompletedJobs = jobsArray.filter(job => {
      if (!job.referenceNumber || job.status !== 'COMPLETED') return false;

      const previousStatus = previousJobStatusesRef.current.get(
        job.referenceNumber
      );
      return previousStatus && previousStatus !== 'COMPLETED';
    });

    // Show toast if we have newly completed jobs and citation matches
    if (newlyCompletedJobs.length > 0 && citationMatchesData) {
      const totalMatches =
        citationMatchesData.groupedResults?.reduce(
          (total, group) => total + group.matches.length,
          0
        ) || 0;

      // Only show toast if there are actual matches
      if (totalMatches > 0) {
        logger.info(
          '[CitationsTabContainer] 🎉 Showing analysis complete toast',
          {
            searchId: activeSearchId,
            newlyCompletedJobs: newlyCompletedJobs.length,
            totalMatches,
          }
        );

        const completedRefs = newlyCompletedJobs
          .map(job => job.referenceNumber)
          .filter(Boolean);

        const refText =
          completedRefs.length === 1
            ? `Reference ${completedRefs[0]}`
            : `${completedRefs.length} references`;

        toast({
          title: 'Analysis Complete',
          description: `${refText} processed successfully.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    }

    // Update previous job statuses
    previousJobStatusesRef.current = currentJobStatuses;
  }, [citationJobsData, activeSearchId, isActive, citationMatchesData, toast]);

  // Clear previous job statuses when search changes
  useEffect(() => {
    previousJobStatusesRef.current.clear();
  }, [activeSearchId]);

  // Extract claims array from claimsData
  const allClaims = useMemo(() => {
    let claims: Claim[] = [];
    const typedClaimsData = claimsData as ClaimsData;

    if (typedClaimsData) {
      if (Array.isArray(typedClaimsData)) {
        claims = typedClaimsData;
      } else if (
        typeof typedClaimsData === 'object' &&
        'claims' in typedClaimsData
      ) {
        claims = typedClaimsData.claims;
      }
    }

    return claims;
  }, [claimsData]);

  const {
    showCombinedAnalysis,
    selectedReferencesForCombined,
    combinedAnalysisResult,
    isLoadingCombinedAnalysis,
    handleCombinedAnalysis,
    handleBackFromCombinedAnalysis,
    handleRunCombinedAnalysis,
    clearCombinedAnalysisResult,
    resetToCitationResults,
  } = useCombinedAnalysisState({
    activeSearchId,
    claim1Text,
    citationJobs,
    allClaims,
    projectId,
  });

  // Get saved prior art data
  const { data: savedPriorArtList, refetch: refetchPriorArt } =
    useProjectPriorArt(projectId);

  // Track if we've initialized on first active
  const hasInitializedRef = useRef(false);

  // Force refresh prior art data when tab becomes active for the first time
  useEffect(() => {
    if (isActive && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      logger.info(
        '[CitationsTabContainer] First activation after mount, refreshing prior art data'
      );
      // Force refresh to ensure we have fresh data
      refetchPriorArt();
    }
  }, [isActive]); // Remove refetchPriorArt from dependencies - refetch functions are not stable

  // Use the new saved citation state hook
  const { savedCitationIds, addOptimisticUpdate, removeOptimisticUpdate } =
    useSavedCitationState({
      savedPriorArtList: savedPriorArtList ?? [],
      citationMatchesData,
    });

  // Citation saving functionality
  const { saveCitation } = useSaveCitation({
    projectId,
    savedPriorArt: savedPriorArtList ?? [],
    addOptimisticUpdate,
    removeOptimisticUpdate,
  });

  // Expose reset function to parent components for navigation control
  useEffect(() => {
    if (onResetToCitationResults) {
      onResetToCitationResults(resetToCitationResults);
    }
  }, [onResetToCitationResults, resetToCitationResults]);

  // Convert Map to Set for compatibility with CitationMainView
  const savedCitationIdsSet: Set<string> = useMemo(() => {
    return new Set(Array.from(savedCitationIds.keys()));
  }, [savedCitationIds]);

  // Removed logging to prevent blocking

  // Wrap saveCitation to add optimistic updates
  const handleSaveCitationMatchWithOptimistic = useCallback(
    (citationMatch: ProcessedCitationMatch) => {
      // Add optimistic update immediately for instant UI feedback
      addOptimisticUpdate(citationMatch.id, citationMatch.referenceNumber);

      // Fire the save - it's already non-blocking
      saveCitation(citationMatch);
    },
    [saveCitation, addOptimisticUpdate]
  );

  const handleSelectedSearchIdChange = useCallback(
    (searchId: string) => {
      setActiveSearchId(searchId);
      // Clear the selected reference when changing searches
      // The useEffect below will auto-select the first reference once data loads
      setSelectedReference(null);
    },
    [setActiveSearchId, setSelectedReference]
  );

  // Handler for adding dependent claims from combined analysis
  const handleAddDependentClaim = useCallback(
    (dependentClaimText: string) => {
      try {
        // Get current claims to find the highest claim number
        let claims: Claim[] = [];
        const typedClaimsData = claimsData as ClaimsData;

        if (typedClaimsData) {
          if (Array.isArray(typedClaimsData)) {
            claims = typedClaimsData;
          } else if (
            typeof typedClaimsData === 'object' &&
            'claims' in typedClaimsData
          ) {
            claims = typedClaimsData.claims;
          }
        }

        const maxNumber = claims.reduce(
          (currentMax: number, c) =>
            c.number > currentMax ? c.number : currentMax,
          0
        );

        const newClaimNumber = maxNumber + 1;

        // Add the dependent claim
        addClaim(
          { number: newClaimNumber, text: dependentClaimText },
          {
            onError: (error: Error) => {
              logger.error(
                '[CitationsTabContainer] Failed to add dependent claim',
                { error }
              );
              toast.error({
                title: 'Failed to add claim',
                description:
                  'An error occurred while adding the dependent claim',
              });
            },
          }
        );
      } catch (error) {
        logger.error(
          '[CitationsTabContainer] Error in handleAddDependentClaim',
          { error }
        );
        toast.error({
          title: 'Error',
          description: 'Something went wrong while adding the claim',
        });
      }
    },
    [claimsData, addClaim, toast]
  );

  useEffect(() => {
    if (referenceStatuses.length > 0 && !selectedReference) {
      // Automatically select the first reference when:
      // 1. There are references available
      // 2. No reference is currently selected
      // Prefer selecting an optimistic reference if one exists
      const firstOptimistic = referenceStatuses.find(ref => ref.isOptimistic);
      if (firstOptimistic) {
        setSelectedReference(firstOptimistic.referenceNumber);
      } else {
        setSelectedReference(referenceStatuses[0].referenceNumber);
      }
    }
  }, [
    referenceStatuses,
    selectedReference,
    setSelectedReference,
    activeSearchId,
  ]);

  const selectedReferenceMetadata = useMemo(() => {
    if (!citationMatchesData?.groupedResults || !selectedReference) return null;

    for (const group of citationMatchesData.groupedResults) {
      const match = group.matches.find(
        (m): m is ProcessedCitationMatch =>
          (m as ProcessedCitationMatch).referenceNumber === selectedReference
      );
      if (match) {
        return {
          title: match.referenceTitle ?? undefined,
          applicant: match.referenceApplicant ?? undefined,
          publicationDate: match.referencePublicationDate ?? undefined,
        };
      }
    }
    return null;
  }, [citationMatchesData, selectedReference]);

  // Reference actions (save/exclude)
  const {
    isReferenceSaved,
    isReferenceExcluded,
    handleSaveReference,
    handleExcludeReference,
  } = useReferenceActions({
    projectId,
    selectedReference,
    selectedReferenceMetadata,
  });

  // Log reference actions state for debugging
  useEffect(() => {
    logger.info('[CitationsTabContainer] Reference actions state:', {
      selectedReference,
      isReferenceSaved,
      isReferenceExcluded,
      projectId,
    });
  }, [selectedReference, isReferenceSaved, isReferenceExcluded, projectId]);

  /* ==========================
   *  Deep Analysis Integration
   * ========================== */
  const hasMatchesForCurrentVersion = useMemo(() => {
    return citationMatchesData?.groupedResults?.length
      ? citationMatchesData.groupedResults.length > 0
      : false;
  }, [citationMatchesData]);

  const {
    showDeepAnalysis,
    toggleDeepAnalysis,
    effectiveDeepAnalysis,
    shouldShowDeepAnalysisPanel,
    hasHighRelevanceAnalysis,
    runDeepAnalysis,
    isRunningDeepAnalysis,
    isLoadingJobDetails,
    jobDetailsError,
    hasExistingDeepAnalysis,
  } = useDeepAnalysis({
    selectedReference,
    selectedSearchId: activeSearchId,
    selectedClaimSetVersionId: undefined, // Not using claim set versions in this component
    citationJobs: citationJobsForAnalysis,
    hasMatchesForCurrentVersion,
  });

  // Pass effectiveDeepAnalysis directly without transformation
  const transformedEffectiveDeepAnalysis = effectiveDeepAnalysis;

  // Transform citation history to keep Date objects for compatibility
  const transformedCitationHistory = useMemo(() => {
    return citationHistory.map(item => ({
      ...item,
      createdAt:
        item.createdAt instanceof Date
          ? item.createdAt
          : new Date(item.createdAt),
      status: item.status,
    }));
  }, [citationHistory]);

  const error = jobsError || citationMatchesError;

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4">
          <p className="text-destructive">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {!showCombinedAnalysis ? (
        <>
          {/* Historical View Banner */}
          {isViewingHistorical && viewingJobId && (
            <HistoricalViewBanner
              viewingJobId={viewingJobId}
              allCitationJobs={allCitationJobs}
              onReturnToLatest={handleReturnToLatest}
            />
          )}

          <CitationMainView
            // Search and reference selection
            activeSearchId={activeSearchId}
            selectedReference={selectedReference}
            onSelectReference={setSelectedReference}
            onSearchChange={handleSelectedSearchIdChange}
            searchHistory={currentSearchHistory}
            // Data
            referenceStatuses={referenceStatuses}
            selectedReferenceMetadata={selectedReferenceMetadata}
            citationMatchesData={citationMatchesData}
            viewingJobId={viewingJobId}
            citationJobs={citationJobs}
            // Loading states
            isLoadingJobs={isLoadingJobs}
            isLoadingCitationMatches={isLoadingCitationMatches}
            citationMatchesError={citationMatchesError}
            // Actions
            onCombinedAnalysis={handleCombinedAnalysis}
            onSaveReference={handleSaveReference}
            isReferenceSaved={isReferenceSaved}
            onExcludeReference={handleExcludeReference}
            isReferenceExcluded={isReferenceExcluded}
            onRerunCitationExtraction={handleRerunCitationExtraction}
            isRerunningExtraction={isRerunningExtraction}
            onSaveCitationMatch={handleSaveCitationMatchWithOptimistic}
            savedCitationIds={savedCitationIdsSet}
            // Deep analysis
            showDeepAnalysis={showDeepAnalysis}
            hasDeepAnalysisData={!!effectiveDeepAnalysis}
            hasHighRelevanceAnalysis={hasHighRelevanceAnalysis}
            isRunningDeepAnalysis={isRunningDeepAnalysis}
            onToggleDeepAnalysis={toggleDeepAnalysis}
            onRunDeepAnalysis={runDeepAnalysis}
            effectiveDeepAnalysis={transformedEffectiveDeepAnalysis}
            shouldShowDeepAnalysisPanel={shouldShowDeepAnalysisPanel}
            isLoadingJobDetails={isLoadingJobDetails}
            jobDetailsError={jobDetailsError}
            hasExistingDeepAnalysis={hasExistingDeepAnalysis}
            // Citation history
            citationHistory={transformedCitationHistory}
            onViewHistoricalRun={handleViewHistoricalRun}
            // Claim amendments
            onApplyAmendmentToClaim1={onApplyAmendmentToClaim1}
          />
        </>
      ) : (
        <CombinedAnalysisInTabView
          citationJobs={citationJobs.map(job => {
            // Find the reference metadata for the current job
            const referenceMatch = citationMatchesData?.groupedResults
              ?.flatMap(
                (group): ProcessedCitationMatch[] =>
                  group.matches as ProcessedCitationMatch[]
              )
              .find(m => m.referenceNumber === job.referenceNumber);

            // Normalise job status for UI consumption
            const mappedStatus = mapJobStatus(job.status);

            // Build the citation job with analysis object
            const citationJobWithAnalysis: CitationJobWithAnalysis = {
              id: job.id,
              referenceNumber: job.referenceNumber ?? undefined,
              referenceTitle: referenceMatch?.referenceTitle ?? undefined,
              referenceApplicant:
                referenceMatch?.referenceApplicant ?? undefined,
              deepAnalysisJson:
                typeof job.deepAnalysisJson === 'string'
                  ? job.deepAnalysisJson
                  : undefined,
              status: mappedStatus ?? 'PENDING', // Default to PENDING if status is unknown
              createdAt:
                job.createdAt instanceof Date
                  ? job.createdAt.toISOString()
                  : String(job.createdAt),
              error: job.error ?? undefined,
            };

            return citationJobWithAnalysis;
          })}
          searchHistoryId={activeSearchId}
          onBack={handleBackFromCombinedAnalysis}
          onRunCombinedAnalysis={handleRunCombinedAnalysis}
          isLoading={isLoadingCombinedAnalysis}
          result={combinedAnalysisResult}
          selectedReferences={selectedReferencesForCombined}
          claim1Text={claim1Text}
          onClearResult={clearCombinedAnalysisResult}
          projectId={projectId}
          onSearchChange={handleSelectedSearchIdChange}
          onApplyAmendmentToClaim1={onApplyAmendmentToClaim1}
          onAddDependentClaim={handleAddDependentClaim}
        />
      )}
    </div>
  );
};

export default CitationsTabContainer;
