import { useRouter } from 'next/router';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { logger } from '@/utils/clientLogger';

/**
 * useCurrentProjectId
 *
 * Returns a reliable project ID as early as possible in the component lifecycle.
 *   1. Prefers the `projectId` param from the Next.js router (always present on project routes).
 *   2. Falls back to `activeProjectId` from ProjectDataContext when the route ID is unavailable
 *      (e.g. in deeply nested components or initial render flashes).
 *
 * This prevents race-conditions where a component renders before the context has
 * finished loading, leading to empty API queries and blank screens.
 */
export function useCurrentProjectId(): string | null {
  const router = useRouter();
  const { activeProjectId } = useProjectData();

  const routeProjectId = router.query.projectId;

  // Debug logging to understand hard refresh behavior
  logger.debug('[useCurrentProjectId] Hook called', {
    routeProjectId,
    activeProjectId,
    isReady: router.isReady,
    asPath: router.asPath,
  });

  if (typeof routeProjectId === 'string' && routeProjectId.trim() !== '') {
    logger.debug('[useCurrentProjectId] Using route project ID', {
      routeProjectId,
    });
    return routeProjectId;
  }

  // Fallback: parse projectId directly from the URL path (covers the brief
  // window before Next.js populates `router.query` on the very first render).
  const match = router.asPath.match(/projects\/([^/]+)/);
  if (match && match[1]) {
    logger.debug('[useCurrentProjectId] Using parsed project ID from URL', {
      projectId: match[1],
    });
    return match[1];
  }

  logger.debug('[useCurrentProjectId] Falling back to context project ID', {
    activeProjectId,
  });
  return activeProjectId ?? null;
}
