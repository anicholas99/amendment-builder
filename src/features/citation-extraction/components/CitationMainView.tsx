import React, { useMemo, useState } from 'react';
import CitationTable from './CitationTable';
import { CitationAnalysisPanel } from '@/features/search/components/CitationAnalysisPanel';
import { CitationTabHeader, SortOption } from './CitationTabHeader';
import {
  GroupedCitation,
  CitationMatch,
} from '@/features/search/hooks/useCitationMatches';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';
import { CitationJob } from '@/features/search/hooks/useCitationJobs';
import { clientFeatures } from '@/config/environment.client';
import { calculateReferenceRelevanceScores, ReferenceRelevanceScore } from '../utils/relevanceScore';
import { ProcessedCitationMatch } from '@/types/domain/citation';

interface CitationMainViewProps {
  // Search and reference selection
  activeSearchId: string | null;
  selectedReference: string | null;
  onSelectReference: (ref: string) => void;
  onSearchChange: (searchId: string) => void;
  searchHistory: ProcessedSearchHistoryEntry[];

  // Data
  referenceStatuses: Array<{ referenceNumber: string; status?: string }>;
  selectedReferenceMetadata: {
    title?: string;
    abstract?: string;
    publicationNumber?: string;
  } | null;
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
  onSaveCitationMatch?: (match: any) => void;
  savedCitationIds?: Set<string>;

  // Deep analysis
  showDeepAnalysis: boolean;
  hasDeepAnalysisData: boolean;
  hasHighRelevanceAnalysis: boolean;
  isRunningDeepAnalysis: boolean;
  onToggleDeepAnalysis: (show: boolean) => void;
  onRunDeepAnalysis: () => void;
  effectiveDeepAnalysis: any;
  shouldShowDeepAnalysisPanel: boolean;
  isLoadingJobDetails: boolean;
  jobDetailsError?: Error | null;
  hasExistingDeepAnalysis?: boolean;
  citationHistory?: Array<{
    id: string;
    createdAt: Date;
    status: string;
    isCurrent: boolean;
  }>;
  onViewHistoricalRun?: (jobId: string) => void;
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
  // State for sorting
  const [sortOption, setSortOption] = useState<SortOption>('default');

  // Calculate relevance scores for all references
  const referenceRelevanceScores = useMemo((): Map<string, ReferenceRelevanceScore> => {
    if (!citationMatchesData?.groupedResults) {
      return new Map();
    }
    // Cast CitationMatch to ProcessedCitationMatch for score calculation
    const typedGroupedResults = citationMatchesData.groupedResults.map(group => ({
      elementText: group.elementText,
      matches: group.matches as unknown as ProcessedCitationMatch[]
    }));
    return calculateReferenceRelevanceScores(typedGroupedResults);
  }, [citationMatchesData]);

