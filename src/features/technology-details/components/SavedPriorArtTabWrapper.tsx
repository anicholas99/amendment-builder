import React from 'react';
import { Box } from '@chakra-ui/react';
import SavedPriorArtTab from '../../search/components/SavedPriorArtTab';
import {
  ProcessedSavedPriorArt,
  PriorArtReference,
} from '@/types/domain/priorArt';

interface SavedPriorArtTabWrapperProps {
  savedPriorArt: ProcessedSavedPriorArt[];
  onRemovePriorArt: (index: number) => void;
  onOpenPriorArtDetails: (reference: PriorArtReference) => void;
}

/**
 * Wrapper component for SavedPriorArtTab that ensures proper height handling
 * within the Technology Details sidebar container
 */
export const SavedPriorArtTabWrapper: React.FC<
  SavedPriorArtTabWrapperProps
> = ({ savedPriorArt, onRemovePriorArt, onOpenPriorArtDetails }) => {
  return (
    <Box height="100%" overflow="hidden" position="relative">
      <Box height="100%" position="absolute" inset={0}>
        <SavedPriorArtTab
          savedPriorArt={savedPriorArt}
          onRemovePriorArt={onRemovePriorArt}
          onOpenPriorArtDetails={(reference: unknown) =>
            onOpenPriorArtDetails(reference as PriorArtReference)
          }
        />
      </Box>
    </Box>
  );
};
