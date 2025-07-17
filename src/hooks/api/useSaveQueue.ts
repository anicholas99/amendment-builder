import React, { useCallback, useRef, useState } from 'react';
import { logger } from '@/utils/clientLogger';
import { extractSections } from '@/features/patent-application/utils/patent-sections/extractSections';
import { useBatchUpdateDraftDocuments } from '@/hooks/api/useDraftDocuments';
import { clearResetProject, clearSessionStorage } from '@/utils/patentAutosaveUtils';

// Save queue item for managing pending saves
interface SaveQueueItem {
  content: string;
  timestamp: number;
  attempt: number;
}

interface UseSaveQueueOptions {
  projectId: string;
  enabled: boolean;
  instanceId: string;
  forceSyncInProgressRef: React.MutableRefObject<boolean>;
  onSaveSuccess?: (content: string) => void;
  onSaveFailure?: (content: string, error: any) => void;
}

interface UseSaveQueueReturn {
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  queueSave: (content: string) => void;
  processSaveQueue: () => Promise<void>;
  forceSave: (content: string) => Promise<void>;
  clearQueue: () => void;
  getQueuedContent: () => string | null;
  updateSavedContentRef: (content: string) => void;
}

const DEBOUNCE_DELAY = 300; // Optimized for responsive autosave
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000; // 1 second base delay

/**
 * Hook for managing autosave queue with retry logic and debouncing
 * Handles all the complex save orchestration while preventing race conditions
 */
