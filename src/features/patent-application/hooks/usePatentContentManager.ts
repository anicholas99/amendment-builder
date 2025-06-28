import { useCallback, useMemo } from 'react';
import { useToast } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { ApplicationVersionWithDocuments } from '@/types/versioning';
import { InventionData } from '@/types';
import { rebuildHtmlContent } from '../utils/patent-sections';
import { versionQueryKeys } from '@/lib/queryKeys/versionQueryKeys';

interface UsePatentContentManagerOptions {
  projectId: string;
  latestVersion?: ApplicationVersionWithDocuments | null;
  inventionData?: InventionData | null;
  localEditorContent: string | null;
  queueContentUpdate: (content: string, forceUpdate?: boolean) => void;
  forceSave: () => Promise<void>;
}

interface UsePatentContentManagerReturn {
  patentContent: string;
  hasGenerated: boolean;
  handleSyncClaims: () => void;
  handleRebuildSections: () => void;
  refreshContent: () => void;
  updateCurrentVersionDocument: (
    documentId: string,
    newContent: string
  ) => void;
}

/**
 * Hook for managing patent content operations
 * Handles content derivation, syncing, and rebuilding
 */
export const usePatentContentManager = ({
  projectId,
  latestVersion,
  inventionData,
  localEditorContent,
  queueContentUpdate,
  forceSave,
}: UsePatentContentManagerOptions): UsePatentContentManagerReturn => {
  const toast = useToast();
  const queryClient = useQueryClient();

  // Section-based document manager
  const updateCurrentVersionDocument = useCallback(
    (documentId: string, newContent: string) => {
      if (!latestVersion) return;

      // Update React Query cache for this version so UI stays in sync
      queryClient.setQueryData(
        versionQueryKeys.detail(projectId, latestVersion.id),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            documents: old.documents.map((doc: any) =>
              doc.id === documentId ? { ...doc, content: newContent } : doc
            ),
          };
        }
      );
    },
    [latestVersion, projectId, queryClient]
  );

  // Derive patent content from current version
  const patentContent = useMemo(() => {
    // If we have local editor content (from loading a version), use that
    if (localEditorContent !== null) {
      return localEditorContent;
    }

    if (!latestVersion) return '';

    const htmlDoc = latestVersion.documents.find(
      (d: any) => d.type === 'FULL_CONTENT'
    );
    if (htmlDoc?.content) {
      return htmlDoc.content;
    }

    // Rebuild from sections if no full content
    const sectionDocuments: Record<string, string> = {};
    latestVersion.documents.forEach((doc: any) => {
      if (doc.type && doc.content != null && doc.type !== 'FULL_CONTENT') {
        sectionDocuments[doc.type] = doc.content;
      }
    });

    if (Object.keys(sectionDocuments).length > 0) {
      return rebuildHtmlContent(sectionDocuments);
    }

    return '';
  }, [latestVersion, localEditorContent]);

  // Determine if content has been generated
  const hasGenerated = useMemo(() => {
    return (
      latestVersion?.documents?.some(
        (doc: any) => doc.content && doc.content.trim() !== ''
      ) ?? false
    );
  }, [latestVersion]);

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

    // Extract and queue all sections
    queueContentUpdate(patentContent);
    forceSave();
  }, [patentContent, queueContentUpdate, forceSave, toast]);

  const handleSyncClaims = useCallback(() => {
    if (!inventionData?.claims || !latestVersion) return;

    const claims = inventionData.claims || {};
    const sortedClaims = Object.entries(claims)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([number, claim]) => `${number}. ${claim}`);
    const claimsContent = sortedClaims.join('\n\n');

    queueContentUpdate(claimsContent);
    forceSave();
  }, [inventionData, latestVersion, queueContentUpdate, forceSave]);

  const refreshContent = useCallback(() => {
    // Trigger a re-render by invalidating the version query
    queryClient.invalidateQueries({
      queryKey: versionQueryKeys.detail(projectId, latestVersion?.id || ''),
    });
  }, [queryClient, projectId, latestVersion]);

  return {
    patentContent,
    hasGenerated,
    handleSyncClaims,
    handleRebuildSections,
    refreshContent,
    updateCurrentVersionDocument,
  };
};
