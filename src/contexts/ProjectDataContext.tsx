/**
 * ProjectDataContext
 *
 * Provides the globally active project ID. This is its ONLY responsibility.
 * Data fetching and caching are handled by React Query hooks (e.g., useProject).
 */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { logger } from '@/utils/clientLogger';
import {
  useSetActiveProjectMutation,
  useClearActiveProjectMutation,
} from '@/hooks/api/useProjects';
import { useProjectCleanup } from '@/hooks/useProjectCleanup';

interface ProjectDataContextValue {
  activeProjectId: string | null;
  setActiveProject: (projectId: string | null) => void;
}

const ProjectDataContext = createContext<ProjectDataContextValue | undefined>(
  undefined
);

export function ProjectDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(
    null
  );

  const setActiveProjectMutation = useSetActiveProjectMutation();
  const clearActiveProjectMutation = useClearActiveProjectMutation();

  // Use the cleanup hook to clear data when project changes
  useProjectCleanup(activeProjectId);

  const setActiveProject = useCallback(
    (projectId: string | null) => {
      setActiveProjectIdState(currentProjectId => {
        // Prevent unnecessary re-renders if the ID is the same
        if (projectId === currentProjectId) {
          return currentProjectId;
        }

        if (projectId) {
          setActiveProjectMutation.mutate(projectId);
          logger.info('[ProjectData] Active project changed', { projectId });
        } else {
          clearActiveProjectMutation.mutate();
          logger.info('[ProjectData] Active project cleared');
        }
        return projectId;
      });
    },
    [setActiveProjectMutation, clearActiveProjectMutation]
  );

  const value = useMemo<ProjectDataContextValue>(
    () => ({
      activeProjectId,
      setActiveProject,
    }),
    [activeProjectId, setActiveProject]
  );

  return (
    <ProjectDataContext.Provider value={value}>
      {children}
    </ProjectDataContext.Provider>
  );
}

export function useProjectData() {
  const context = useContext(ProjectDataContext);
  if (!context) {
    throw new Error('useProjectData must be used within ProjectDataProvider');
  }
  return context;
}
