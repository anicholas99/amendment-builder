import { useCallback, useMemo, useEffect } from 'react';
import { useProject } from '@/hooks/api/useProjects';
import { useSearchHistory } from '@/hooks/api/useSearchHistory';
import { useSavedPriorArt } from '@/hooks/api/useSavedPriorArt';
import { useSearchHistoryData } from '@/hooks/api/useSearchHistoryData';
import { toProcessedSavedPriorArt } from '@/features/search/utils/priorArt.converter';
import { usePriorArtSets } from './usePriorArtSets';
import { SavedPriorArt } from '@/types/domain/priorArt';
import { subscribeToCitationEvents } from '@/utils/events/citationEvents';
import { logger } from '@/utils/clientLogger';

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
    () => toProcessedSavedPriorArt(rawSavedPriorArt as SavedPriorArt[]),
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
  }, []); // Remove refetch functions from dependencies - they are not stable

  // Subscribe to citation events for automatic refresh
  useEffect(() => {
    if (!activeProjectId) return;

    const unsubscribe = subscribeToCitationEvents(detail => {
      // Only refresh if the event is for the current project
      if (
        detail.projectId === activeProjectId &&
        (detail.type === 'citation-saved' ||
          detail.type === 'citations-refreshed')
      ) {
        logger.info(
          '[useClaimSidebarData] Citation event received, refreshing data',
          { ...detail }
        );
        // Refresh saved art data to ensure UI is in sync
        refetchSavedArt();
      }
    });

    return unsubscribe;
  }, [activeProjectId]); // Remove refetchSavedArt from dependencies - refetch functions are not stable

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
