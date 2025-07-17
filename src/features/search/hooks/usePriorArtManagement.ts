/**
 * @deprecated This hook has been replaced with cleaner implementations.
 *
 * DO NOT USE THIS HOOK - It causes navigation blocking issues.
 *
 * Instead, use:
 * - useSaveCitation() for saving citations
 * - useProjectPriorArt() for fetching prior art
 * - useDeletePriorArt() for deleting prior art
 * - useAddProjectExclusion() for excluding references
 *
 * This file is kept temporarily for reference during migration.
 * It will be removed in the next cleanup phase.
 */

import { useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/useToastWrapper';
import {
  useProjectPriorArt,
  useProjectExclusions,
  useSavePriorArt,
} from '@/hooks/api/usePriorArt';
import { useAddPatentExclusion } from '@/hooks/api/usePatentExclusions';
import { ProcessedCitationMatch } from '@/types/domain/citation';
import { logger } from '@/utils/clientLogger';
import { formatLocationData } from '../utils/citationFormatting';
import { SavedCitationUI } from '@/types/domain/priorArt';
import { processSavedPriorArtArray } from '@/features/search/utils/priorArt';

interface UsePriorArtManagementProps {
  projectId: string;
  selectedReference: string | null;
  citationMatchesData?: ProcessedCitationMatch[];
  refreshSavedArtData?: (projectId: string | null) => Promise<void>;
  toast?: any;
  savedArtNumbers?: Set<string>;
  excludedPatentNumbers?: Set<string>;
  savedPriorArtList?: any[];
}

export function usePriorArtManagement({
  projectId,
  selectedReference,
  citationMatchesData,
  refreshSavedArtData,
  toast: externalToast,
  savedArtNumbers: propSavedArtNumbers,
  excludedPatentNumbers: propExcludedPatentNumbers,
  savedPriorArtList: propSavedPriorArtList,
}: UsePriorArtManagementProps) {
  const toast = externalToast || useToast();

  const { data: savedArt, isLoading: isFetchingSavedArt } =
    useProjectPriorArt(projectId);
  const { data: exclusions } = useProjectExclusions(projectId);
  const { mutateAsync: saveArt } = useSavePriorArt();
  const { mutateAsync: excludeArt } = useAddPatentExclusion();

  const savedArtNumbers = useMemo(() => {
    if (propSavedArtNumbers && propSavedArtNumbers instanceof Set)
      return propSavedArtNumbers;
    if (propSavedArtNumbers && Array.isArray(propSavedArtNumbers)) {
      return new Set(propSavedArtNumbers);
    }
    return new Set(
      (savedArt || []).map(art =>
        art.patentNumber.replace(/-/g, '').toUpperCase()
      )
    );
  }, [savedArt, propSavedArtNumbers]);

  const excludedPatentNumbers = useMemo(() => {
    if (propExcludedPatentNumbers && propExcludedPatentNumbers instanceof Set)
      return propExcludedPatentNumbers;
    if (propExcludedPatentNumbers && Array.isArray(propExcludedPatentNumbers)) {
      return new Set(propExcludedPatentNumbers);
    }

    // The useProjectExclusions hook from features/projects returns a Set<string> directly
    // of normalized patent numbers, not an array of exclusion objects
    if (exclusions instanceof Set) {
      return exclusions;
    }

    // Fallback for when exclusions is not loaded yet
    return new Set<string>();
  }, [exclusions, propExcludedPatentNumbers]);

  /**
   * Ensure savedPriorArtList always contains processed citation data
   * This guarantees downstream components (e.g. isCitationSaved) can
   * reliably access the `savedCitations` property for duplicate checks.
   */
  const savedPriorArtList = useMemo(() => {
    if (propSavedPriorArtList) {
      return propSavedPriorArtList;
    }

    if (savedArt && Array.isArray(savedArt)) {
      // The data from useProjectPriorArt is already processed, so we can use it directly
      return savedArt;
    }

    return [];
  }, [propSavedPriorArtList, savedArt]);

  const isReferenceSaved = useMemo(() => {
    if (!selectedReference) return false;
    return savedArtNumbers.has(
      selectedReference.replace(/-/g, '').toUpperCase()
    );
  }, [selectedReference, savedArtNumbers]);

  const isReferenceExcluded = useMemo(() => {
    if (!selectedReference) return false;
    return excludedPatentNumbers.has(
      selectedReference.replace(/-/g, '').toUpperCase()
    );
  }, [selectedReference, excludedPatentNumbers]);

  const handleSaveReference = useCallback(
    async (referenceNumber: string) => {
      try {
        const matchToSave = citationMatchesData?.find(
          m => m.referenceNumber === referenceNumber
        );
        if (!matchToSave)
          throw new Error('Could not find reference details to save.');

        await saveArt({
          projectId,
          priorArt: {
            patentNumber: matchToSave.referenceNumber,
            title: matchToSave.referenceTitle || '',
            publicationDate: matchToSave.referencePublicationDate || '',
          },
        });

        // Refresh saved art data if callback provided
        if (refreshSavedArtData) {
          await refreshSavedArtData(projectId);
        }
      } catch (error) {
        logger.error('Error saving reference', { error });
        toast({ title: 'Failed to save reference', status: 'error' });
      }
    },
    [citationMatchesData, saveArt, toast, refreshSavedArtData, projectId]
  );

  const handleSaveCitationMatch = useCallback(
    async (citationMatch: ProcessedCitationMatch) => {
      try {
        // Get existing saved prior art for this reference to check for existing citations
        const existingArt = savedPriorArtList?.find(
          art =>
            art.patentNumber.replace(/-/g, '').toUpperCase() ===
            citationMatch.referenceNumber.replace(/-/g, '').toUpperCase()
        );

        // Prepare the citation data with location
        const newCitation: SavedCitationUI = {
          elementText: citationMatch.parsedElementText || '',
          citation: citationMatch.citation || '',
          location: citationMatch.location
            ? formatLocationData(citationMatch.location)
            : citationMatch.locationDataRaw || undefined,
          reasoning: citationMatch.reasoning?.summary || undefined,
        };

        // Combine with existing citations or create new array
        let savedCitations: SavedCitationUI[] = [];

        if (existingArt?.savedCitations) {
          // Check if this exact citation already exists
          const isDuplicate = existingArt.savedCitations.some(
            (saved: SavedCitationUI) =>
              saved.elementText === newCitation.elementText &&
              saved.citation === newCitation.citation
          );

          if (isDuplicate) {
            // Citation already saved, just show success
            toast({ title: 'Citation already saved', status: 'info' });
            return;
          } else {
            savedCitations = [...existingArt.savedCitations, newCitation];
          }
        } else {
          savedCitations = [newCitation];
        }

        // Save the prior art with citation data
        await saveArt({
          projectId,
          priorArt: {
            patentNumber: citationMatch.referenceNumber,
            title: citationMatch.referenceTitle || '',
            publicationDate: citationMatch.referencePublicationDate || '',
            savedCitationsData: JSON.stringify(savedCitations),
          },
        });

        // Refresh saved art data if callback provided
        if (refreshSavedArtData) {
          await refreshSavedArtData(projectId);
        }
      } catch (error) {
        logger.error('Error saving citation match', { error });
        toast({ title: 'Failed to save citation', status: 'error' });
      }
    },
    [saveArt, toast, refreshSavedArtData, projectId, savedPriorArtList]
  );

  const handleExcludeReference = useCallback(
    async (referenceNumber: string) => {
      try {
        await excludeArt({
          projectId,
          patentNumbers: [referenceNumber],
        });
        toast({ title: 'Reference excluded', status: 'success' });

        // Note: No need to refresh data here - the useAddProjectExclusion hook
        // already handles React Query cache invalidation and optimistic updates
      } catch (error) {
        logger.error('Error excluding reference', { error });
        toast({ title: 'Failed to exclude reference', status: 'error' });
      }
    },
    [excludeArt, toast, projectId]
  );

  return {
    savedArt,
    savedArtNumbers,
    excludedPatentNumbers,
    savedPriorArtList,
    isFetchingSavedArt,
    isReferenceSaved,
    isReferenceExcluded,
    handleSaveReference,
    handleSaveCitationMatch,
    handleExcludeReference,
  };
}
