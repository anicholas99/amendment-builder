/**
 * Hook for prefetching view data to enable instant navigation
 * Implements predictive loading based on user intent
 */
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { logger } from '@/utils/clientLogger';
import { inventionQueryKeys } from '@/hooks/api/useInvention';
import { claimQueryKeys } from '@/hooks/api/useClaims';
import { versionQueryKeys } from '@/lib/queryKeys/versionQueryKeys';
import { useInventionService } from '@/contexts/ClientServicesContext';
import { ProjectApiService } from '@/client/services/project.client-service';
import { STALE_TIME, GC_TIME } from '@/constants/time';

export const usePrefetchViewData = () => {
  const queryClient = useQueryClient();
  const inventionService = useInventionService();

  /**
   * Helper to prefetch or refetch based on staleness
   */
  const prefetchOrRefetch = useCallback(
    async (
      queryKey: readonly unknown[],
      queryFn: () => Promise<any>,
      options?: any
    ) => {
      const existingData = queryClient.getQueryData(queryKey);
      const queryState = queryClient.getQueryState(queryKey);

      // If we have data in cache that's not stale, skip fetching
      // This preserves optimistic updates when navigating
      if (existingData && !queryState?.isInvalidated) {
        logger.debug('[Prefetch] Skipping - fresh data in cache', { queryKey });
        return;
      }

      // If data exists and is marked as stale, refetch it
      if (existingData && queryState?.isInvalidated) {
        await queryClient.refetchQueries({
          queryKey,
          exact: true,
        });
      } else {
        // Otherwise, prefetch normally
        await queryClient.prefetchQuery({
          queryKey,
          queryFn,
          ...options,
        });
      }
    },
    [queryClient]
  );

  /**
   * Prefetch Technology Details data
   */
  const prefetchTechnology = useCallback(
    async (projectId: string) => {
      if (!projectId) return;

      logger.debug('[Prefetch] Starting Technology Details prefetch', {
        projectId,
      });

      // Prefetch invention data
      await prefetchOrRefetch(
        inventionQueryKeys.byProject(projectId),
        () => inventionService.getInvention(projectId),
        {
          staleTime: STALE_TIME.LONG,
          gcTime: GC_TIME.LONG,
        }
      );

      logger.debug('[Prefetch] Technology Details data prefetched');
    },
    [prefetchOrRefetch, inventionService]
  );

  /**
   * Prefetch Claim Refinement data
   */
  const prefetchClaimRefinement = useCallback(
    async (projectId: string) => {
      if (!projectId) return;

      logger.debug('[Prefetch] Starting Claim Refinement prefetch', {
        projectId,
      });

      // Prefetch claims and invention data in parallel
      await Promise.all([
        // Claims data
        prefetchOrRefetch(
          claimQueryKeys.list(projectId),
          () => ProjectApiService.getClaims(projectId),
          {
            staleTime: STALE_TIME.DEFAULT,
            gcTime: GC_TIME.DEFAULT,
          }
        ),
        // Invention data (if not already cached)
        prefetchOrRefetch(
          inventionQueryKeys.byProject(projectId),
          () => inventionService.getInvention(projectId),
          {
            staleTime: STALE_TIME.LONG,
            gcTime: GC_TIME.LONG,
          }
        ),
      ]);

      logger.debug('[Prefetch] Claim Refinement data prefetched');
    },
    [prefetchOrRefetch, inventionService]
  );

  /**
   * Prefetch Patent Application data
   */
  const prefetchPatentApplication = useCallback(
    async (projectId: string) => {
      if (!projectId) return;

      logger.debug('[Prefetch] Starting Patent Application prefetch', {
        projectId,
      });

      // Prefetch latest version and invention data in parallel
      await Promise.all([
        // Latest version data
        prefetchOrRefetch(
          versionQueryKeys.latest(projectId),
          () => ProjectApiService.getLatestVersion(projectId),
          {
            staleTime: STALE_TIME.SHORT,
            gcTime: GC_TIME.SHORT,
          }
        ),
        // Invention data (if not already cached)
        prefetchOrRefetch(
          inventionQueryKeys.byProject(projectId),
          () => inventionService.getInvention(projectId),
          {
            staleTime: STALE_TIME.LONG,
            gcTime: GC_TIME.LONG,
          }
        ),
      ]);

      logger.debug('[Prefetch] Patent Application data prefetched');
    },
    [prefetchOrRefetch, inventionService]
  );

  /**
   * Prefetch all views for a project (useful for project switching)
   */
  const prefetchAllViews = useCallback(
    async (projectId: string) => {
      if (!projectId) return;

      logger.debug('[Prefetch] Starting all views prefetch', { projectId });

      await Promise.all([
        prefetchTechnology(projectId),
        prefetchClaimRefinement(projectId),
        prefetchPatentApplication(projectId),
      ]);

      logger.debug('[Prefetch] All views data prefetched');
    },
    [prefetchTechnology, prefetchClaimRefinement, prefetchPatentApplication]
  );

  return {
    prefetchTechnology,
    prefetchClaimRefinement,
    prefetchPatentApplication,
    prefetchAllViews,
  };
};
