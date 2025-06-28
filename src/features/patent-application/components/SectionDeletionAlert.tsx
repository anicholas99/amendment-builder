import React, { useRef } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Icon,
  Text,
  Box,
} from '@chakra-ui/react';
import { FiAlertTriangle } from 'react-icons/fi';

interface SectionDeletionAlertProps {
  isOpen: boolean;
  headerName: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SectionDeletionAlert: React.FC<SectionDeletionAlertProps> = ({
  isOpen,
  headerName,
  onConfirm,
  onCancel,
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  if (!headerName) return null; // Don't render if no header name is provided

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onCancel} // Use onCancel for closing via overlay click or Esc key
      motionPreset="slideInBottom"
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader
            fontSize="lg"
            fontWeight="semibold"
            as="h3"
            pb={3}
            borderBottomWidth="1px"
          >
            Delete Section Header
          </AlertDialogHeader>

          <AlertDialogBody>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Icon as={FiAlertTriangle} color="orange.500" boxSize={5} />
              <Text fontWeight="semibold">Warning</Text>
            </Box>
            <Text>
              You're about to delete the "{headerName}" section header. This may
              affect the structure of your document. Section headers are
              important for organizing your patent application.
            </Text>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onCancel}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={onConfirm} ml={3}>
              Delete Section Header
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
