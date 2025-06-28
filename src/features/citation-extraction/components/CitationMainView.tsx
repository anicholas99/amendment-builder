import React, { useMemo } from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';
import ClaimRefinementCitationTable from './ClaimRefinementCitationTable';
import EnhancedCitationResultsTable from './EnhancedCitationResultsTable';
import { CitationAnalysisPanel } from '@/features/search/components/CitationAnalysisPanel';
import { CitationTabHeader } from './CitationTabHeader';
import { GroupedCitation, CitationMatch } from '@/features/search/hooks/useCitationMatches';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';
import { CitationJob } from '@/features/search/hooks/useCitationJobs';
import environment from '@/config/environment';

interface CitationMainViewProps {
  // Search and reference selection
  activeSearchId: string | null;
  selectedReference: string | null;
  onSelectReference: (ref: string) => void;
  onSearchChange: (searchId: string) => void;
  searchHistory: ProcessedSearchHistoryEntry[];

  // Data
  referenceStatuses: Array<{ referenceNumber: string; status?: string }>;
  selectedReferenceMetadata: { title?: string; abstract?: string; publicationNumber?: string } | null;
  citationMatchesData: { groupedResults: GroupedCitation[] } | undefined;
  viewingJobId: string | null;
  citationJobs: CitationJob[];

  // Loading states
  isLoadingJobs: boolean;
  isLoadingCitationMatches: boolean;
  citationMatchesError: Error | null;

  // Actions
  onCombinedAnalysis: () => void;
  onSaveReference: () => void;
  isReferenceSaved: boolean;
  onExcludeReference: () => void;
  isReferenceExcluded: boolean;
  onRerunCitationExtraction: () => void;
  isRerunningExtraction: boolean;
  onSaveCitationMatch?: (match: any) => Promise<void>;
  savedCitationIds?: Set<string>;

  // Deep analysis
  showDeepAnalysis: boolean;
  hasDeepAnalysisData: boolean;
  hasHighRelevanceAnalysis: boolean;
  isRunningDeepAnalysis: boolean;
  onToggleDeepAnalysis: (show: boolean) => void;
  onRunDeepAnalysis: () => void;
  effectiveDeepAnalysis: { highRelevanceElements?: Array<{ element: string; reasoning: string }> } | null;
  shouldShowDeepAnalysisPanel: boolean;
  isLoadingJobDetails: boolean;
  jobDetailsError: Error | null;
  hasExistingDeepAnalysis: boolean;

  // Citation history
  citationHistory: Array<{ id: string; createdAt: string; status: string }>;
  onViewHistoricalRun: (jobId: string) => void;

  // Claim amendments
  onApplyAmendmentToClaim1?: (original: string, revised: string) => void;
}

