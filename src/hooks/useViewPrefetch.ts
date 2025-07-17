import { useEffect } from 'react';
import { logger } from '@/utils/clientLogger';

/**
 * Hook to prefetch lazy-loaded view components
 * This reduces the delay when switching between views by pre-loading the components
 */
export function useViewPrefetch() {
  useEffect(() => {
    // Prefetch all view components after a short delay
    // This ensures the current view loads first
    const prefetchTimer = setTimeout(() => {
      // Import all views to warm up the module cache
      Promise.all([
        import(
          '@/features/technology-details/components/TechnologyDetailsViewClean'
        ),
        import(
          '@/features/claim-refinement/components/ClaimRefinementViewCleanLazy'
        ),
        import(
          '@/features/patent-application/components/PatentApplicationViewClean'
        ),
      ])
        .then(() => {
          logger.debug('[ViewPrefetch] All views prefetched');
        })
        .catch((error: any) => {
          logger.warn('[ViewPrefetch] Failed to prefetch views', { error });
        });
    }, 1000); // Wait 1 second after mount to avoid blocking initial render

    return () => clearTimeout(prefetchTimer);
  }, []);
}
