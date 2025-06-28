import { useCallback, useMemo } from 'react';
import { useProject } from '@/hooks/api/useProjects';
import { useSearchHistory } from '@/hooks/api/useSearchHistory';
import { useSavedPriorArt } from '@/hooks/api/useSavedPriorArt';
import { useSearchHistoryData } from '@/hooks/api/useSearchHistoryData';
import { toProcessedSavedPriorArt } from '@/features/search/utils/priorArt.converter';
import { usePriorArtSets } from './usePriorArtSets';

/**
 * Custom hook that manages all data fetching and state for the claim sidebar
 */
export const useClaimSidebarData = (activeProjectId: string | null) => {
  // Fetch project data
  const { data: activeProjectData } = useProject(activeProjectId);

  // Fetch search history
  const {
    data: searchHistory = [],
    isLoading: isSearchHistoryLoading,
    refetch: refetchSearchHistory,
  } = useSearchHistory(activeProjectId);

  // Fetch saved prior art
  const {
    data: rawSavedPriorArt = [],
    isLoading: isSavedPriorArtLoading,
    refetch: refetchSavedArt,
  } = useSavedPriorArt(activeProjectId);

  // Fetch search exclusion data
  const {
    data: searchExclusionData,
    isLoading: isSearchDataLoading,
    refetch: refetchExclusions,
  } = useSearchHistoryData(activeProjectId || undefined);

  // Process the raw saved prior art into the UI-ready format
  const savedPriorArt = useMemo(
    () => toProcessedSavedPriorArt(rawSavedPriorArt),
    [rawSavedPriorArt]
  );

  // Get prior art sets
  const { savedArtNumbersSet, excludedPatentNumbersSet } = usePriorArtSets(
    savedPriorArt,
    searchExclusionData?.excludedPatentNumbers
  );

  // Combined loading state
  const isDataLoading =
    isSearchHistoryLoading || isSearchDataLoading || isSavedPriorArtLoading;

  // Combined refresh function
  const refreshProjectData = useCallback(async () => {
    await Promise.all([
      refetchSearchHistory(),
      refetchSavedArt(),
      refetchExclusions(),
    ]);
  }, [refetchSearchHistory, refetchSavedArt, refetchExclusions]);

  return {
    activeProjectData,
    searchHistory,
    savedPriorArt,
    searchExclusionData,
    savedArtNumbersSet,
    excludedPatentNumbersSet,
    isDataLoading,
    refreshProjectData,
  };
};
