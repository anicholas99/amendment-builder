/**
 * ProjectAutosaveContext
 *
 * Handles project data autosave logic and change tracking.
 * This is part of the split from UnifiedProjectContext for better maintainability.
 *
 * Responsibilities:
 * - Project content state (inventionData)
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
  useRef,
} from 'react';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import { useUpdateProjectMutation } from '@/hooks/api/useProjects';
import { useUpdateInventionMutation } from '@/hooks/api/useInvention';
import { UpdateProjectData } from '@/types/project';
import { useProjectData } from './ProjectDataContext';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { InventionData } from '@/types/invention';
import { useInventionService } from '@/contexts/ClientServicesContext';
import { useQueryClient } from '@tanstack/react-query';

const AUTOSAVE_DELAY = 2000; // 2 seconds

// Valid fields that can be saved/updated
const SAVEABLE_FIELDS = [
  'title',
  'summary',
  'abstract',
  'novelty',
  'noveltyStatement',
  'patentCategory',
  'technicalField',
  'features',
  'advantages',
  'useCases',
  'processSteps',
  'futureDirections',
  'pendingFigures',
  'elements',
  'claims',
  'priorArt',
  'definitions',
  'technicalImplementation',
  'background',
] as const;

interface ProjectAutosaveContextValue {
  inventionData: InventionData | null;
  textInput: string; // Kept for backward compatibility, maps to inventionData.summary
  isSaving: boolean;
  setInventionData: React.Dispatch<React.SetStateAction<InventionData | null>>;
  setTextInput: React.Dispatch<React.SetStateAction<string>>; // Updates inventionData.summary
  forceSave: () => Promise<boolean>;
}

const ProjectAutosaveContext = createContext<
  ProjectAutosaveContextValue | undefined
>(undefined);

/**
 * Clean invention data to only include saveable fields
 * This prevents sending database fields like id, createdAt, etc.
 */
function cleanInventionData(
  data: InventionData | null
): Partial<InventionData> | null {
  if (!data) return null;

  const cleaned: Partial<InventionData> = {};

  for (const field of SAVEABLE_FIELDS) {
    if (field in data) {
      const value = data[field as keyof InventionData];

      // Special handling for claims - ensure it's an array
      if (
        field === 'claims' &&
        value &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        // Convert object to array if needed
        cleaned[field] = Object.values(value);
      } else if (value !== undefined) {
        cleaned[field] = value as any;
      }
    }
  }

  return cleaned;
}

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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Track the last saved data to detect real changes
  const lastSavedDataRef = useRef<string>('');

  const updateProjectMutation = useUpdateProjectMutation();
  const updateInventionMutation = useUpdateInventionMutation();

  const inventionService = useInventionService();

  // Derive textInput from inventionData.summary for backward compatibility
  const textInput = inventionData?.summary || '';

  // Custom setter that updates inventionData.summary
  const setTextInput = useCallback(
    (value: string | ((prev: string) => string)) => {
      setInventionData(prev => {
        if (!prev) {
          // If no invention data yet, create minimal object with summary
          return {
            summary: typeof value === 'function' ? value('') : value,
          } as InventionData;
        }
        const newValue =
          typeof value === 'function' ? value(prev.summary || '') : value;
        return { ...prev, summary: newValue };
      });
    },
    []
  );

  useEffect(() => {
    if (!activeProjectId) {
      setInventionData(null);
      setIsInitialLoad(true);
      lastSavedDataRef.current = '';
      return;
    }

    let cancelled = false;
    const loadData = async () => {
      setIsInitialLoad(true);
      try {
        // Check React Query cache first to avoid unnecessary API calls
        const cachedData = queryClient.getQueryData<InventionData | null>([
          'invention',
          activeProjectId,
        ]);

        // If we have cached data (including explicit null for new projects), use it
        if (cachedData !== undefined) {
          if (!cancelled) {
            setInventionData(cachedData);
            // Store the initial state to detect changes
            const cleaned = cleanInventionData(cachedData);
            lastSavedDataRef.current = JSON.stringify(cleaned || {});
          }
        } else {
          // Only fetch if not in cache
          const loadedInventionData =
            await inventionService.getInvention(activeProjectId);
          if (!cancelled) {
            // It's normal for new projects to have no invention data (null)
            setInventionData(loadedInventionData);
            // Store the initial state to detect changes
            const cleaned = cleanInventionData(loadedInventionData);
            lastSavedDataRef.current = JSON.stringify(cleaned || {});
          }
        }
      } catch (error) {
        logger.error('[ProjectAutosave] Error loading invention data', {
          projectId: activeProjectId,
          error,
        });
        if (!cancelled) {
          setInventionData(null);
          lastSavedDataRef.current = '';
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
  }, [activeProjectId, queryClient, inventionService]);

  const saveProjectData = useCallback(async () => {
    if (!activeProjectId || isInitialLoad) {
      return false;
    }

    // Only save invention data if it exists and has changes
    if (!inventionData) {
      return true; // Nothing to save is not an error
    }

    // Clean the data to only include saveable fields
    const cleanedData = cleanInventionData(inventionData);
    if (!cleanedData) {
      return true; // Nothing to save
    }

    // Check if there are actual changes
    const currentDataString = JSON.stringify(cleanedData);
    if (currentDataString === lastSavedDataRef.current) {
      logger.debug('[ProjectAutosave] No changes detected, skipping save');
      return true;
    }

    logger.info('[ProjectAutosave] Autosaving project data...', {
      projectId: activeProjectId,
    });

    setIsSaving(true);

    try {
      const result = await inventionService.updateInvention(
        activeProjectId,
        cleanedData
      );
      logger.debug('[ProjectAutosaveContext] Save successful', { result });

      // Update the last saved data reference
      lastSavedDataRef.current = currentDataString;

      return true;
    } catch (error) {
      logger.error('[ProjectAutosaveContext] Save failed', { error });
      toast.error({
        title: 'Autosave Failed',
        description: 'Your latest changes could not be saved.',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [activeProjectId, inventionData, isInitialLoad, inventionService, toast]);

  const [debouncedSave] = useDebouncedCallback(saveProjectData, AUTOSAVE_DELAY);

  useEffect(() => {
    if (!isInitialLoad && inventionData) {
      debouncedSave();
    }
  }, [inventionData, debouncedSave, isInitialLoad]);

  const forceSave = useCallback(async (): Promise<boolean> => {
    // This function can be a direct call to saveProjectData without the debounce
    return saveProjectData();
  }, [saveProjectData]);

  const value = useMemo<ProjectAutosaveContextValue>(
    () => ({
      inventionData,
      textInput,
      isSaving:
        updateProjectMutation.isPending ||
        updateInventionMutation.isPending ||
        isSaving,
      setInventionData,
      setTextInput,
      forceSave,
    }),
    [
      inventionData,
      textInput,
      updateProjectMutation.isPending,
      updateInventionMutation.isPending,
      isSaving,
      setTextInput,
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
