import { useCallback, useMemo } from 'react';
import { useToast } from '@chakra-ui/react';
import { logger } from '@/lib/monitoring/logger';
import { ApplicationVersionWithDocuments } from '@/types/versioning';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { extractSections, rebuildContent } from '../utils/patent-sections';
import { useBatchUpdateDocumentsMutation } from '@/hooks/api/useDocuments';

export interface UsePatentContentReturn {
  patentContent: string;
  hasGenerated: boolean;
  handleSaveContent: (showToast: boolean, newContent?: string) => void;
  refreshContent: () => void;
}

/**
 * Hook for patent content management - ONLY handles content operations
 * Clean, focused on content reading/writing
 */
export const usePatentContent = (
  projectId: string,
  currentVersion: ApplicationVersionWithDocuments | null
): UsePatentContentReturn => {
  const toast = useToast();
  const saveMutation = useBatchUpdateDocumentsMutation();

  // Extract patent content from current version
  const patentContent = useMemo(() => {
    if (!currentVersion?.documents) return '';

    // Look for FULL_CONTENT document
    const fullContentDoc = currentVersion.documents.find(
      (d: any) => d.type === 'FULL_CONTENT'
    );

    return fullContentDoc?.content || '';
  }, [currentVersion]);

  // Check if patent has been generated
  const hasGenerated = useMemo(() => {
    return (
      currentVersion?.documents?.some(
        (doc: any) => doc.content && doc.content.trim() !== ''
      ) ?? false
    );
  }, [currentVersion]);

  // Debounced auto-save
  const debouncedSave = useDebouncedCallback(
    (documentId: string, content: string) => {
      saveMutation.mutate([{ documentId, content }]);
    },
    1000
  );

  // Handle content save
  const handleSaveContent = useCallback(
    (showToast: boolean, newContent?: string) => {
      const content = newContent || patentContent;
      const fullContentDoc = currentVersion?.documents?.find(
        (d: any) => d.type === 'FULL_CONTENT'
      );

      if (fullContentDoc?.id && content) {
        if (showToast) {
          saveMutation.mutate([{ documentId: fullContentDoc.id, content }], {
            onSuccess: () => {
              logger.info('[Patent Content] Saved successfully');
              toast({
                title: 'Saved',
                status: 'success',
                duration: 2000,
              });
            },
            onError: error => {
              logger.error('[Patent Content] Save failed:', error);
              toast({
                title: 'Save Failed',
                description: 'Unable to save changes',
                status: 'error',
                duration: 3000,
              });
            },
          });
        } else {
          debouncedSave[0](fullContentDoc.id, content);
        }
      }
    },
    [currentVersion, patentContent, saveMutation, debouncedSave, toast]
  );

  // Refresh content (in the clean version, this would trigger a re-fetch)
  const refreshContent = useCallback(() => {
    // This would be connected to React Query's refetch mechanism
    logger.info('[Patent Content] Refreshing content');
  }, []);

  return {
    patentContent,
    hasGenerated,
    handleSaveContent,
    refreshContent,
  };
};
