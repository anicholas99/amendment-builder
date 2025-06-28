/**
 * React Query Configuration
 *
 * Centralized cache configuration for optimal performance
 * and consistent behavior across the application.
 */

import { QueryClient } from '@tanstack/react-query';
import { createQueryClient as createEnhancedQueryClient } from '@/lib/api/queryClient';

// Time constants in milliseconds
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/**
 * Query key factory for consistent key generation
 * Helps prevent key collisions and makes invalidation easier
 */
export const queryKeys = {
  // Project queries
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.projects.lists(), filters] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
    figures: (id: string) =>
      [...queryKeys.projects.detail(id), 'figures'] as const,
    figure: (projectId: string, figureId: string) =>
      [...queryKeys.projects.figures(projectId), figureId] as const,
  },

  // Search queries
  search: {
    all: ['search'] as const,
    history: () => [...queryKeys.search.all, 'history'] as const,
    historyList: (projectId: string) =>
      [...queryKeys.search.history(), projectId] as const,
    results: (searchId: string) =>
      [...queryKeys.search.all, 'results', searchId] as const,
    status: (searchId: string) =>
      [...queryKeys.search.all, 'status', searchId] as const,
  },

  // Citation queries
  citations: {
    all: ['citations'] as const,
    matches: (searchId: string) =>
      [...queryKeys.citations.all, 'matches', searchId] as const,
    jobs: (projectId: string) =>
      [...queryKeys.citations.all, 'jobs', projectId] as const,
    job: (jobId: string) => [...queryKeys.citations.all, 'job', jobId] as const,
  },

  // Prior art queries
  priorArt: {
    all: ['priorArt'] as const,
    saved: (projectId: string) =>
      [...queryKeys.priorArt.all, 'saved', projectId] as const,
    analysis: (projectId: string) =>
      [...queryKeys.priorArt.all, 'analysis', projectId] as const,
  },

  // Claim queries
  claims: {
    all: ['claims'] as const,
    parsed: (projectId: string) =>
      [...queryKeys.claims.all, 'parsed', projectId] as const,
    versions: (projectId: string) =>
      [...queryKeys.claims.all, 'versions', projectId] as const,
  },
};

/**
 * Stale time configuration by data type
 * Determines how long data is considered fresh before refetching
 */
export const staleTimeConfig = {
  // Static or rarely changing data
  projects: 5 * MINUTE,
  projectDetails: 10 * MINUTE,

  // Moderately dynamic data
  searchHistory: 2 * MINUTE,
  citationJobs: 1 * MINUTE,

  // Frequently changing data
  searchStatus: 5 * 1000, // 5 seconds for polling
  citationProgress: 10 * 1000, // 10 seconds

  // User-specific data
  savedPriorArt: 5 * MINUTE,
  userPreferences: 1 * HOUR,

  // Default for unspecified queries
  default: 5 * MINUTE,
};

/**
 * Cache time configuration
 * Determines how long inactive data stays in cache before garbage collection
 */
export const cacheTimeConfig = {
  // Keep important data longer
  projects: 30 * MINUTE,
  searchResults: 1 * HOUR,

  // Shorter cache for transient data
  searchStatus: 1 * MINUTE,
  temporaryData: 5 * MINUTE,

  // Default cache time
  default: 10 * MINUTE,
};

/**
 * Retry configuration by error type
 */
export const retryConfig = {
  // Network errors - retry more aggressively
  network: {
    retries: 3,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  },

  // Server errors (5xx) - retry with backoff
  server: {
    retries: 2,
    retryDelay: (attemptIndex: number) =>
      Math.min(2000 * 2 ** attemptIndex, 30000),
  },

  // Client errors (4xx) - don't retry
  client: {
    retries: 0,
  },

  // Default retry config
  default: {
    retries: 1,
    retryDelay: 1000,
  },
};

/**
 * Default query client configuration
 * Use this when creating the QueryClient instance
 */
export const defaultQueryClientConfig = {
  defaultOptions: {
    queries: {
      // Use the configured stale time
      staleTime: staleTimeConfig.default,

      // Use the configured cache time
      gcTime: cacheTimeConfig.default,

      // Disable automatic refetching in most cases
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false as const,

      // Retry configuration
      retry: (failureCount: number, error: any) => {
        // Don't retry on 4xx errors
        // Check both error.status and error.statusCode for compatibility
        if (
          (error?.status >= 400 && error?.status < 500) ||
          (error?.statusCode >= 400 && error?.statusCode < 500)
        ) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },

      // Network mode
      networkMode: 'online' as const,
    },
    mutations: {
      // Mutations typically shouldn't retry automatically
      retry: 1,

      // Network mode
      networkMode: 'online' as const,
    },
  },
};

/**
 * Helper function to invalidate related queries after mutations
 * Use this in mutation onSuccess handlers
 */
export const invalidateRelatedQueries = (
  queryClient: QueryClient,
  keys: readonly (readonly string[])[]
) => {
  keys.forEach(key => {
    queryClient.invalidateQueries({ queryKey: key });
  });
};

/**
 * Helper to set up smart prefetching
 * Prefetch data that's likely to be needed soon
 */
export const setupPrefetching = (queryClient: QueryClient) => {
  // Example: Prefetch project details when hovering over project links
  const prefetchProjectDetails = (projectId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.projects.detail(projectId),
      staleTime: staleTimeConfig.projectDetails,
    });
  };

  // Example: Prefetch search history when navigating to search tab
  const prefetchSearchHistory = (projectId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.search.historyList(projectId),
      staleTime: staleTimeConfig.searchHistory,
    });
  };

  return {
    prefetchProjectDetails,
    prefetchSearchHistory,
  };
};

/**
 * Export a configured QueryClient factory
 * This uses the enhanced query client from our api/queryClient module
 * which includes global error handling for mutations
 */
export const createQueryClient = () => {
  return createEnhancedQueryClient();
};
