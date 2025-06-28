import React, { useCallback, useEffect, useMemo } from 'react';
import { VStack, Box, Text } from '@chakra-ui/react';
import {
  useCitationMatches,
  GroupedCitation,
} from '@/features/search/hooks/useCitationMatches';
import { useCitationStore } from '../store';
import { useCitationPolling } from '../hooks/useCitationPolling';
import { useCitationStatus } from '../hooks/useCitationStatus';
import { useSearchHistory } from '@/hooks/api/useSearchHistory';
import { useDeepAnalysis } from '@/features/search/hooks/useDeepAnalysis';
import CombinedAnalysisInTabView from '@/features/search/components/CombinedAnalysisInTabView';
import environment from '@/config/environment';
import { usePriorArtManagement } from '@/features/search/hooks/usePriorArtManagement';
import { ProcessedCitationMatch } from '@/types/domain/citation';
import { SavedCitationUI } from '@/types/domain/priorArt';

// Custom hooks
import { useCitationJobsManagement } from '../hooks/useCitationJobsManagement';
import { useCombinedAnalysisState } from '../hooks/useCombinedAnalysisState';
import { useReferenceActions } from '../hooks/useReferenceActions';
import { useClaimsData } from '../hooks/useClaimsData';
import { useAddClaimMutation, useClaimsQuery } from '@/hooks/api/useClaims';
import { useToast as useChakraToast } from '@chakra-ui/react';
import { logger } from '@/lib/monitoring/logger';
import { useSavedCitationState } from '../hooks/useSavedCitationState';

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
}

