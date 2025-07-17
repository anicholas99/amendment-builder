import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DraftApiService,
  DraftDocument,
  UpdateDraftDocumentRequest,
} from '@/services/api/draftApiService';
import { logger } from '@/utils/clientLogger';
import {
  draftQueryKeys,
  refreshDraftCache,
} from '@/lib/queryKeys/draftQueryKeys';
import { projectKeys } from '@/lib/queryKeys';
import { rebuildHtmlContent } from '@/features/patent-application/utils/patent-sections';
import { apiFetch } from '@/lib/api/apiClient';

/**
 * Hook to fetch draft documents for a project
 */
export const useDraftDocuments = (
  projectId: string,
  options?: { enabled?: boolean; skipInit?: boolean }
) => {
  const skipInit = options?.skipInit || false;

  return useQuery({
    queryKey: draftQueryKeys.all(projectId, skipInit),
    queryFn: () => DraftApiService.getDraftDocuments(projectId, skipInit),
    enabled: options?.enabled !== undefined ? options.enabled : !!projectId,
    staleTime: 0, // Always consider data stale to ensure fresh content
    gcTime: 5 * 60 * 1000, // Reduced from 1 hour to 5 minutes - clear cache more aggressively
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Enable refetch on reconnect
    retry: 3, // Retry up to 3 times if the fetch fails
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

/**
 * Hook to get a specific draft document by type
 */
export const useDraftDocumentByType = (projectId: string, type: string) => {
  return useQuery({
    queryKey: draftQueryKeys.byType(projectId, type),
    queryFn: () => DraftApiService.getDraftDocumentByType(projectId, type),
    enabled: !!projectId && !!type,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to update a single draft document
 */
export const useUpdateDraftDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      type,
      content,
    }: {
      projectId: string;
      type: string;
      content: string;
    }) => DraftApiService.updateDraftDocument(projectId, type, content),
    onSuccess: (data, variables) => {
      // Update the specific document in cache
      queryClient.setQueryData(
        draftQueryKeys.byType(variables.projectId, variables.type),
        data
      );

      // Update the list of documents
      queryClient.setQueryData(
        draftQueryKeys.all(variables.projectId),
        (old: DraftDocument[] = []) => {
          const index = old.findIndex(doc => doc.type === variables.type);
          if (index >= 0) {
            const updated = [...old];
            updated[index] = data;
            return updated;
          }
          return [...old, data];
        }
      );

      logger.info('Draft document updated', {
        projectId: variables.projectId,
        type: variables.type,
      });

      // Invalidate the with-content cache to ensure consistency
      queryClient.invalidateQueries({
        queryKey: [...draftQueryKeys.all(variables.projectId), 'with-content'],
        refetchType: 'active', // Changed from 'none' to ensure fresh data
      });

      // Invalidate project lists to update modified time
      queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
        exact: false,
        refetchType: 'active',
      });
    },
    onError: (error, variables) => {
      logger.error('Failed to update draft document', {
        error,
        projectId: variables.projectId,
        type: variables.type,
      });
    },
  });
};

/**
 * Hook to batch update draft documents
 */
export const useBatchUpdateDraftDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      updates,
    }: {
      projectId: string;
      updates: UpdateDraftDocumentRequest[];
    }) => DraftApiService.batchUpdateDraftDocuments(projectId, updates),
    onMutate: async ({ projectId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: draftQueryKeys.all(projectId),
      });

      // Snapshot previous values
      const previousDocuments = queryClient.getQueryData<DraftDocument[]>(
        draftQueryKeys.all(projectId)
      );
      const previousWithContent = queryClient.getQueryData([
        ...draftQueryKeys.all(projectId),
        'with-content',
      ]);

      // Optimistically update cache
      if (previousDocuments) {
        const updatedDocuments = [...previousDocuments];

        updates.forEach(update => {
          const index = updatedDocuments.findIndex(
            doc => doc.type === update.type
          );
          if (index >= 0) {
            // Update existing document
            updatedDocuments[index] = {
              ...updatedDocuments[index],
              content: update.content,
              updatedAt: new Date(),
            };
          } else {
            // Add new document (with temporary data)
            updatedDocuments.push({
              id: `temp-${update.type}`,
              projectId,
              type: update.type,
              content: update.content,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        });

        queryClient.setQueryData(
          draftQueryKeys.all(projectId),
          updatedDocuments
        );

        // Also update the cached content version
        const sectionDocuments: Record<string, string> = {};
        updatedDocuments.forEach((doc: DraftDocument) => {
          if (doc.type && doc.content != null && doc.type !== 'FULL_CONTENT') {
            sectionDocuments[doc.type] = doc.content;
          }
        });

        const builtContent = rebuildHtmlContent(sectionDocuments) || '';

        queryClient.setQueryData(
          [...draftQueryKeys.all(projectId), 'with-content'],
          {
            documents: updatedDocuments,
            content: builtContent,
            hasContent: builtContent.length > 0,
          }
        );
      }

      return { previousDocuments, previousWithContent };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousDocuments) {
        queryClient.setQueryData(
          draftQueryKeys.all(variables.projectId),
          context.previousDocuments
        );
      }

      // Also rollback the with-content cache
      if (context?.previousWithContent) {
        queryClient.setQueryData(
          [...draftQueryKeys.all(variables.projectId), 'with-content'],
          context.previousWithContent
        );
      }

      logger.error('Failed to batch update draft documents', {
        error,
        projectId: variables.projectId,
        updateCount: variables.updates.length,
      });
    },
    onSuccess: async (data, variables) => {
      logger.info('Draft documents batch updated successfully', {
        projectId: variables.projectId,
        count: data?.count,
      });

      // Use the centralized cache refresh utility
      // This ensures browser HTTP cache is bypassed and we get truly fresh data
      await refreshDraftCache(queryClient, variables.projectId);

      // Invalidate project lists to update modified time
      queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
        exact: false,
        refetchType: 'none',
      });
    },
    // Remove onSettled to prevent duplicate invalidation
  });
};

