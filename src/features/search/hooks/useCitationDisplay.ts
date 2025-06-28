import { useCallback, useEffect, useMemo, useState } from 'react';
import { groupAndSortCitationMatches } from '../utils/citationUtils';
import { logger } from '@/lib/monitoring/logger';

interface UseCitationDisplayParams {
  citationMatchesData: unknown[] | undefined;
  selectedReference: string | null;
  selectedSearchId: string | null;
  currentVersionElements?: { text: string }[];
}

/**
 * Provides grouped+sorted citation matches along with UI helper state for
 * cycling through multiple matches per claim element.
 */
export function useCitationDisplay({
  citationMatchesData,
  selectedReference,
  selectedSearchId,
  currentVersionElements,
}: UseCitationDisplayParams) {
  // Add logging to debug the input data
  // COMMENTED OUT: Excessive logging causing console noise
  /*
  logger.log('[useCitationDisplay] Hook called with:', {
    citationMatchesDataLength: citationMatchesData?.length,
    selectedReference,
    selectedSearchId,
    hasCurrentVersionElements: !!currentVersionElements,
    currentVersionElementsCount: currentVersionElements?.length,
    citationMatchesSample: citationMatchesData?.slice(0, 2)
  });
  */

  const groupedAndSortedMatches = useMemo(() => {
    const result = groupAndSortCitationMatches(
      citationMatchesData as any,
      selectedReference,
      selectedSearchId ? { id: selectedSearchId } : null,
      currentVersionElements
    );

    // COMMENTED OUT: Excessive logging causing console noise
    /*
      logger.log('[useCitationDisplay] Grouped and sorted result:', {
        resultLength: result?.length,
        groups: result?.map(g => ({
          elementText: g.elementText,
          matchesCount: g.matches.length
        }))
      });
      */

    return result;
  }, [
    citationMatchesData,
    selectedReference,
    selectedSearchId,
    currentVersionElements,
  ]);

  // elementText -> currently displayed match index
  const [displayIndexMap, setDisplayIndexMap] = useState<
    Record<string, number>
  >({});

  const resetDisplayIndices = useCallback(() => setDisplayIndexMap({}), []);

  // Reset indices whenever selected search or reference changes
  useEffect(() => {
    resetDisplayIndices();
  }, [selectedSearchId, selectedReference, resetDisplayIndices]);

  const handleDisplayIndexChange = useCallback(
    (elementText: string, newIndex: number) => {
      setDisplayIndexMap(prev => ({ ...prev, [elementText]: newIndex }));
    },
    []
  );

  return {
    groupedAndSortedMatches,
    displayIndexMap,
    handleDisplayIndexChange,
    resetDisplayIndices,
  };
}
