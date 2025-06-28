import React, { useState, useEffect, useCallback, startTransition } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { useTimeout } from '@/hooks/useTimeout';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Box,
  Icon,
  Spinner,
  VStack,
  useToast,
  FormErrorMessage,
} from '@chakra-ui/react';
import { FiPlus, FiCheck } from 'react-icons/fi';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleCreateProject: (name: string) => Promise<void>;
  // Optional props for external state management (for progressive migration)
  isCreating?: boolean;
  error?: string | null;
  isSuccess?: boolean;
}

/**
 * Standardized New Project Modal component used throughout the application
 * for creating new projects with a consistent user experience
 */
const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  handleCreateProject,
  // Support external state management for progressive migration
  isCreating: externalIsCreating,
  error: externalError,
  isSuccess: externalIsSuccess,
}) => {
  const [projectName, setProjectName] = useState('');
  // Use external state if provided, otherwise manage locally (for backward compatibility)
  const [localIsCreating, setLocalIsCreating] = useState(false);
  const [localIsSuccess, setLocalIsSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Use external state if provided, otherwise use local state
  const isCreating = externalIsCreating ?? localIsCreating;
  const isSuccess = externalIsSuccess ?? localIsSuccess;
  const error = externalError ?? localError;

  const toast = useToast();

  // Ref for the first input field for autofocus
  const initialRef = React.useRef<HTMLInputElement>(null);

  // Auto-close modal after success
  useTimeout(
    () => {
      if (externalIsSuccess === undefined) {
        setLocalIsSuccess(false);
      }
      onClose();
    },
    isSuccess ? 200 : null
  );

  // Memoize the input change handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setProjectName(e.target.value);
      // Clear error on typing (only if managing locally)
      if (externalError === undefined && localError) {
        setLocalError(null);
      }
    },
    [externalError, localError]
  );

  const handleSubmit = async () => {
    if (!projectName.trim()) {
      if (externalError === undefined) {
        setLocalError('Project name cannot be empty.');
      }
      return;
    }

    // Batch state updates to reduce render cycles
    startTransition(() => {
      // Only manage state locally if not provided externally
      if (externalIsCreating === undefined) {
        setLocalIsCreating(true);
      }
      if (externalError === undefined) {
        setLocalError(null);
      }
    });

    try {
      await handleCreateProject(projectName);

      // Show success state briefly before closing (only if managing locally)
      if (externalIsSuccess === undefined) {
        startTransition(() => {
          setLocalIsSuccess(true);
        });
      }
      setProjectName(''); // Reset form

      // Modal will auto-close via useTimeout hook
    } catch (err) {
      logger.error('Error creating project:', err);
      startTransition(() => {
        if (externalError === undefined) {
          setLocalError('Failed to create project. Please try again.');
        }
      });
      toast({
        title: 'Creation Failed',
        description: 'Could not create the project.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      startTransition(() => {
        if (externalIsCreating === undefined) {
          setLocalIsCreating(false);
        }
      });
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setProjectName('');
      // Only reset local state
      setLocalError(null);
      setLocalIsCreating(false);
      setLocalIsSuccess(false);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      initialFocusRef={initialRef}
      isCentered
    >
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent>
        <ModalHeader as="h3">
          {isSuccess ? 'Project Created!' : 'Create New Project'}
        </ModalHeader>
        <ModalCloseButton isDisabled={isCreating || isSuccess} />
        <ModalBody pb={6}>
          {isSuccess ? (
            <VStack spacing={4} align="center" py={4}>
              <Box bg="green.100" borderRadius="full" p={3} color="green.500">
                <Icon as={FiCheck} boxSize={6} />
              </Box>
              <Text color="green.600" fontWeight="medium">
                Project "{projectName}" created successfully!
              </Text>
              <Text fontSize="sm" color="gray.600">
                Opening technology details...
              </Text>
            </VStack>
          ) : (
            <FormControl isInvalid={!!error}>
              <FormLabel>Project Name</FormLabel>
              <Input
                ref={initialRef}
                placeholder="Enter project name"
                value={projectName}
                onChange={handleInputChange}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !isCreating) {
                    handleSubmit();
                  }
                }}
              />
              {error && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>
          )}
        </ModalBody>

        <ModalFooter>
          {!isSuccess && (
            <>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={handleSubmit}
                isLoading={isCreating}
                loadingText="Creating..."
                isDisabled={!projectName.trim() || isCreating}
              >
                {isCreating ? 'Creating Project...' : 'Create Project'}
              </Button>
              <Button onClick={onClose} isDisabled={isCreating}>
                Cancel
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NewProjectModal;
