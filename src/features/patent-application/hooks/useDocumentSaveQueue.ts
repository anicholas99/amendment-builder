import { useRef, useCallback, useState, useEffect } from 'react';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { logger } from '@/lib/monitoring/logger';

interface SaveQueueItem {
  documentType: string;
  content: string;
  timestamp: number;
}

interface UseDocumentSaveQueueOptions {
  onSave: (changes: Record<string, string>) => Promise<void>;
  debounceMs?: number;
}

export const useDocumentSaveQueue = ({
  onSave,
  debounceMs = 300,
}: UseDocumentSaveQueueOptions) => {
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Use refs to prevent stale closures
  const queueRef = useRef<Map<string, SaveQueueItem>>(new Map());
  const saveInProgressRef = useRef(false);
  const lastSaveTimestampRef = useRef(0);
  const savedChangesRef = useRef<Record<string, string>>({});

  // Process the save queue
  const processSaveQueue = useCallback(async () => {
    // Prevent concurrent saves
    if (saveInProgressRef.current || queueRef.current.size === 0) {
      return;
    }

    // Check if enough time has passed since last save (rate limiting)
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTimestampRef.current;
    if (timeSinceLastSave < 500) {
      // Wait before next save
      setTimeout(() => processSaveQueue(), 500 - timeSinceLastSave);
      return;
    }

    saveInProgressRef.current = true;
    setIsSaving(true);

    // Use requestIdleCallback to avoid blocking the UI
    const performSave = async () => {
      try {
        // Convert queue to changes object
        const changes: Record<string, string> = {};
        queueRef.current.forEach((item, documentType) => {
          changes[documentType] = item.content;
        });

        // Store changes for error recovery
        savedChangesRef.current = changes;

        // Clear queue before save to prevent duplicate processing
        queueRef.current.clear();

        // Perform the save asynchronously
        await onSave(changes);

        lastSaveTimestampRef.current = Date.now();
        setHasUnsavedChanges(false);

        logger.debug('[SaveQueue] Successfully saved documents', {
          count: Object.keys(changes).length,
        });
      } catch (error) {
        logger.error('[SaveQueue] Error saving documents', { error });
        // Re-queue failed items for retry
        Object.entries(savedChangesRef.current).forEach(
          ([documentType, content]) => {
            queueRef.current.set(documentType, {
              documentType,
              content,
              timestamp: Date.now(),
            });
          }
        );
        setHasUnsavedChanges(true);
      } finally {
        saveInProgressRef.current = false;
        setIsSaving(false);

        // Check if new items were added during save
        if (queueRef.current.size > 0) {
          // Schedule next save with debounce
          debouncedProcessQueue();
        }
      }
    };

    // Use requestIdleCallback if available, otherwise use setTimeout
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => performSave(), {
        timeout: 1000,
      });
    } else {
      setTimeout(() => performSave(), 0);
    }
  }, [onSave]);

  // Debounced queue processor with cancel function
  const [debouncedProcessQueue, cancelDebouncedProcessQueue] =
    useDebouncedCallback(processSaveQueue, debounceMs);

  // Add document to save queue
  const queueDocumentSave = useCallback(
    (documentType: string, content: string) => {
      const existingItem = queueRef.current.get(documentType);

      // Skip if content hasn't changed
      if (existingItem?.content === content) {
        return;
      }

      // Add or update queue item
      queueRef.current.set(documentType, {
        documentType,
        content,
        timestamp: Date.now(),
      });

      setHasUnsavedChanges(true);

      // Trigger debounced save
      debouncedProcessQueue();
    },
    [debouncedProcessQueue]
  );

  // Force save (bypass debounce)
  const forceSave = useCallback(async () => {
    // Cancel pending debounced save
    cancelDebouncedProcessQueue();

    // Process queue immediately
    await processSaveQueue();
  }, [cancelDebouncedProcessQueue, processSaveQueue]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending saves
      cancelDebouncedProcessQueue();

      // Log warning if there are unsaved changes
      if (queueRef.current.size > 0) {
        logger.warn('[SaveQueue] Component unmounting with unsaved changes', {
          count: queueRef.current.size,
        });
      }
    };
  }, [cancelDebouncedProcessQueue]);

  return {
    queueDocumentSave,
    forceSave,
    isSaving,
    hasUnsavedChanges,
    pendingCount: queueRef.current.size,
  };
};
