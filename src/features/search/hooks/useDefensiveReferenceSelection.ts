import { useEffect, useRef } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { ProcessedCitationMatch } from '@/types/domain/citation';

interface UseDefensiveReferenceSelectionProps {
  selectedSearchId: string | null;
  selectedReference: string | null;
  citationMatchesData: ProcessedCitationMatch[] | undefined;
  citationMatchesLoading: boolean;
  setSelectedReference: (ref: string | null) => void;
  disablePolling: boolean;
}

/**
 * Custom hook to defensively manage reference selection and prevent infinite loops
 */
export function useDefensiveReferenceSelection({
  selectedSearchId,
  selectedReference,
  citationMatchesData,
  citationMatchesLoading,
  setSelectedReference,
  disablePolling,
}: UseDefensiveReferenceSelectionProps) {
  // Track the last auto-selected reference to prevent loops
  const lastAutoSelectedRef = useRef<string | null>(null);
  const lastSearchId = useRef<string | null>(null);

  useEffect(() => {
    // Skip this effect entirely if polling is disabled
    // This prevents unnecessary state updates in contexts where the component is embedded
    if (disablePolling) {
      logger.debug(
        '[useDefensiveReferenceSelection] Skipping reference management - polling disabled'
      );
      return;
    }

    // Case 1: No search ID selected - clear any reference to avoid invalid state
    if (!selectedSearchId) {
      if (selectedReference) {
        logger.debug(
          '[useDefensiveReferenceSelection] Clearing reference - no search selected'
        );
        setSelectedReference(null);
        lastAutoSelectedRef.current = null;
      }
      return; // Exit early - don't try to auto-select when no search
    }

    // Detect search ID change
    const searchIdChanged = lastSearchId.current !== selectedSearchId;
    if (searchIdChanged) {
      lastSearchId.current = selectedSearchId;
      lastAutoSelectedRef.current = null; // Reset auto-selection tracking
    }

    // Case 2: We have a search ID and citation data, but no reference selected
    // Auto-select the first reference only if we have valid data
    if (
      selectedSearchId &&
      citationMatchesData &&
      citationMatchesData.length > 0 &&
      !selectedReference &&
      !citationMatchesLoading && // Don't auto-select while loading
      searchIdChanged // Only auto-select on search ID change
    ) {
      const firstReference = citationMatchesData[0].referenceNumber;

      // Prevent re-selecting the same reference repeatedly
      if (lastAutoSelectedRef.current !== firstReference) {
        logger.debug(
          '[useDefensiveReferenceSelection] Auto-selecting first reference:',
          {
            firstReference,
            searchIdChanged,
          }
        );
        setSelectedReference(firstReference);
        lastAutoSelectedRef.current = firstReference;
      }
    }
  }, [
    selectedSearchId,
    selectedReference,
    citationMatchesData,
    citationMatchesLoading,
    setSelectedReference,
    disablePolling,
  ]);
}
