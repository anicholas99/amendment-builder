import { useEffect, useRef } from 'react';
import { logger } from '@/utils/clientLogger';
import { saveToSessionStorage, clearSessionStorage } from '@/utils/patentAutosaveUtils';

interface UseSessionRecoveryOptions {
  projectId: string;
  content: string;
  hasUnsavedChanges: boolean;
  enabled: boolean;
}

const SESSION_SAVE_INTERVAL = 5000; // 5 seconds

/**
 * Hook for managing session storage crash recovery
 * Periodically saves content to session storage to allow recovery after crashes
 */
export function useSessionRecovery({
  projectId,
  content,
  hasUnsavedChanges,
  enabled,
}: UseSessionRecoveryOptions) {
  const lastSessionSaveRef = useRef<number>(0);

  // Save to session storage periodically for crash recovery
  useEffect(() => {
    if (!enabled || !projectId || !content) return;

    // Save immediately if we have unsaved changes
    if (
      hasUnsavedChanges &&
      Date.now() - lastSessionSaveRef.current > SESSION_SAVE_INTERVAL
    ) {
      const success = saveToSessionStorage(projectId, content);
      if (success) {
        lastSessionSaveRef.current = Date.now();
        logger.debug(
          '[SessionRecovery] Saved to session storage for crash recovery'
        );
      }
    }
  }, [content, hasUnsavedChanges, enabled, projectId]);

  // Clear session storage on unmount if no unsaved changes
  useEffect(() => {
    return () => {
      if (!hasUnsavedChanges && typeof window !== 'undefined') {
        clearSessionStorage(projectId);
      }
    };
  }, [hasUnsavedChanges, projectId]);

  return {
    clearSessionStorage: () => clearSessionStorage(projectId),
  };
} 