export function useSaveQueue({
  projectId,
  enabled,
  instanceId,
  forceSyncInProgressRef,
  onSaveSuccess,
  onSaveFailure,
}: UseSaveQueueOptions): UseSaveQueueReturn {
  // Save queue management
  const saveQueueRef = useRef<SaveQueueItem | null>(null);
  const activeSavePromiseRef = useRef<Promise<boolean> | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>('');
  const isMountedRef = useRef(true);

  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Mutation for updating draft documents
  const batchUpdateMutation = useBatchUpdateDraftDocuments();

  // Cleanup refs on unmount
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      
      // Clear any pending save timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      // If there's a queued save, attempt it one last time
      if (
        saveQueueRef.current &&
        saveQueueRef.current.content !== lastSavedContentRef.current
      ) {
        logger.warn('[SaveQueue] Attempting final save before unmount', {
          instanceId,
          projectId,
          contentLength: saveQueueRef.current.content.length,
        });

        // Fire and forget - we can't block unmount
        performSaveWithRetry(saveQueueRef.current.content, 0).catch(error => {
          logger.error('[SaveQueue] Final save attempt failed', { error });
        });
      }
    };
  }, []);

  // Perform save with retry logic
  const performSaveWithRetry = useCallback(
    async (contentToSave: string, attemptNumber: number): Promise<boolean> => {
      if (!isMountedRef.current || !enabled || !projectId) {
        logger.warn(
          '[SaveQueue] Cannot save - component unmounted or disabled',
          {
            instanceId,
            isMounted: isMountedRef.current,
            enabled,
            projectId,
          }
        );
        return false;
      }

      // Prevent saves during force sync
      if (forceSyncInProgressRef.current) {
        logger.debug(
          '[SaveQueue] Skipping save - force sync in progress',
          {
            instanceId,
          }
        );
        return false;
      }

      try {
        logger.info('[SaveQueue] Starting save attempt', {
          instanceId,
          attemptNumber,
          contentLength: contentToSave.length,
          projectId,
        });

        // Extract sections from content
        const sections = extractSections(contentToSave);

        // Validate that we have sections to save
        if (Object.keys(sections).length === 0) {
          logger.warn('[SaveQueue] No sections extracted from content', {
            instanceId,
            contentLength: contentToSave.length,
          });
          return false;
        }

        // Prepare updates for each section
        const updates = Object.entries(sections)
          .filter(([type, content]) => {
            // Filter out empty sections
            return content && content.trim().length > 0;
          })
          .map(([type, content]) => ({
            type: type.toUpperCase().replace(/\s+/g, '_'),
            content,
          }));

        // Validate we have updates to send
        if (updates.length === 0) {
          logger.warn(
            '[SaveQueue] No valid sections to save after filtering',
            {
              instanceId,
            }
          );
          return false;
        }

        logger.debug('[SaveQueue] Saving sections', {
          instanceId,
          projectId,
          sectionCount: updates.length,
          sectionTypes: updates.map(u => u.type),
        });

        // Perform the save
        const result = await batchUpdateMutation.mutateAsync({
          projectId,
          updates,
        });

        // Server confirmed the save
        lastSavedContentRef.current = contentToSave;
        saveQueueRef.current = null;
        setHasUnsavedChanges(false);

        // Clear reset flag if we've saved non-empty content
        if (contentToSave.trim().length > 0) {
          clearResetProject(projectId);
        }

        // Clear session storage after successful save
        clearSessionStorage(projectId);

        logger.info('[SaveQueue] Save successful', {
          instanceId,
          projectId,
          sectionCount: updates.length,
        });

        // Notify success callback
        onSaveSuccess?.(contentToSave);

        return true;
      } catch (error) {
        logger.error('[SaveQueue] Save failed', {
          instanceId,
          attemptNumber,
          error,
          projectId,
        });

        // Notify failure callback
        onSaveFailure?.(contentToSave, error);

        // Check if we should retry
        if (attemptNumber < MAX_RETRIES - 1) {
          const retryDelay = BASE_RETRY_DELAY * Math.pow(2, attemptNumber);
          logger.info('[SaveQueue] Scheduling retry', {
            instanceId,
            attemptNumber: attemptNumber + 1,
            retryDelay,
          });

          // Schedule retry
          saveTimeoutRef.current = setTimeout(() => {
            if (saveQueueRef.current && isMountedRef.current) {
              performSaveWithRetry(
                saveQueueRef.current.content,
                attemptNumber + 1
              );
            }
          }, retryDelay);
        } else {
          logger.error(
            '[SaveQueue] Max retries reached, save failed permanently',
            {
              instanceId,
              projectId,
            }
          );
          // Keep the unsaved flag true so user knows there's unsaved content
          setHasUnsavedChanges(true);
        }

        return false;
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false);
        }
      }
    },
    [batchUpdateMutation, projectId, enabled, forceSyncInProgressRef, instanceId, onSaveSuccess, onSaveFailure]
  );

  // Process save queue
  const processSaveQueue = useCallback(async () => {
    // Check if there's already an active save
    if (activeSavePromiseRef.current) {
      logger.debug('[SaveQueue] Save already in progress, queueing', {
        instanceId,
      });
      return;
    }

    // Check if there's content to save
    if (
      !saveQueueRef.current ||
      saveQueueRef.current.content === lastSavedContentRef.current
    ) {
      logger.debug('[SaveQueue] No changes to save', {
        instanceId,
      });
      return;
    }

    // Clear any pending timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    // Create save promise
    const savePromise = (async () => {
      setIsSaving(true);
      const contentToSave = saveQueueRef.current!.content;
      const success = await performSaveWithRetry(contentToSave, 0);

      if (success) {
        // Clear the queue on success
        saveQueueRef.current = null;
      }

      return success;
    })();

    // Track the active save
    activeSavePromiseRef.current = savePromise;

    try {
      await savePromise;
    } finally {
      activeSavePromiseRef.current = null;

      // Check if new content was queued while we were saving
      if (
        saveQueueRef.current &&
        saveQueueRef.current.content !== lastSavedContentRef.current
      ) {
        logger.debug(
          '[SaveQueue] New content queued during save, processing',
          {
            instanceId,
          }
        );
        // Process the new content with a small delay
        saveTimeoutRef.current = setTimeout(() => {
          processSaveQueue();
        }, DEBOUNCE_DELAY);
      }
    }
  }, [performSaveWithRetry, instanceId]);

  // Queue a save (with debouncing)
  const queueSave = useCallback(
    (newContent: string) => {
      // Check if content actually changed
      if (newContent === lastSavedContentRef.current) {
        setHasUnsavedChanges(false);
        return;
      }

      // Track changes
      const hasChanges = newContent !== lastSavedContentRef.current;
      setHasUnsavedChanges(hasChanges);

      if (!hasChanges || !enabled || !projectId) {
        return;
      }

      // Queue the save
      saveQueueRef.current = {
        content: newContent,
        timestamp: Date.now(),
        attempt: 0,
      };

      // Clear any existing save timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounce the save
      saveTimeoutRef.current = setTimeout(() => {
        processSaveQueue();
      }, DEBOUNCE_DELAY);
    },
    [enabled, projectId, processSaveQueue]
  );

  // Force save - bypass debouncing
  const forceSave = useCallback(async (contentToSave: string) => {
    if (!enabled || !projectId) return;

    logger.debug('[SaveQueue] Force save requested', {
      instanceId,
      contentLength: contentToSave.length,
    });

    // Clear any pending timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    // Queue the content
    saveQueueRef.current = {
      content: contentToSave,
      timestamp: Date.now(),
      attempt: 0,
    };

    // Process immediately
    await processSaveQueue();
  }, [enabled, projectId, processSaveQueue, instanceId]);

  // Clear the queue
  const clearQueue = useCallback(() => {
    saveQueueRef.current = null;
    setHasUnsavedChanges(false);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, []);

  // Get queued content
  const getQueuedContent = useCallback(() => {
    return saveQueueRef.current?.content || null;
  }, []);

  // Update saved content reference (for external updates)
  const updateSavedContentRef = useCallback((content: string) => {
    lastSavedContentRef.current = content;
  }, []);

  return {
    isSaving,
    hasUnsavedChanges,
    queueSave,
    processSaveQueue,
    forceSave,
    clearQueue,
    getQueuedContent,
    updateSavedContentRef,
  };
} 