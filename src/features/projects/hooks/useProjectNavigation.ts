import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useToast } from '@/utils/toast';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { useProjectAutosave } from '@/contexts/ProjectAutosaveContext';
import { logger } from '@/utils/clientLogger';
import { ProjectData } from '@/types/project';

interface UseProjectNavigationProps {
  projects: ProjectData[];
}

interface TransitionState {
  isAnimating: boolean;
  targetProjectName?: string;
  targetView?: string;
}

export function useProjectNavigation({ projects }: UseProjectNavigationProps) {
  const router = useRouter();
  const toast = useToast();
  const { tenant } = router.query;
  const { activeProjectId, setActiveProject } = useProjectData();
  const { forceSave: forceSaveCurrentProject } = useProjectAutosave();
  const [transitionState, setTransitionState] = useState<TransitionState>({
    isAnimating: false,
  });

  const navigateToProject = useCallback(
    async (projectId: string, documentType: string) => {
      if (!tenant) {
        logger.error('No tenant specified for navigation');
        toast.error('Navigation Error', {
          description: 'No organization selected',
        });
        return;
      }

      const tenantPath = `/${tenant}`;
      const newPath = `${tenantPath}/projects/${projectId}/${documentType}`;

      try {
        await router.push(newPath, undefined, { shallow: false });
      } catch (navError) {
        logger.error('Navigation error:', navError);
        toast.error('Navigation Error', {
          description: 'Failed to navigate to project',
        });
        throw navError;
      }
    },
    [router, tenant, toast]
  );

  const handleSelectProject = useCallback(
    async (projectId: string, isNewProject: boolean = false) => {
      if (!projectId) return;

      const targetProject = projects.find(p => p.id === projectId);
      const documentType = 'technology'; // Always go to tech details by default

      setTransitionState({
        isAnimating: true,
        targetProjectName: targetProject?.name,
        targetView: 'Technology Details',
      });

      try {
        // Save current project data if needed
        if (activeProjectId && !isNewProject) {
          await forceSaveCurrentProject();
        }

        // Set new active project
        setActiveProject(projectId);

        // Always navigate to technology details when switching projects
        await navigateToProject(projectId, documentType);

        if (targetProject) {
          const viewName =
            documentType === 'technology'
              ? 'Technology Details'
              : documentType === 'claim-refinement'
                ? 'Claims'
                : 'Patent Application';

          toast.success('Project opened', {
            description: `Opened ${viewName.toLowerCase()} for "${targetProject.name}"`,
          });
        }
      } catch (error) {
        logger.error('Error opening project:', error);
        toast.error('Project open failed', {
          description: 'Failed to open project. Please try again.',
        });
      } finally {
        setTransitionState({ isAnimating: false });
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

      const targetProject = projects.find(p => p.id === projectId);
      const documentName =
        documentType === 'technology'
          ? 'Technology Details'
          : documentType === 'claim-refinement'
            ? 'Claims'
            : 'Patent';

      setTransitionState({
        isAnimating: true,
        targetProjectName: targetProject?.name,
        targetView: documentName,
      });

      try {
        // Save current project data if needed
        if (activeProjectId) {
          await forceSaveCurrentProject();
        }

        // Set new active project
        setActiveProject(projectId);

        await navigateToProject(projectId, documentType);

        if (targetProject) {
          toast.success(`${documentName} opened`, {
            description: `Opened ${documentName.toLowerCase()} for "${targetProject.name}"`,
          });
        }
      } catch (error) {
        logger.error('Error opening project:', error);
        toast.error('Project open failed', {
          description: 'Failed to open project. Please try again.',
        });
      } finally {
        setTransitionState({ isAnimating: false });
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
        toast.error('Creation incomplete', {
          description:
            'Project may have been created but response was incomplete. Please refresh.',
        });
        return;
      }

      setTransitionState({
        isAnimating: true,
        targetProjectName: newProject.name,
        targetView: 'Technology Details',
      });

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
        toast.error('Navigation failed', {
          description:
            'Project was created but failed to navigate. Please refresh the page.',
        });
      } finally {
        setTransitionState({ isAnimating: false });
      }
    },
    [setActiveProject, router, tenant, toast]
  );

  return {
    isAnimating: transitionState.isAnimating,
    transitionState,
    setIsAnimating: (value: boolean) =>
      setTransitionState({ isAnimating: value }),
    handleSelectProject,
    handleDocumentSelect,
    handleCreateProjectNavigation,
  };
}
