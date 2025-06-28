import React from 'react';
import VersionHistoryModal from '../../version/components/VersionHistoryModal';
import PriorArtDetailsModal from './PriorArtDetailsModal';
import PriorArtModal from './PriorArtModal';
import PreviewModal from './PreviewModal';
import ClaimParsingModal from '../../claim-refinement/components/ClaimParsingModal';
import { PriorArtReference, Suggestion } from '../../../types/claimTypes';
import { InventionData } from '../../../types';
import { normalizeClaims } from '../../../utils/dataHelpers';

interface ClaimModalsProps {
  isPreviewModalOpen: boolean;
  setIsPreviewModalOpen: (isOpen: boolean) => void;
  isVersionHistoryModalOpen: boolean;
  setIsVersionHistoryModalOpen: (isOpen: boolean) => void;
  isPriorArtModalOpen: boolean;
  setIsPriorArtModalOpen: (isOpen: boolean) => void;
  isParsingModalOpen: boolean;
  setIsParsingModalOpen: (isOpen: boolean) => void;
  viewingPriorArt: PriorArtReference | null;
  setViewingPriorArt: (priorArt: PriorArtReference | null) => void;
  analyzedInvention: InventionData | null;
  parsedElements: { text: string; label: string; emphasized: boolean }[];
  searchQueries: string[];
  isParsingClaim: boolean;
  handleExecuteSearch: (
    editedElements: unknown[],
    editedQueries: string[]
  ) => void;
  handleInsertNewClaim?: (
    afterClaimNumber: string,
    text: string,
    dependsOn: string
  ) => void;
}

/**
 * Component that contains all modals used in the Claim Refinement view
 */
const ClaimModals: React.FC<ClaimModalsProps> = ({
  isPreviewModalOpen,
  setIsPreviewModalOpen,
  isVersionHistoryModalOpen,
  setIsVersionHistoryModalOpen,
  isPriorArtModalOpen,
  setIsPriorArtModalOpen,
  isParsingModalOpen,
  setIsParsingModalOpen,
  viewingPriorArt,
  setViewingPriorArt,
  analyzedInvention,
  parsedElements,
  searchQueries,
  isParsingClaim,
  handleExecuteSearch,
  handleInsertNewClaim,
}) => {
  // Normalize claims to a consistent format using our helper
  const normalizedClaims = normalizeClaims(analyzedInvention?.claims);

  // For the parentClaimText, use the first claim if it exists
  const parentClaimText = normalizedClaims['1'] || '';

  return (
    <>
      {/* Prior Art Modal */}
      <PriorArtDetailsModal
        isOpen={viewingPriorArt !== null}
        onClose={() => setViewingPriorArt(null)}
        priorArt={viewingPriorArt}
      />

      {/* Preview Modal */}
      <PreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        claims={normalizedClaims}
      />

      {/* Claim Parsing Modal */}
      <ClaimParsingModal
        isOpen={isParsingModalOpen}
        onClose={() => setIsParsingModalOpen(false)}
        parsedElements={parsedElements}
        searchQueries={searchQueries}
        isLoading={isParsingClaim}
        inventionData={{
          title: analyzedInvention?.title || '',
          technical_field: analyzedInvention?.technical_field
            ? typeof analyzedInvention.technical_field === 'string'
              ? analyzedInvention.technical_field
              : ''
            : '',
          novelty: analyzedInvention?.novelty
            ? typeof analyzedInvention.novelty === 'string'
              ? analyzedInvention.novelty
              : ''
            : '',
          features: analyzedInvention?.features
            ? Array.isArray(analyzedInvention.features)
              ? analyzedInvention.features.map(f =>
                  typeof f === 'string' ? f : ''
                )
              : []
            : [],
          background: analyzedInvention?.background
            ? typeof analyzedInvention.background === 'string'
              ? analyzedInvention.background
              : typeof analyzedInvention.background === 'object' &&
                  analyzedInvention.background
                ? String(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- justified: background field structure varies and may contain technical_field
                    (analyzedInvention.background as any).technical_field || ''
                  )
                : ''
            : '',
        }}
        onExecuteSearch={handleExecuteSearch}
        searchMode="basic"
      />
    </>
  );
};

export default ClaimModals;
