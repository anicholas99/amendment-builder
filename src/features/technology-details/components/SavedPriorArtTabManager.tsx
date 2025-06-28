import React, { useCallback } from 'react';
import { useProjectData } from '@/contexts/ProjectDataContext';
import {
  usePriorArtWithStatus,
  useDeletePriorArt,
} from '@/hooks/api/usePriorArt';
import {
  ProcessedSavedPriorArt,
  PriorArtReference,
} from '@/types/domain/priorArt';
import { logger } from '@/lib/monitoring/logger';
import { useToast } from '@chakra-ui/react';

interface SavedPriorArtTabManagerProps {
  children: (props: {
    savedPriorArt: ProcessedSavedPriorArt[];
    isLoading: boolean;
    handleRemovePriorArt: (index: number) => void;
    handleOpenPriorArtDetails: (reference: PriorArtReference) => void;
  }) => React.ReactNode;
}

/**
 * Manager component that handles saved prior art data fetching and operations
 * for the Technology Details view
 */
export const SavedPriorArtTabManager: React.FC<
  SavedPriorArtTabManagerProps
> = ({ children }) => {
  const { activeProjectId } = useProjectData();
  const { priorArt: savedPriorArt, isLoading } =
    usePriorArtWithStatus(activeProjectId);
  const deletePriorArtMutation = useDeletePriorArt();
  const toast = useToast();

  // Map raw DB records to UI-friendly ProcessedSavedPriorArt
  const processedSavedPriorArt: ProcessedSavedPriorArt[] = React.useMemo(() => {
    return savedPriorArt.map(item => {
      const priorArtData: PriorArtReference = {
        number: item.patentNumber,
        patentNumber: item.patentNumber,
        title: item.title || '',
        abstract: item.abstract || undefined,
        source: 'Manual', // Saved items are user-selected
        relevance: 100,
        url: item.url || undefined,
        authors: item.authors ? [item.authors] : undefined,
        publicationDate: item.publicationDate || undefined,
        year: item.publicationDate?.substring(0, 4) || undefined,
      };

      return {
        ...item,
        priorArtData,
        savedCitations: item.savedCitationsData
          ? JSON.parse(item.savedCitationsData)
          : [],
      } as ProcessedSavedPriorArt;
    });
  }, [savedPriorArt]);

  const handleRemovePriorArt = useCallback(
    async (index: number) => {
      const itemToRemove = processedSavedPriorArt[index];

      // Determine projectId to use (context or fallback to item)
      const projectIdForDeletion = activeProjectId || itemToRemove?.projectId;

      if (!projectIdForDeletion) {
        logger.error(
          '[SavedPriorArtTabManager] Unable to resolve projectId for deletion',
          { activeProjectId, itemProjectId: itemToRemove?.projectId }
        );
        toast({
          title: 'Failed to remove prior art',
          description: 'Unable to determine the current project context.',
          status: 'error',
          duration: 4000,
        });
        return;
      }

      logger.log('[SavedPriorArtTabManager] Removing prior art', {
        index,
        itemId: itemToRemove.id,
        patentNumber: itemToRemove.patentNumber,
      });

      try {
        await deletePriorArtMutation.mutateAsync({
          projectId: projectIdForDeletion,
          priorArtId: itemToRemove.id,
        });

        toast({
          title: 'Prior art removed',
          status: 'success',
          duration: 2500,
        });
      } catch (error) {
        logger.error(
          '[SavedPriorArtTabManager] Failed to remove prior art',
          error
        );

        toast({
          title: 'Failed to remove prior art',
          description: (error as Error)?.message ?? 'Unknown error',
          status: 'error',
          duration: 4000,
        });
      }
    },
    [activeProjectId, processedSavedPriorArt, deletePriorArtMutation, toast]
  );

  const handleOpenPriorArtDetails = useCallback(
    (reference: PriorArtReference) => {
      // Open patent URL in new tab
      const patentNumber = reference.patentNumber || reference.number;
      if (patentNumber) {
        const cleanPatentNumber = patentNumber.replace(/-/g, '');
        const url = `https://patents.google.com/patent/${cleanPatentNumber}`;
        window.open(url, '_blank');
      }
    },
    []
  );

  return (
    <>
      {children({
        savedPriorArt: processedSavedPriorArt,
        isLoading,
        handleRemovePriorArt,
        handleOpenPriorArtDetails,
      })}
    </>
  );
};