/**
 * Hook to check if project has draft documents
 */
export const useHasDraftDocuments = (projectId: string) => {
  return useQuery({
    queryKey: draftQueryKeys.exists(projectId),
    queryFn: () => DraftApiService.hasDraftDocuments(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get draft documents with pre-built HTML content
 * This prevents the need to rebuild content on every navigation
 */
export const useDraftDocumentsWithContent = (
  projectId: string,
  options?: { enabled?: boolean; skipInit?: boolean }
) => {
  const skipInit = options?.skipInit || false;

  return useQuery({
    queryKey: [...draftQueryKeys.all(projectId, skipInit), 'with-content'],
    queryFn: async () => {
      const documents = await DraftApiService.getDraftDocuments(
        projectId,
        skipInit
      );

      // Build HTML content once during fetch
      const sectionDocuments: Record<string, string> = {};
      if (documents && Array.isArray(documents)) {
        documents.forEach((doc: DraftDocument) => {
          if (doc.type && doc.content != null && doc.type !== 'FULL_CONTENT') {
            sectionDocuments[doc.type] = doc.content;
          }
        });
      }

      const builtContent = rebuildHtmlContent(sectionDocuments) || '';

      return {
        documents,
        content: builtContent,
        hasContent: builtContent.length > 0,
      };
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!projectId,
    staleTime: 0, // Always consider data stale to ensure fresh content
    gcTime: 5 * 60 * 1000, // Reduced from 1 hour to 5 minutes - clear cache more aggressively
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Enable refetch on reconnect
    retry: 3, // Retry up to 3 times if the fetch fails
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

/**
 * Hook to restore draft documents from a version
 * This handles the server-side version restore and ensures the editor updates immediately
 */
export const useRestoreDraftFromVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      versionId,
    }: {
      projectId: string;
      versionId: string;
    }) => {
      const response = await apiFetch(
        `/api/projects/${projectId}/draft/restore-version`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ versionId }),
        }
      );

      if (!response.ok) {
        throw new Error(`Version restore failed: ${response.status}`);
      }

      const result = await response.json();
      
      logger.info('[useRestoreDraftFromVersion] Version restored successfully', {
        projectId,
        versionName: result.versionName,
        documentCount: result.documentCount,
        contentLength: result.content.length,
      });

      return result;
    },
    onSuccess: async (result, { projectId }) => {
      logger.info('[useRestoreDraftFromVersion] Processing version restore result', {
        projectId,
        contentLength: result.content.length,
        versionName: result.versionName,
      });

      // 1. First refresh the cache to get updated data
      await refreshDraftCache(queryClient, projectId);

      // 1b. OVERWRITE the freshly rebuilt HTML with the authoritative content
      // returned by the server. The rebuild step can occasionally return stale
      // data if the replica hasn't caught up yet, which causes the editor to
      // flash back to the previous draft. We update ALL with-content cache
      // variants so every consumer receives the correct version immediately.
      const withContentPayload = (existing: any) => ({
        ...(existing ?? {}),
        content: result.content,
        hasContent: result.content.length > 0,
      });

      const cacheKeysToFix = [
        [...draftQueryKeys.all(projectId, false), 'with-content'],
        [...draftQueryKeys.all(projectId, true), 'with-content'],
        [...draftQueryKeys.all(projectId), 'with-content'],
      ];

      cacheKeysToFix.forEach(key => {
        queryClient.setQueryData(key, withContentPayload);
      });

      // 2. THEN emit direct content update to override any rebuilt content
      // Use a small delay to ensure cache refresh completes first
      setTimeout(() => {
        const event = new CustomEvent('directEditorContentUpdate', {
          detail: {
            projectId,
            content: result.content,
            source: 'version-restore',
            versionName: result.versionName,
          },
        });
        window.dispatchEvent(event);

        logger.info('[useRestoreDraftFromVersion] Emitted direct content update after cache refresh', {
          projectId,
          contentLength: result.content.length,
          versionName: result.versionName,
        });
      }, 100); // Small delay to let cache refresh complete
    },
    onError: (error) => {
      logger.error('[useRestoreDraftFromVersion] Version restore failed', {
        error,
      });
    },
  });
};
