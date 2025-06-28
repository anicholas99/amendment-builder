import { useCallback, useRef, useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { logger } from '@/lib/monitoring/logger';
import { ApplicationVersionWithDocuments } from '@/types/versioning';
import { DocumentUpdate } from '@/client/services/document.client-service';
import { SectionSyncService } from '../services/sectionSyncService';

interface UseOptimisticPatentSaveOptions {
  currentVersion: ApplicationVersionWithDocuments | null | undefined;
  batchUpdateDocumentsMutation: any;
  updateCurrentVersionDocument: (documentId: string, content: string) => void;
  projectId: string | null;
}

interface SaveQueueItem {
  documentId: string;
  content: string;
  timestamp: number;
}

export const useOptimisticPatentSave = ({
  currentVersion,
  batchUpdateDocumentsMutation,
  updateCurrentVersionDocument,
  projectId,
}: UseOptimisticPatentSaveOptions) => {
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Refs for performance
  const saveQueueRef = useRef<Map<string, SaveQueueItem>>(new Map());
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedContentRef = useRef<Map<string, string>>(new Map());
  const optimisticUpdatesRef = useRef<Map<string, string>>(new Map());

  // Process the save queue in background
  const processSaveQueue = useCallback(async () => {
    const queue = Array.from(saveQueueRef.current.values());
    if (queue.length === 0) return;

    // Clear queue immediately to prevent duplicate saves
    saveQueueRef.current.clear();
    setIsSaving(true);

    try {
      // Convert to DocumentUpdate format
      const updates: DocumentUpdate[] = queue.map(item => ({
        documentId: item.documentId,
        content: item.content,
      }));

      // Save in background
      await batchUpdateDocumentsMutation.mutateAsync(updates);

      // Update last saved content
      queue.forEach(item => {
        lastSavedContentRef.current.set(item.documentId, item.content);
      });

      setHasUnsavedChanges(false);

      // Remove success toast - SaveIndicator already shows this
      // toast({
      //   title: 'Saved',
      //   status: 'success',
      //   duration: 800,
      //   isClosable: false,
      //   position: 'bottom-right',
      // });
    } catch (error) {
      logger.error('[OptimisticSave] Save failed', { error });

      // Re-queue failed items
      queue.forEach(item => {
        saveQueueRef.current.set(item.documentId, item);
      });

      setHasUnsavedChanges(true);

      toast({
        title: 'Save failed',
        description: 'Will retry automatically',
        status: 'error',
        duration: 3000,
        position: 'bottom-right',
      });

      // Retry after delay
      saveTimeoutRef.current = setTimeout(() => processSaveQueue(), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [batchUpdateDocumentsMutation, toast]);

  // Queue content update with optimistic UI update
  const queueContentUpdate = useCallback(
    (content: string, forceUpdate = false) => {
      if (!currentVersion) return;

      // Find FULL_CONTENT document
      const fullContentDoc = currentVersion.documents.find(
        d => d.type === 'FULL_CONTENT'
      );

      if (!fullContentDoc) {
        logger.warn('[OptimisticSave] No FULL_CONTENT document found');
        return;
      }

      // Check if content actually changed (skip check if force update)
      if (!forceUpdate) {
        const lastSaved = lastSavedContentRef.current.get(fullContentDoc.id);
        const currentOptimistic = optimisticUpdatesRef.current.get(
          fullContentDoc.id
        );

        if (content === lastSaved || content === currentOptimistic) {
          return; // No change
        }
      }

      // Apply optimistic update immediately for FULL_CONTENT
      optimisticUpdatesRef.current.set(fullContentDoc.id, content);
      updateCurrentVersionDocument(fullContentDoc.id, content);

      // Queue FULL_CONTENT for background save
      saveQueueRef.current.set(fullContentDoc.id, {
        documentId: fullContentDoc.id,
        content,
        timestamp: Date.now(),
      });

      // Extract and queue individual sections using the service
      const sectionUpdates = SectionSyncService.extractSectionUpdates(
        content,
        currentVersion,
        lastSavedContentRef.current
      );

      // Queue section updates
      sectionUpdates.forEach(update => {
        // Apply optimistic update for section
        optimisticUpdatesRef.current.set(update.documentId, update.content);
        updateCurrentVersionDocument(update.documentId, update.content);

        // Queue section for save
        saveQueueRef.current.set(update.documentId, {
          documentId: update.documentId,
          content: update.content,
          timestamp: Date.now(),
        });
      });

      setHasUnsavedChanges(true);

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Schedule save with short delay (400ms for fluid UX)
      saveTimeoutRef.current = setTimeout(() => {
        processSaveQueue();
      }, 400);
    },
    [currentVersion, updateCurrentVersionDocument, processSaveQueue]
  );

  // Force immediate save
  const forceSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await processSaveQueue();
  }, [processSaveQueue]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Initialize last saved content and clear caches when version changes
  useEffect(() => {
    if (currentVersion) {
      // Clear all caches when version changes to prevent stale references
      lastSavedContentRef.current.clear();
      optimisticUpdatesRef.current.clear();
      saveQueueRef.current.clear();
      
      // Initialize with new version's content
      currentVersion.documents.forEach(doc => {
        if (doc.content) {
          lastSavedContentRef.current.set(doc.id, doc.content);
        }
      });
      
      logger.info('[OptimisticSave] Initialized for new version', {
        versionId: currentVersion.id,
        documentCount: currentVersion.documents.length,
      });
    }
  }, [currentVersion?.id]); // Watch version ID to detect changes

  // Clear all pending saves and caches (used when saving new version)
  const clearPendingSaves = useCallback(() => {
    // Clear any pending timeouts
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Clear all queues and caches
    saveQueueRef.current.clear();
    optimisticUpdatesRef.current.clear();
    setHasUnsavedChanges(false);
    
    logger.info('[OptimisticSave] Cleared all pending saves');
  }, []);

  return {
    queueContentUpdate,
    forceSave,
    isSaving,
    hasUnsavedChanges,
    clearPendingSaves,
  };
};
