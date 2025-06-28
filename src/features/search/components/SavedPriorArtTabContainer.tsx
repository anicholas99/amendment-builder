import React from 'react';
import SavedPriorArtTab from './SavedPriorArtTab';
import { PriorArtReference } from '../../../types/claimTypes';
import { ProcessedSavedPriorArt } from '@/types/domain/priorArt';

interface SavedPriorArtTabContainerProps {
  savedPriorArt: ProcessedSavedPriorArt[];
  handleRemovePriorArt: (index: number) => void;
  onOpenPriorArtDetails: (reference: PriorArtReference) => void;
  onRefreshList?: () => void;
}

/**
 * Container component for the Saved Prior Art tab in the ClaimSidebar
 */
const SavedPriorArtTabContainer: React.FC<SavedPriorArtTabContainerProps> = ({
  savedPriorArt,
  handleRemovePriorArt,
  onOpenPriorArtDetails,
  onRefreshList,
}) => {
  return (
    <SavedPriorArtTab
      key="prior-art"
      savedPriorArt={savedPriorArt}
      onRemovePriorArt={handleRemovePriorArt}
      onOpenPriorArtDetails={onOpenPriorArtDetails as any}
      onRefreshList={onRefreshList}
    />
  );
};

export default SavedPriorArtTabContainer;
