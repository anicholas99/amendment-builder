import { useEffect, useRef, useState } from 'react';
import { logger } from '@/utils/clientLogger';
import { useDraftDocuments } from '@/hooks/api/useDraftDocuments';
import { rebuildHtmlContent } from '@/features/patent-application/utils/patent-sections';
import { isDifferentContent, isResetProject } from '@/utils/patentAutosaveUtils';

interface UseContentInitializationOptions {
  projectId: string;
  enabled: boolean;
  initialContent?: string;
  instanceId: string;
  hasUnsavedChanges: boolean;
  currentContent: string;
  onContentLoaded?: (content: string) => void;
}

interface UseContentInitializationReturn {
  isLoading: boolean;
  isInitializing: boolean;
  draftDocuments: any[] | undefined;
  markAsInitialized: () => void;
  clearInitialization: () => void;
}

/**
 * Hook for managing content initialization from draft documents
 * Handles loading content from the server and managing initialization state
 */
export function useContentInitialization({
  projectId,
  enabled,
  initialContent,
  instanceId,
  hasUnsavedChanges,
  currentContent,
  onContentLoaded,
}: UseContentInitializationOptions): UseContentInitializationReturn {
  const hasInitializedRef = useRef(false);
  const lastInitialContentRef = useRef<string>('');
  
  // Track if we're still initializing from draft documents
  const [isInitializing, setIsInitializing] = useState(() => {
    if (initialContent && initialContent.trim().length > 0) {
      return false;
    }
    return true;
  });

  // Query for draft documents
  const projectWasReset = isResetProject(projectId);

  const { data: draftDocuments, isLoading } = useDraftDocuments(projectId, {
    enabled,
    skipInit: projectWasReset,
  });

  // Handle changes to initialContent after the hook has started
  useEffect(() => {
    if (!enabled || !projectId || initialContent === undefined || initialContent === null) return;

    // Check if initial content has actually changed
    if (initialContent !== lastInitialContentRef.current) {
      logger.info(
        '[ContentInitialization] Initial content changed from parent',
        {
          instanceId,
          projectId,
          oldLength: lastInitialContentRef.current.length,
          newLength: initialContent.length,
          currentContentLength: currentContent.length,
          hasUnsavedChanges,
        }
      );
      
      lastInitialContentRef.current = initialContent;

      // Only update if we don't have unsaved changes
      if (!hasUnsavedChanges) {
        logger.info(
          '[ContentInitialization] Updating content with new initial content',
          {
            instanceId,
            projectId,
            contentLength: initialContent.length,
          }
        );

        onContentLoaded?.(initialContent);
        hasInitializedRef.current = true;
        setIsInitializing(false);
      } else {
        logger.info(
          '[ContentInitialization] Skipping update - user has unsaved changes',
          {
            instanceId,
            projectId,
          }
        );
      }
    }
  }, [initialContent, enabled, projectId, hasUnsavedChanges, instanceId, currentContent, onContentLoaded]);

  // Update initializing state based on actual initialization status
  useEffect(() => {
    if (hasInitializedRef.current && currentContent.length > 0) {
      setIsInitializing(false);
    }
  }, [currentContent.length]);

  // Initialize content from draft documents
  useEffect(() => {
    if (!draftDocuments || !enabled || isLoading) {
      return;
    }

    // IMPORTANT: If initialContent is provided, we should NEVER rebuild from draft documents
    // The parent component is responsible for managing content updates
    if (initialContent !== undefined && initialContent !== null) {
      if (!hasInitializedRef.current) {
        logger.debug('[ContentInitialization] Skipping draft rebuild - using parent-provided content', {
          instanceId,
          projectId,
          initialContentLength: initialContent.length,
        });
        hasInitializedRef.current = true;
        setIsInitializing(false);
      }
      return;
    }

    // Skip initialization if project was reset
    if (projectWasReset) {
      logger.debug(
        '[ContentInitialization] Skipping initialization - project was reset',
        {
          instanceId,
          projectId,
        }
      );
      setIsInitializing(false);
      return;
    }

    // Type guard to ensure draftDocuments is an array
    const docs = Array.isArray(draftDocuments) ? draftDocuments : [];

    // Don't initialize from empty draft documents if we already have content
    if (docs.length === 0 && currentContent.length > 0) {
      setIsInitializing(false);
      return;
    }

    // If we currently have empty content but draft documents exist, check if this is intentional
    if (currentContent.length === 0 && docs.length > 0 && hasInitializedRef.current) {
      // This logic was checking lastSavedContentRef in the original, but we don't have access here
      // We'll trust that the parent hook manages this correctly
      logger.info(
        '[ContentInitialization] Content was cleared, skipping reinitialization from drafts',
        {
          instanceId,
          projectId,
          draftCount: docs.length,
        }
      );
      return;
    }

    // Rebuild content from sections
    const sectionDocuments: Record<string, string> = {};
    docs.forEach((doc: any) => {
      if (doc.type && doc.content != null && doc.type !== 'FULL_CONTENT') {
        sectionDocuments[doc.type] = doc.content;
      }
    });

    // Check if we have new content from generation
    let newRebuiltContent = '';
    if (Object.keys(sectionDocuments).length > 0) {
      try {
        newRebuiltContent = rebuildHtmlContent(sectionDocuments) || '';
      } catch (error) {
        logger.error(
          '[ContentInitialization] Error rebuilding content from sections',
          {
            error,
            instanceId,
          }
        );
      }
    }

    // Check if this is new content that should replace current content
    if (newRebuiltContent) {
      const shouldLoadNewContent =
        (!hasInitializedRef.current && newRebuiltContent !== currentContent) ||
        (currentContent.length === 0 && newRebuiltContent.length > 0) ||
        (hasInitializedRef.current &&
          currentContent.length > 0 &&
          newRebuiltContent.length > 0 &&
          !hasUnsavedChanges &&
          isDifferentContent(currentContent, newRebuiltContent)) ||
        (hasInitializedRef.current &&
          currentContent.length === 0 &&
          newRebuiltContent.length > 0);
          // Removed lastSavedContentRef check as we don't have access here

      if (shouldLoadNewContent) {
        logger.info(
          '[ContentInitialization] Loading new content from draft documents',
          {
            instanceId,
            projectId,
            oldContentLength: currentContent.length,
            newContentLength: newRebuiltContent.length,
            reason: !hasInitializedRef.current
              ? 'initial-load'
              : currentContent.length === 0
                ? 'empty-to-content'
                : 'content-changed',
          }
        );

        onContentLoaded?.(newRebuiltContent);
        hasInitializedRef.current = true;
        setIsInitializing(false);

        return;
      }
    }

    // Mark as no longer initializing if no draft content or no changes
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
    }
    setIsInitializing(false);
  }, [
    draftDocuments,
    projectId,
    enabled,
    isLoading,
    currentContent,
    projectWasReset,
    hasUnsavedChanges,
    instanceId,
    onContentLoaded,
  ]);

  // Mark as initialized
  const markAsInitialized = () => {
    hasInitializedRef.current = true;
    setIsInitializing(false);
  };

  // Clear initialization state
  const clearInitialization = () => {
    hasInitializedRef.current = false;
    setIsInitializing(true);
    lastInitialContentRef.current = '';
  };

  return {
    isLoading,
    isInitializing,
    draftDocuments,
    markAsInitialized,
    clearInitialization,
  };
} 