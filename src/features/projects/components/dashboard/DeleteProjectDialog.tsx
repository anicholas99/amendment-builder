import React from 'react';
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
import { useThemeContext } from '@/contexts/ThemeContext';

interface DeleteProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
  cancelRef: React.RefObject<HTMLButtonElement>;
  isDeleting?: boolean;
}

/**
 * Delete confirmation dialog for projects
 * Follows the established AlertDialog pattern used throughout the application
 */
export const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  projectName,
  cancelRef,
  isDeleting = false,
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
      motionPreset="slideInBottom"
    >
      <AlertDialogOverlay bg="blackAlpha.600">
        <AlertDialogContent
          bg={isDarkMode ? 'gray.800' : 'white'}
          color={isDarkMode ? 'white' : 'gray.800'}
          borderColor={isDarkMode ? 'gray.700' : 'gray.200'}
          mx={4}
          position="relative"
          zIndex="modal"
        >
          <AlertDialogHeader
            fontSize="lg"
            fontWeight="bold"
            borderBottomWidth="1px"
            borderColor={isDarkMode ? 'gray.700' : 'gray.200'}
            pb={3}
            as="h3"
          >
            Delete Project
          </AlertDialogHeader>

          <AlertDialogBody pt={4}>
            <Text>
              Are you sure you want to delete{' '}
              <Text
                as="span"
                fontWeight="semibold"
                color={isDarkMode ? 'blue.200' : 'blue.600'}
              >
                "{projectName}"
              </Text>
              ?
            </Text>
            <Text
              mt={3}
              fontSize="sm"
              color={isDarkMode ? 'gray.400' : 'gray.600'}
            >
              This action cannot be undone. All project data including
              technology details, claims, and patent drafts will be permanently
              deleted.
            </Text>
          </AlertDialogBody>

          <AlertDialogFooter
            borderTopWidth="1px"
            borderColor={isDarkMode ? 'gray.700' : 'gray.200'}
            pt={3}
            gap={2}
          >
            <Button
              ref={cancelRef}
              onClick={onClose}
              variant="outline"
              borderColor={isDarkMode ? 'gray.600' : 'gray.200'}
              _hover={{ bg: isDarkMode ? 'gray.700' : 'gray.50' }}
              isDisabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={onConfirm}
              isLoading={isDeleting}
              loadingText="Deleting"
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