  // Enhanced reference metadata that includes relevance score
  const enhancedReferenceMetadata = useMemo(() => {
    if (!selectedReference || !selectedReferenceMetadata) return null;
    
    const relevanceScore = referenceRelevanceScores.get(selectedReference);
    
    return {
      ...selectedReferenceMetadata,
      relevanceScore: relevanceScore?.averageScore ?? 0,
      matchCount: relevanceScore?.matchCount ?? 0,
      hasLowConfidenceMatches: relevanceScore?.hasLowConfidenceMatches ?? false,
    };
  }, [selectedReferenceMetadata, selectedReference, referenceRelevanceScores]);

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
        (a.matches[0] as CitationMatch & { elementOrder?: number })
          ?.elementOrder ?? Number.MAX_SAFE_INTEGER;
      const bOrder =
        (b.matches[0] as CitationMatch & { elementOrder?: number })
          ?.elementOrder ?? Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    });
    return sorted;
  }, [filteredMatches]);

  // Get reference metadata for sorting
  const getReferenceMetadata = (referenceNumber: string) => {
    if (!citationMatchesData?.groupedResults) return null;
    
    for (const group of citationMatchesData.groupedResults) {
      const match = group.matches.find(
        (m): m is ProcessedCitationMatch =>
          (m as ProcessedCitationMatch).referenceNumber === referenceNumber
      );
      if (match) {
        return {
          publicationDate: match.referencePublicationDate,
          applicant: match.referenceApplicant,
          title: match.referenceTitle,
        };
      }
    }
    return null;
  };

  // Transform reference statuses with conditional sorting
  const transformedReferenceStatuses = useMemo(() => {
    const transformed = referenceStatuses.map(ref => ({
      ...ref,
      status: ref.status || 'pending', // Ensure status is always defined
      isOptimistic: (ref as any).isOptimistic || false,
      wasOptimistic: (ref as any).wasOptimistic || false,
      showAsOptimistic: (ref as any).showAsOptimistic || false,
    }));

    // Apply sorting based on user preference
    switch (sortOption) {
      case 'relevance':
        return transformed.sort((a, b) => {
          const scoreA = referenceRelevanceScores.get(a.referenceNumber)?.averageScore ?? 0;
          const scoreB = referenceRelevanceScores.get(b.referenceNumber)?.averageScore ?? 0;
          
          // If scores are the same, maintain original order by using reference number as tiebreaker
          if (scoreA === scoreB) {
            return a.referenceNumber.localeCompare(b.referenceNumber);
          }
          
          // Sort by score descending (highest first)
          return scoreB - scoreA;
        });

      case 'date-desc':
        return transformed.sort((a, b) => {
          const metaA = getReferenceMetadata(a.referenceNumber);
          const metaB = getReferenceMetadata(b.referenceNumber);
          
          const dateA = metaA?.publicationDate;
          const dateB = metaB?.publicationDate;
          
          // Handle missing dates - put them at the end
          if (!dateA && !dateB) return a.referenceNumber.localeCompare(b.referenceNumber);
          if (!dateA) return 1;
          if (!dateB) return -1;
          
          // Sort by date descending (newest first)
          return dateB.localeCompare(dateA);
        });

      case 'date-asc':
        return transformed.sort((a, b) => {
          const metaA = getReferenceMetadata(a.referenceNumber);
          const metaB = getReferenceMetadata(b.referenceNumber);
          
          const dateA = metaA?.publicationDate;
          const dateB = metaB?.publicationDate;
          
          // Handle missing dates - put them at the end
          if (!dateA && !dateB) return a.referenceNumber.localeCompare(b.referenceNumber);
          if (!dateA) return 1;
          if (!dateB) return -1;
          
          // Sort by date ascending (oldest first)
          return dateA.localeCompare(dateB);
        });

      default:
        // Return in original order if not sorting
        return transformed;
    }
  }, [referenceStatuses, referenceRelevanceScores, sortOption, citationMatchesData]);

  // Check if deep analysis is available
  const isDeepAnalysisAvailable = clientFeatures.enableDeepAnalysis;

  // Transform citation history for component compatibility
  const transformedCitationHistory = useMemo(() => {
    if (!citationHistory) return undefined;
    
    return citationHistory.map(item => ({
      ...item,
      createdAt: item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt),
    }));
  }, [citationHistory]);

  // Handler for sort change
  const handleSortChange = (newSortOption: SortOption) => {
    setSortOption(newSortOption);
  };

  return (
    <>
      <CitationTabHeader
        currentSearchId={activeSearchId}
        onSearchChange={onSearchChange}
        searchHistory={searchHistory}
        referenceStatuses={transformedReferenceStatuses}
        selectedReference={selectedReference}
        onSelectReference={onSelectReference}
        isLoading={isLoadingJobs || isLoadingCitationMatches}
        onCombinedAnalysis={onCombinedAnalysis}
        onSaveReference={onSaveReference}
        isReferenceSaved={isReferenceSaved}
        onExcludeReference={onExcludeReference}
        isReferenceExcluded={isReferenceExcluded}
        referenceMetadata={enhancedReferenceMetadata}
        sortOption={sortOption}
        onSortChange={handleSortChange}
        isDeepAnalysisAvailable={isDeepAnalysisAvailable}
        showDeepAnalysis={showDeepAnalysis}
        hasDeepAnalysisData={hasExistingDeepAnalysis || hasDeepAnalysisData}
        hasHighRelevanceAnalysis={hasHighRelevanceAnalysis}
        isRunningDeepAnalysis={isRunningDeepAnalysis}
        onToggleDeepAnalysis={onToggleDeepAnalysis}
        onRunDeepAnalysis={onRunDeepAnalysis}
        onRerunCitationExtraction={onRerunCitationExtraction}
        isRerunningExtraction={isRerunningExtraction}
        citationHistory={transformedCitationHistory}
        onViewHistoricalRun={onViewHistoricalRun}
      />
      
      {activeSearchId ? (
        shouldShowDeepAnalysisPanel && selectedReference ? (
          <div className="flex-1 overflow-hidden">
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
              referenceStatuses={referenceStatuses}
            />
          </div>
        ) : (
          <CitationTable
            isLoading={isLoadingCitationMatches}
            error={citationMatchesError}
            groupedResults={visibleMatches}
            onSaveCitationMatch={onSaveCitationMatch}
            savedCitationIds={savedCitationIds}
            selectedReference={selectedReference}
            referenceStatuses={referenceStatuses}
          />
        )
      ) : (
        <div className="py-8 flex flex-col items-center space-y-3">
          <p className="text-muted-foreground text-lg">No search selected</p>
          <p className="text-sm text-muted-foreground">
            Run a search from the Search tab to see citations here
          </p>
        </div>
      )}
    </>
  );
};
