import React from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  VStack,
  Text,
  HStack,
} from '@chakra-ui/react';
import { FiSave, FiTrash2, FiX } from 'react-icons/fi';

interface RestoreVersionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAndRestore: () => Promise<void>;
  onDiscardAndRestore: () => Promise<void>;
  versionName: string;
  isSaving?: boolean;
  isRestoring?: boolean;
}

export const RestoreVersionDialog: React.FC<RestoreVersionDialogProps> = ({
  isOpen,
  onClose,
  onSaveAndRestore,
  onDiscardAndRestore,
  versionName,
  isSaving = false,
  isRestoring = false,
}) => {
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const isProcessing = isSaving || isRestoring;

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      closeOnOverlayClick={!isProcessing}
      closeOnEsc={!isProcessing}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Unsaved Changes Detected
          </AlertDialogHeader>

          <AlertDialogBody>
            <VStack spacing={4} align="stretch">
              <Text>
                You have unsaved changes in your working draft. 
                What would you like to do before loading content from "{versionName}"?
              </Text>
              
              <VStack spacing={3} align="stretch" pt={2}>
                <HStack
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor="green.200"
                  bg="green.50"
                  _dark={{ bg: 'green.900', borderColor: 'green.700' }}
                >
                  <FiSave color="green" />
                  <Text fontSize="sm">
                    <Text as="span" fontWeight="semibold">Save current draft</Text> - 
                    Create a new snapshot of your working draft before loading the selected content
                  </Text>
                </HStack>

                <HStack
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor="orange.200"
                  bg="orange.50"
                  _dark={{ bg: 'orange.900', borderColor: 'orange.700' }}
                >
                  <FiTrash2 color="orange" />
                  <Text fontSize="sm">
                    <Text as="span" fontWeight="semibold">Discard changes</Text> - 
                    Replace your working draft with content from the selected version
                  </Text>
                </HStack>

                <HStack
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor="gray.200"
                  bg="gray.50"
                  _dark={{ bg: 'gray.700', borderColor: 'gray.600' }}
                >
                  <FiX color="gray" />
                  <Text fontSize="sm">
                    <Text as="span" fontWeight="semibold">Cancel</Text> - 
                    Keep working on your current draft
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </AlertDialogBody>

          <AlertDialogFooter>
            <HStack spacing={3}>
              <Button
                ref={cancelRef}
                onClick={onClose}
                isDisabled={isProcessing}
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                colorScheme="orange"
                onClick={onDiscardAndRestore}
                isLoading={isRestoring && !isSaving}
                isDisabled={isProcessing}
                loadingText="Restoring..."
              >
                Discard & Restore
              </Button>
              <Button
                colorScheme="green"
                onClick={onSaveAndRestore}
                isLoading={isSaving}
                isDisabled={isProcessing}
                loadingText="Saving..."
              >
                Save & Restore
              </Button>
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}; 