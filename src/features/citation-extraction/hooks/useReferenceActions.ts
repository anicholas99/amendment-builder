import { useMemo, useCallback, useRef, useEffect } from 'react';
import {
  useSavePriorArt,
  usePriorArtWithStatus,
  useAddProjectExclusion,
} from '@/hooks/api/usePriorArt';
import { useProjectExclusions } from '@/features/projects/hooks/useProjectExclusions';
import { isReferenceExcludedLocally } from '@/features/search/utils/searchHistoryRowUtils';
import { PriorArtDataToSave } from '@/types/domain/priorArt';

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

export function useReferenceActions({
  projectId,
  selectedReference,
  selectedReferenceMetadata,
}: UseReferenceActionsProps) {
  const savePriorArtMutation = useSavePriorArt();
  const { priorArt: savedPriorArt } = usePriorArtWithStatus(projectId);
  const { data: excludedSet } = useProjectExclusions(projectId);
  const addExclusionMutation = useAddProjectExclusion();

  // Use a ref to track if we've already marked this reference as saved
  // This prevents flicker when the query refetches
  const savedReferencesRef = useRef<Set<string>>(new Set());

  // Check if the selected reference is already saved
  const isReferenceSaved = useMemo(() => {
    if (!selectedReference) return false;

    // Normalize the reference number for comparison
    const normalizedRef = selectedReference.replace(/-/g, '').toUpperCase();
    
    // Check our optimistic cache first
    if (savedReferencesRef.current.has(normalizedRef)) {
      return true;
    }

    // Then check the actual saved data
    if (!savedPriorArt) return false;

    const isSaved = savedPriorArt.some(
      art => art.patentNumber.replace(/-/g, '').toUpperCase() === normalizedRef
    );
    
    // If it's saved in the data, add to our cache
    if (isSaved) {
      savedReferencesRef.current.add(normalizedRef);
    }
    
    return isSaved;
  }, [selectedReference, savedPriorArt]);

  // Clear the cache when the project changes
  useEffect(() => {
    savedReferencesRef.current.clear();
  }, [projectId]);

  // Check if the selected reference is excluded
  const isReferenceExcluded = useMemo(() => {
    if (!selectedReference || !excludedSet) return false;
    return isReferenceExcludedLocally(selectedReference, excludedSet);
  }, [selectedReference, excludedSet]);

  const handleSaveReference = useCallback(async () => {
    if (!selectedReference || !projectId || isReferenceSaved) return;

    // Add to optimistic cache immediately
    const normalizedRef = selectedReference.replace(/-/g, '').toUpperCase();
    savedReferencesRef.current.add(normalizedRef);

    const payload: PriorArtDataToSave = {
      patentNumber: selectedReference,
      title: selectedReferenceMetadata?.title || undefined,
      authors: selectedReferenceMetadata?.applicant || undefined,
      publicationDate: selectedReferenceMetadata?.publicationDate || undefined,
      url: undefined,
      abstract: undefined,
      notes: undefined,
    };

    try {
      await savePriorArtMutation.mutateAsync({
        projectId,
        priorArt: payload,
      });
    } catch (err) {
      // Remove from optimistic cache on error
      savedReferencesRef.current.delete(normalizedRef);
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

  return {
    isReferenceSaved,
    isReferenceExcluded,
    handleSaveReference,
    handleExcludeReference,
  };
}
