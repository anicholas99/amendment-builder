import { useEffect, useRef } from 'react';
import { ReferenceJobStatus } from '../../search/components/CitationTabHeader';
import { logger } from '@/utils/clientLogger';

interface UseReferenceSelectionParams {
  projectId: string;
  selectedSearchId: string | null;
  referenceJobStatuses: Array<ReferenceJobStatus & { originalIndex: number }>;
  selectedReference: string | null;
  setSelectedReference: (ref: string | null) => void;
}

/**
 * Handles automatically selecting a sensible default reference when the
 * available references list changes or when the user switches search entries.
 */
export function useReferenceSelection({
  projectId,
  selectedSearchId,
  referenceJobStatuses,
  selectedReference,
  setSelectedReference,
}: UseReferenceSelectionParams) {
  // Track the previous search ID to detect changes
  const previousSearchIdRef = useRef<string | null>(null);

  // --- handle searchId change: clear selection so new default can be chosen ---
  useEffect(() => {
    // Skip if no search ID (prevents clearing on initial mount)
    if (!selectedSearchId) {
      return;
    }

    // Skip if this is the first search ID we've seen
    if (previousSearchIdRef.current === null) {
      previousSearchIdRef.current = selectedSearchId;
      return;
    }

    // Skip if search ID hasn't actually changed
    if (selectedSearchId === previousSearchIdRef.current) {
      return;
    }

    // Search truly changed - clear selection
    logger.debug(
      '[useReferenceSelection] Search ID changed, clearing selection',
      {
        from: previousSearchIdRef.current,
        to: selectedSearchId,
      }
    );

    previousSearchIdRef.current = selectedSearchId;
    setSelectedReference(null);
  }, [selectedSearchId, setSelectedReference]);

  // --- auto-select first valid reference whenever reference list changes ---
  useEffect(() => {
    if (referenceJobStatuses.length === 0) return;

    // If current selection is valid, keep it
    if (
      selectedReference &&
      referenceJobStatuses.some(r => r.referenceNumber === selectedReference)
    ) {
      return;
    }

    // Default to first reference in list
    const first = referenceJobStatuses[0]?.referenceNumber;
    if (first && first !== selectedReference) {
      logger.debug('[useReferenceSelection] Auto-selecting first reference', {
        ref: first,
        previousSelection: selectedReference,
      });
      setSelectedReference(first);
    }
  }, [referenceJobStatuses, selectedReference, setSelectedReference]);
}
