import React, { RefObject } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useColorModeValue,
  Button,
} from '@chakra-ui/react';

interface DeleteFigureAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  figureNum: string;
  cancelRef: RefObject<HTMLButtonElement>;
}

/**
 * Component for the delete figure confirmation dialog
 */
const DeleteFigureAlert: React.FC<DeleteFigureAlertProps> = ({
  isOpen,
  onClose,
  onDelete,
  figureNum,
  cancelRef,
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay bg="blackAlpha.600">
        <AlertDialogContent boxShadow="xl" borderRadius="md">
          <AlertDialogHeader
            fontSize="lg"
            fontWeight="600"
            pb={3}
            borderBottomWidth="1px"
            borderColor={borderColor}
          >
            Delete Figure
          </AlertDialogHeader>

          <AlertDialogBody pt={4} pb={5}>
            Are you sure you want to delete {figureNum}? This action cannot be
            undone.
          </AlertDialogBody>

          <AlertDialogFooter
            borderTopWidth="1px"
            borderColor={borderColor}
            pt={3}
          >
            <Button onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button colorScheme="red" onClick={onDelete} ml={3} size="sm">
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default DeleteFigureAlert;
