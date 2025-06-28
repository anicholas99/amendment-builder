import React, { useRef } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Text,
} from '@chakra-ui/react';

interface ClaimAmendmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal component for confirming claim amendments when the claim has been modified
 * since the analysis was performed
 */
export const ClaimAmendmentModal: React.FC<ClaimAmendmentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
      motionPreset="slideInBottom"
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Claim Modified Since Analysis
          </AlertDialogHeader>

          <AlertDialogBody>
            <Text mb={4}>
              Claim 1 has been modified since this deep analysis was performed.
            </Text>
            <Text mb={4} fontWeight="medium">
              The deep analysis was based on an older version of claim 1.
            </Text>
            <Text color="orange.500" fontWeight="medium">
              If you proceed, your current claim 1 text will be REPLACED with
              the suggested amendment.
            </Text>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onCancel}>
              Keep Current Text
            </Button>
            <Button colorScheme="orange" onClick={onConfirm} ml={3}>
              Apply Amendment
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
