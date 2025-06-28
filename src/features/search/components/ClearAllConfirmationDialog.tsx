import React from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';

interface ClearAllConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cancelRef: React.RefObject<HTMLButtonElement>;
}

/**
 * Clear all confirmation dialog component for search history
 */
const ClearAllConfirmationDialog: React.FC<ClearAllConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  cancelRef,
}) => {
  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
      motionPreset="slideInBottom"
    >
      <AlertDialogOverlay>
        <AlertDialogContent mx={4} position="relative" zIndex="modal">
          <AlertDialogHeader
            fontSize="lg"
            fontWeight="bold"
            borderBottomWidth="1px"
            pb={3}
            as="h3"
          >
            Clear Search History
          </AlertDialogHeader>

          <AlertDialogBody pt={4}>
            Are you sure you want to clear all search history? This action
            cannot be undone.
          </AlertDialogBody>

          <AlertDialogFooter gap={2}>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={onConfirm}>
              Clear All
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default ClearAllConfirmationDialog;
