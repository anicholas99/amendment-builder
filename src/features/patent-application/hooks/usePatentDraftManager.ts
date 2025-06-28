import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/monitoring/logger';
import { useDraftDocuments, useBatchUpdateDraftDocuments } from '@/hooks/api/useDraftDocuments';
import { useCreateVersionMutation } from '@/hooks/api/useProjectVersions';
import { extractSections } from '../utils/patent-sections/extractSections';
import { rebuildHtmlContent } from '../utils/patent-sections';
import { getStandardSectionName, PATENT_SECTION_CONFIG } from '../utils/patent-sections/sectionConfig';
import { ProjectApiService } from '@/client/services/project.client-service';
import { createApplicationVersionFromDraft } from '@/repositories/project';
import { versionQueryKeys } from '@/lib/queryKeys/versionQueryKeys';
import { draftQueryKeys } from '@/lib/queryKeys/draftQueryKeys';
import { subscribeToDraftDocumentEvents, DraftDocumentEventDetail } from '../utils/draftDocumentEvents';
import { DraftDocument } from '@/services/api/draftApiService';

interface UsePatentDraftManagerOptions {
  projectId: string;
  enabled?: boolean;
}

interface UsePatentDraftManagerReturn {
  // Content state
  patentContent: string;
  draftDocuments: any[];
  isLoading: boolean;
  
  // Save operations
  queueContentUpdate: (content: string) => void;
  forceSave: (showToast?: boolean) => Promise<void>;
  saveOnBlur: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  
  // Version operations
  handleSaveNewVersion: (versionName: string) => Promise<void>;
  handleLoadVersion: (versionId: string) => Promise<void>;
  isSavingVersion: boolean;
  
  // Query operations
  refetchDraftDocuments: () => Promise<void>;
  
  // Content determination state
  hasContentFromBackend: boolean;
  isContentReady: boolean;
}

/**
 * Hook for managing patent draft content
 * Working draft is always editable, versions are immutable snapshots
 * 
 * Simplified to follow the same patterns as claim refinement and technology details
 */
