import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { ProcessedCitationMatch } from '@/types/domain/citation';
import {
  ProcessedSavedPriorArt,
  SavedCitationUI,
} from '@/types/domain/priorArt';
import { useTemporarySet } from '@/hooks/useTemporaryState';
import { SAVING_FEEDBACK_DURATION } from '../constants/citationConstants';
import { logger } from '@/lib/monitoring/logger';

/**
 * Hook for managing citation saving functionality
 *
 * @param onSaveCitationMatch - Function to call when saving a citation
 * @param selectedSearchId - Currently selected search ID for cache updates
 * @returns Object with saving state and functions
 */
export function useCitationSaving(
  onSaveCitationMatch?: (match: ProcessedCitationMatch) => Promise<void>,
  selectedSearchId?: string
) {
  const toast = useToast();
  const queryClient = useQueryClient();

  // Track citations that are currently being saved
  const savingCitationsManager = useTemporarySet<string>(
    SAVING_FEEDBACK_DURATION
  );

  // Track optimistically saved citations
  const [optimisticallySaved, setOptimisticallySaved] = useState<Set<string>>(
    new Set()
  );

  /**
   * Normalize text by collapsing whitespace and forcing lowercase.
   * This helps avoid false negatives when comparing user-visible strings.
   */
  const normalize = (value: string): string =>
    value.replace(/\s+/g, ' ').trim().toLowerCase();

  /**
   * Generate a consistent citation key for both optimistic and actual saved state.
   * We normalise strings to avoid issues with minor formatting differences.
   */
  const generateCitationKey = useCallback((match: ProcessedCitationMatch): string => {
    const elementText = normalize(match.parsedElementText || '');
    const citation = normalize(match.citation || '');
    const referenceNumber = match.referenceNumber.replace(/-/g, '').toUpperCase();
    return `${referenceNumber}_${elementText}_${citation}`;
  }, []);

  /**
   * Check if a citation is already saved
   */
  const isCitationSaved = useCallback(
    (
      match: ProcessedCitationMatch,
      savedPriorArtData: ProcessedSavedPriorArt[] = []
    ): boolean => {
      // Create a unique key for this citation
      const citationKey = generateCitationKey(match);

      // Debug logging
      logger.info('[isCitationSaved] Checking citation:', {
        citationKey,
        matchElementText: match.parsedElementText,
        matchCitation: match.citation?.substring(0, 50) + '...',
        referenceNumber: match.referenceNumber,
        savedPriorArtDataLength: savedPriorArtData.length,
      });

      // Check if it's optimistically saved (immediate visual feedback)
      if (optimisticallySaved.has(citationKey)) {
        logger.info('[isCitationSaved] Found in optimisticallySaved');
        return true;
      }

      // Check if it's currently being saved (temporary visual feedback)
      if (savingCitationsManager.has(citationKey)) {
        logger.info('[isCitationSaved] Found in savingCitationsManager');
        return true;
      }

      if (!savedPriorArtData || savedPriorArtData.length === 0) {
        logger.info('[isCitationSaved] No saved prior art data');
        return false;
      }

      const parentReference = savedPriorArtData.find(
        art =>
          art.patentNumber.replace(/-/g, '').toUpperCase() ===
          match.referenceNumber.replace(/-/g, '').toUpperCase()
      );

      logger.info('[isCitationSaved] Parent reference search:', {
        found: !!parentReference,
        parentPatentNumber: parentReference?.patentNumber,
        hasSavedCitations: !!parentReference?.savedCitations,
        savedCitationsCount: parentReference?.savedCitations?.length || 0,
      });

      if (!parentReference || !parentReference.savedCitations) {
        return false;
      }

      // Simple comparison - just trim whitespace
      const matchCitationNormalized = normalize(match.citation || '');
      const matchElementNormalized = normalize(match.parsedElementText || '');

      logger.info('[isCitationSaved] Normalized match values:', {
        matchCitationNormalized: matchCitationNormalized.substring(0, 50) + '...',
        matchElementNormalized,
      });

      return (
        parentReference.savedCitations?.some(
          (savedCitation: SavedCitationUI) => {
            const savedCitationNormalized = normalize(savedCitation.citation || '');
            const savedElementNormalized = normalize(savedCitation.elementText || '');

            logger.info('[isCitationSaved] Comparing with saved citation:', {
              savedElementText: savedCitation.elementText,
              savedCitationText: savedCitation.citation?.substring(0, 50) + '...',
              savedElementNormalized,
              savedCitationNormalized: savedCitationNormalized.substring(0, 50) + '...',
              elementMatch: savedElementNormalized === matchElementNormalized,
            });

            const citationMatch =
              savedCitationNormalized === matchCitationNormalized ||
              savedCitationNormalized.includes(matchCitationNormalized) ||
              matchCitationNormalized.includes(savedCitationNormalized);

            const isMatch = savedElementNormalized === matchElementNormalized && citationMatch;
            
            if (isMatch) {
              logger.info('[isCitationSaved] MATCH FOUND!', {
                elementText: savedCitation.elementText,
                citationMatch,
              });
            }

            return (
              savedElementNormalized === matchElementNormalized &&
              citationMatch
            );
          }
        ) || false
      );
    },
    [generateCitationKey, savingCitationsManager, optimisticallySaved]
  );

  /**
   * Handle optimistic save with immediate UI feedback
   */
  const handleOptimisticSave = useCallback(
    async (citationMatch: ProcessedCitationMatch) => {
      const citationId = generateCitationKey(citationMatch);

      try {
        // Immediately add to optimistic set for instant UI feedback
        setOptimisticallySaved(prev => new Set(prev).add(citationId));

        // Add to saving set for loading indicator
        savingCitationsManager.add(citationId);

        // Call the actual save function (this will show its own success toast)
        if (onSaveCitationMatch) {
          await onSaveCitationMatch(citationMatch);
        }

        // After successful save, invalidate the cache to get fresh data
        queryClient.invalidateQueries({
          queryKey: ['savedPriorArt', selectedSearchId],
        });

        // Clear optimistic state after successful save and let the real data take over
        // We do this after a short delay to ensure the cache update has time to propagate
        setTimeout(() => {
          setOptimisticallySaved(prev => {
            const newSet = new Set(prev);
            newSet.delete(citationId);
            return newSet;
          });
        }, 100);
      } catch (error) {
        // Remove from optimistic state on error
        setOptimisticallySaved(prev => {
          const newSet = new Set(prev);
          newSet.delete(citationId);
          return newSet;
        });

        toast({
          title: 'Failed to save citation',
          description: 'Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [
      generateCitationKey,
      savingCitationsManager,
      queryClient,
      selectedSearchId,
      onSaveCitationMatch,
      toast,
    ]
  );

  return {
    isCitationSaved,
    handleOptimisticSave,
    optimisticallySaved,
    savingCitations: savingCitationsManager,
  };
}
