import { QueryClient } from '@tanstack/react-query';
import { DraftApiService } from '@/services/api/draftApiService';
import { rebuildHtmlContent } from '@/features/patent-application/utils/patent-sections';
import { logger } from '@/utils/clientLogger';

/**
 * Query keys for draft document operations
 */
export const draftQueryKeys = {
  all: (projectId: string, skipInit = false) =>
    skipInit
      ? (['draft', 'documents', projectId, 'skipInit'] as const)
      : (['draft', 'documents', projectId] as const),
  byType: (projectId: string, type: string) =>
    ['draft', 'documents', projectId, 'type', type] as const,
  exists: (projectId: string) =>
    ['draft', 'documents', projectId, 'exists'] as const,
};

/**
 * Clear all draft document data from React Query cache
 * Used during reset to ensure no stale data persists
 */
export async function clearDraftCache(
  queryClient: QueryClient,
  projectId: string
): Promise<void> {
  // Cancel any in-flight queries first
  await queryClient.cancelQueries({
    queryKey: ['draft'],
    exact: false,
  });

  // Set all variations to empty array (immediate UI update)
  queryClient.setQueryData(draftQueryKeys.all(projectId), []);
  queryClient.setQueryData(draftQueryKeys.all(projectId, false), []);
  queryClient.setQueryData(draftQueryKeys.all(projectId, true), []);

  // Clear any type-specific queries
  const allQueries = queryClient.getQueryCache().getAll();
  allQueries.forEach(query => {
    const queryKey = query.queryKey;
    if (
      Array.isArray(queryKey) &&
      queryKey[0] === 'draft' &&
      queryKey[1] === 'documents' &&
      queryKey[2] === projectId
    ) {
      queryClient.removeQueries({ queryKey, exact: true });
    }
  });

  // Remove any pending autosave content
  queryClient.removeQueries({
    queryKey: ['patent-autosave-pending', projectId],
    exact: true,
  });

  // Clear any version-related draft data
  queryClient.removeQueries({
    queryKey: ['version-draft', projectId],
    exact: false,
  });

  // Ensure no draft-related data remains for this project
  queryClient.removeQueries({
    predicate: query => {
      const key = query.queryKey;
      return (
        Array.isArray(key) &&
        ((key[0] === 'draft' && key.includes(projectId)) ||
          (key.includes('patent-autosave') && key.includes(projectId)))
      );
    },
  });
}

/**
 * Force refresh draft documents with cache busting
 * This ensures we bypass browser HTTP cache and get truly fresh data
 *
 * @param queryClient - React Query client instance
 * @param projectId - Project ID to refresh
 * @returns Promise that resolves when refresh is complete
 */
export async function refreshDraftCache(
  queryClient: QueryClient,
  projectId: string
): Promise<void> {
  try {
    logger.info('[refreshDraftCache] Starting cache refresh', { projectId });

    // Step 1: Fetch fresh data with cache busting to bypass browser HTTP cache
    const freshDrafts = await DraftApiService.getDraftDocuments(
      projectId,
      false,
      true // bustCache - this adds timestamp to URL
    );

    logger.info('[refreshDraftCache] Fetched fresh documents', {
      count: freshDrafts?.length ?? 0,
    });

    // Step 2: Update all query cache variations with fresh data
    queryClient.setQueryData(draftQueryKeys.all(projectId, false), freshDrafts);
    queryClient.setQueryData(draftQueryKeys.all(projectId, true), freshDrafts);
    queryClient.setQueryData(draftQueryKeys.all(projectId), freshDrafts);

    // Step 3: Rebuild content and update 'with-content' cache
    const sectionDocuments: Record<string, string> = {};
    if (freshDrafts && Array.isArray(freshDrafts)) {
      freshDrafts.forEach((doc: any) => {
        if (doc.type && doc.content != null && doc.type !== 'FULL_CONTENT') {
          sectionDocuments[doc.type] = doc.content;
        }
      });
    }

    const builtContent = rebuildHtmlContent(sectionDocuments) || '';
    const withContentData = {
      documents: freshDrafts,
      content: builtContent,
      hasContent: builtContent.length > 0,
    };

    // Update all with-content cache variations
    const withContentKeys = [
      [...draftQueryKeys.all(projectId, false), 'with-content'],
      [...draftQueryKeys.all(projectId, true), 'with-content'],
      [...draftQueryKeys.all(projectId), 'with-content'],
    ];

    withContentKeys.forEach(key => {
      queryClient.setQueryData(key, withContentData);
    });

    logger.info('[refreshDraftCache] Cache refresh complete', { projectId });
  } catch (error) {
    logger.error('[refreshDraftCache] Failed to refresh draft cache', {
      error,
      projectId,
    });
    throw error;
  }
}
