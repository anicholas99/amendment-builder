import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Box,
} from '@chakra-ui/react';
import { useThemeContext } from '../../../../contexts/ThemeContext';
import { ProjectData } from '@/contexts';
import { ProjectSidebarProject } from '../../types/projectSidebar';

export interface ProjectSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetProject: ProjectSidebarProject | null;
  isLoading: boolean;
}

export const ProjectSwitchModal: React.FC<ProjectSwitchModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  targetProject,
  isLoading,
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size="md"
      motionPreset="scale"
      closeOnOverlayClick={!isLoading}
      closeOnEsc={!isLoading}
      blockScrollOnMount={true}
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
            Open Project
          </Text>
          <Text fontSize="md" mb={4}>
            Are you sure you want to open{' '}
            <Text
              as="span"
              fontWeight="semibold"
              color={isDarkMode ? 'blue.200' : 'blue.600'}
            >
              {targetProject?.name}
            </Text>
            ?
          </Text>
          {isLoading && (
            <Text
              fontSize="sm"
              color={isDarkMode ? 'gray.400' : 'gray.600'}
              mt={2}
            >
              Loading project data...
            </Text>
          )}
        </Box>
        <ModalFooter pt={6}>
          <Button
            variant="secondary"
            mr={3}
            onClick={onClose}
            isDisabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            isLoading={isLoading}
            loadingText="Opening..."
          >
            Open
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
