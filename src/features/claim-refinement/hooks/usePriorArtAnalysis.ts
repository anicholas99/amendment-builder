import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@chakra-ui/react';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';
import { PriorArtReference } from '../../../types/claimTypes';
import {
  FullAnalysisResponse,
  ReferenceRiskProfile,
} from '../../../types/priorArtAnalysisTypes';
import { useAnalyzePriorArtMutation } from '@/hooks/api/usePriorArt';

interface UsePriorArtAnalysisProps {
  searchHistory: ProcessedSearchHistoryEntry[];
  projectId: string;
  claim1Text?: string;
}

interface UsePriorArtAnalysisResult {
  selectedSearchId: string | null;
  setSelectedSearchId: (id: string | null) => void;
  availableReferences: PriorArtReference[];
  displayedReferences: PriorArtReference[];
  selectedReferenceNumbers: string[];
  toggleReferenceSelection: (referenceNumber: string) => void;
  selectAllReferences: () => void;
  deselectAllReferences: () => void;
  showAllReferences: boolean;
  toggleShowAll: () => void;
  triggerAnalysis: (forceRefresh: boolean) => void;
  hideResolved: boolean;
  toggleHideResolved: () => void;
  referenceRiskProfiles: ReferenceRiskProfile[] | null;
  overallCoverageScore: number;
  resolvedStatusMap: Map<string, boolean>;
  isAnalyzing: boolean;
  analysisData: FullAnalysisResponse | null;
}

/**
 * Hook for managing prior art analysis
 * This hook extracts and processes prior art references for claim analysis,
 * ensuring proper type compatibility with PriorArtReference (including the required relevance property)
 */
export function usePriorArtAnalysis({
  searchHistory,
  projectId,
  claim1Text,
}: UsePriorArtAnalysisProps): UsePriorArtAnalysisResult {
  const [selectedSearchId, setSelectedSearchId] = useState<string | null>(null);
  const [availableReferences, setAvailableReferences] = useState<
    PriorArtReference[]
  >([]);
  const [selectedReferenceNumbers, setSelectedReferenceNumbers] = useState<
    string[]
  >([]);
  const [showAllReferences, setShowAllReferences] = useState<boolean>(false);
  const [hideResolved, setHideResolved] = useState(false);

  const toast = useToast();

  const {
    mutate: analyzePriorArt,
    data: rawAnalysisData,
    isPending: isAnalyzing,
  } = useAnalyzePriorArtMutation();

  // Cast the data to the expected type
  const analysisData =
    rawAnalysisData as unknown as FullAnalysisResponse | null;

  const referenceRiskProfiles = useMemo(
    () =>
      (analysisData?.referenceRiskProfiles as ReferenceRiskProfile[]) || null,
    [analysisData]
  );

  useEffect(() => {
    if (selectedSearchId) {
      const entry = searchHistory.find(e => e.id === selectedSearchId);
      if (
        entry &&
        entry.priorArtReferences &&
        Array.isArray(entry.priorArtReferences)
      ) {
        const allReferences = [...entry.priorArtReferences].sort(
          (a, b) => (b.relevance || 0) - (a.relevance || 0)
        );
        setAvailableReferences(allReferences);
        setSelectedReferenceNumbers([]);
      } else {
        setAvailableReferences([]);
        setSelectedReferenceNumbers([]);
      }
    } else {
      setAvailableReferences([]);
      setSelectedReferenceNumbers([]);
    }
  }, [selectedSearchId, searchHistory]);

  const resolvedStatusMap = useMemo(() => {
    const map = new Map<string, boolean>();
    referenceRiskProfiles?.forEach(profile => {
      map.set(profile.referenceId, profile.isResolved);
    });
    return map;
  }, [referenceRiskProfiles]);

  const baseDisplayedReferences = useMemo(() => {
    return showAllReferences
      ? availableReferences
      : availableReferences.slice(0, 3);
  }, [showAllReferences, availableReferences]);

  const displayedReferences = useMemo(() => {
    if (hideResolved) {
      return baseDisplayedReferences.filter(
        ref => !resolvedStatusMap.get(ref.number)
      );
    }
    return baseDisplayedReferences;
  }, [baseDisplayedReferences, hideResolved, resolvedStatusMap]);

  const overallCoverageScore = useMemo(() => {
    if (!referenceRiskProfiles || referenceRiskProfiles.length === 0) return 0;

    const pendingProfiles = referenceRiskProfiles.filter(
      (p: ReferenceRiskProfile) => !p.isResolved
    );
    if (pendingProfiles.length === 0) return 100;

    const sum = pendingProfiles.reduce(
      (acc: number, p: ReferenceRiskProfile) => acc + p.coverageScore,
      0
    );
    return Math.round(sum / pendingProfiles.length);
  }, [referenceRiskProfiles]);

  const toggleReferenceSelection = useCallback((referenceNumber: string) => {
    setSelectedReferenceNumbers(prev => {
      if (prev.includes(referenceNumber)) {
        return prev.filter(num => num !== referenceNumber);
      } else {
        return [...prev, referenceNumber];
      }
    });
  }, []);

  const selectAllReferences = useCallback(() => {
    const visibleNumbers = baseDisplayedReferences.map(ref => ref.number);
    setSelectedReferenceNumbers(visibleNumbers);
  }, [baseDisplayedReferences]);

  const deselectAllReferences = useCallback(() => {
    setSelectedReferenceNumbers([]);
  }, []);

  const toggleShowAll = useCallback(() => {
    setShowAllReferences(prev => !prev);
  }, []);

  const toggleHideResolved = useCallback(() => {
    setHideResolved(prev => !prev);
  }, []);

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

      if (!claim1Text) {
        toast({
          title: 'Missing Claim Text',
          description: 'Please ensure Claim 1 is written before analysis',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (selectedReferenceNumbers.length === 0) {
        toast({
          title: 'No References Selected',
          description: 'Please select at least one reference for analysis',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      analyzePriorArt({
        searchHistoryId: selectedSearchId,
        selectedReferenceNumbers,
        forceRefresh,
        claim1Text,
        projectId,
        existingDependentClaimsText: '', // Required by the API
        inventionDetailsContext: '', // Required by the API
      });
    },
    [
      selectedSearchId,
      selectedReferenceNumbers,
      analyzePriorArt,
      toast,
      claim1Text,
      projectId,
    ]
  );

  return {
    selectedSearchId,
    setSelectedSearchId,
    availableReferences,
    displayedReferences,
    selectedReferenceNumbers,
    toggleReferenceSelection,
    selectAllReferences,
    deselectAllReferences,
    showAllReferences,
    toggleShowAll,
    triggerAnalysis,
    hideResolved,
    toggleHideResolved,
    referenceRiskProfiles,
    overallCoverageScore,
    resolvedStatusMap,
    isAnalyzing,
    analysisData: analysisData ?? null,
  };
}
