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

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cancelRef: React.RefObject<HTMLButtonElement>;
}

/**
 * Delete confirmation dialog component for search history entries
 */
const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
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
            Delete Search
          </AlertDialogHeader>

          <AlertDialogBody pt={4}>
            Are you sure you want to delete this search? This action cannot be
            undone.
          </AlertDialogBody>

          <AlertDialogFooter gap={2}>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={onConfirm}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default DeleteConfirmationDialog;
