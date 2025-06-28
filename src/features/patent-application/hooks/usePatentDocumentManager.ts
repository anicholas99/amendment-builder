import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { logger } from '@/lib/monitoring/logger';
import {
  extractSections,
  rebuildContent,
  rebuildHtmlContent,
} from '../utils/patent-sections';
import { DocumentUpdate } from '@/client/services/document.client-service';
import { ApplicationVersionWithDocuments } from '@/types/versioning';
import { InventionData } from '@/types/invention';
import { useDocumentSaveQueue } from './useDocumentSaveQueue';

export const usePatentDocumentManager = ({
  currentVersion,
  updateCurrentVersionDocument,
  batchUpdateDocumentsMutation,
  saveFullContentMutation,
  analyzedInvention,
  projectId,
}: {
  currentVersion: ApplicationVersionWithDocuments | null | undefined;
  updateCurrentVersionDocument: (documentId: string, content: string) => void;
  batchUpdateDocumentsMutation: any;
  saveFullContentMutation: any;
  analyzedInvention: InventionData | null;
  projectId: string | null;
}) => {
  const toast = useToast();
  const isMountedRef = useRef(true);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const getPatentContent = useCallback(() => {
    if (!currentVersion) {
      logger.warn('[getPatentContent] No current version available');
      return '';
    }
    const htmlDoc = currentVersion.documents.find(
      d => d.type === 'FULL_CONTENT'
    );
    if (htmlDoc?.content) {
      return htmlDoc.content;
    }
    const sectionDocuments: Record<string, string> = {};
    currentVersion.documents.forEach(doc => {
      if (doc.type && doc.content != null && doc.type !== 'FULL_CONTENT') {
        sectionDocuments[doc.type] = doc.content;
      }
    });
    if (Object.keys(sectionDocuments).length > 0) {
      return rebuildHtmlContent(sectionDocuments);
    }
    const firstDoc = currentVersion.documents[0];
    return firstDoc?.content ?? '';
  }, [currentVersion?.id, refreshCounter]);

  const patentContent = useMemo(() => {
    return getPatentContent();
  }, [currentVersion?.id, refreshCounter]);

  const hasGenerated = useMemo(() => {
    const hasDocumentContent =
      currentVersion?.documents?.some(
        doc => doc.content && doc.content.trim() !== ''
      ) ?? false;
    return hasDocumentContent;
  }, [currentVersion]);

  // Save handler that processes pending changes
  const processSaveChanges = useCallback(
    async (changes: Record<string, string>) => {
      if (!currentVersion) {
        throw new Error('No current version available');
      }

      const updates: DocumentUpdate[] = [];
      const processedDocs = new Set<string>();

      // Process changes into document updates
      Object.entries(changes).forEach(([docType, content]) => {
        const doc = currentVersion.documents.find(
          d => d.type === docType || d.type === docType.replace(/\s+/g, '_')
        );
        if (doc?.id && !processedDocs.has(doc.id) && doc.content !== content) {
          updates.push({
            documentId: doc.id,
            content:
              typeof content === 'string' ? content : JSON.stringify(content),
          });
          processedDocs.add(doc.id);
        }
      });

      if (updates.length === 0) {
        return; // No actual changes to save
      }

      // Batch update documents
      await batchUpdateDocumentsMutation.mutateAsync(updates);

      // Update local state after successful save
      updates.forEach(update => {
        updateCurrentVersionDocument(update.documentId, update.content);
      });

      // Show auto-save toast
      if (isMountedRef.current) {
        toast({
          title: 'Auto-saved',
          status: 'success',
          duration: 1000,
          isClosable: false,
          position: 'bottom-right',
        });
      }
    },
    [
      currentVersion,
      batchUpdateDocumentsMutation,
      updateCurrentVersionDocument,
      toast,
    ]
  );

  // Initialize the save queue
  const { queueDocumentSave, forceSave, isSaving, hasUnsavedChanges } =
    useDocumentSaveQueue({
      onSave: processSaveChanges,
      debounceMs: 500,
    });

  const handleRebuildSections = useCallback(() => {
    if (!patentContent) {
      toast({
        title: 'Error',
        description: 'No patent content found',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    try {
      const newSections = extractSections(patentContent);
      logger.debug('[PatentDocumentManager] Rebuilding sections:', {
        extractedSectionCount: Object.keys(newSections).length,
        extractedSectionNames: Object.keys(newSections),
      });

      if (currentVersion) {
        let updatesQueued = 0;
        Object.entries(newSections).forEach(([sectionName, content]) => {
          const docType = sectionName.toUpperCase().replace(/\s+/g, '_');
          const doc = currentVersion.documents.find(
            d => d.type === docType || d.type === sectionName.toUpperCase()
          );

          if (doc && doc.content !== content) {
            logger.debug('[PatentDocumentManager] Rebuilding section:', {
              sectionName,
              docType: doc.type,
              contentChanged: true,
            });
            queueDocumentSave(doc.type, content);
            updatesQueued++;
          } else if (!doc) {
            logger.warn(
              '[PatentDocumentManager] Section document not found for rebuild:',
              {
                sectionName,
                attemptedDocType: docType,
              }
            );
          }
        });

        logger.debug('[PatentDocumentManager] Rebuild summary:', {
          totalSections: Object.keys(newSections).length,
          updatesQueued,
        });

        // Force immediate save for rebuild
        forceSave();
      }
    } catch (error) {
      logger.error('Error rebuilding sections', { error });
    }
  }, [patentContent, currentVersion, queueDocumentSave, forceSave, toast]);

  const handleSaveContent = useCallback(
    async (showToast: boolean = true, newContent?: string) => {
      const contentToSave = newContent ?? patentContent;
      if (!contentToSave || !currentVersion) {
        return;
      }

      // Log current version documents
      logger.debug('[PatentDocumentManager] Current version documents:', {
        versionId: currentVersion.id,
        documentCount: currentVersion.documents.length,
        documentTypes: currentVersion.documents.map(d => ({
          id: d.id,
          type: d.type,
          contentLength: d.content?.length || 0,
        })),
      });

      try {
        const htmlDoc = currentVersion.documents.find(
          d => d.type === 'FULL_CONTENT'
        );
        if (htmlDoc) {
          if (htmlDoc.content !== contentToSave) {
            queueDocumentSave('FULL_CONTENT', contentToSave);
          }
        } else {
          try {
            await saveFullContentMutation.mutateAsync({
              content: contentToSave,
            });
          } catch (err) {
            logger.error('Error saving full content', { error: err });
          }
        }

        try {
          const extractedSections = extractSections(contentToSave);
          logger.debug('[PatentDocumentManager] Extracted sections:', {
            sectionCount: Object.keys(extractedSections).length,
            sectionNames: Object.keys(extractedSections),
            currentVersionDocs: currentVersion.documents.map(d => ({
              type: d.type,
              contentLength: d.content?.length || 0,
            })),
          });

          Object.entries(extractedSections).forEach(
            ([sectionName, sectionContent]) => {
              const docType = sectionName.toUpperCase().replace(/\s+/g, '_');
              const sectionDoc = currentVersion.documents.find(
                d => d.type === docType || d.type === sectionName.toUpperCase()
              );

              logger.debug('[PatentDocumentManager] Processing section:', {
                sectionName,
                docType,
                foundDoc: !!sectionDoc,
                docId: sectionDoc?.id,
                existingDocType: sectionDoc?.type,
                contentMatches: sectionDoc?.content === sectionContent,
                newContentLength: sectionContent.length,
                existingContentLength: sectionDoc?.content?.length || 0,
              });

              if (sectionDoc && sectionDoc.content !== sectionContent) {
                logger.debug(
                  '[PatentDocumentManager] Queueing section update:',
                  {
                    docType: sectionDoc.type,
                    docId: sectionDoc.id,
                    contentChanged: true,
                  }
                );
                queueDocumentSave(sectionDoc.type, sectionContent);
              } else if (!sectionDoc) {
                logger.warn(
                  '[PatentDocumentManager] Section document not found:',
                  {
                    sectionName,
                    docType,
                    availableTypes: currentVersion.documents.map(d => d.type),
                  }
                );
              }
            }
          );
        } catch (sectionError) {
          logger.error('Error extracting sections', { error: sectionError });
        }

        if (showToast) {
          await forceSave();
          toast({
            title: 'Saved',
            status: 'success',
            duration: 2000,
            isClosable: true,
          });
        }
      } catch (error) {
        logger.error('Error processing content for save', { error });
      }
    },
    [
      currentVersion,
      patentContent,
      queueDocumentSave,
      forceSave,
      saveFullContentMutation,
      toast,
    ]
  );

  const handleSyncClaims = useCallback(() => {
    if (!analyzedInvention?.claims) {
      return;
    }
    try {
      const claims = analyzedInvention.claims || {};
      const sortedClaims = Object.entries(claims)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([number, claim]) => `${number}. ${claim}`);
      const claimsContent = sortedClaims.join('\n\n');

      if (currentVersion) {
        const claimsDocType = 'CLAIM_SET';
        const claimsDoc = currentVersion.documents.find(
          d => d.type === claimsDocType
        );
        if (claimsDoc && claimsDoc.content !== claimsContent) {
          queueDocumentSave(claimsDocType, claimsContent);
          forceSave();
        }
      }
    } catch (error) {
      logger.error('Error syncing claims', { error });
    }
  }, [analyzedInvention, currentVersion, queueDocumentSave, forceSave]);

  const refreshContent = useCallback(() => {
    setRefreshCounter(prev => prev + 1);
  }, []);

  return {
    patentContent,
    hasGenerated,
    handleRebuildSections,
    handleSaveContent,
    handleSyncClaims,
    refreshContent,
    isSaving,
    hasUnsavedChanges,
  };
};
