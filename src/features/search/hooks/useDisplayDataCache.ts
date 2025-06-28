import { useRef, useEffect, useMemo } from 'react';
import { ProcessedCitationMatch } from '@/types/domain/citation';

interface UseDisplayDataCacheProps {
  citationMatchesData: ProcessedCitationMatch[] | undefined;
  isLoading: boolean;
  selectedSearchId: string | null;
  selectedClaimSetVersionId: string | null;
}

/**
 * Custom hook to cache citation data and prevent empty state flashing during loading
 */
export function useDisplayDataCache({
  citationMatchesData,
  isLoading,
  selectedSearchId,
  selectedClaimSetVersionId,
}: UseDisplayDataCacheProps) {
  // Cache for previous citation data to prevent empty state flashing
  const previousDataCache = useRef<{
    searchId: string | null;
    versionId: string | null;
    data: ProcessedCitationMatch[];
  }>({
    searchId: null,
    versionId: null,
    data: [],
  });

  // Update cache when we have fresh data
  useEffect(() => {
    if (
      citationMatchesData &&
      citationMatchesData.length > 0 &&
      selectedSearchId
    ) {
      previousDataCache.current = {
        searchId: selectedSearchId,
        versionId: selectedClaimSetVersionId || null,
        data: citationMatchesData,
      };
    }
  }, [citationMatchesData, selectedSearchId, selectedClaimSetVersionId]);

  // Use cached data while loading to prevent empty state flash
  const displayData = useMemo(() => {
    // If we have fresh data, use it
    if (citationMatchesData && citationMatchesData.length > 0) {
      return citationMatchesData;
    }

    // If loading and we have cached data for the same search/version, use cached data
    if (
      isLoading &&
      previousDataCache.current.data &&
      previousDataCache.current.searchId === selectedSearchId &&
      previousDataCache.current.versionId === selectedClaimSetVersionId
    ) {
      return previousDataCache.current.data;
    }

    // Otherwise return current data (might be null/empty)
    return citationMatchesData;
  }, [
    citationMatchesData,
    isLoading,
    selectedSearchId,
    selectedClaimSetVersionId,
  ]);

  const showEmptyState = !displayData || displayData.length === 0;

  return {
    displayData,
    showEmptyState,
    cachedData: previousDataCache.current,
  };
}
