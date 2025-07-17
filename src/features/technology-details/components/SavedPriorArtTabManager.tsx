import React, { useCallback, useMemo } from 'react';
import { useCurrentProjectId } from '@/hooks/useCurrentProjectId';
import { useSavedPriorArt } from '@/hooks/api/useSavedPriorArt';
import { useDeletePriorArt } from '@/hooks/api/usePriorArt';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import {
  ProcessedSavedPriorArt,
  PriorArtReference,
  SavedCitationUI,
} from '@/types/domain/priorArt';
import SavedPriorArtTab from '../../search/components/SavedPriorArtTab';
import { subscribeToCitationEvents } from '@/utils/events/citationEvents';

interface SavedPriorArtTabManagerProps {
  children: (props: {
    savedPriorArt: any[];
    isLoading: boolean;
    handleRemovePriorArt: (id: string) => void;
    handleOpenPriorArtDetails: (id: string) => void;
    onRefreshList: () => void;
  }) => React.ReactNode;
}

/**
 * Manager component that handles the business logic for the saved prior art tab
 */
export const SavedPriorArtTabManager: React.FC<
  SavedPriorArtTabManagerProps
> = ({ children }) => {
  const currentProjectId = useCurrentProjectId();
  const toast = useToast();

  const {
    data: savedPriorArt = [],
    isLoading,
    refetch: onRefreshList,
  } = useSavedPriorArt(currentProjectId || '');

  const deletePriorArtMutation = useDeletePriorArt();

  // Force refetch when component mounts or project changes
  React.useEffect(() => {
    if (currentProjectId) {
      onRefreshList();
    }
  }, [currentProjectId]); // Remove onRefreshList from dependencies - refetch functions are not stable

  // Subscribe to citation events to automatically refetch when citations are saved
  React.useEffect(() => {
    if (!currentProjectId) return;

    const unsubscribe = subscribeToCitationEvents(detail => {
      // Only refetch if the event is for the current project
      if (
        detail.projectId === currentProjectId &&
        (detail.type === 'citation-saved' ||
          detail.type === 'citations-refreshed')
      ) {
        logger.info(
          '[SavedPriorArtTabManager] Citation event received, refetching data',
          { ...detail }
        );
        onRefreshList();
      }
    });

    return unsubscribe;
  }, [currentProjectId]); // Remove onRefreshList from dependencies - refetch functions are not stable

  // The data from useSavedPriorArtQuery is already processed by processSavedPriorArtArray
  // No need to process it again - just use it directly
  const processedSavedPriorArt = savedPriorArt as ProcessedSavedPriorArt[];

  const handleRemovePriorArt = useCallback(
    (id: string) => {
      if (!currentProjectId) return;

      deletePriorArtMutation.mutate(
        { projectId: currentProjectId, priorArtId: id },
        {
          onSuccess: () => {
            toast.success({
              title: 'Prior art removed',
              description: 'Successfully removed from saved items',
            });
            onRefreshList();
          },
          onError: (error: Error) => {
            logger.error('Failed to remove prior art:', error);
            toast.error({
              title: 'Failed to remove prior art',
              description: 'Please try again',
            });
          },
        }
      );
    },
    [currentProjectId, deletePriorArtMutation, toast, onRefreshList]
  );

  const handleOpenPriorArtDetails = useCallback((id: string) => {
    logger.info('Opening prior art details:', { id });
    // TODO: Implement navigation to prior art details
  }, []);

  const childProps = useMemo(
    () => ({
      savedPriorArt,
      isLoading,
      handleRemovePriorArt,
      handleOpenPriorArtDetails,
      onRefreshList,
    }),
    [
      savedPriorArt,
      isLoading,
      handleRemovePriorArt,
      handleOpenPriorArtDetails,
      onRefreshList,
    ]
  );

  return <>{children(childProps)}</>;
};
