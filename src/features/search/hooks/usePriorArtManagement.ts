import { useMemo, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import {
  useProjectPriorArt,
  useProjectExclusions,
  useSavePriorArt,
  useAddProjectExclusion,
} from '@/hooks/api/usePriorArt';
import { ProcessedCitationMatch } from '@/types/domain/citation';
import { logger } from '@/lib/monitoring/logger';
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
  const { mutateAsync: excludeArt } = useAddProjectExclusion();

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
    logger.info('[usePriorArtManagement] Processing savedPriorArtList:', {
      hasPropSavedPriorArtList: !!propSavedPriorArtList,
      propLength: propSavedPriorArtList?.length,
      hasSavedArt: !!savedArt,
      savedArtLength: savedArt?.length,
      savedArtSample: savedArt?.[0] ? {
        patentNumber: savedArt[0].patentNumber,
        hasSavedCitationsData: !!savedArt[0].savedCitationsData,
        savedCitationsDataLength: savedArt[0].savedCitationsData?.length,
      } : null,
    });

    if (propSavedPriorArtList) {
      logger.info('[usePriorArtManagement] Using propSavedPriorArtList');
      return propSavedPriorArtList;
    }

    if (savedArt && Array.isArray(savedArt)) {
      const processed = processSavedPriorArtArray(savedArt);
      logger.info('[usePriorArtManagement] Processed savedArt:', {
        processedLength: processed.length,
        processedSample: processed[0] ? {
          patentNumber: processed[0].patentNumber,
          hasSavedCitations: !!processed[0].savedCitations,
          savedCitationsCount: processed[0].savedCitations?.length || 0,
          firstCitation: processed[0].savedCitations?.[0],
        } : null,
      });
      return processed;
    }

    logger.info('[usePriorArtManagement] Returning empty array');
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

          if (!isDuplicate) {
            savedCitations = [...existingArt.savedCitations, newCitation];
          } else {
            // Citation already saved, just show success
            toast({ title: 'Citation already saved', status: 'info' });
            return;
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

        // Refresh saved art data if callback provided
        if (refreshSavedArtData) {
          await refreshSavedArtData(projectId);
        }
      } catch (error) {
        logger.error('Error excluding reference', { error });
        toast({ title: 'Failed to exclude reference', status: 'error' });
      }
    },
    [excludeArt, toast, refreshSavedArtData, projectId]
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
