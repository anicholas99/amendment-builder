import { useEffect } from 'react';
import { logger } from '@/utils/clientLogger';

interface UseGlobalAutosaveControlsOptions {
  instanceId: string;
  projectId: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  isInitializing: boolean;
  forceSyncInProgressRef: React.MutableRefObject<boolean>;
  onForceSave?: () => Promise<void>;
}

// Extend Window interface for autosave reference
declare global {
  interface Window {
    __patentAutosave?: {
      pause: () => void;
      resume: () => void;
      forceSave: () => Promise<void>;
      getStatus: () => {
        hasUnsavedChanges: boolean;
        isSaving: boolean;
        isInitializing: boolean;
        lastSaved: Date | null;
      };
    };
  }
}

/**
 * Hook for managing global autosave control interface
 * Provides external scripts access to autosave functionality
 */
export function useGlobalAutosaveControls({
  instanceId,
  projectId,
  hasUnsavedChanges,
  isSaving,
  isInitializing,
  forceSyncInProgressRef,
  onForceSave,
}: UseGlobalAutosaveControlsOptions) {
  // Global autosave control interface
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__patentAutosave = {
        pause: () => {
          logger.info('[GlobalAutosaveControls] Paused by external request', {
            instanceId,
            projectId,
          });
          forceSyncInProgressRef.current = true;
        },
        resume: () => {
          logger.info('[GlobalAutosaveControls] Resumed by external request', {
            instanceId,
            projectId,
          });
          forceSyncInProgressRef.current = false;
        },
        forceSave: () => {
          logger.info(
            '[GlobalAutosaveControls] Force save requested by external request',
            {
              instanceId,
              projectId,
            }
          );
          return onForceSave?.() || Promise.resolve();
        },
        getStatus: () => ({
          hasUnsavedChanges,
          isSaving,
          isInitializing,
          lastSaved: hasUnsavedChanges ? null : new Date(),
        }),
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete window.__patentAutosave;
      }
    };
  }, [
    hasUnsavedChanges,
    isSaving,
    isInitializing,
    onForceSave,
    projectId,
    instanceId,
    forceSyncInProgressRef,
  ]);
} 