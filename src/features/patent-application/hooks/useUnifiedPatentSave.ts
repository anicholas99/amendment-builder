import { useCallback, useRef, useMemo } from 'react';
import { useToast } from '@chakra-ui/react';
import { logger } from '@/lib/monitoring/logger';
import { ApplicationVersionWithDocuments } from '@/types/versioning';
import { useDocumentSaveQueue } from './useDocumentSaveQueue';
import { DocumentUpdate } from '@/client/services/document.client-service';
import { extractSections } from '../utils/patent-sections';

interface UseUnifiedPatentSaveOptions {
  currentVersion: ApplicationVersionWithDocuments | null | undefined;
  batchUpdateDocumentsMutation: any;
  updateCurrentVersionDocument: (documentId: string, content: string) => void;
  projectId: string | null;
}

export const useUnifiedPatentSave = ({
  currentVersion,
  batchUpdateDocumentsMutation,
  updateCurrentVersionDocument,
  projectId,
}: UseUnifiedPatentSaveOptions) => {
  const toast = useToast();
  const lastSavedContentRef = useRef<Record<string, string>>({});

  // Single save handler for all document updates
  const processSaveChanges = useCallback(
    async (changes: Record<string, string>) => {
      if (!currentVersion) {
        throw new Error('No current version available');
      }

      // Process changes in the background to avoid blocking UI
      return new Promise<void>((resolve, reject) => {
        // Use setTimeout to ensure this runs asynchronously
        setTimeout(async () => {
          try {
            const updates: DocumentUpdate[] = [];
            const processedDocs = new Set<string>();

            // Process changes into document updates
            Object.entries(changes).forEach(([docType, content]) => {
              const doc = currentVersion.documents.find(
                d =>
                  d.type === docType || d.type === docType.replace(/\s+/g, '_')
              );

              // Only save if content actually changed
              if (
                doc?.id &&
                !processedDocs.has(doc.id) &&
                doc.content !== content &&
                lastSavedContentRef.current[doc.id] !== content
              ) {
                updates.push({
                  documentId: doc.id,
                  content:
                    typeof content === 'string'
                      ? content
                      : JSON.stringify(content),
                });
                processedDocs.add(doc.id);
              }
            });

            if (updates.length === 0) {
              logger.debug('[UnifiedSave] No changes to save');
              resolve();
              return;
            }

            logger.info('[UnifiedSave] Saving documents', {
              count: updates.length,
              types: Object.keys(changes),
            });

            // Batch update documents
            await batchUpdateDocumentsMutation.mutateAsync(updates);

            // Update tracking and local state after successful save
            // Use requestAnimationFrame to avoid blocking UI updates
            requestAnimationFrame(() => {
              updates.forEach(update => {
                lastSavedContentRef.current[update.documentId] = update.content;
                updateCurrentVersionDocument(update.documentId, update.content);
              });
            });

            // Show auto-save toast without blocking
            requestAnimationFrame(() => {
              toast({
                title: 'Auto-saved',
                status: 'success',
                duration: 1000,
                isClosable: false,
                position: 'bottom-right',
              });
            });

            resolve();
          } catch (error) {
            logger.error('[UnifiedSave] Save failed', { error });
            reject(error);
          }
        }, 0);
      });
    },
    [
      currentVersion,
      batchUpdateDocumentsMutation,
      updateCurrentVersionDocument,
      toast,
    ]
  );

  // Initialize the save queue with proper debouncing
  const { queueDocumentSave, forceSave, isSaving, hasUnsavedChanges } =
    useDocumentSaveQueue({
      onSave: processSaveChanges,
      debounceMs: 800,
    });

  // Queue a full content update with automatic section extraction
  const queueFullContentUpdate = useCallback(
    (fullContent: string) => {
      if (!currentVersion) return;

      // Queue full content if exists
      const fullContentDoc = currentVersion.documents.find(
        d => d.type === 'FULL_CONTENT'
      );
      if (fullContentDoc) {
        queueDocumentSave('FULL_CONTENT', fullContent);
      }

      // Extract and queue individual sections
      try {
        const extractedSections = extractSections(fullContent);
        Object.entries(extractedSections).forEach(
          ([sectionName, sectionContent]) => {
            const docType = sectionName.toUpperCase().replace(/\s+/g, '_');
            const sectionDoc = currentVersion.documents.find(
              d => d.type === docType || d.type === sectionName.toUpperCase()
            );
            if (sectionDoc) {
              queueDocumentSave(sectionDoc.type, sectionContent);
            }
          }
        );
      } catch (error) {
        logger.error('[UnifiedSave] Error extracting sections', { error });
      }
    },
    [currentVersion, queueDocumentSave]
  );

  // Queue a single section update
  const queueSectionUpdate = useCallback(
    (sectionType: string, content: string) => {
      if (!currentVersion) return;

      const doc = currentVersion.documents.find(
        d =>
          d.type === sectionType || d.type === sectionType.replace(/\s+/g, '_')
      );

      if (doc) {
        queueDocumentSave(doc.type, content);
      }
    },
    [currentVersion, queueDocumentSave]
  );

  // Check if a specific document has unsaved changes
  const hasDocumentChanges = useCallback(
    (documentType: string): boolean => {
      const doc = currentVersion?.documents.find(
        d =>
          d.type === documentType ||
          d.type === documentType.replace(/\s+/g, '_')
      );

      if (!doc) return false;

      return lastSavedContentRef.current[doc.id] !== doc.content;
    },
    [currentVersion]
  );

  return {
    queueFullContentUpdate,
    queueSectionUpdate,
    forceSave,
    isSaving,
    hasUnsavedChanges,
    hasDocumentChanges,
  };
};
