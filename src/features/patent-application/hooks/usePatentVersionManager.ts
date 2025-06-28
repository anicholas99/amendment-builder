import { useCallback, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/monitoring/logger';
import { ProjectApiService } from '@/client/services/project.client-service';
import { projectKeys } from '@/lib/queryKeys';
import { versionQueryKeys } from '@/lib/queryKeys/versionQueryKeys';
import { rebuildHtmlContent, extractSections } from '../utils/patent-sections';
import { useCreateVersionMutation } from '@/hooks/api/useProjectVersions';
import { ApplicationVersionWithDocuments } from '@/types/versioning';

interface UsePatentVersionManagerOptions {
  projectId: string;
  patentContent: string;
  latestVersion?: ApplicationVersionWithDocuments | null;
  queueContentUpdate: (content: string, forceUpdate?: boolean) => void;
  clearPendingSaves?: () => void;
}

interface UsePatentVersionManagerReturn {
  localEditorContent: string | null;
  setLocalEditorContent: (content: string | null) => void;
  handleSaveNewVersion: (versionName: string) => Promise<void>;
  handleLoadVersion: (versionId: string) => Promise<void>;
  handleResetApplication: () => Promise<void>;
  isSavingVersion: boolean;
}

/**
 * Hook for managing patent application versions
 * Handles save, load, and reset operations
 */
export const usePatentVersionManager = ({
  projectId,
  patentContent,
  latestVersion,
  queueContentUpdate,
  clearPendingSaves,
}: UsePatentVersionManagerOptions): UsePatentVersionManagerReturn => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const createVersionMutation = useCreateVersionMutation();

  // Local editor content state for immediate UI updates
  const [localEditorContent, setLocalEditorContent] = useState<string | null>(
    null
  );
  
  // Track when we're saving a new version
  const [isSavingVersion, setIsSavingVersion] = useState(false);

  const handleSaveNewVersion = useCallback(
    async (versionName: string) => {
      if (!projectId || !patentContent) {
        logger.warn(
          '[handleSaveNewVersion] Missing projectId or patent content'
        );
        toast({
          title: 'Error',
          description: 'Unable to save version. Missing project or content.',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      try {
        logger.info('[handleSaveNewVersion] Saving new version', {
          projectId,
          versionName,
          contentLength: patentContent.length,
        });

        // Clear any pending saves to ensure no content goes to the old version
        if (clearPendingSaves) {
          clearPendingSaves();
        }

        // Extract sections from the current content
        const sections = extractSections(patentContent);

        // Create a new version with the current content
        const result = await createVersionMutation.mutateAsync({
          projectId,
          payload: {
            name: versionName || `Version ${new Date().toLocaleString()}`,
            sections,
          },
        });

        logger.info('[handleSaveNewVersion] Version saved successfully', {
          versionId: result.id,
          versionName: result.name,
        });

        // Invalidate queries to refresh version data
        await queryClient.invalidateQueries({
          queryKey: versionQueryKeys.all(projectId),
        });
        await queryClient.invalidateQueries({
          queryKey: versionQueryKeys.latest(projectId),
        });

        // Force refetch of latest version to ensure we're working with the new version
        await queryClient.refetchQueries({
          queryKey: versionQueryKeys.latest(projectId),
        });

        // Small delay to ensure the UI has updated with the new version
        await new Promise(resolve => setTimeout(resolve, 100));

        toast({
          title: 'Version Saved',
          description: `Successfully saved version: ${result.name}`,
          status: 'success',
          duration: 3000,
        });
      } catch (error) {
        logger.error('[handleSaveNewVersion] Error saving version:', error);
        toast({
          title: 'Save Failed',
          description: 'Unable to save the version. Please try again.',
          status: 'error',
          duration: 5000,
        });
      }
    },
    [projectId, patentContent, createVersionMutation, queryClient, toast]
  );

  const handleLoadVersion = useCallback(
    async (versionId: string) => {
      if (!projectId || !versionId) {
        logger.warn('[handleLoadVersion] Missing projectId or versionId');
        return;
      }

      try {
        logger.info('[handleLoadVersion] Loading version', {
          projectId,
          versionId,
        });

        // Fetch the specific version
        const version = await ProjectApiService.getVersion(
          projectId,
          versionId
        );

        if (!version) {
          throw new Error('Version not found');
        }

        // Extract content from the version
        let contentToLoad = '';

        // First try to get FULL_CONTENT document
        const fullContentDoc = version.documents?.find(
          (d: any) => d.type === 'FULL_CONTENT'
        );

        if (fullContentDoc?.content) {
          contentToLoad = fullContentDoc.content;
        } else {
          // Rebuild from sections if no full content
          const sectionDocuments: Record<string, string> = {};
          version.documents?.forEach((doc: any) => {
            if (
              doc.type &&
              doc.content != null &&
              doc.type !== 'FULL_CONTENT'
            ) {
              sectionDocuments[doc.type] = doc.content;
            }
          });

          if (Object.keys(sectionDocuments).length > 0) {
            contentToLoad = rebuildHtmlContent(sectionDocuments);
          }
        }

        if (!contentToLoad) {
          throw new Error('No content found in the selected version');
        }

        // Update local editor content immediately for instant UI feedback
        setLocalEditorContent(contentToLoad);

        // Also queue the save to backend with force flag to ensure update
        queueContentUpdate(contentToLoad, true);

        toast({
          title: 'Version Restored',
          description: `Working draft has been updated with content from "${version.name}"`,
          status: 'success',
          duration: 3000,
        });

        logger.info('[handleLoadVersion] Version content loaded', {
          versionId,
          versionName: version.name,
        });
      } catch (error) {
        logger.error('[handleLoadVersion] Error loading version:', error);
        toast({
          title: 'Load Failed',
          description: 'Unable to load the selected version. Please try again.',
          status: 'error',
          duration: 5000,
        });
      }
    },
    [projectId, queueContentUpdate, toast]
  );

  const handleResetApplication = useCallback(async () => {
    try {
      // Show confirmation dialog
      const isConfirmed = window.confirm(
        'Are you sure you want to reset your patent application? This will delete all generated versions and you will need to regenerate from scratch.'
      );

      if (!isConfirmed) {
        return;
      }

      logger.info(
        '[handleResetApplication] Resetting application for project',
        { projectId }
      );

      // Show loading toast
      const loadingToast = toast({
        title: 'Resetting Application',
        description: 'Please wait while we reset your patent application...',
        status: 'info',
        duration: null,
        isClosable: false,
      });

      // Call the reset API
      const result =
        await ProjectApiService.resetApplicationVersions(projectId);

      // Clear local editor content state immediately
      setLocalEditorContent(null);

      // Remove the latest version from cache to prevent stale data
      queryClient.removeQueries({
        queryKey: versionQueryKeys.latest(projectId),
      });
      queryClient.removeQueries({
        queryKey: versionQueryKeys.all(projectId),
      });

      // Invalidate relevant queries to refresh the UI
      await queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      });

      // Cancel all in-flight queries for this project to avoid race conditions
      await queryClient.cancelQueries({
        queryKey: versionQueryKeys.all(projectId),
      });

      // Small delay to ensure cache is cleared
      await new Promise(resolve => setTimeout(resolve, 100));

      // Refetch latest version query which will now return null/404
      await queryClient.refetchQueries({
        queryKey: versionQueryKeys.latest(projectId),
      });

      // Close loading toast
      toast.close(loadingToast);

      // Show success message
      toast({
        title: 'Application Reset',
        description:
          result.message ||
          'Your patent application has been reset successfully.',
        status: 'success',
        duration: 5000,
      });

      logger.info('[handleResetApplication] Reset completed successfully');
    } catch (error) {
      logger.error(
        '[handleResetApplication] Error resetting application:',
        error
      );
      toast({
        title: 'Reset Failed',
        description:
          'Unable to reset the patent application. Please try again.',
        status: 'error',
        duration: 5000,
      });
    }
  }, [projectId, queryClient, toast]);

  return {
    localEditorContent,
    setLocalEditorContent,
    handleSaveNewVersion,
    handleLoadVersion,
    handleResetApplication,
    isSavingVersion,
  };
};
