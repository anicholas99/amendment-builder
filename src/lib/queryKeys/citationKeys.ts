/**
 * @fileoverview Query key factory for citation-related queries
 */

import { getCurrentTenant } from './tenant';

export const citationKeys = {
  all: ['citations'] as const,
  lists: () => [getCurrentTenant(), ...citationKeys.all, 'list'] as const,
  list: (filters?: unknown) => [...citationKeys.lists(), filters] as const,
  details: () => [getCurrentTenant(), ...citationKeys.all, 'detail'] as const,
  detail: (id: string) => [...citationKeys.details(), id] as const,

  // Project-specific queries
  byProject: (projectId: string) =>
    [getCurrentTenant(), ...citationKeys.all, 'project', projectId] as const,
  bySearchHistory: (searchHistoryId: string) =>
    [
      getCurrentTenant(),
      ...citationKeys.all,
      'searchHistory',
      searchHistoryId,
    ] as const,
  forMultipleSearches: (searchHistoryIds: string[]) =>
    [
      getCurrentTenant(),
      ...citationKeys.all,
      'forMultipleSearches',
      searchHistoryIds,
    ] as const,

  // Jobs - use functions for lazy evaluation
  jobs: {
    all: () => [getCurrentTenant(), 'citationJobs'] as const,
    list: (projectId?: string) =>
      projectId
        ? [...citationKeys.jobs.all(), 'project', projectId]
        : [...citationKeys.jobs.all(), 'list'],
    detail: (jobId: string) => [...citationKeys.jobs.all(), 'detail', jobId],
    bySearchHistory: (searchHistoryId: string) => [
      ...citationKeys.jobs.all(),
      'searchHistory',
      searchHistoryId,
    ],
  },

  // Matches - use functions for lazy evaluation
  matches: {
    all: () => [getCurrentTenant(), 'citationMatches'] as const,
    list: (filters?: unknown) => [
      ...citationKeys.matches.all(),
      'list',
      filters,
    ],
    bySearchHistory: (searchHistoryId: string) => [
      ...citationKeys.matches.all(),
      'searchHistory',
      searchHistoryId,
    ],
    byProject: (projectId: string) => [
      ...citationKeys.matches.all(),
      'project',
      projectId,
    ],
  },

  // Top matches from deep analysis
  topMatches: (searchHistoryId: string, referenceNumber?: string) =>
    [
      getCurrentTenant(),
      'citationTopMatches',
      searchHistoryId,
      referenceNumber,
    ] as const,
} as const;

// Backward compatibility exports
export const citationJobKeys = {
  all: ['citationJob'] as const,
  list: (searchHistoryId: string) =>
    [
      getCurrentTenant(),
      ...citationJobKeys.all,
      'list',
      searchHistoryId,
    ] as const,
  detail: (jobId: string) =>
    [getCurrentTenant(), ...citationJobKeys.all, 'detail', jobId] as const,
  status: (jobId: string) =>
    [getCurrentTenant(), ...citationJobKeys.all, 'status', jobId] as const,
};

export const citationMatchesKeys = {
  all: ['citationMatches'] as const,
  bySearch: (searchHistoryId: string) =>
    [getCurrentTenant(), ...citationMatchesKeys.all, searchHistoryId] as const,
};
