import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { logger } from '@/utils/clientLogger';

interface UseAutosaveEventsOptions {
  hasUnsavedChanges: boolean;
  enabled: boolean;
  projectId: string;
  instanceId: string;
  contentLength: number;
  onRouteChange?: () => void;
  onBeforeUnload?: () => void;
  onManualSave?: () => void;
}

/**
 * Hook for managing autosave event listeners
 * Handles route changes, page unload warnings, and keyboard shortcuts
 */
export function useAutosaveEvents({
  hasUnsavedChanges,
  enabled,
  projectId,
  instanceId,
  contentLength,
  onRouteChange,
  onBeforeUnload,
  onManualSave,
}: UseAutosaveEventsOptions) {
  const router = useRouter();

  // Auto-save on route change
  useEffect(() => {
    const handleRouteChange = () => {
      if (hasUnsavedChanges && enabled) {
        logger.info('[AutosaveEvents] Auto-saving on route change', {
          instanceId,
          projectId,
          contentLength,
        });
        onRouteChange?.();
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [
    hasUnsavedChanges,
    enabled,
    projectId,
    router.events,
    contentLength,
    instanceId,
    onRouteChange,
  ]);

  // Enhanced beforeunload handling
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && enabled) {
        // Try to save immediately before unload
        logger.warn('[AutosaveEvents] Page unloading with unsaved changes', {
          instanceId,
          projectId,
        });

        // Trigger immediate save (fire and forget)
        onBeforeUnload?.();

        // Show warning dialog
        e.preventDefault();
        e.returnValue =
          'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, enabled, projectId, instanceId, onBeforeUnload]);

  // Add Ctrl+S keyboard shortcut for manual save
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S (or Cmd+S on Mac) to force save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();

        if (hasUnsavedChanges && enabled) {
          logger.info('[AutosaveEvents] Manual save triggered via Ctrl+S', {
            instanceId,
            projectId,
          });
          onManualSave?.();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasUnsavedChanges, enabled, projectId, instanceId, onManualSave]);
} 