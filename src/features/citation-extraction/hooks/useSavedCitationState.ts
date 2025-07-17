import { useCallback, useRef, useEffect, useState } from 'react';
import {
  SavedCitationUI,
  ProcessedSavedPriorArt,
} from '@/types/domain/priorArt';
import { GroupedCitation } from '@/features/search/hooks/useCitationMatches';
import { ProcessedCitationMatch } from '@/types/domain/citation';
import { logger } from '@/utils/clientLogger';

interface UseSavedCitationStateProps {
  savedPriorArtList: ProcessedSavedPriorArt[];
  citationMatchesData?: { groupedResults?: GroupedCitation[] };
}

export function useSavedCitationState({
  savedPriorArtList,
  citationMatchesData,
}: UseSavedCitationStateProps) {
  // Track the saved state as a state variable to trigger re-renders
  const [savedMap, setSavedMap] = useState<Map<string, boolean>>(new Map());

  // Track optimistic updates separately
  const optimisticUpdatesRef = useRef<
    Map<string, { timestamp: number; referenceNumber: string }>
  >(new Map());

  // Helper to normalize text for comparison
  const normalize = (text: string): string =>
    text.replace(/\s+/g, ' ').trim().toLowerCase();

  // Clean up old optimistic updates when saved prior art changes
  useEffect(() => {
    // When saved prior art updates, clean up matching optimistic updates
    const now = Date.now();
    const fiveSecondsAgo = now - 5000; // Shorter timeout since we clean up on data changes

    let hasChanges = false;
    optimisticUpdatesRef.current.forEach((value, key) => {
      // Remove old optimistic updates
      if (value.timestamp < fiveSecondsAgo) {
        optimisticUpdatesRef.current.delete(key);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      // Trigger re-render by updating state
      setSavedMap(prev => new Map(prev));
    }
  }, [savedPriorArtList]); // Clean up when saved prior art changes

  // Update the map when either data source changes
  useEffect(() => {
    // Skip if we don't have the necessary data
    if (!savedPriorArtList || !citationMatchesData?.groupedResults) {
      return;
    }

    const newMap = new Map<string, boolean>();

    // Build a quick lookup map for saved citations by reference
    const savedByReference = new Map<string, SavedCitationUI[]>();

    savedPriorArtList.forEach(priorArt => {
      if (priorArt.savedCitations && Array.isArray(priorArt.savedCitations)) {
        const refNormalized = priorArt.patentNumber
          .replace(/-/g, '')
          .toUpperCase();
        savedByReference.set(refNormalized, priorArt.savedCitations);
      }
    });

    // Check each match against saved citations
    let savedCount = 0;
    citationMatchesData.groupedResults.forEach(group => {
      group.matches.forEach(match => {
        // Type assertion to ProcessedCitationMatch for proper typing
        const typedMatch = match as unknown as ProcessedCitationMatch;
        const matchRefNormalized = typedMatch.referenceNumber
          .replace(/-/g, '')
          .toUpperCase();
        const savedCitations = savedByReference.get(matchRefNormalized);

        if (savedCitations) {
          const matchElementNorm = normalize(
            typedMatch.parsedElementText || ''
          );
          const matchCitationNorm = normalize(typedMatch.citation || '');

          const isMatchSaved = savedCitations.some(
            (savedCitation: SavedCitationUI) => {
              const savedElementNorm = normalize(
                savedCitation.elementText || ''
              );
              const savedCitationNorm = normalize(savedCitation.citation || '');

              const isMatch =
                savedElementNorm === matchElementNorm &&
                savedCitationNorm === matchCitationNorm;

              // Debug log for troubleshooting
              if (!isMatch && savedElementNorm === matchElementNorm) {
                logger.debug('[useSavedCitationState] Citation text mismatch', {
                  matchId: typedMatch.id,
                  reference: typedMatch.referenceNumber,
                  saved: savedCitationNorm.substring(0, 50),
                  current: matchCitationNorm.substring(0, 50),
                });
              }

              return isMatch;
            }
          );

          if (isMatchSaved) {
            newMap.set(typedMatch.id, true);
            savedCount++;
          }
        }
      });
    });

    // Add optimistic updates
    optimisticUpdatesRef.current.forEach((_, id) => {
      newMap.set(id, true);
    });

    logger.debug('[useSavedCitationState] Saved citation map updated', {
      savedCount,
      optimisticCount: optimisticUpdatesRef.current.size,
      totalSaved: newMap.size,
    });

    setSavedMap(newMap);
  }, [savedPriorArtList, citationMatchesData]);

  // Add optimistic update
  const addOptimisticUpdate = useCallback(
    (citationId: string, referenceNumber?: string) => {
      optimisticUpdatesRef.current.set(citationId, {
        timestamp: Date.now(),
        referenceNumber: referenceNumber || '',
      });
      setSavedMap(prev => {
        const newMap = new Map(prev);
        newMap.set(citationId, true);
        return newMap;
      });
    },
    []
  );

  // Remove a specific optimistic update
  const removeOptimisticUpdate = useCallback((citationId: string) => {
    optimisticUpdatesRef.current.delete(citationId);
    setSavedMap(prev => {
      const newMap = new Map(prev);
      newMap.delete(citationId);
      return newMap;
    });
  }, []);

  // Clear optimistic updates for a specific reference
  const clearOptimisticUpdatesForReference = useCallback(
    (referenceNumber: string) => {
      const normalizedRef = referenceNumber.replace(/-/g, '').toUpperCase();
      const toRemove: string[] = [];

      optimisticUpdatesRef.current.forEach((value, key) => {
        const valueRefNormalized = value.referenceNumber
          .replace(/-/g, '')
          .toUpperCase();
        if (valueRefNormalized === normalizedRef) {
          toRemove.push(key);
        }
      });

      toRemove.forEach(key => optimisticUpdatesRef.current.delete(key));

      if (toRemove.length > 0) {
        setSavedMap(prev => {
          const newMap = new Map(prev);
          toRemove.forEach(key => newMap.delete(key));
          return newMap;
        });
      }
    },
    []
  );

  // Clear all optimistic updates
  const clearOptimisticUpdates = useCallback(() => {
    optimisticUpdatesRef.current.clear();
    setSavedMap(prev => new Map(prev));
  }, []);

  return {
    savedCitationIds: savedMap,
    addOptimisticUpdate,
    removeOptimisticUpdate,
    clearOptimisticUpdates,
    clearOptimisticUpdatesForReference,
    savedCount: savedMap.size,
  };
}

// Define explicit return type to improve type-safety when the hook is consumed elsewhere
export type UseSavedCitationStateResult = ReturnType<
  typeof useSavedCitationState
>;
