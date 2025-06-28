import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Box,
} from '@chakra-ui/react';
import { useThemeContext } from '../../../../contexts/ThemeContext';

interface ProjectConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetProject: { name: string } | null;
  isLoading: boolean;
  title?: string;
  actionText?: string;
}

export const ProjectConfirmationModal: React.FC<
  ProjectConfirmationModalProps
> = ({
  isOpen,
  onClose,
  onConfirm,
  targetProject,
  isLoading,
  title = 'Open Project',
  actionText = 'Open',
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      closeOnOverlayClick={!isLoading}
      closeOnEsc={!isLoading}
      blockScrollOnMount={true}
      motionPreset="scale"
    >
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent
        bg={isDarkMode ? 'gray.800' : 'white'}
        color={isDarkMode ? 'white' : 'gray.800'}
        borderRadius="md"
        boxShadow="lg"
        pt={6}
        pb={4}
      >
        <Box px={6}>
          <Text fontSize="xl" fontWeight="semibold" mb={4}>
            {title}
          </Text>
          <Text fontSize="md" mb={4}>
            Are you sure you want to {actionText.toLowerCase()}{' '}
            <Text
              as="span"
              fontWeight="semibold"
              color={isDarkMode ? 'blue.200' : 'blue.600'}
            >
              {targetProject?.name || 'this project'}
            </Text>
            ?
          </Text>
          <Text fontSize="sm" color={isDarkMode ? 'gray.400' : 'gray.600'}>
            Any unsaved changes in the current project will be saved
            automatically.
          </Text>
        </Box>
        <ModalFooter pt={6}>
          <Button
            variant="outline"
            mr={3}
            onClick={onClose}
            bg="transparent"
            color={isDarkMode ? 'gray.300' : 'gray.600'}
            borderColor={isDarkMode ? 'gray.600' : 'gray.200'}
            _hover={{ bg: isDarkMode ? 'gray.700' : 'gray.50' }}
            isDisabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={onConfirm}
            isLoading={isLoading}
            loadingText={`${actionText}ing`}
          >
            {actionText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
