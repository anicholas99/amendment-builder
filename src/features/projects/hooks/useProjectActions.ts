import { useCallback } from 'react';
import { useToast } from '@/hooks/useToastWrapper';
import {
  useDeleteProjectMutation,
  useUpdateProjectMutation,
} from '@/hooks/api/useProjects';
import { logger } from '@/utils/clientLogger';
import { useProjectData } from '@/contexts';
import { useRouter } from 'next/router';
import { extractTenantFromQuery } from '@/utils/routerTenant';

/**
 * Hook that provides actions for managing projects by composing other hooks.
 */
export const useProjectActions = () => {
  const toast = useToast();
  const router = useRouter();
  const { activeProjectId, setActiveProject } = useProjectData();
  const deleteProjectMutation = useDeleteProjectMutation();
  const renameProjectMutation = useUpdateProjectMutation();
  const updateProjectMutation = useUpdateProjectMutation();

  /**
   * Rename a project
   */
  const renameProject = useCallback(
    async (projectId: string, newName: string): Promise<boolean> => {
      try {
        await renameProjectMutation.mutateAsync({
          projectId,
          data: { name: newName },
        });
        return true;
      } catch {
        return false;
      }
    },
    [renameProjectMutation]
  );

  /**
   * Delete a project with confirmation
   */
  const deleteProjectWithConfirmation = useCallback(
    async (projectId: string) => {
      if (
        !window.confirm(
          'Are you sure you want to delete this project? This action cannot be undone.'
        )
      ) {
        return;
      }

      try {
        await deleteProjectMutation.mutateAsync(projectId);

        if (projectId === activeProjectId) {
          await setActiveProject(null);
          const { tenant } = extractTenantFromQuery(router.query);
          await router.push(`/${tenant}/projects`);
        }
      } catch (error) {
        logger.error('Error deleting project:', error);
      }
    },
    [activeProjectId, setActiveProject, router, deleteProjectMutation]
  );

  /**
   * Update a project with new data
   */
  const updateProject = useCallback(
    async (projectId: string, data: any): Promise<boolean> => {
      try {
        await updateProjectMutation.mutateAsync({
          projectId,
          data,
        });
        return true;
      } catch (error) {
        logger.error('Error updating project:', error);
        return false;
      }
    },
    [updateProjectMutation]
  );

  return {
    renameProject,
    updateProject,
    deleteProjectWithConfirmation,
    isRenaming: renameProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
  };
};