export const usePatentDraftManager = ({
  projectId,
  enabled = true,
}: UsePatentDraftManagerOptions): UsePatentDraftManagerReturn => {
  const toast = useToast();
  const queryClient = useQueryClient();
  
  /* ------------------------------------------------------------------
   * Synchronous cache hydration to avoid first-paint skeletons
   * ------------------------------------------------------------------
   * When we navigate away and back, React unmounts this hook and its state.
   * However React-Query still keeps the last draft documents in cache.
   * We can leverage that cache *before* the first render to hydrate the
   * local state so `hasInitialLoad` is already true and `isContentReady`
   * in the parent hook doesn't trigger the Skeleton.
   * ------------------------------------------------------------------ */

  // Grab any cached draft docs synchronously (undefined if cache is empty)
  const cachedDraftDocs: DraftDocument[] = (
    queryClient.getQueryData(
      draftQueryKeys.all(projectId)
    ) ?? []
  ) as DraftDocument[];

  // Helper to derive full content from cached docs (mirrors logic below)
  const deriveFullContent = (docs: DraftDocument[] = []): string => {
    if (!docs || docs.length === 0) return '';

    // Always rebuild from sections
    const sectionDocs: Record<string, string> = {};
    docs.forEach((doc: DraftDocument) => {
      if (doc.type && doc.content != null && doc.type !== 'FULL_CONTENT') {
        sectionDocs[doc.type] = doc.content;
      }
    });
    try {
      return Object.keys(sectionDocs).length > 0
        ? rebuildHtmlContent(sectionDocs) || ''
        : '';
    } catch {
      return '';
    }
  };

  const initialContentFromCache: string = deriveFullContent(cachedDraftDocs);

  // State - simplified
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingVersion, setIsSavingVersion] = useState(false);
  // Local content state seeded from cache (prevents flicker)
  const [localContent, setLocalContent] = useState<string>(initialContentFromCache);
  
  // CRITICAL FIX: Check if we have ANY indication that content exists
  // This includes cached content OR if the query has been fetched before
  const hasCachedData = cachedDraftDocs.length > 0 || initialContentFromCache.length > 0;
  const queryState = queryClient.getQueryState(draftQueryKeys.all(projectId));
  const hasBeenFetchedBefore = queryState?.dataUpdatedAt !== undefined && queryState.dataUpdatedAt > 0;
  
  // If we have cached data OR the query has been fetched before, we can consider initial load done
  // This prevents the flicker by immediately showing whatever we have (even if empty)
  const [hasInitialLoad, setHasInitialLoad] = useState(
    hasCachedData || hasBeenFetchedBefore
  );
  
  // Refs for auto-save - simplified like claim refinement
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>('');
  const projectIdRef = useRef<string>(projectId);
  const draftDocumentsRef = useRef<any[]>([]);
  
  // Update refs when props change
  useEffect(() => {
    projectIdRef.current = projectId;
  }, [projectId]);
  
  // Queries
  const {
    data: draftDocsResponse,
    isLoading,
    refetch: refetchQuery,
  } = useDraftDocuments(projectId, {
    enabled: enabled && !!projectId,
  });
  
  const draftDocuments: DraftDocument[] = (draftDocsResponse ?? []) as DraftDocument[];
  
  // Update draft documents ref
  useEffect(() => {
    draftDocumentsRef.current = draftDocuments || [];
  }, [draftDocuments]);
  
  // Mutations
  const batchUpdateMutation = useBatchUpdateDraftDocuments();
  const createVersionMutation = useCreateVersionMutation();
  
  // Process content synchronously from draft documents
  // This eliminates the timing gap that causes UI flicker
  const contentFromDrafts = useMemo(() => {
    if (!draftDocuments || draftDocuments.length === 0) {
      logger.debug('[PatentDraftManager] No draft documents found');
      return '';
    }
    
    // ALWAYS rebuild from sections - no more FULL_CONTENT
    const sectionDocuments: Record<string, string> = {};
    draftDocuments.forEach((doc: DraftDocument) => {
      if (doc.type && doc.content != null && doc.type !== 'FULL_CONTENT') {
        sectionDocuments[doc.type] = doc.content;
        logger.debug(`[PatentDraftManager] Found section: ${doc.type} with ${doc.content.length} chars`);
      }
    });
    
    logger.info(`[PatentDraftManager] Found ${Object.keys(sectionDocuments).length} sections to rebuild`, {
      sectionTypes: Object.keys(sectionDocuments),
    });
    
    if (Object.keys(sectionDocuments).length > 0) {
      try {
        const rebuilt = rebuildHtmlContent(sectionDocuments);
        logger.info(`[PatentDraftManager] Rebuilt content length: ${rebuilt?.length || 0} chars`);
        return rebuilt || '';
      } catch (error) {
        logger.error('[PatentDraftManager] Error rebuilding content from sections', { error });
        return '';
      }
    }
    
    logger.warn('[PatentDraftManager] No sections found to rebuild content');
    return '';
  }, [draftDocuments]);
  
  // Initialize local content from processed draft content
  // SURGICAL FIX: Only sync on initial load, never allow cache to override user edits
  useEffect(() => {
    // CRITICAL GUARD: After initial load, user edits are sacred - never overwrite them
    if (hasInitialLoad) {
      logger.debug('[PatentDraftManager] Initial load complete - protecting user edits from cache overrides');
      return;
    }
    
    // Skip if we have unsaved changes - don't overwrite user edits
    if (hasUnsavedChanges) {
      return;
    }
    
    // Skip if content hasn't changed
    if (contentFromDrafts === lastSavedContentRef.current) {
      return;
    }
    
    // Skip if we already have content and drafts are empty (loading state)
    if (localContent && contentFromDrafts === '') {
      return;
    }
    
    // FIRST-TIME ONLY: Update local content with backend content
    if (contentFromDrafts !== localContent) {
      setLocalContent(contentFromDrafts);
      lastSavedContentRef.current = contentFromDrafts;
      setHasInitialLoad(true); // Raise the flag - from now on, user edits are boss
      logger.info('[PatentDraftManager] Initial content loaded - user edits now protected', {
        contentLength: contentFromDrafts.length,
        projectId
      });
    }
  }, [contentFromDrafts, hasUnsavedChanges, localContent, projectId, hasInitialLoad]);
  
  /* ------------------------------------------------------------------
   * Keep local content in sync with backend AFTER initial load
   * ------------------------------------------------------------------
   * Scenario: we navigated away → forceSave mutation finishes AFTER the
   * component unmounted. When we navigate back, we hydrate from the cache
   * that might still contain the *previous* content. Once React-Query
   * receives the fresh content from the server we want to update the UI –
   * but only when the user hasn't started editing yet to avoid clobbering
   * unsaved changes.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (hasUnsavedChanges) return; // do not overwrite active edits

    const backendContent = contentFromDrafts;

    // If backend delivered new content we haven't reflected locally, sync it
    if (backendContent && backendContent !== localContent) {
      logger.info('[PatentDraftManager] Syncing refreshed backend content', {
        previousLength: localContent.length,
        newLength: backendContent.length,
      });

      setLocalContent(backendContent);
      lastSavedContentRef.current = backendContent;
    }
  }, [contentFromDrafts, hasUnsavedChanges, localContent]);
  
  // Handle project changes without unnecessary refetches
  useEffect(() => {
    if (enabled && projectId) {
      // Only reset state if we're switching to a different project
      if (projectIdRef.current !== projectId) {
        // Reset state when switching projects
        setHasInitialLoad(false);
        setHasUnsavedChanges(false);
        setLocalContent(''); // Clear local content when switching projects
        lastSavedContentRef.current = '';
        
        logger.info('[PatentDraftManager] Project changed, clearing state', {
          projectId,
          previousProjectId: projectIdRef.current
        });
      }
      
      // Update the project ID ref after processing
      projectIdRef.current = projectId;
    }
    
    // Cleanup on unmount
    return () => {
      // Save any pending changes before unmounting
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // If there are unsaved changes, persist them synchronously
        if (hasUnsavedChanges && lastSavedContentRef.current !== localContent) {
          logger.info('[PatentDraftManager] Persisting pending changes before unmount');
          // fire-and-forget – we can't await in cleanup but we still want to trigger
          void forceSave(false);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, enabled]); // Only run when projectId or enabled changes
  
  // Use local content as the patent content - this ensures immediate UI updates
  const patentContent = localContent;
  
  // Force save to draft - simplified
  const forceSave = useCallback(async (showToast: boolean = false) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    const currentProjectId = projectIdRef.current;
    const currentContent = localContent;
    
    if (!currentProjectId || !currentContent || currentContent === lastSavedContentRef.current) {
      logger.debug('[PatentDraftManager] Skipping save - no changes or missing data');
      return;
    }
    
    try {
      // Extract sections from content
      const sections = extractSections(currentContent);
      
      // Normalize section types to prevent duplicates in database
      // Use the centralized configuration for consistency
      const normalizeType = (type: string): string => {
        const standardName = getStandardSectionName(type);
        
        // If we have a standard name from config, use it
        if (standardName) {
          // Get the config to check if we should save this section
          const config = Object.values(PATENT_SECTION_CONFIG).find(
            c => c.standardName === standardName
          );
          
          // Only normalize if the section is configured for auto-creation
          if (config?.autoCreate) {
            return standardName.toUpperCase().replace(/\s+/g, '_');
          }
        }
        
        // Otherwise, keep the original type (normalized to uppercase)
        return type.toUpperCase().replace(/\s+/g, '_');
      };
      
      // Create a map to deduplicate sections with normalized types
      const normalizedSections = new Map<string, string>();
      
      // Process sections and normalize types
      Object.entries(sections).forEach(([type, content]) => {
        const normalizedType = normalizeType(type);
        
        // If we already have this normalized type, merge the content
        if (normalizedSections.has(normalizedType)) {
          const existingContent = normalizedSections.get(normalizedType) || '';
          // Only add if content is different
          if (existingContent !== content) {
            logger.warn('[PatentDraftManager] Duplicate section type detected', {
              originalType: type,
              normalizedType,
              existingLength: existingContent.length,
              newLength: content?.length || 0,
            });
            // Keep the longer content (usually more complete)
            if ((content?.length || 0) > existingContent.length) {
              normalizedSections.set(normalizedType, content || '');
            }
          }
        } else {
          normalizedSections.set(normalizedType, content || '');
        }
      });
      
      // Prepare updates from deduplicated sections
      const updates = Array.from(normalizedSections.entries()).map(([type, content]) => ({
        type,
        content,
      }));
      
      logger.info('[PatentDraftManager] Saving content to backend', {
        projectId: currentProjectId,
        updateCount: updates.length,
        contentLength: currentContent.length,
        types: updates.map(u => u.type), // Log normalized types
        originalSectionCount: Object.keys(sections).length,
        normalizedSectionCount: normalizedSections.size,
      });
      
      await batchUpdateMutation.mutateAsync({
        projectId: currentProjectId,
        updates,
      });
      
      // Update our saved content reference after successful save
      lastSavedContentRef.current = currentContent;
      setHasUnsavedChanges(false);
      
      logger.info('[PatentDraftManager] Content saved successfully');
      
      // Only show toast if explicitly requested (not for auto-save)
      if (showToast) {
        toast({
          title: 'Changes saved',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      logger.error('[PatentDraftManager] Failed to save content', { error });
      toast({
        title: 'Failed to save changes',
        description: 'Please try again',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      throw error;
    }
  }, [localContent, batchUpdateMutation, toast]);
  
  // Queue content update with auto-save - updates local state immediately
  const queueContentUpdate = useCallback((content: string) => {
    // Update local content immediately for instant UI feedback
    setLocalContent(content);
    
    // Check if content actually changed
    const hasChanged = content !== lastSavedContentRef.current;
    
    logger.debug('[PatentDraftManager] queueContentUpdate', {
      contentLength: content.length,
      lastSavedLength: lastSavedContentRef.current.length,
      hasChanged,
    });
    
    if (hasChanged) {
      setHasUnsavedChanges(true);
      
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set new timeout for auto-save (3000ms = 3 seconds to reduce interruptions)
      saveTimeoutRef.current = setTimeout(() => {
        logger.debug('[PatentDraftManager] Auto-saving after timeout');
        forceSave(false).catch(error => {
          logger.error('[PatentDraftManager] Auto-save failed', { error });
        });
      }, 3000);
    } else {
      // Content matches saved, no unsaved changes
      setHasUnsavedChanges(false);
    }
  }, [forceSave]);
  
  // Save on blur handler - saves immediately when editor loses focus
  const saveOnBlur = useCallback(() => {
    if (hasUnsavedChanges) {
      logger.debug('[PatentDraftManager] Save on blur triggered');
      // Clear any pending auto-save timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      // Save immediately without toast
      forceSave(false).catch(error => {
        logger.error('[PatentDraftManager] Save on blur failed', { error });
      });
    }
  }, [hasUnsavedChanges, forceSave]);
  
  // Cleanup on unmount - save any pending changes
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Force save immediately on unmount if there are unsaved changes
        if (hasUnsavedChanges) {
          const currentContent = localContent;
          const currentProjectId = projectIdRef.current;
          
          if (currentProjectId && currentContent && currentContent !== lastSavedContentRef.current) {
            logger.info('[PatentDraftManager] Forcing save on unmount');
            // We need to save synchronously here, but we can't use async hooks
            // The best we can do is trigger the save before cleanup
            forceSave(false);
          }
        }
      }
    };
  }, [hasUnsavedChanges, localContent, forceSave]);
  
  // Save new version from draft
  const handleSaveNewVersion = useCallback(
    async (versionName: string) => {
      if (!projectId) {
        return;
      }
      
      setIsSavingVersion(true);
      
      try {
        // First, ensure draft is saved (with toast since this is a manual action)
        if (hasUnsavedChanges) {
          await forceSave(true);
        }
        
        logger.info('[PatentDraftManager] Creating version from draft', {
          projectId,
          versionName,
        });
        
        // Create version from draft using the new API that doesn't need sections
        const result = await createVersionMutation.mutateAsync({
          projectId,
          payload: {
            name: versionName || `Version ${new Date().toLocaleString()}`,
          },
        });
        
        logger.info('[PatentDraftManager] Version created successfully', {
          versionId: result.id,
          versionName: result.name,
        });
        
        // Invalidate version queries to refresh the list
        await queryClient.invalidateQueries({
          queryKey: versionQueryKeys.all(projectId),
        });
        
        toast({
          title: 'Version Saved',
          description: `Successfully saved version: ${result.name}`,
          status: 'success',
          duration: 3000,
        });
      } catch (error) {
        logger.error('[PatentDraftManager] Error creating version', { error });
        toast({
          title: 'Save Failed',
          description: 'Unable to save version. Please try again.',
          status: 'error',
          duration: 5000,
        });
      } finally {
        setIsSavingVersion(false);
      }
    },
    [projectId, hasUnsavedChanges, forceSave, createVersionMutation, toast, queryClient]
  );
  
  // Load version into draft
  const handleLoadVersion = useCallback(
    async (versionId: string) => {
      if (!projectId || !versionId) {
        return;
      }
      
      try {
        logger.info('[PatentDraftManager] Loading version into draft', {
          projectId,
          versionId,
        });
        
        // Fetch the specific version
        const version = await ProjectApiService.getVersion(projectId, versionId);
        
        if (!version) {
          throw new Error('Version not found');
        }
        
        // Extract sections from version documents
        const updates: Array<{ type: string; content: string }> = [];
        
        version.documents?.forEach((doc: any) => {
          if (doc.type && doc.content != null) {
            updates.push({
              type: doc.type,
              content: doc.content,
            });
          }
        });
        
        if (updates.length === 0) {
          throw new Error('No content found in the selected version');
        }
        
        // Update draft with version content
        await batchUpdateMutation.mutateAsync({ projectId, updates });
        
        // Rebuild content from section updates
        const sectionDocuments: Record<string, string> = {};
        updates.forEach(update => {
          if (update.type !== 'FULL_CONTENT') {
            sectionDocuments[update.type] = update.content;
          }
        });
        
        if (Object.keys(sectionDocuments).length > 0) {
          try {
            const rebuiltContent = rebuildHtmlContent(sectionDocuments);
            setLocalContent(rebuiltContent || '');
            lastSavedContentRef.current = rebuiltContent || '';
            setHasUnsavedChanges(false);
          } catch (error) {
            logger.error('[PatentDraftManager] Error rebuilding content from version sections', { error });
            throw new Error('Failed to rebuild content from version');
          }
        }
        
        toast({
          title: 'Version Restored',
          description: `Working draft has been updated with content from "${version.name}"`,
          status: 'success',
          duration: 3000,
        });
        
        logger.info('[PatentDraftManager] Version loaded into draft', {
          versionId,
          versionName: version.name,
        });
      } catch (error) {
        logger.error('[PatentDraftManager] Error loading version', { error });
        toast({
          title: 'Load Failed',
          description: 'Unable to load the selected version. Please try again.',
          status: 'error',
          duration: 5000,
        });
      }
    },
    [projectId, batchUpdateMutation, toast]
  );
  
  // Query operations
  const refetchDraftDocuments = useCallback(async () => {
    if (!projectId || !enabled) {
      return;
    }
    
    try {
      logger.info('[PatentDraftManager] Refetching draft documents', {
        projectId,
      });
      
      // Refetch the draft documents query
      await refetchQuery();
      
      logger.info('[PatentDraftManager] Draft documents refetched successfully');
    } catch (error) {
      logger.error('[PatentDraftManager] Error refetching draft documents', { error });
      throw error;
    }
  }, [projectId, enabled, refetchQuery]);
  
  // Listen for draft document updates from external sources (e.g., chat agent)
  useEffect(() => {
    if (!projectId) return;
    
    const unsubscribe = subscribeToDraftDocumentEvents((event: DraftDocumentEventDetail) => {
      logger.info('[PatentDraftManager] Draft document update event received', {
        event,
        currentProjectId: projectId,
      });
      
      // Only refetch if this event is for our project
      if (event.projectId === projectId) {
        logger.info('[PatentDraftManager] External update detected for our project');
        
        // If we have unsaved changes, don't sync to avoid losing user edits
        if (hasUnsavedChanges) {
          logger.warn('[PatentDraftManager] Skipping external sync - unsaved changes present');
          toast({
            title: 'External changes detected',
            description: 'Save your changes to see updates from other sources',
            status: 'info',
            duration: 3000,
          });
          return;
        }
        
        // Clear any pending saves to avoid conflicts
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
        
        // Just invalidate the cache - don't force immediate sync
        // The data will be available when the user saves or reloads
        queryClient.invalidateQueries({
          queryKey: ['draft', 'documents', projectId],
          exact: true,
        });
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [projectId, queryClient, hasUnsavedChanges, toast]);
  
  return {
    // Content state
    patentContent,
    draftDocuments,
    isLoading,
    
    // Save operations
    queueContentUpdate,
    forceSave,
    saveOnBlur,
    isSaving: batchUpdateMutation.isPending,
    hasUnsavedChanges,
    
    // Version operations
    handleSaveNewVersion,
    handleLoadVersion,
    isSavingVersion,
    
    // Query operations
    refetchDraftDocuments,
    
    // Content determination state
    hasContentFromBackend: contentFromDrafts.length > 0,
    isContentReady: hasInitialLoad, // Content is truly ready only after initial load is complete
  };
}; 