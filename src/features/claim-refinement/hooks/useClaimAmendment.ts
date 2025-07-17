import { useState, useCallback } from 'react';
import { useDisclosure } from '@/hooks/useDisclosure';
import { logger } from '@/utils/clientLogger';

interface PendingAmendment {
  originalText: string;
  replacementText: string;
}

interface UseClaimAmendmentProps {
  claims?: Array<{ id: string; number: number; text: string }>;
  handleClaimChange: (claimNumber: string, text: string) => void;
}

/**
 * Custom hook for managing claim amendment logic and confirmation modal
 */
export const useClaimAmendment = ({
  claims,
  handleClaimChange,
}: UseClaimAmendmentProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pendingAmendment, setPendingAmendment] =
    useState<PendingAmendment | null>(null);

  // Function to update claim text when a suggestion is applied
  const updateClaimText = useCallback(
    (originalText: string, replacementText: string) => {
      logger.info('[useClaimAmendment] Updating claim text', {
        originalText,
        replacementText,
      });

      // We need to find the actual claim ID for claim 1
      if (!claims || claims.length === 0) {
        logger.error('[useClaimAmendment] No claims data available');
        return;
      }

      // Find claim 1 by number
      const claim1 = claims.find(claim => claim.number === 1);
      if (!claim1) {
        logger.error('[useClaimAmendment] Claim 1 not found');
        return;
      }

      // Safety check: Verify the current claim text matches what the analysis was based on
      if (claim1.text !== originalText) {
        logger.warn(
          '[useClaimAmendment] Claim 1 has been modified since the analysis',
          {
            currentText: claim1.text,
            analysisOriginalText: originalText,
          }
        );

        // Store the pending amendment and open confirmation modal
        setPendingAmendment({ originalText, replacementText });
        onOpen();
        return;
      }

      // Update claim 1 text - use the claim ID, not the claim number
      logger.info('[useClaimAmendment] Updating claim 1', {
        claimId: claim1.id,
      });
      handleClaimChange(claim1.id, replacementText);
    },
    [handleClaimChange, claims, onOpen]
  );

  // Handle confirmed amendment
  const handleConfirmAmendment = useCallback(() => {
    if (pendingAmendment) {
      logger.info('[useClaimAmendment] User confirmed claim amendment');
      // Find claim 1 again to get its current ID
      const claim1 = claims?.find(claim => claim.number === 1);
      if (claim1) {
        handleClaimChange(claim1.id, pendingAmendment.replacementText);
      }
      setPendingAmendment(null);
      onClose();
    }
  }, [pendingAmendment, handleClaimChange, onClose, claims]);

  // Handle cancelled amendment
  const handleCancelAmendment = useCallback(() => {
    logger.info('[useClaimAmendment] User cancelled claim amendment');
    setPendingAmendment(null);
    onClose();
  }, [onClose]);

  return {
    isConfirmOpen: isOpen,
    onConfirmClose: onClose,
    updateClaimText,
    handleConfirmAmendment,
    handleCancelAmendment,
  };
};
