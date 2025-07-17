/**
 * Hook to manage view prefetching when projects change
 */
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePrefetchViewData } from './usePrefetchViewData';
import { logger } from '@/utils/clientLogger';

export const useViewTransition = () => {
  const router = useRouter();
  const { prefetchAllViews } = usePrefetchViewData();

  // Prefetch all views when project changes
  useEffect(() => {
    const projectId = router.query.projectId as string;
    if (projectId) {
      logger.debug('[ViewTransition] Prefetching all views for project', {
        projectId,
      });
      prefetchAllViews(projectId);
    }
  }, [router.query.projectId, prefetchAllViews]);

  return {};
};
