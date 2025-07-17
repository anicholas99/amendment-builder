import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/useToastWrapper';
import { PriorArtReference } from '../../../types/claimTypes';
import { SearchHistoryEntry } from '../../search/types';
import { FullAnalysisResponse } from '../../../types/priorArtAnalysisTypes';

interface UseAnalysisTabLogicProps {
  searchHistory: SearchHistoryEntry[];
  handleAnalyzePriorArt: (
    searchHistoryId: string,
    forceRefresh: boolean
  ) => void;
  analysisData: FullAnalysisResponse | null;
  isAnalyzing: boolean;
}

interface UseAnalysisTabLogicResult {
  selectedSearchId: string | null;
  setSelectedSearchId: (id: string | null) => void;
  selectedReferencesForDisplay: PriorArtReference[];
  triggerAnalysis: (forceRefresh: boolean) => void;
}

/**
 * Hook for managing prior art analysis tab logic
 */
export function useAnalysisTabLogic({
  searchHistory,
  handleAnalyzePriorArt,
  analysisData,
  isAnalyzing,
}: UseAnalysisTabLogicProps): UseAnalysisTabLogicResult {
  // Analysis-specific state
  const [selectedSearchId, setSelectedSearchId] = useState<string | null>(null);
  const [selectedReferencesForDisplay, setSelectedReferencesForDisplay] =
    useState<PriorArtReference[]>([]);

  const toast = useToast();

  // Effect to derive selectedReferencesForDisplay based on selectedSearchId
  useEffect(() => {
    if (selectedSearchId) {
      const entry = searchHistory.find(e => e.id === selectedSearchId);
      if (
        entry &&
        entry.priorArtReferences &&
        Array.isArray(entry.priorArtReferences)
      ) {
        const top5Refs = entry.priorArtReferences
          // Filter step to ensure valid results
          .filter((r: any) => r && typeof r === 'object' && r.number)
          .sort((a: any, b: any) => (b.relevance || 0) - (a.relevance || 0))
          .slice(0, 5)
          .map(
            (r: any) =>
              ({
                number: r.number,
                title: r.title || '',
                relevance: r.relevance || 0,
                abstract: r.abstract || '',
                relevantText: r.relevantText || '',
                year: r.year || '',
                authors: r.authors || '',
                url: r.url || '',
                CPCs: r.CPCs || [],
                IPCs: r.IPCs || [],
                isMock: r.isMock || false,
                isGuaranteedQuery: r.isGuaranteedQuery || false,
                otherFamilyMembers: r.otherFamilyMembers || [],
                isExcluded: r.isExcluded || false,
                citationStatus: r.citationStatus || null,
                searchAppearanceCount: r.searchAppearanceCount || 0,
              }) as PriorArtReference
          );
        setSelectedReferencesForDisplay(top5Refs);
      } else {
        setSelectedReferencesForDisplay([]); // Clear if entry or results are invalid
      }
    } else {
      setSelectedReferencesForDisplay([]); // Clear if no search selected
    }
  }, [selectedSearchId, searchHistory]);

  // Wrapper for analyze function
  const triggerAnalysis = useCallback(
    (forceRefresh: boolean) => {
      if (!selectedSearchId) {
        toast({
          title: 'No Search Selected',
          description: 'Please select a search before analyzing',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Call parent handler with selected search and force refresh option
      handleAnalyzePriorArt(selectedSearchId, forceRefresh);
    },
    [selectedSearchId, handleAnalyzePriorArt, toast]
  );

  return {
    selectedSearchId,
    setSelectedSearchId,
    selectedReferencesForDisplay,
    triggerAnalysis,
  };
}
