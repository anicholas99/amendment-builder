import React, { useState, useRef, useCallback } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { useNextTick } from '@/hooks/useNextTick';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
  Flex,
  HStack,
  Box,
  Icon,
  Badge,
  Input,
  IconButton,
  useToast,
  Spinner,
  Divider,
  Checkbox,
  useColorModeValue,
  useTheme,
} from '@chakra-ui/react';
import { FiTrash2, FiEdit2, FiCheck, FiX, FiFolder } from 'react-icons/fi';
import { showSuccessToast, showErrorToast } from '../../../utils/toast';
import { useThemeContext } from '../../../contexts/ThemeContext';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { useProjectActions } from '../hooks/useProjectActions';
import { StandardTooltip } from '../../../components/common/StandardTooltip';
import { useDeleteProject } from '../hooks';
import { useRouter } from 'next/router';

interface Project {
  id: string;
  name: string;
  inventionData?: unknown;
}

interface ManageProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  handleDeleteProject: (projectId: string, e: React.MouseEvent) => void;
}

const ManageProjectsModal: React.FC<ManageProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  handleDeleteProject: externalHandleDeleteProject,
}) => {
  const deleteProjectMutation = useDeleteProject();
  const { activeProjectId } = useProjectData();
  const { isDarkMode } = useThemeContext();
  const { nextTick } = useNextTick();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // State for editing project names
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get theme context and toast
  const toast = useToast();
  const theme = useTheme();

  // Use our custom hook for project actions
  const { renameProject, isRenaming } = useProjectActions();

  // Custom dark mode colors
  const darkItemBg = 'gray.700';
  const darkHoverBg = 'gray.600';
  const darkBorderColor = 'gray.600';

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedProjects([]);
      setEditingProject(null);
      setNewProjectName('');
      setIsDeleting(false);
    }
  }, [isOpen]);

  // Start editing a project name
  const startEditing = (project: Project) => {
    setEditingProject(project.id);
    setNewProjectName(project.name);
    // Use nextTick to focus and select after render
    nextTick(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingProject(null);
    setNewProjectName('');
  };

  // Save the new project name
  const saveProjectName = async (projectId: string) => {
    if (!newProjectName.trim() || isRenaming) return;
    const currentProject = projects.find(p => p.id === projectId);
    if (!currentProject || currentProject.name === newProjectName.trim()) {
      cancelEditing();
      return;
    }
    const success = await renameProject(projectId, newProjectName);
    if (success) cancelEditing();
  };

  // Handle project selection
  const handleProjectSelect = (projectId: string) => {
    setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  // Internal delete handler that uses mutation if no external handler provided
  const handleDeleteProject = useCallback(
    (projectId: string, e: React.MouseEvent) => {
      if (externalHandleDeleteProject) {
        externalHandleDeleteProject(projectId, e);
      } else {
        e.stopPropagation();
        e.preventDefault();
        if (window.confirm('Are you sure you want to delete this project?')) {
          deleteProjectMutation.mutate(projectId);
        }
      }
    },
    [externalHandleDeleteProject, deleteProjectMutation]
  );

  // Handle bulk delete button click
  const handleBulkDelete = async () => {
    if (selectedProjects.length === 0 || isDeleting) return;

    const projectNames = selectedProjects
      .map(id => projects.find(p => p.id === id)?.name || 'Unknown Project')
      .join(', ');

    if (
      window.confirm(
        `Delete ${selectedProjects.length} projects: ${projectNames}? This cannot be undone.`
      )
    ) {
      setIsDeleting(true);
      try {
        // Delete all selected projects
        for (const projectId of selectedProjects) {
          deleteProjectMutation.mutate(projectId);
        }

        // Clear selection after deletion
        setSelectedProjects([]);

        // Show success message
        showSuccessToast(
          toast,
          'Projects deleted',
          `Deleting ${selectedProjects.length} projects...`
        );
      } catch (error) {
        logger.error('Error during bulk delete:', error);
        showErrorToast(
          toast,
          'Bulk Delete Error',
          'Some projects may not have been deleted.'
        );
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Handle key press in input
  const handleKeyPress = (e: React.KeyboardEvent, projectId: string) => {
    if (e.key === 'Enter') saveProjectName(projectId);
    else if (e.key === 'Escape') cancelEditing();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      motionPreset="slideInBottom"
      scrollBehavior="inside"
      closeOnOverlayClick={!isDeleting && !isRenaming}
      closeOnEsc={!isDeleting && !isRenaming}
      isCentered
      blockScrollOnMount={true}
    >
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent
        boxShadow="xl"
        borderRadius="lg"
        bg={isDarkMode ? 'gray.800' : 'white'}
        color={isDarkMode ? 'white' : 'gray.800'}
        maxH="80vh"
      >
        <ModalHeader
          fontSize="xl"
          fontWeight="semibold"
          pb={4}
          borderBottomWidth="1px"
          borderColor={isDarkMode ? 'gray.700' : 'gray.200'}
        >
          Manage Projects
        </ModalHeader>

        <ModalBody py={5} px={6}>
          {projects.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              py={10}
              color={isDarkMode ? 'gray.300' : 'gray.500'}
            >
              <Icon as={FiFolder} fontSize="4xl" mb={4} />
              <Text fontSize="lg">No projects found</Text>
              <Text fontSize="md" mt={1}>
                Create one from the sidebar!
              </Text>
            </Flex>
          ) : (
            <VStack align="stretch" spacing={3}>
              {projects.map(project => (
                <Flex
                  key={project.id}
                  align="center"
                  p={3}
                  borderWidth="1px"
                  borderColor={
                    editingProject === project.id ? 'blue.200' : 'gray.200'
                  }
                  borderRadius="md"
                  bg={editingProject === project.id ? 'blue.50' : 'gray.50'}
                  transition="background-color 0.15s ease-out, border-color 0.15s ease-out"
                  _hover={{
                    borderColor:
                      editingProject === project.id ? 'blue.200' : 'blue.300',
                    bg: editingProject === project.id ? 'blue.100' : 'gray.100',
                  }}
                >
                  <Checkbox
                    isChecked={selectedProjects.includes(project.id)}
                    onChange={() => handleProjectSelect(project.id)}
                    colorScheme="blue"
                    mr={4}
                    isDisabled={isDeleting || isRenaming}
                    aria-label={`Select project ${project.name}`}
                  />
                  <Flex flex="1" align="center" mr={3} minWidth="0">
                    <Icon
                      as={FiFolder}
                      color={isDarkMode ? 'blue.300' : 'blue.500'}
                      mr={3}
                      fontSize="xl"
                      flexShrink={0}
                    />
                    {editingProject === project.id ? (
                      <Input
                        ref={inputRef}
                        value={newProjectName}
                        onChange={e => setNewProjectName(e.target.value)}
                        onKeyDown={e => handleKeyPress(e, project.id)}
                        size="sm"
                        variant="outline"
                        bg={isDarkMode ? 'gray.700' : 'white'}
                        _focus={{
                          borderColor: 'blue.500',
                          boxShadow: `0 0 0 1px ${theme.colors.blue[500]}`,
                        }}
                        isDisabled={isRenaming}
                        placeholder="Enter new name"
                      />
                    ) : (
                      <Text fontWeight="medium" fontSize="md" isTruncated>
                        {project.name}
                      </Text>
                    )}
                  </Flex>
                  {editingProject === project.id ? (
                    <HStack spacing={1}>
                      <StandardTooltip label="Save name">
                        <IconButton
                          aria-label="Save project name"
                          icon={
                            isRenaming ? <Spinner size="xs" /> : <FiCheck />
                          }
                          size="sm"
                          colorScheme="green"
                          variant="ghost"
                          onClick={() => saveProjectName(project.id)}
                          isDisabled={isRenaming || !newProjectName.trim()}
                          _hover={{ bg: isDarkMode ? 'gray.600' : 'gray.200' }}
                        />
                      </StandardTooltip>
                      <StandardTooltip label="Cancel editing">
                        <IconButton
                          aria-label="Cancel editing"
                          icon={<FiX />}
                          size="sm"
                          variant="ghost"
                          colorScheme="gray"
                          onClick={cancelEditing}
                          isDisabled={isRenaming}
                          _hover={{ bg: isDarkMode ? 'gray.600' : 'gray.200' }}
                        />
                      </StandardTooltip>
                    </HStack>
                  ) : (
                    <HStack spacing={1}>
                      <StandardTooltip label="Rename project">
                        <IconButton
                          aria-label="Rename project"
                          icon={<FiEdit2 />}
                          size="sm"
                          variant="ghost"
                          colorScheme="gray"
                          onClick={e => {
                            e.stopPropagation();
                            startEditing(project);
                          }}
                          isDisabled={isDeleting || isRenaming}
                          _hover={{ bg: isDarkMode ? 'gray.600' : 'gray.200' }}
                        />
                      </StandardTooltip>
                      <StandardTooltip label="Delete project">
                        <IconButton
                          aria-label="Delete project"
                          icon={
                            isDeleting ? <Spinner size="sm" /> : <FiTrash2 />
                          }
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          color={isDarkMode ? 'red.300' : undefined}
                          _hover={{
                            bg: isDarkMode ? darkHoverBg : undefined,
                            color: isDarkMode ? 'red.200' : undefined,
                          }}
                          onClick={e => handleDeleteProject(project.id, e)}
                          isDisabled={isDeleting}
                        />
                      </StandardTooltip>
                    </HStack>
                  )}
                </Flex>
              ))}
            </VStack>
          )}
        </ModalBody>

        <ModalFooter
          py={4}
          px={6}
          borderTopWidth="1px"
          borderColor={isDarkMode ? 'gray.700' : 'gray.200'}
          bg={isDarkMode ? 'gray.700' : 'white'}
        >
          <Flex width="100%" justifyContent="space-between" alignItems="center">
            {/* Clear Selection Button - Always rendered, conditionally displayed */}
            <Button
              onClick={() => setSelectedProjects([])}
              variant="outline"
              size="sm"
              color={isDarkMode ? 'gray.300' : 'gray.600'}
              borderColor={isDarkMode ? 'gray.600' : 'gray.300'}
              _hover={{ bg: isDarkMode ? 'gray.600' : 'gray.200' }}
              _focus={{ boxShadow: 'none', outline: 'none' }}
              _focusVisible={{ boxShadow: 'none', outline: 'none' }}
              isDisabled={isDeleting}
              ringColor="transparent"
              boxShadow="none"
              display={selectedProjects.length > 0 ? 'inline-flex' : 'none'}
            >
              Clear selection ({selectedProjects.length})
            </Button>

            {/* Spacer to push Done button right when Clear/Delete are hidden */}
            <Box
              flexGrow={1}
              display={selectedProjects.length === 0 ? 'block' : 'none'}
            />

            {/* Delete Selected Button - Always rendered, conditionally displayed */}
            <Button
              colorScheme="red"
              variant="solid"
              onClick={handleBulkDelete}
              isLoading={isDeleting}
              size="sm"
              leftIcon={<Icon as={FiTrash2} />}
              display={selectedProjects.length > 0 ? 'inline-flex' : 'none'}
              ml={2}
            >
              Delete Selected
            </Button>

            {/* Done Button - Always rendered, conditionally displayed */}
            <Button
              onClick={onClose}
              colorScheme="blue"
              size="sm"
              display={selectedProjects.length === 0 ? 'inline-flex' : 'none'}
            >
              Done
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

ManageProjectsModal.displayName = 'ManageProjectsModal';

export default ManageProjectsModal;
