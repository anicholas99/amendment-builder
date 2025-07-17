import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { useProjectPriorArt, useSavePriorArt } from '@/hooks/api/usePriorArt';
import { useAddPatentExclusion } from '@/hooks/api/usePatentExclusions';
import { useProjectExclusions } from '@/features/projects/hooks/useProjectExclusions';
import { isReferenceExcludedLocally } from '@/features/search/utils/searchHistoryRowUtils';
import { PriorArtDataToSave } from '@/types/domain/priorArt';
import { logger } from '@/utils/clientLogger';
import { normalizePatentNumber } from '@/features/patent-application/utils/patentUtils';

interface ReferenceMetadata {
  title?: string;
  applicant?: string;
  publicationDate?: string;
}

interface UseReferenceActionsProps {
  projectId: string;
  selectedReference: string | null;
  selectedReferenceMetadata: ReferenceMetadata | null;
}

/**
 * Hook to handle reference actions (save/exclude) with optimistic updates
 */
export function useReferenceActions({
  projectId,
  selectedReference,
  selectedReferenceMetadata,
}: UseReferenceActionsProps) {
  const { data: savedArt } = useProjectPriorArt(projectId);
  const savePriorArtMutation = useSavePriorArt();
  const { data: excludedSet } = useProjectExclusions(projectId);
  const addExclusionMutation = useAddPatentExclusion();

  // Use state instead of ref to trigger re-renders
  const [optimisticSavedRefs, setOptimisticSavedRefs] = useState<Set<string>>(
    new Set()
  );

  // Check if the selected reference is already saved
  const isReferenceSaved = useMemo(() => {
    if (!selectedReference) return false;

    // Normalize the reference number for comparison
    const normalizedRef = selectedReference.replace(/-/g, '').toUpperCase();

    // Check our optimistic cache first
    if (optimisticSavedRefs.has(normalizedRef)) {
      logger.info(
        '[useReferenceActions] Reference found in optimistic cache:',
        {
          reference: selectedReference,
          normalizedRef,
        }
      );
      return true;
    }

    // Then check the actual saved data
    if (!savedArt) {
      logger.info('[useReferenceActions] No saved prior art data available');
      return false;
    }

    const isSaved = savedArt.some(
      art => art.patentNumber.replace(/-/g, '').toUpperCase() === normalizedRef
    );

    logger.info('[useReferenceActions] Checking saved prior art:', {
      reference: selectedReference,
      normalizedRef,
      isSaved,
      savedArtCount: savedArt.length,
      savedRefs: savedArt.map(art =>
        art.patentNumber.replace(/-/g, '').toUpperCase()
      ),
    });

    return isSaved;
  }, [selectedReference, savedArt, optimisticSavedRefs]);

  // Clear the optimistic cache when the project changes
  useEffect(() => {
    logger.info(
      '[useReferenceActions] Project changed, clearing optimistic cache:',
      { projectId }
    );
    setOptimisticSavedRefs(new Set());
  }, [projectId]);

  // Sync optimistic state with actual data when it changes
  useEffect(() => {
    if (!savedArt || savedArt.length === 0) return;

    setOptimisticSavedRefs(prev => {
      const newSet = new Set(prev);
      let hasChanges = false;

      // Add any references that are actually saved but not in optimistic cache
      savedArt.forEach(art => {
        const normalizedRef = art.patentNumber.replace(/-/g, '').toUpperCase();
        if (!newSet.has(normalizedRef)) {
          newSet.add(normalizedRef);
          hasChanges = true;
          logger.info(
            '[useReferenceActions] Syncing actual saved reference to optimistic cache:',
            {
              reference: art.patentNumber,
              normalizedRef,
            }
          );
        }
      });

      return hasChanges ? newSet : prev;
    });
  }, [savedArt]);

  // Check if the selected reference is excluded
  const isReferenceExcluded = useMemo(() => {
    if (!selectedReference || !excludedSet) return false;
    return isReferenceExcludedLocally(selectedReference, excludedSet);
  }, [selectedReference, excludedSet]);

  const handleSaveReference = useCallback(async () => {
    if (!selectedReference || !projectId || isReferenceSaved) {
      logger.info(
        '[useReferenceActions] Save reference called but conditions not met:',
        {
          selectedReference,
          projectId,
          isReferenceSaved,
        }
      );
      return;
    }

    // Add to optimistic cache immediately
    const normalizedRef = selectedReference.replace(/-/g, '').toUpperCase();
    setOptimisticSavedRefs(prev => {
      const newSet = new Set(prev);
      newSet.add(normalizedRef);
      logger.info('[useReferenceActions] Added optimistic update:', {
        reference: selectedReference,
        normalizedRef,
        optimisticCount: newSet.size,
      });
      return newSet;
    });

    const payload: PriorArtDataToSave = {
      patentNumber: selectedReference,
      title: selectedReferenceMetadata?.title || undefined,
      authors: selectedReferenceMetadata?.applicant || undefined,
      publicationDate: selectedReferenceMetadata?.publicationDate || undefined,
      url: undefined,
      abstract: undefined,
      notes: undefined,
    };

    logger.info('[useReferenceActions] Saving reference:', {
      reference: selectedReference,
      payload,
    });

    try {
      await savePriorArtMutation.mutateAsync({
        projectId,
        priorArt: payload,
      });
      logger.info('[useReferenceActions] Save successful:', {
        reference: selectedReference,
      });

      // Keep the optimistic update since the save was successful
      // The actual data will sync via the useEffect above
    } catch (err) {
      // Remove from optimistic cache on error
      setOptimisticSavedRefs(prev => {
        const newSet = new Set(prev);
        newSet.delete(normalizedRef);
        logger.error(
          '[useReferenceActions] Save failed, removed optimistic update:',
          {
            reference: selectedReference,
            error: err,
          }
        );
        return newSet;
      });
      // Error handling within mutation already displays toast
    }
  }, [
    selectedReference,
    projectId,
    isReferenceSaved,
    selectedReferenceMetadata,
    savePriorArtMutation,
  ]);

  const handleExcludeReference = useCallback(async () => {
    if (!selectedReference || isReferenceExcluded) return;

    try {
      await addExclusionMutation.mutateAsync({
        projectId,
        patentNumbers: [selectedReference],
      });
    } catch (err) {
      // toast handled in mutation hook
    }
  }, [selectedReference, isReferenceExcluded, projectId, addExclusionMutation]);

  // Log state changes for debugging
  useEffect(() => {
    logger.info('[useReferenceActions] State updated:', {
      selectedReference,
      isReferenceSaved,
      optimisticCount: optimisticSavedRefs.size,
      savedArtCount: savedArt?.length || 0,
    });
  }, [selectedReference, isReferenceSaved, optimisticSavedRefs, savedArt]);

  return {
    isReferenceSaved,
    isReferenceExcluded,
    handleSaveReference,
    handleExcludeReference,
  };
}
