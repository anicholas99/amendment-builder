import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import { useCreateVersionMutation } from '@/hooks/api/useProjectVersions';
import { useRestoreDraftFromVersion } from '@/hooks/api/useDraftDocuments';
import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { useQueryClient } from '@tanstack/react-query';

interface UseSimplifiedPatentVersioningOptions {
  projectId: string;
  forceSave?: () => Promise<void>;
}

interface UseSimplifiedPatentVersioningReturn {
  handleSaveNewVersion: (versionName: string) => Promise<void>;
  handleLoadVersion: (versionId: string) => Promise<void>;
  handleResetApplication: () => void;
  isResetModalOpen: boolean;
  onResetModalClose: () => void;
  isResetting: boolean;
  handleResetApplicationConfirm: () => Promise<void>;
}

/**
 * Simplified patent versioning hook
 * 
 * Key improvements:
 * - Server-side version restore (no client-side rebuilding)
 * - No manual content updates or syncing
 * - React Query handles all cache updates
 * - No passive mode or workarounds needed
 */
export const useSimplifiedPatentVersioning = ({
  projectId,
  forceSave,
}: UseSimplifiedPatentVersioningOptions): UseSimplifiedPatentVersioningReturn => {
  const toast = useToast();
  const createVersionMutation = useCreateVersionMutation();
  const restoreVersionMutation = useRestoreDraftFromVersion();
  const queryClient = useQueryClient();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSaveNewVersion = useCallback(
    async (versionName: string) => {
      if (!projectId) return;

      try {
        // Save any pending changes first
        if (forceSave) {
          await forceSave();
        }

        logger.info('[SimplifiedVersioning] Creating new version', {
          projectId,
          versionName,
        });

        await createVersionMutation.mutateAsync({
          projectId,
          payload: {
            name: versionName,
          },
        });

        toast({
          title: 'Version Saved',
          description: `Version "${versionName}" has been created`,
          status: 'success',
          duration: 3000,
        });
      } catch (error) {
        logger.error('[SimplifiedVersioning] Failed to save version', { error });
        toast({
          title: 'Failed to Save Version',
          description: 'Please try again',
          status: 'error',
          duration: 3000,
        });
      }
    },
    [projectId, forceSave, createVersionMutation, toast]
  );

  const handleLoadVersion = useCallback(
    async (versionId: string) => {
      if (!projectId || !versionId) {
        logger.warn('[SimplifiedVersioning] Missing projectId or versionId', {
          projectId,
          versionId,
        });
        return;
      }

      try {
        logger.info('[SimplifiedVersioning] Loading version', {
          projectId,
          versionId,
        });

        // Show loading toast
        const loadingToast = toast.info({
          title: 'Loading Version',
          description: 'Restoring content from selected version...',
        });

        // Server-side version restore
        const result = await restoreVersionMutation.mutateAsync({
          projectId,
          versionId,
        });

        // Close loading toast
        if (loadingToast.dismiss) {
          loadingToast.dismiss();
        }

        // Show success toast
        toast.success({
          title: 'Version Restored',
          description: `Working draft has been updated with content from "${result.versionName}"`,
        });

        logger.info('[SimplifiedVersioning] Version loaded successfully', {
          versionId,
          versionName: result.versionName,
          documentCount: result.documentCount,
        });
      } catch (error) {
        logger.error('[SimplifiedVersioning] Error loading version', { error });
        toast({
          title: 'Load Failed',
          description: 'Unable to load the selected version. Please try again.',
          status: 'error',
          duration: 5000,
        });
      }
    },
    [projectId, restoreVersionMutation, toast]
  );

  const handleResetApplication = useCallback(() => {
    setIsResetModalOpen(true);
  }, []);

  const onResetModalClose = useCallback(() => {
    setIsResetModalOpen(false);
  }, []);

  const handleResetApplicationConfirm = useCallback(async () => {
    if (!projectId) return;

    setIsResetting(true);
    try {
      logger.info('[SimplifiedVersioning] Resetting patent application', { projectId });

      // Use the comprehensive reset endpoint that clears all patent content
      const response = await apiFetch(API_ROUTES.PROJECTS.VERSIONS.RESET(projectId), {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Reset failed with status: ${response.status}`);
      }

      const result = await response.json();
      
      logger.info('[SimplifiedVersioning] Patent application reset complete', { 
        projectId, 
        result 
      });

      toast({
        title: 'Application Reset',
        description: `Patent application reset complete. ${result.draftDocumentsDeleted} draft document(s) and ${result.versionsDeleted} version(s) deleted.`,
        status: 'success',
        duration: 4000,
      });

      // Close modal
      setIsResetModalOpen(false);

      // Invalidate all relevant queries to ensure clean transition to placeholder state
      await Promise.all([
        // Core project data (contains hasPatentContent flag)
        queryClient.invalidateQueries({ queryKey: ['project', projectId] }),
        
        // Draft documents (working content)
        queryClient.invalidateQueries({ queryKey: ['draftDocuments', projectId] }),
        
        // Application versions (saved versions)
        queryClient.invalidateQueries({ queryKey: ['projectVersions', projectId] }),
        queryClient.invalidateQueries({ queryKey: ['applicationVersions', projectId] }),
        
        // Any cached patent content
        queryClient.invalidateQueries({ queryKey: ['patentContent', projectId] }),
        queryClient.invalidateQueries({ queryKey: ['patent-autosave', projectId] }),
      ]);

      logger.info('[SimplifiedVersioning] Cache invalidation complete, transitioning to placeholder');

    } catch (error) {
      logger.error('[SimplifiedVersioning] Failed to reset patent application', { error });
      toast({
        title: 'Reset Failed',
        description: 'Unable to reset the patent application. Please try again.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsResetting(false);
    }
  }, [projectId, toast, queryClient]);

  return {
    handleSaveNewVersion,
    handleLoadVersion,
    handleResetApplication,
    isResetModalOpen,
    onResetModalClose,
    isResetting,
    handleResetApplicationConfirm,
  };
}; 