const CitationsTabContainer: React.FC<CitationsTabContainerProps> = ({
  isActive = false,
  projectId,
  onApplyAmendmentToClaim1,
}) => {
  // Use individual selectors to avoid re-renders and infinite loops
  const activeSearchId = useCitationStore(state => state.activeSearchId);
  const selectedReference = useCitationStore(state => state.selectedReference);
  const setActiveSearchId = useCitationStore(state => state.setActiveSearchId);
  const setSelectedReference = useCitationStore(
    state => state.setSelectedReference
  );

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
  const toast = useChakraToast();

  const {
    showCombinedAnalysis,
    selectedReferencesForCombined,
    combinedAnalysisResult,
    isRunningCombinedAnalysis,
    handleCombinedAnalysis,
    handleBackFromCombinedAnalysis,
    handleRunCombinedAnalysis,
    clearCombinedAnalysisResult,
  } = useCombinedAnalysisState({
    activeSearchId,
    claim1Text,
    citationJobs,
  });

  // Citation saving functionality
  const { handleSaveCitationMatch, savedPriorArtList } = usePriorArtManagement({
    projectId,
    selectedReference,
    citationMatchesData: citationMatchesData?.groupedResults?.flatMap(
      g => g.matches
    ) as ProcessedCitationMatch[] | undefined,
  });

  // Use the new saved citation state hook
  const { savedCitationIds, addOptimisticUpdate, savedCount } = useSavedCitationState({
    savedPriorArtList,
    citationMatchesData,
  });

  // Log saved count for debugging
  useEffect(() => {
    logger.info('[CitationsTabContainer] Saved citations count:', { 
      savedCount,
      savedCitationIds: savedCitationIds ? Array.from(savedCitationIds).slice(0, 5) : []
    });
  }, [savedCount, savedCitationIds]);

  // Wrap handleSaveCitationMatch to add optimistic updates
  const handleSaveCitationMatchWithOptimistic = useCallback(
    async (citationMatch: ProcessedCitationMatch) => {
      // Add optimistic update immediately
      addOptimisticUpdate(citationMatch.id);
      
      // Then save for real
      await handleSaveCitationMatch(citationMatch);
    },
    [handleSaveCitationMatch, addOptimisticUpdate]
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
        const claims = Array.isArray(claimsData)
          ? claimsData
          : (claimsData as any)?.claims || [];

        const maxNumber = claims.reduce(
          (currentMax: number, c: any) =>
            c.number > currentMax ? c.number : currentMax,
          0
        );

        const newClaimNumber = maxNumber + 1;

        // Add the dependent claim
        addClaim(
          { number: newClaimNumber, text: dependentClaimText },
          {
            onError: error => {
              logger.error(
                '[CitationsTabContainer] Failed to add dependent claim',
                { error }
              );
              toast({
                title: 'Failed to add claim',
                description:
                  'An error occurred while adding the dependent claim',
                status: 'error',
                duration: 4000,
                isClosable: true,
              });
            },
          }
        );
      } catch (error) {
        logger.error(
          '[CitationsTabContainer] Error in handleAddDependentClaim',
          { error }
        );
        toast({
          title: 'Error',
          description: 'Something went wrong while adding the claim',
          status: 'error',
          duration: 4000,
          isClosable: true,
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
        m => m.referenceNumber === selectedReference
      );
      if (match) {
        return {
          title: match.referenceTitle,
          applicant: match.referenceApplicant,
          publicationDate: match.referencePublicationDate,
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

  /* ==========================
   *  Deep Analysis Integration
   * ========================== */
  const hasMatchesForCurrentVersion = useMemo(() => {
    return citationMatchesData?.groupedResults?.length
      ? citationMatchesData.groupedResults.length > 0
      : false;
  }, [citationMatchesData]);

  // Only enable deep analysis if we have the data we need
  const canUseDeepAnalysis = useMemo(() => {
    return !!selectedReference && !!activeSearchId && citationJobs.length > 0;
  }, [selectedReference, activeSearchId, citationJobs.length]);

  const {
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
  } = useDeepAnalysis({
    selectedReference,
    selectedSearchId: activeSearchId,
    selectedClaimSetVersionId: undefined, // Not using claim set versions in this component
    citationJobs: citationJobsForAnalysis,
    hasMatchesForCurrentVersion,
  });

  const isDeepAnalysisAvailable =
    environment.features.enableDeepAnalysis || false;
  const useEnhancedCitationTable =
    environment.features.enableEnhancedCitationTable || false;

  const error = jobsError || citationMatchesError;

  if (error) {
    return (
      <VStack h="100%" spacing={0} align="stretch">
        <Box p={3}>
          <Text color="red.500">Error: {error.message}</Text>
        </Box>
      </VStack>
    );
  }

  return (
    <VStack h="100%" spacing={0} align="stretch" position="relative">
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
            savedCitationIds={savedCitationIds}
            // Deep analysis
            showDeepAnalysis={showDeepAnalysis}
            hasDeepAnalysisData={!!effectiveDeepAnalysis}
            hasHighRelevanceAnalysis={hasHighRelevanceAnalysis}
            isRunningDeepAnalysis={isRunningDeepAnalysis}
            onToggleDeepAnalysis={toggleDeepAnalysis}
            onRunDeepAnalysis={runDeepAnalysis}
            effectiveDeepAnalysis={effectiveDeepAnalysis}
            shouldShowDeepAnalysisPanel={shouldShowDeepAnalysisPanel}
            isLoadingJobDetails={isLoadingJobDetails}
            jobDetailsError={jobDetailsError}
            hasExistingDeepAnalysis={hasExistingDeepAnalysis}
            // Citation history
            citationHistory={citationHistory}
            onViewHistoricalRun={handleViewHistoricalRun}
            // Claim amendments
            onApplyAmendmentToClaim1={onApplyAmendmentToClaim1}
          />
        </>
      ) : (
        <CombinedAnalysisInTabView
          citationJobs={citationJobs.map(job => {
            const referenceTitle = citationMatchesData?.groupedResults
              ?.flatMap(g => g.matches)
              .find(
                m => m.referenceNumber === job.referenceNumber
              )?.referenceTitle;

            return {
              ...job,
              referenceTitle: referenceTitle || undefined,
            };
          })}
          searchHistoryId={activeSearchId}
          onBack={handleBackFromCombinedAnalysis}
          onRunCombinedAnalysis={handleRunCombinedAnalysis}
          isLoading={isRunningCombinedAnalysis}
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
    </VStack>
  );
};

export default CitationsTabContainer;
