/**
 * Centralized React Query Key Factory
 *
 * Provides type-safe, consistent query keys across the application.
 * Each domain has its own key factory to prevent duplication and simplify cache management.
 */
import { QueryClient } from '@tanstack/react-query';

// --- Export all key factories from a single entry point ---
export { authQueryKeys } from './authKeys';
export { chatKeys } from './chatKeys';
export { citationKeys } from './citationKeys';
export { debugKeys } from './debugKeys';
export { exclusionKeys } from './exclusionKeys';
export { inventionQueryKeys as inventionKeys } from './inventionKeys';
export { patentKeys } from './patentKeys';
export { priorArtKeys } from './priorArtKeys';
export { projectKeys } from './projectKeys';
export { searchKeys } from './searchKeys';
export { systemKeys } from './systemKeys';
export { tenantQueryKeys } from './tenantKeys';
export { userKeys } from './userKeys';
export { versionKeys } from './versionKeys';

// Import all key factories for use in helper functions
import { projectKeys } from './projectKeys';
import { inventionQueryKeys } from './inventionKeys';
import { searchKeys } from './searchKeys';
import { priorArtKeys } from './priorArtKeys';
import { exclusionKeys } from './exclusionKeys';
import { patentKeys } from './patentKeys';
import { chatKeys } from './chatKeys';
import { draftQueryKeys } from './draftQueryKeys';

/**
 * Helper function to get all keys for a project that might need invalidation.
 * Useful for invalidating all project-related queries after a broad mutation.
 */
export function getProjectRelatedInvalidationKeys(projectId: string) {
  return [
    projectKeys.all, // Invalidate project lists
    projectKeys.detail(projectId), // Invalidate specific project details
    inventionQueryKeys.detail(projectId),
    searchKeys.history.list(projectId),
    priorArtKeys.saved.byProject(projectId),
    exclusionKeys.byProject(projectId),
    patentKeys.versions.byProject(projectId),
    chatKeys.history(projectId, 'project'), // A guess at a common context
    draftQueryKeys.all(projectId), // Invalidate draft documents
  ];
}

/**
 * Helper function to invalidate all queries related to a project.
 * Use this after any major project mutation (e.g., updating core details).
 */
export const invalidateProjectData = (
  queryClient: QueryClient,
  projectId: string
) => {
  queryClient.invalidateQueries({
    predicate: (query: any) => {
      const queryKey = query.queryKey as string[];
      // Invalidate if the query key array contains the projectId.
      // This is a broad but effective strategy for project-wide updates.
      return queryKey.includes(projectId);
    },
  });
};
