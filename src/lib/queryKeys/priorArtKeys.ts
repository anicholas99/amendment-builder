/**
 * @fileoverview Query key factory for prior art related queries
 */

import { getCurrentTenant } from './tenant';

export const priorArtKeys = {
  /**
   * Base key for all prior art queries
   */
  all: ['priorArt'] as const,

  /**
   * Query keys for saved prior art
   */
  saved: {
    all: () => [getCurrentTenant(), 'savedPriorArt'] as const,
    byProject: (projectId: string) =>
      [...priorArtKeys.saved.all(), 'project', projectId] as const,
    detail: (priorArtId: string) =>
      [...priorArtKeys.saved.all(), 'detail', priorArtId] as const,
  },

  /**
   * Query keys for prior art analysis
   */
  analysis: {
    all: ['priorArt', 'analysis'] as const,
    byProject: (projectId: string) =>
      [...priorArtKeys.all, 'analysis', 'project', projectId] as const,
  },

  /**
   * Query keys for prior art search
   */
  search: {
    all: () => [getCurrentTenant(), 'priorArtSearch'] as const,
    byProject: (projectId: string) =>
      [...priorArtKeys.search.all(), 'project', projectId] as const,
    byQuery: (query: string) =>
      [...priorArtKeys.search.all(), 'query', query] as const,
  },

  /**
   * Query keys for project exclusions
   */
  exclusions: (projectId: string) =>
    [getCurrentTenant(), 'priorArt', 'exclusions', projectId] as const,

  /**
   * Query keys for prior art cache
   */
  cache: {
    all: () => [getCurrentTenant(), 'priorArtCache'] as const,
    byProject: (projectId: string) =>
      [...priorArtKeys.cache.all(), 'project', projectId] as const,
  },
} as const;
