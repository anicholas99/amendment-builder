/**
 * ProjectAutosaveContext
 *
 * Handles project data autosave logic and change tracking.
 * This is part of the split from UnifiedProjectContext for better maintainability.
 *
 * Responsibilities:
 * - Project content state (structuredData, textInput)
 * - Change detection
 * - Autosave logic with debouncing
 * - Manual save operations
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useToast } from '@/ui/hooks/useToast';
import { logger } from '@/lib/monitoring/logger';
import { useUpdateProjectMutation } from '@/hooks/api/useProjects';
import { useUpdateInventionMutation } from '@/hooks/api/useInvention';
import { UpdateProjectData } from '@/types/project';
import { useProjectData } from './ProjectDataContext';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { InventionData } from '@/types/invention';
import { inventionClientService } from '@/client/services/invention.client-service';
import { useQueryClient } from '@tanstack/react-query';

const AUTOSAVE_DELAY = 2000; // 2 seconds

interface ProjectAutosaveContextValue {
  inventionData: InventionData | null;
  textInput: string;
  isSaving: boolean;
  setInventionData: React.Dispatch<React.SetStateAction<InventionData | null>>;
  setTextInput: React.Dispatch<React.SetStateAction<string>>;
  forceSave: () => Promise<boolean>;
}

const ProjectAutosaveContext = createContext<
  ProjectAutosaveContextValue | undefined
>(undefined);

export function ProjectAutosaveProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const toast = useToast();
  const { activeProjectId } = useProjectData();
  const queryClient = useQueryClient();

  const [inventionData, setInventionData] = useState<InventionData | null>(
    null
  );
  const [textInput, setTextInput] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const updateProjectMutation = useUpdateProjectMutation();
  const updateInventionMutation = useUpdateInventionMutation();

  useEffect(() => {
    if (!activeProjectId) {
      setInventionData(null);
      setTextInput('');
      setIsInitialLoad(true);
      return;
    }

    let cancelled = false;
    const loadData = async () => {
      setIsInitialLoad(true);
      try {
        // Check React Query cache first to avoid unnecessary API calls
        const cachedData = queryClient.getQueryData<InventionData | null>(['invention', activeProjectId]);
        
        // If we have cached data (including explicit null for new projects), use it
        if (cachedData !== undefined) {
          if (!cancelled) {
            setInventionData(cachedData);
            setTextInput('');
          }
        } else {
          // Only fetch if not in cache
          const loadedInventionData =
            await inventionClientService.getInvention(activeProjectId);
          if (!cancelled) {
            // It's normal for new projects to have no invention data (null)
            setInventionData(loadedInventionData);
            // Assuming textInput is part of the project data, not invention data
            // If it is, it should be loaded here as well. For now, reset it.
            setTextInput('');
          }
        }
      } catch (error) {
        logger.error('[ProjectAutosave] Error loading invention data', {
          projectId: activeProjectId,
          error,
        });
        if (!cancelled) {
          setInventionData(null);
          setTextInput('');
        }
      } finally {
        if (!cancelled) {
          setIsInitialLoad(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [activeProjectId, queryClient]);

  const saveProjectData = useCallback(async () => {
    if (!activeProjectId || isInitialLoad) {
      return false;
    }

    logger.info('[ProjectAutosave] Autosaving project data...', {
      projectId: activeProjectId,
    });

    const promises = [];

    // For simplicity, we save both if they exist.
    // A more advanced implementation could check for dirty state.
    if (textInput) {
      promises.push(
        updateProjectMutation.mutateAsync({
          projectId: activeProjectId,
          data: { textInput },
        })
      );
    }

    if (inventionData) {
      promises.push(
        updateInventionMutation.mutateAsync({
          projectId: activeProjectId,
          updates: inventionData,
        })
      );
    }

    if (promises.length === 0) return true;

    try {
      await Promise.all(promises);
      logger.info('[ProjectAutosave] Autosave successful.', {
        projectId: activeProjectId,
      });
      return true;
    } catch (error) {
      logger.error('[ProjectAutosave] Autosave failed.', { error });
      toast.error({
        title: 'Autosave Failed',
        description: 'Your latest changes could not be saved.',
      });
      return false;
    }
  }, [
    activeProjectId,
    textInput,
    inventionData,
    updateProjectMutation,
    updateInventionMutation,
    toast,
    isInitialLoad,
  ]);

  const [debouncedSave] = useDebouncedCallback(saveProjectData, AUTOSAVE_DELAY);

  useEffect(() => {
    if (!isInitialLoad) {
      debouncedSave();
    }
  }, [textInput, inventionData, debouncedSave, isInitialLoad]);

  const forceSave = useCallback(async (): Promise<boolean> => {
    // This function can be a direct call to saveProjectData without the debounce
    return saveProjectData();
  }, [saveProjectData]);

  const value = useMemo<ProjectAutosaveContextValue>(
    () => ({
      inventionData,
      textInput,
      isSaving:
        updateProjectMutation.isPending || updateInventionMutation.isPending,
      setInventionData,
      setTextInput,
      forceSave,
    }),
    [
      inventionData,
      textInput,
      updateProjectMutation.isPending,
      updateInventionMutation.isPending,
      forceSave,
    ]
  );

  return (
    <ProjectAutosaveContext.Provider value={value}>
      {children}
    </ProjectAutosaveContext.Provider>
  );
}

export function useProjectAutosave() {
  const context = useContext(ProjectAutosaveContext);
  if (!context) {
    throw new Error(
      'useProjectAutosave must be used within ProjectAutosaveProvider'
    );
  }
  return context;
}