export const CitationMainView: React.FC<CitationMainViewProps> = ({
  activeSearchId,
  selectedReference,
  onSelectReference,
  onSearchChange,
  searchHistory,
  referenceStatuses,
  selectedReferenceMetadata,
  citationMatchesData,
  viewingJobId,
  citationJobs,
  isLoadingJobs,
  isLoadingCitationMatches,
  citationMatchesError,
  onCombinedAnalysis,
  onSaveReference,
  isReferenceSaved,
  onExcludeReference,
  isReferenceExcluded,
  onRerunCitationExtraction,
  isRerunningExtraction,
  onSaveCitationMatch,
  savedCitationIds,
  showDeepAnalysis,
  hasDeepAnalysisData,
  hasHighRelevanceAnalysis,
  isRunningDeepAnalysis,
  onToggleDeepAnalysis,
  onRunDeepAnalysis,
  effectiveDeepAnalysis,
  shouldShowDeepAnalysisPanel,
  isLoadingJobDetails,
  jobDetailsError,
  hasExistingDeepAnalysis,
  citationHistory,
  onViewHistoricalRun,
  onApplyAmendmentToClaim1,
}) => {
  const isDeepAnalysisAvailable =
    environment.features.enableDeepAnalysis || false;
  const useEnhancedCitationTable =
    environment.features.enableEnhancedCitationTable || false;

  // Filter matches for selected reference and optionally by job ID
  const filteredMatches = useMemo((): GroupedCitation[] => {
    if (!citationMatchesData?.groupedResults || !selectedReference) return [];

    const jobs = Array.isArray(citationJobs) ? citationJobs : [];

    // Find the latest job for the selected reference
    const referenceJobs = jobs
      .filter(job => job.referenceNumber === selectedReference)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    const latestJob = referenceJobs[0];
    const targetJobId = viewingJobId || latestJob?.id || null;

    return citationMatchesData.groupedResults.reduce(
      (acc: GroupedCitation[], group) => {
        let relevantMatches = group.matches.filter(
          m => m.referenceNumber === selectedReference
        );

        // Always filter by job ID - either the viewing job or the latest job
        if (targetJobId) {
          relevantMatches = relevantMatches.filter(
            m => m.citationJobId === targetJobId
          );
        }

        if (relevantMatches.length > 0) {
          acc.push({
            elementText: group.elementText,
            matches: relevantMatches,
          });
        }
        return acc;
      },
      []
    );
  }, [citationMatchesData, selectedReference, viewingJobId, citationJobs]);

  // Use the original extraction order - elements are frozen in time from when citations were extracted
  const visibleMatches = useMemo((): GroupedCitation[] => {
    // Sort by elementOrder of the first match to guarantee correct order
    const sorted = [...filteredMatches].sort((a, b) => {
      const aOrder =
        (a.matches[0] as CitationMatch & { elementOrder?: number })?.elementOrder ?? Number.MAX_SAFE_INTEGER;
      const bOrder =
        (b.matches[0] as CitationMatch & { elementOrder?: number })?.elementOrder ?? Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    });
    return sorted;
  }, [filteredMatches]);

  return (
    <>
      <CitationTabHeader
        currentSearchId={activeSearchId}
        onSearchChange={onSearchChange}
        searchHistory={searchHistory}
        referenceStatuses={referenceStatuses}
        selectedReference={selectedReference}
        onSelectReference={onSelectReference}
        isLoading={isLoadingJobs || isLoadingCitationMatches}
        onCombinedAnalysis={onCombinedAnalysis}
        onSaveReference={onSaveReference}
        isReferenceSaved={isReferenceSaved}
        onExcludeReference={onExcludeReference}
        isReferenceExcluded={isReferenceExcluded}
        referenceMetadata={selectedReferenceMetadata}
        isDeepAnalysisAvailable={isDeepAnalysisAvailable}
        showDeepAnalysis={showDeepAnalysis}
        hasDeepAnalysisData={hasExistingDeepAnalysis || hasDeepAnalysisData}
        hasHighRelevanceAnalysis={hasHighRelevanceAnalysis}
        isRunningDeepAnalysis={isRunningDeepAnalysis}
        onToggleDeepAnalysis={onToggleDeepAnalysis}
        onRunDeepAnalysis={onRunDeepAnalysis}
        onRerunCitationExtraction={onRerunCitationExtraction}
        isRerunningExtraction={isRerunningExtraction}
        citationHistory={citationHistory}
        onViewHistoricalRun={onViewHistoricalRun}
      />
      <Box flex="1" overflow="auto" position="relative">
        {activeSearchId ? (
          useEnhancedCitationTable && isDeepAnalysisAvailable ? (
            <EnhancedCitationResultsTable
              searchHistoryId={activeSearchId}
              selectedReference={selectedReference || undefined}
            />
          ) : (
            <ClaimRefinementCitationTable
              isLoading={isLoadingCitationMatches}
              error={citationMatchesError}
              groupedResults={visibleMatches}
              onSaveCitationMatch={onSaveCitationMatch}
              savedCitationIds={savedCitationIds}
            />
          )
        ) : (
          <VStack py={8} spacing={3}>
            <Text color="gray.500" fontSize="lg">
              No search selected
            </Text>
            <Text fontSize="sm" color="gray.400">
              Run a search from the Search tab to see citations here
            </Text>
          </VStack>
        )}

        {/* Deep Analysis Panel */}
        {shouldShowDeepAnalysisPanel && selectedReference && (
          <Box
            position="absolute"
            top={0}
            bottom={0}
            left={0}
            right={0}
            bg="white"
            zIndex={10}
            overflow="hidden"
          >
            <CitationAnalysisPanel
              type="deep"
              selectedReference={selectedReference}
              onClose={() => onToggleDeepAnalysis(false)}
              isLoading={isLoadingJobDetails || isRunningDeepAnalysis}
              isRunningAnalysis={isRunningDeepAnalysis}
              analysisData={effectiveDeepAnalysis}
              onRunAnalysis={onRunDeepAnalysis}
              onApplyAmendmentToClaim1={onApplyAmendmentToClaim1}
              error={jobDetailsError}
            />
          </Box>
        )}
      </Box>
    </>
  );
};
