import { useState, useCallback, useMemo, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { logger } from '@/lib/monitoring/logger';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { useLatestVersionQuery } from '@/hooks/api/useProjects';
import { useBatchUpdateDocumentsMutation } from '@/hooks/api/useDocuments';
import { usePatentGeneration } from './usePatentGeneration';
import { ApplicationVersionWithDocuments } from '@/types/versioning';

interface UseSimplePatentManagerProps {
  projectId: string;
  currentVersion: ApplicationVersionWithDocuments | null | undefined;
}

interface UseSimplePatentManagerReturn {
  // Content state
  patentContent: string;
  hasGenerated: boolean;
  isSaving: boolean;

  // Actions
  updateContent: (newContent: string) => void;
  saveContent: (showToast?: boolean) => Promise<void>;

  // Generation
  isGenerating: boolean;
  generationProgress: number;
  generatePatent: (versionName?: string) => Promise<void>;
}

/**
 * Simplified patent manager hook
 * - Single source of truth for patent content
 * - Simple auto-save mechanism
 * - Clear generation flow with UI updates
 */
export const useSimplePatentManager = ({
  projectId,
  currentVersion,
}: UseSimplePatentManagerProps): UseSimplePatentManagerReturn => {
  const toast = useToast();
  const [pendingContent, setPendingContent] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Mutations
  const batchUpdateMutation = useBatchUpdateDocumentsMutation();

  // Generation hook
  const { isGenerating, generationProgress, handleGeneratePatent } =
    usePatentGeneration(projectId);

  // Extract current content from version
  const patentContent = useMemo(() => {
    if (!currentVersion?.documents) return '';

    const fullContentDoc = currentVersion.documents.find(
      doc => doc.type === 'FULL_CONTENT'
    );

    return fullContentDoc?.content || '';
  }, [currentVersion]);

  // Check if patent has been generated
  const hasGenerated = useMemo(() => {
    return (
      currentVersion?.documents?.some(
        doc => doc.content && doc.content.trim().length > 0
      ) ?? false
    );
  }, [currentVersion]);

  // Save content to backend
  const saveContent = useCallback(
    async (showToast = true) => {
      const contentToSave = pendingContent ?? patentContent;
      if (!contentToSave || !currentVersion) return;

      const fullContentDoc = currentVersion.documents.find(
        doc => doc.type === 'FULL_CONTENT'
      );

      if (!fullContentDoc?.id) {
        logger.warn('[SimplePatentManager] No FULL_CONTENT document found');
        return;
      }

      setIsSaving(true);

      try {
        await batchUpdateMutation.mutateAsync([
          {
            documentId: fullContentDoc.id,
            content: contentToSave,
          },
        ]);

        setPendingContent(null);

        if (showToast) {
          toast({
            title: 'Saved',
            status: 'success',
            duration: 2000,
          });
        }
      } catch (error) {
        logger.error('[SimplePatentManager] Save failed:', error);
        toast({
          title: 'Save Failed',
          description: 'Unable to save changes. Please try again.',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setIsSaving(false);
      }
    },
    [currentVersion, pendingContent, patentContent, batchUpdateMutation, toast]
  );

  // Debounced auto-save
  const [debouncedSave, cancelDebouncedSave] = useDebouncedCallback(
    () => saveContent(false),
    3000 // 3 seconds - longer delay for better performance
  );

  // Update content and trigger auto-save
  const updateContent = useCallback(
    (newContent: string) => {
      if (newContent === patentContent) return;

      setPendingContent(newContent);
      debouncedSave();
    },
    [patentContent, debouncedSave]
  );

  // Enhanced generate patent with proper UI refresh
  const generatePatent = useCallback(
    async (versionName?: string) => {
      await handleGeneratePatent(versionName);
      // The UI will automatically refresh due to query invalidation in handleGeneratePatent
    },
    [handleGeneratePatent]
  );

  // Clean up pending saves on unmount
  useEffect(() => {
    return () => {
      cancelDebouncedSave();
    };
  }, [cancelDebouncedSave]);

  return {
    // Content state
    patentContent: pendingContent ?? patentContent,
    hasGenerated,
    isSaving,

    // Actions
    updateContent,
    saveContent,

    // Generation
    isGenerating,
    generationProgress,
    generatePatent,
  };
};
