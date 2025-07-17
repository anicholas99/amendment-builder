/**
 * NavigationManager - Handles document navigation and project switching logic
 * Uses render props pattern following the architectural blueprint
 */
import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useProjectData } from '@/contexts';
import { useActiveDocument } from '@/contexts/ActiveDocumentContext';
import { useQueryClient } from '@tanstack/react-query';
import {
  NavigationManagerProps,
  NavigationHandlers,
  DocumentType,
} from '../../types/projectSidebar';
import { logger } from '@/utils/clientLogger';
import { performanceMonitor } from '@/utils/performance';
import { getTenantFromRouter } from '@/utils/routerTenant';
import { projectKeys } from '@/lib/queryKeys';
import { ProjectApiService } from '@/client/services/project.client-service';

const NavigationManager: React.FC<NavigationManagerProps> = ({
  activeProject,
  projects,
  onProjectSwitch,
  onDocumentNavigation,
  children,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setActiveProject } = useProjectData();
  const { setActiveDocument } = useActiveDocument();

  // Helper for non-tenant query params
  const getQueryString = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) return value[0] || '';
    return value || '';
  };

  // Handle document selection with prefetching
  const handleDocumentSelect = useCallback(
    async (projectId: string, documentType: string) => {
      const tenant = getTenantFromRouter(router);
      const docType = documentType as DocumentType;

      try {
        logger.debug('[NavigationManager] Document selection started', {
          projectId,
          documentType,
        });

        // Prefetch the project detail data before navigation
        await queryClient.prefetchQuery({
          queryKey: projectKeys.detail(projectId),
          queryFn: () => ProjectApiService.getProject(projectId),
          staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
        });

        // Just navigate - let the page component handle all state updates
        const navigationPath = `/${tenant}/projects/${projectId}/${documentType}`;
        await router.push(navigationPath);

        // Notify parent of successful navigation
        onDocumentNavigation(projectId, documentType);

        logger.debug('[NavigationManager] Document selection completed', {
          projectId,
          documentType,
        });
      } catch (error) {
        logger.error('Error during document selection:', error);
        throw error;
      }
    },
    [router, onDocumentNavigation, queryClient]
  );

  // Handle project switching
  const handleProjectSwitch = useCallback(
    async (targetProjectId: string, isNewProject: boolean = false) => {
      const tenant = getTenantFromRouter(router);
      let documentType =
        getQueryString(router.query.documentType) || 'technology';

      try {
        logger.debug('[NavigationManager] Project switch started', {
          from: activeProject,
          to: targetProjectId,
        });

        // Always navigate to amendments when switching projects
        if (!isNewProject) {
          documentType = 'amendments';
        }

        // Navigate to the new project
        const newPath = `/${tenant}/projects/${targetProjectId}/${documentType}`;

        // Just navigate - let the page component handle context updates
        await router.push(newPath, undefined, { shallow: false });

        // Notify parent
        onProjectSwitch(targetProjectId);

        // Invalidate queries in background - don't block
        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: ['project', targetProjectId],
          });
          queryClient.invalidateQueries({
            queryKey: ['priorArt', targetProjectId],
          });
        }, 0);

        logger.debug('[NavigationManager] Project switch completed', {
          projectId: targetProjectId,
        });
      } catch (error) {
        logger.error('[NavigationManager] Project switch failed:', error);
        throw error;
      }
    },
    [router, activeProject, onProjectSwitch, queryClient]
  );

  // Navigate to projects dashboard
  const navigateToProjects = useCallback(async () => {
    const tenant = getTenantFromRouter(router);
    const targetPath = `/${tenant}/projects`;

    try {
      logger.debug('[NavigationManager] Dashboard navigation started');

      // Check if already on the projects page
      if (router.asPath === targetPath) {
        return;
      }

      // Pre-populate the dashboard cache to eliminate skeleton loader
      if (projects && projects.length > 0) {
        const cacheData = {
          pages: [
            {
              projects: projects,
              pagination: {
                page: 1,
                limit: 20,
                hasNextPage: false,
                nextCursor: undefined,
              },
            },
          ],
          pageParams: [1],
        };
        queryClient.setQueryData(['projects'], cacheData);
        logger.debug('[NavigationManager] Pre-populated dashboard cache');
      }

      // Navigate to projects page with smooth transition
      await router.push(targetPath);

      logger.debug('[NavigationManager] Dashboard navigation completed');
    } catch (error) {
      logger.error('Error during dashboard navigation:', error);
      throw error;
    }
  }, [router, projects, queryClient]);

  // Create handlers object
  const handlers: NavigationHandlers = {
    handleDocumentSelect,
    handleProjectSwitch,
    navigateToProjects,
  };

  return <>{children(handlers)}</>;
};

export default NavigationManager;
