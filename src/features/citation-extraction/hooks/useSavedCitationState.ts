import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { SavedCitationUI } from '@/types/domain/priorArt';
import { GroupedCitation, CitationMatch } from '@/features/search/hooks/useCitationMatches';
import { logger } from '@/lib/monitoring/logger';

interface UseSavedCitationStateProps {
  savedPriorArtList: any[];
  citationMatchesData?: { groupedResults?: GroupedCitation[] };
}

export function useSavedCitationState({
  savedPriorArtList,
  citationMatchesData,
}: UseSavedCitationStateProps) {
  // Track the saved state as a state variable to trigger re-renders
  const [savedMap, setSavedMap] = useState<Map<string, boolean>>(new Map());
  
  // Track optimistic updates separately
  const optimisticUpdatesRef = useRef<Set<string>>(new Set());
  
  // Track the current reference to detect changes
  const currentReferenceRef = useRef<string | null>(null);

  // Helper to normalize text for comparison
  const normalize = (text: string): string => 
    text.replace(/\s+/g, ' ').trim().toLowerCase();

  // Clear optimistic updates when reference changes
  useEffect(() => {
    const currentReference = citationMatchesData?.groupedResults?.[0]?.matches?.[0]?.referenceNumber;
    if (currentReference && currentReference !== currentReferenceRef.current) {
      logger.info('[useSavedCitationState] Reference changed, clearing optimistic updates:', {
        oldRef: currentReferenceRef.current,
        newRef: currentReference,
      });
      optimisticUpdatesRef.current.clear();
      currentReferenceRef.current = currentReference;
    }
  }, [citationMatchesData]);

  // Update the map when savedPriorArtList changes
  useEffect(() => {
    const newMap = new Map<string, boolean>();
    
    if (savedPriorArtList && citationMatchesData?.groupedResults) {
      logger.info('[useSavedCitationState] Building saved map from:', {
        savedPriorArtCount: savedPriorArtList.length,
        groupedResultsCount: citationMatchesData.groupedResults.length,
      });

      savedPriorArtList.forEach((priorArt: any) => {
        if (priorArt.savedCitations && Array.isArray(priorArt.savedCitations)) {
          logger.info('[useSavedCitationState] Processing prior art:', {
            patentNumber: priorArt.patentNumber,
            savedCitationsCount: priorArt.savedCitations.length,
          });

          citationMatchesData.groupedResults?.forEach(group => {
            group.matches.forEach(match => {
              const matchRefNormalized = match.referenceNumber.replace(/-/g, '').toUpperCase();
              const priorArtRefNormalized = priorArt.patentNumber.replace(/-/g, '').toUpperCase();
              
              if (matchRefNormalized === priorArtRefNormalized) {
                logger.info('[useSavedCitationState] Checking match for reference:', {
                  matchRef: match.referenceNumber,
                  priorArtRef: priorArt.patentNumber,
                  matchElement: match.parsedElementText?.substring(0, 50),
                  savedCitationsCount: priorArt.savedCitations.length,
                });
                
                const isMatchSaved = priorArt.savedCitations.some(
                  (savedCitation: SavedCitationUI) => {
                    const savedElementNorm = normalize(savedCitation.elementText || '');
                    const savedCitationNorm = normalize(savedCitation.citation || '');
                    const matchElementNorm = normalize(match.parsedElementText || '');
                    const matchCitationNorm = normalize(match.citation || '');
                    
                    const elementMatch = savedElementNorm === matchElementNorm;
                    const citationMatch = 
                      savedCitationNorm === matchCitationNorm ||
                      savedCitationNorm.includes(matchCitationNorm) ||
                      matchCitationNorm.includes(savedCitationNorm);
                    
                    // Log first comparison for debugging
                    if (savedCitation === priorArt.savedCitations[0] && match === group.matches[0]) {
                      logger.info('[useSavedCitationState] Detailed comparison:', {
                        savedElement: savedElementNorm.substring(0, 50),
                        matchElement: matchElementNorm.substring(0, 50),
                        elementMatch,
                        savedCitation: savedCitationNorm.substring(0, 50),
                        matchCitation: matchCitationNorm.substring(0, 50),
                        citationMatch,
                      });
                    }
                    
                    if (elementMatch && citationMatch) {
                      logger.info('[useSavedCitationState] Found saved match:', {
                        matchId: match.id,
                        elementText: match.parsedElementText?.substring(0, 50),
                      });
                    }
                    
                    return elementMatch && citationMatch;
                  }
                );
                if (isMatchSaved) {
                  newMap.set(match.id, true);
                }
              }
            });
          });
        }
      });
    }

    // Preserve optimistic updates
    optimisticUpdatesRef.current.forEach(id => {
      newMap.set(id, true);
    });

    setSavedMap(newMap);
    
    logger.info('[useSavedCitationState] Updated saved map:', {
      totalSaved: newMap.size,
      optimisticCount: optimisticUpdatesRef.current.size,
      savedIds: Array.from(newMap.keys()),
    });
  }, [savedPriorArtList, citationMatchesData]);

  // Stable function to check if citation is saved
  const isCitationSaved = useCallback((citationId: string): boolean => {
    const isSaved = savedMap.has(citationId) || optimisticUpdatesRef.current.has(citationId);
    return isSaved;
  }, [savedMap]); // Include savedMap in dependencies so it updates when map changes

  // Add optimistic update
  const addOptimisticUpdate = useCallback((citationId: string) => {
    optimisticUpdatesRef.current.add(citationId);
    // Also update the state map to trigger re-render
    setSavedMap(prev => {
      const newMap = new Map(prev);
      newMap.set(citationId, true);
      return newMap;
    });
    
    logger.info('[useSavedCitationState] Added optimistic update:', { citationId });
  }, []);

  // Clear optimistic updates (called when real data arrives)
  const clearOptimisticUpdates = useCallback(() => {
    optimisticUpdatesRef.current.clear();
    logger.info('[useSavedCitationState] Cleared optimistic updates');
  }, []);

  return {
    savedCitationIds: savedMap,
    addOptimisticUpdate,
    clearOptimisticUpdates,
    savedCount: savedMap.size, // Export for debugging
  };
} 