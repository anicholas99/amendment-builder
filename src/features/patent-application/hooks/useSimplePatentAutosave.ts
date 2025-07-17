import { useCallback, useRef, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { logger } from '@/utils/clientLogger';
import {
  useDraftDocumentsWithContent,
  useBatchUpdateDraftDocuments,
} from '@/hooks/api/useDraftDocuments';
import { extractSections } from '../utils/patent-sections/extractSections';

interface UseSimplePatentAutosaveOptions {
  projectId: string;
  enabled?: boolean;
  onContentReady?: () => void;
}

interface UseSimplePatentAutosaveReturn {
  // Content from React Query (source of truth)
  // NOTE: Now reflects the most recent pending changes as well
  content: string;
  isLoading: boolean;
  isSaving: boolean;
  
  // Actions
  updateContent: (content: string) => void;
  saveOnBlur: () => void;
}

/**
 * Drastically simplified patent autosave
 * 
 * Core principles:
 * - React Query is the ONLY source of truth
 * - Simple debounced save (1.5s)
 * - Save on blur/unmount
 * - Direct event handling for version restore & agent edits
 * - No complex state management or recovery
 */
export const useSimplePatentAutosave = ({
  projectId,
  enabled = true,
  onContentReady,
}: UseSimplePatentAutosaveOptions): UseSimplePatentAutosaveReturn => {
  // Track pending content and save state
  const pendingContentRef = useRef<string | null>(null);
  const isSavingRef = useRef(false);

  // Local state to provide up-to-date content to consumers (incl. pending edits)
  const [currentContent, setCurrentContent] = useState<string>('');
  
  // Get content from React Query - this is our source of truth
  const { data: draftData, isLoading, refetch } = useDraftDocumentsWithContent(
    projectId,
    { 
      enabled,
    }
  );
  
  // Mutation for saving
  const batchUpdateMutation = useBatchUpdateDraftDocuments();
  
  // Track when content is ready - trigger when data loads successfully
  useEffect(() => {
    if (!isLoading && draftData !== undefined && onContentReady) {
      // Small delay to ensure data has propagated
      const timeoutId = setTimeout(() => {
        logger.info('[SimpleAutosave] Content ready', {
          projectId,
          hasContent: !!draftData?.content,
          contentLength: draftData?.content?.length || 0,
          documentsCount: draftData?.documents?.length || 0,
          firstDocType: draftData?.documents?.[0]?.type || 'none',
          draftDataKeys: draftData ? Object.keys(draftData) : [],
        });
        onContentReady();
      }, 100); // Small delay to let React updates settle
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, draftData, onContentReady, projectId]);

  // Keep local content state in sync with server data (when no pending edits)
  useEffect(() => {
    if (draftData?.content !== undefined && pendingContentRef.current === null) {
      setCurrentContent(draftData.content);
    }
  }, [draftData?.content]);
  
  // Core save function
  const saveContent = useCallback(
    async (content: string) => {
      if (!projectId || !enabled || isSavingRef.current) return;
      
      // Use the most recent pending content if available
      const contentToSave = pendingContentRef.current || content;
      
      try {
        isSavingRef.current = true;
        
        // Extract sections from content
        const sections = extractSections(contentToSave);
        const updates = Object.entries(sections).map(([type, sectionContent]) => ({
          type,
          content: sectionContent,
        }));
        
        logger.info('[SimpleAutosave] Saving content', {
          projectId,
          sectionCount: updates.length,
          contentLength: contentToSave.length,
          hasPendingContent: !!pendingContentRef.current,
        });
        
        // Save to server
        await batchUpdateMutation.mutateAsync({
          projectId,
          updates,
        });
        
        // Clear pending content after successful save
        pendingContentRef.current = null;
        
        logger.debug('[SimpleAutosave] Content saved', {
          projectId,
          sectionCount: updates.length,
        });
      } catch (error) {
        logger.error('[SimpleAutosave] Save failed', { error, projectId });
      } finally {
        isSavingRef.current = false;
      }
    },
    [projectId, enabled, batchUpdateMutation]
  );
  
  // Debounced save (1.5 seconds - optimal for typing)
  const debouncedSave = useDebouncedCallback(saveContent, 1500);
  
  // Update content handler
  const updateContent = useCallback(
    (content: string) => {
      if (!enabled) return;

      logger.info('[SimpleAutosave] updateContent called', {
        projectId,
        length: content.length,
      });

      // Store pending content
      pendingContentRef.current = content;

      // Immediately reflect the change in local state for real-time UI updates
      setCurrentContent(content);
      
      // Cancel previous and schedule new save
      debouncedSave.cancel();
      debouncedSave(content); // Pass content but pendingContentRef takes precedence
    },
    [enabled, debouncedSave]
  );
  
  // Save on blur - immediate save when editor loses focus
  const saveOnBlur = useCallback(() => {
    if (pendingContentRef.current && enabled) {
      debouncedSave.cancel();
      saveContent(pendingContentRef.current);
    }
  }, [enabled, debouncedSave, saveContent]);
  
  // Save on unmount to prevent data loss on view switches
  useEffect(() => {
    return () => {
      if (pendingContentRef.current && enabled) {
        // Use the native fetch API for synchronous save on unmount
        const content = pendingContentRef.current;
        const sections = extractSections(content);
        const updates = Object.entries(sections).map(([type, sectionContent]) => ({
          type,
          content: sectionContent,
        }));
        
        // Fire and forget - browser will complete the request
        fetch(`/api/projects/${projectId}/draft/batch-update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-tenant-slug': window.location.pathname.split('/')[1],
          },
          body: JSON.stringify({ updates }),
          keepalive: true, // Ensures request completes even if page unloads
        }).catch(error => {
          logger.error('[SimpleAutosave] Unmount save failed', { error });
        });
      }
    };
  }, [projectId, enabled]);
  
  // Listen for version restore events
  useEffect(() => {
    if (!projectId || !enabled) return;

    const handleDirectUpdate = (event: CustomEvent) => {
      const { projectId: eventProjectId, source, content: restoredContent } = event.detail;
      
      if (eventProjectId === projectId && source === 'version-restore' && restoredContent) {
        logger.info('[SimpleAutosave] Version restore detected, updating pending content', {
          projectId,
          contentLength: restoredContent.length,
        });
        
        // Clear any pending saves
        debouncedSave.cancel();
        
        // Update the pending content to the restored version
        pendingContentRef.current = restoredContent;

        // Update local state so UI reflects restored content instantly
        setCurrentContent(restoredContent);
        
        // Don't refetch - the editor will handle the content update directly
        // The next time we load, React Query will have the updated content
      }
    };

    window.addEventListener('directEditorContentUpdate', handleDirectUpdate as EventListener);
    
    return () => {
      window.removeEventListener('directEditorContentUpdate', handleDirectUpdate as EventListener);
    };
  }, [projectId, enabled, debouncedSave]);
  
  // Listen for agent section updates - DISABLED: Now handled directly in editor
  /*
  useEffect(() => {
    if (!projectId || !enabled) return;

    const handleSectionUpdate = (event: CustomEvent) => {
      const { projectId: eventProjectId } = event.detail;
      
      if (eventProjectId === projectId) {
        logger.info('[SimpleAutosave] Agent section update detected', {
          projectId,
        });
        
        // Slight delay to let backend process the update
        setTimeout(() => {
          refetch();
        }, 500);
      }
    };

    window.addEventListener('patentSectionUpdated', handleSectionUpdate as EventListener);
    
    return () => {
      window.removeEventListener('patentSectionUpdated', handleSectionUpdate as EventListener);
    };
  }, [projectId, enabled, refetch]);
  */
  
  return {
    content: currentContent,
    isLoading,
    isSaving: isSavingRef.current || batchUpdateMutation.isPending,
    updateContent,
    saveOnBlur,
  };
}; 