import { useState, useCallback } from 'react';
import { useDisclosure, useToast } from '@chakra-ui/react';
import {
  useAllProjects,
  useCreateProject,
  useDeleteProjectMutation,
} from '@/hooks/api/useProjects';
import { useProjectListFilters } from './useProjectListFilters';
import { useProjectNavigation } from './useProjectNavigation';
import { logger } from '@/lib/monitoring/logger';
import { showErrorToast } from '@/utils/toast';

export function useProjectDashboard() {
  const toast = useToast();
  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProjectMutation();

  // Modal states
  const {
    isOpen: isNewProjectModalOpen,
    onOpen: onOpenNewProjectModal,
    onClose: onCloseNewProjectModal,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onOpenDelete,
    onClose: onCloseDelete,
  } = useDisclosure();

  const [projectToDelete, setProjectToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Fetch projects with React Query
  const filtersState = useProjectListFilters({ projects: undefined });
  const {
    projects: allProjects,
    isLoading: isLoadingProjects,
    error: projectsError,
  } = useAllProjects({
    search: filtersState.searchQuery,
    filterBy: filtersState.filterBy,
    sortBy: filtersState.sortBy,
    sortOrder: 'desc',
  });

  // Update filters with actual projects
  const filters = useProjectListFilters({ projects: allProjects });

  // Navigation logic
  const navigation = useProjectNavigation({
    projects: filters.filteredProjects,
  });

  // Handle new project creation
  const handleCreateProject = useCallback(
    async (projectName: string) => {
      try {
        navigation.setIsAnimating(true);

        const newProject = await createProjectMutation.mutateAsync({
          name: projectName.trim(),
        });

        if (newProject && newProject.id) {
          await navigation.handleCreateProjectNavigation(newProject);
        } else {
          logger.warn(
            'New project created, but project data/ID not returned for navigation.'
          );
          showErrorToast(
            toast,
            'Creation incomplete',
            'Project may have been created but response was incomplete. Please refresh.'
          );
        }
      } catch (error) {
        logger.error('Error creating project:', error);
        showErrorToast(
          toast,
          'Creation failed',
          error instanceof Error ? error.message : 'Failed to create project'
        );
        throw error;
      } finally {
        navigation.setIsAnimating(false);
      }
    },
    [createProjectMutation, navigation, toast]
  );

  // Handle project deletion
  const handleDeleteProject = useCallback(
    (projectId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const project = filters.filteredProjects.find(p => p.id === projectId);
      if (project) {
        setProjectToDelete({ id: projectId, name: project.name });
        onOpenDelete();
      }
    },
    [filters.filteredProjects, onOpenDelete]
  );

  const confirmDeleteProject = useCallback(() => {
    if (projectToDelete) {
      deleteProjectMutation.mutate(projectToDelete.id);
      onCloseDelete();
      setProjectToDelete(null);
    }
  }, [projectToDelete, deleteProjectMutation, onCloseDelete]);

  return {
    // Project data
    projects: filters.filteredProjects,
    isLoadingProjects,
    projectsError,

    // Filters
    ...filters,

    // Navigation
    ...navigation,

    // Modal states
    isNewProjectModalOpen,
    onOpenNewProjectModal,
    onCloseNewProjectModal,
    isDeleteOpen,
    onOpenDelete,
    onCloseDelete,
    projectToDelete,

    // Actions
    handleCreateProject,
    handleDeleteProject,
    confirmDeleteProject,
    isDeleting: deleteProjectMutation.isPending,
  };
}
