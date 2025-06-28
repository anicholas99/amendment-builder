import { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { useDeferredValue } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { useDraftDocuments, useBatchUpdateDraftDocuments } from '@/hooks/api/useDraftDocuments';
import { rebuildHtmlContent } from '../utils/patent-sections';
import { extractSections } from '../utils/patent-sections/extractSections';
import { useToast } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { draftQueryKeys } from '@/lib/queryKeys/draftQueryKeys';

interface UsePatentAutosaveOptions {
  projectId: string;
  enabled?: boolean;
  initialContent?: string;
}

interface UsePatentAutosaveReturn {
  // Content state
  content: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  isLoading: boolean;
  
  // Actions
  updateContent: (content: string) => void;
  saveOnBlur: () => void;
  forceSave: () => Promise<void>;
}

/**
 * Unified patent autosave hook - simplified, performant, and maintainable
 * 
 * Key principles:
 * - Works with TipTap's debounced updates (editor handles debouncing)
 * - Saves individual sections (no FULL_CONTENT duplication)
 * - Minimal state management
 * - Follows established codebase patterns
 * - Uses draft documents (mutable) not version documents (immutable)
 */
export const usePatentAutosave = ({
  projectId,
  enabled = true,
  initialContent,
}: UsePatentAutosaveOptions): UsePatentAutosaveReturn => {
  const instanceId = useRef(`autosave-${Date.now()}`);
  const isMountedRef = useRef(true);
  const contentRef = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const [content, setContent] = useState<string>(initialContent || '');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Defer content updates to reduce re-render frequency
  const deferredContent = useDeferredValue(content);
  
  logger.debug('[PatentAutosave] Hook instance created', { 
    instanceId,
    projectId,
    enabled,
  });
  
  // Refs for performance
  const lastSavedContentRef = useRef('');
  const pendingContentRef = useRef<string | null>(null);
  const pendingSaveRef = useRef<Promise<void> | null>(null);
  
  // Query for draft documents
  const { data: draftDocuments, isLoading } = useDraftDocuments(projectId, { enabled });
  
  // Mutation for updating draft documents
  const batchUpdateMutation = useBatchUpdateDraftDocuments();
  
  // Track if we've already initialized content
  const hasInitializedRef = useRef(false);
  
  // Flag to track if we need to save pending content
  const shouldSavePendingRef = useRef(false);
  
  // Set mounted state on mount
  useEffect(() => {
    isMountedRef.current = true;
    logger.debug('[PatentAutosave] Component mounted', { 
      instanceId,
      projectId,
      enabled,
    });
    
    return () => {
      isMountedRef.current = false;
      logger.debug('[PatentAutosave] Component unmounting', { 
        instanceId,
        projectId,
        hasUnsavedChanges,
        pendingContent: !!pendingContentRef.current,
        hasPendingSave: !!pendingSaveRef.current,
      });
      
      // Clear any pending save timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      
      // Wait for any pending save to complete
      if (pendingSaveRef.current) {
        logger.warn('[PatentAutosave] Waiting for pending save to complete before unmount', {
          instanceId,
          projectId,
        });
        // Note: We can't actually block unmount, but we can let the save continue
        // The save will check isMountedRef and handle accordingly
      }
      
      // Try to save any pending content before unmounting
      if (pendingContentRef.current && pendingContentRef.current !== lastSavedContentRef.current) {
        logger.warn('[PatentAutosave] Unmounting with unsaved changes', {
          instanceId,
          projectId,
          contentLength: pendingContentRef.current.length,
        });
        
        // Store the unsaved content in the query cache for when we come back
        // This prevents data loss when switching views quickly
        queryClient.setQueryData(
          ['patent-autosave-pending', projectId],
          pendingContentRef.current
        );
      }
    };
  }, [instanceId, projectId, hasUnsavedChanges, queryClient]);
  
  // Initialize content from draft documents
  useEffect(() => {
    if (!draftDocuments || !enabled || isLoading) return;
    
    // Check if we have pending content from a previous unmount
    const pendingContent = queryClient.getQueryData<string>(['patent-autosave-pending', projectId]);
    if (pendingContent && !hasInitializedRef.current) {
      logger.info('[PatentAutosave] Restoring pending content from previous session', {
        instanceId,
        projectId,
        contentLength: pendingContent.length,
      });
      
      setContent(pendingContent);
      pendingContentRef.current = pendingContent;
      setHasUnsavedChanges(true);
      hasInitializedRef.current = true;
      shouldSavePendingRef.current = true;
      
      // Clear the pending content from cache
      queryClient.removeQueries({ queryKey: ['patent-autosave-pending', projectId] });
      
      return;
    }
    
    // Don't reinitialize if we already have content or unsaved changes
    if (hasInitializedRef.current || hasUnsavedChanges || content.length > 0) {
      logger.debug('[PatentAutosave] Skipping draft initialization', {
        instanceId,
        hasInitialized: hasInitializedRef.current,
        hasUnsavedChanges,
        hasLocalContent: content.length > 0,
      });
      return;
    }
    
    // Type guard to ensure draftDocuments is an array
    const docs = Array.isArray(draftDocuments) ? draftDocuments : [];
    
    // Rebuild content from sections
    const sectionDocuments: Record<string, string> = {};
    docs.forEach((doc: any) => {
      if (doc.type && doc.content != null && doc.type !== 'FULL_CONTENT') {
        sectionDocuments[doc.type] = doc.content;
      }
    });
    
    if (Object.keys(sectionDocuments).length > 0) {
      try {
        const rebuiltContent = rebuildHtmlContent(sectionDocuments);
        if (rebuiltContent) {
          setContent(rebuiltContent);
          lastSavedContentRef.current = rebuiltContent;
          hasInitializedRef.current = true;
          
          logger.debug('[PatentAutosave] Initialized content from sections', {
            instanceId,
            projectId,
            sectionCount: Object.keys(sectionDocuments).length,
            contentLength: rebuiltContent.length,
          });
        }
      } catch (error) {
        logger.error('[PatentAutosave] Error rebuilding content from sections', { error });
      }
    }
  }, [draftDocuments, projectId, enabled, isLoading, instanceId, queryClient]);
  
  // Perform save - minimal and efficient
  const performSave = useCallback(
    async (providedContent?: string): Promise<void> => {
      // Prevent concurrent saves
      if (pendingSaveRef.current) {
        logger.debug('[PatentAutosave] Save already in progress, skipping', { instanceId });
        return;
      }
      
      logger.debug('[PatentAutosave] performSave called', {
        instanceId,
        isMounted: isMountedRef.current,
        hasContentToSave: !!providedContent,
        contentLength: providedContent?.length || pendingContentRef.current?.length,
      });
      
      if (!isMountedRef.current || !enabled || !projectId) {
        logger.warn('[PatentAutosave] Component unmounted or disabled, skipping save', { 
          instanceId,
          isMounted: isMountedRef.current,
          enabled,
          projectId,
        });
        return;
      }
      
      // Use provided content or pending content
      const finalContent = providedContent || pendingContentRef.current || '';
      
      // Skip if content hasn't changed or is empty
      if (!finalContent || finalContent === lastSavedContentRef.current) {
        logger.debug('[PatentAutosave] Skipping save - no changes or empty content', {
          hasContent: !!finalContent,
          contentChanged: finalContent !== lastSavedContentRef.current,
        });
        return;
      }
      
      // Create save promise to track concurrent saves
      pendingSaveRef.current = (async () => {
        logger.info('[PatentAutosave] Starting save process', {
          instanceId,
          contentLength: finalContent.length,
          projectId,
        });

        setIsSaving(true);

        try {
          // Validate mount state before starting
          if (!isMountedRef.current) {
            logger.warn('[PatentAutosave] Component unmounted before save start', { instanceId });
            return;
          }

          logger.debug('[PatentAutosave] Extracting sections from content', {
            projectId,
            contentLength: finalContent.length,
          });
          
          // Extract sections from content
          const sections = extractSections(finalContent);
          
          // Prepare updates for each section
          const updates = Object.entries(sections).map(([type, content]) => ({
            type: type.toUpperCase().replace(/\s+/g, '_'),
            content,
          }));
          
          logger.debug('[PatentAutosave] Saving sections', {
            instanceId,
            projectId,
            sectionCount: updates.length,
            sectionTypes: updates.map(u => u.type),
            sampleContent: updates[0] ? {
              type: updates[0].type,
              firstChars: updates[0].content.substring(0, 100),
            } : null,
          });
          
          // Final check before async operation
          if (!isMountedRef.current) {
            logger.warn('[PatentAutosave] Component unmounted before save', {
              instanceId,
              projectId,
            });
            return;
          }
          
          const result = await batchUpdateMutation.mutateAsync({
            projectId,
            updates,
          });
          
          // Check if mutation was successful
          if (batchUpdateMutation.isError) {
            logger.error('[PatentAutosave] Mutation failed', {
              instanceId,
              error: batchUpdateMutation.error,
            });
            return;
          }
          
          // Update tracking after successful save
          lastSavedContentRef.current = finalContent;
          pendingContentRef.current = null;
          setHasUnsavedChanges(false);
          
          logger.info('[PatentAutosave] Draft sections saved successfully', {
            instanceId,
            projectId,
            sectionCount: updates.length,
            result,
          });
        } catch (error) {
          logger.error('[PatentAutosave] Save failed', { 
            instanceId,
            error,
            projectId,
          });
          // Don't throw - autosave failures should be silent
        } finally {
          if (isMountedRef.current) {
            setIsSaving(false);
          }
          pendingSaveRef.current = null;
        }
      })();
    }, [batchUpdateMutation, projectId, enabled, instanceId]);
  
  // Update content - no debouncing needed, editor handles that
  const updateContent = useCallback((newContent: string) => {
    // Check if content actually changed
    if (newContent === content && newContent === pendingContentRef.current) {
      logger.debug('[PatentAutosave] updateContent called with same content, skipping', {
        instanceId,
      });
      return;
    }
    
    logger.info('[PatentAutosave] updateContent called', {
      instanceId,
      contentLength: newContent.length,
      lastSavedLength: lastSavedContentRef.current.length,
      contentPreview: newContent.substring(0, 100),
      enabled,
      projectId,
      isMounted: isMountedRef.current,
    });
    
    // Immediate UI update for responsive feel
    setContent(newContent);
    pendingContentRef.current = newContent;
    
    // Track unsaved changes
    const hasChanges = newContent !== lastSavedContentRef.current;
    setHasUnsavedChanges(hasChanges);
    
    logger.info('[PatentAutosave] Content changes detected', {
      instanceId,
      hasChanges,
      enabled,
      willSave: hasChanges && enabled,
    });
    
    if (!hasChanges || !enabled || !projectId) {
      logger.debug('[PatentAutosave] Skipping save', {
        instanceId,
        reason: !hasChanges ? 'no changes' : (!enabled ? 'not enabled' : 'no projectId'),
      });
      return;
    }
    
    // Don't save immediately - the TipTap editor will call this function
    // with its debounced content after 2 seconds of no typing
    logger.info('[PatentAutosave] Content updated, waiting for editor debounce', {
      instanceId,
      contentLength: newContent.length,
    });
    
    // Perform the save
    performSave(newContent);
  }, [performSave, enabled, projectId, instanceId, content]);
  
  // Save on blur - immediate save when editor loses focus
  const saveOnBlur = useCallback(() => {
    if (!hasUnsavedChanges || !enabled) return;
    
    logger.debug('[PatentAutosave] Save on blur triggered', {
      instanceId,
      projectId,
      hasUnsavedChanges,
      isMounted: isMountedRef.current,
    });
    
    // Save immediately with pending content
    performSave();
  }, [hasUnsavedChanges, performSave, enabled, instanceId, projectId]);
  
  // Force save - bypass any pending operations
  const forceSave = useCallback(async () => {
    if (!enabled) return;
    
    // Save immediately
    await performSave();
  }, [performSave, enabled]);
  
  // Handle saving of restored pending content
  useEffect(() => {
    if (shouldSavePendingRef.current && pendingContentRef.current && isMountedRef.current) {
      shouldSavePendingRef.current = false;
      
      logger.info('[PatentAutosave] Saving restored pending content', {
        instanceId,
        projectId,
        contentLength: pendingContentRef.current.length,
      });
      
      // Trigger save after a small delay to ensure everything is initialized
      setTimeout(() => {
        if (isMountedRef.current && pendingContentRef.current) {
          performSave(pendingContentRef.current);
        }
      }, 100);
    }
  }, [performSave, projectId, instanceId]);
  
  return {
    content: deferredContent,
    hasUnsavedChanges,
    isSaving,
    isLoading,
    updateContent,
    saveOnBlur,
    forceSave,
  };
}; 