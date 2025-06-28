import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useToast } from '@chakra-ui/react';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { useProjectAutosave } from '@/contexts/ProjectAutosaveContext';
import { logger } from '@/lib/monitoring/logger';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { ProjectData } from '@/types/project';
import { useQueryClient } from '@tanstack/react-query';

interface UseProjectNavigationProps {
  projects: ProjectData[];
}

export function useProjectNavigation({ projects }: UseProjectNavigationProps) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { tenant } = router.query;
  const { activeProjectId, setActiveProject } = useProjectData();
  const { forceSave: forceSaveCurrentProject } = useProjectAutosave();
  const [isAnimating, setIsAnimating] = useState(false);

  const navigateToProject = useCallback(
    async (projectId: string, documentType: string) => {
      if (!tenant) {
        logger.error('No tenant specified for navigation');
        showErrorToast(toast, 'Navigation Error', 'No organization selected');
        return;
      }

      const tenantPath = `/${tenant}`;
      const newPath = `${tenantPath}/projects/${projectId}/${documentType}`;

      try {
        await router.push(newPath, undefined, { shallow: false });
      } catch (navError) {
        logger.error('Navigation error:', navError);
        showErrorToast(
          toast,
          'Navigation failed',
          'Failed to navigate to project page. Please try again.'
        );
        throw navError;
      }
    },
    [router, tenant, toast]
  );

  const handleSelectProject = useCallback(
    async (projectId: string, isNewProject: boolean = false) => {
      if (!projectId) return;

      setIsAnimating(true);

      try {
        // Save current project data if needed
        if (activeProjectId && !isNewProject) {
          await forceSaveCurrentProject();
        }

        // Set new active project
        setActiveProject(projectId);

        // Always navigate to technology details when switching projects
        const targetProject = projects.find(p => p.id === projectId);
        const documentType = 'technology'; // Always go to tech details by default

        await navigateToProject(projectId, documentType);

        if (targetProject) {
          const viewName =
            documentType === 'technology'
              ? 'Technology Details'
              : documentType === 'claim-refinement'
                ? 'Claims'
                : 'Patent Application';

          showSuccessToast(
            toast,
            'Project opened',
            `Opened ${viewName.toLowerCase()} for "${targetProject.name}"`
          );
        }
      } catch (error) {
        logger.error('Error opening project:', error);
        showErrorToast(
          toast,
          'Project open failed',
          'Failed to open project. Please try again.'
        );
      } finally {
        setIsAnimating(false);
      }
    },
    [
      setActiveProject,
      forceSaveCurrentProject,
      projects,
      activeProjectId,
      navigateToProject,
      toast,
    ]
  );

  const handleDocumentSelect = useCallback(
    async (projectId: string, documentType: string) => {
      if (!projectId) return;

      setIsAnimating(true);

      try {
        // Save current project data if needed
        if (activeProjectId) {
          await forceSaveCurrentProject();
        }

        // Set new active project
        setActiveProject(projectId);

        await navigateToProject(projectId, documentType);

        const targetProject = projects.find(p => p.id === projectId);
        const documentName =
          documentType === 'technology'
            ? 'Technology Details'
            : documentType === 'claim-refinement'
              ? 'Claims'
              : 'Patent';

        if (targetProject) {
          showSuccessToast(
            toast,
            `${documentName} opened`,
            `Opened ${documentName.toLowerCase()} for "${targetProject.name}"`
          );
        }
      } catch (error) {
        logger.error('Error opening project:', error);
        showErrorToast(
          toast,
          'Project open failed',
          'Failed to open project. Please try again.'
        );
      } finally {
        setIsAnimating(false);
      }
    },
    [
      setActiveProject,
      forceSaveCurrentProject,
      activeProjectId,
      navigateToProject,
      projects,
      toast,
    ]
  );

  const handleCreateProjectNavigation = useCallback(
    async (newProject: { id: string; name: string }) => {
      if (!newProject.id) {
        logger.warn(
          'New project created, but project ID not returned for navigation.'
        );
        showErrorToast(
          toast,
          'Creation incomplete',
          'Project may have been created but response was incomplete. Please refresh.'
        );
        return;
      }

      // Pre-populate the React Query cache for technology details to avoid loading state
      queryClient.setQueryData(['invention', newProject.id], null);
      
      // Also ensure the project detail is cached
      queryClient.setQueryData(['projects', newProject.id], newProject);
      
      // Pre-populate versions to avoid 404s
      queryClient.setQueryData(['versions', newProject.id, 'latest'], null);
      queryClient.setQueryData(['versions', newProject.id, 'list'], []);

      // Set new active project
      setActiveProject(newProject.id);

      // Navigate directly to the new project
      const tenantPath = `/${tenant}`;
      const newPath = `${tenantPath}/projects/${newProject.id}/technology`;

      logger.info('[New Project] Navigating to:', {
        projectId: newProject.id,
        path: newPath,
      });

      try {
        await router.push(newPath, undefined, { shallow: false });
      } catch (navError) {
        logger.error('Navigation error:', navError);
        showErrorToast(
          toast,
          'Navigation failed',
          'Project was created but failed to navigate. Please refresh the page.'
        );
      }
    },
    [setActiveProject, router, tenant, toast, queryClient]
  );

  return {
    isAnimating,
    setIsAnimating,
    handleSelectProject,
    handleDocumentSelect,
    handleCreateProjectNavigation,
  };
}
