import { useMemo } from 'react';
import { ProcessedSavedPriorArt } from '@/features/search/types';

/**
 * Hook to manage sets of saved art numbers and excluded patents
 */
export function usePriorArtSets(
  savedPriorArt: ProcessedSavedPriorArt[],
  exclusions: Set<string> | undefined
) {
  const savedArtNumbersSet = useMemo(() => {
    const numbers = new Set<string>();
    savedPriorArt.forEach(art => {
      if (art.patentNumber) {
        numbers.add(art.patentNumber.replace(/-/g, '').toUpperCase());
      }
    });
    return numbers;
  }, [savedPriorArt]);

  const excludedPatentNumbersSet = useMemo(() => {
    // Ensure exclusions is always a Set, even if undefined or not a Set
    if (exclusions instanceof Set) {
      return exclusions;
    }
    // If exclusions is not a Set or is undefined, return empty Set
    return new Set<string>();
  }, [exclusions]);

  return {
    savedArtNumbersSet,
    excludedPatentNumbersSet,
  };
}
