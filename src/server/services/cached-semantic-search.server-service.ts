/**
 * Enhanced Semantic Search Service with Caching and Performance Optimizations
 */
import { logger } from '@/server/logger';
import { SearchResultCache } from '@/lib/cache/searchCache';
import {
  executeSemanticSearch,
  SemanticSearchServiceParams,
} from './semantic-search.server-service';
import { SearchResult } from '@/types/searchTypes';

export interface CachedSearchParams extends SemanticSearchServiceParams {
  useCache?: boolean;
  cacheTTL?: number; // Override default cache TTL
}

export interface OptimizedSearchResponse {
  results: unknown[];
  totalCount: number;
  originalCount?: number;
  excludedCount?: number;
  jobId?: string;
  message?: string;
  fromCache?: boolean;
  cacheAge?: number; // Age in minutes if from cache
}

/**
 * Enhanced semantic search with caching and optimization
 * Now accepts searchCache as a parameter for request isolation
 */
export async function executeOptimizedSearch(
  params: CachedSearchParams,
  apiKey: string,
  searchCache: SearchResultCache
): Promise<OptimizedSearchResponse> {
  const startTime = Date.now();

  logger.info('[CachedSemanticSearch] Starting optimized search', {
    projectId: params.projectId,
    queryCount: params.searchInputs.length,
    useCache: params.useCache !== false, // Default to true
  });

  // Try cache first (unless explicitly disabled)
  if (params.useCache !== false) {
    const cached = await searchCache.getCachedResults({
      queries: params.searchInputs,
      projectId: params.projectId,
      filterCPCs: params.filterCPCs,
      filterIPCRs: params.filterIPCRs,
      jurisdiction: params.jurisdiction,
    });

    if (cached) {
      const cacheAge = Math.round((Date.now() - cached.timestamp) / 1000 / 60);
      logger.info('[CachedSemanticSearch] Returning cached results', {
        resultCount: cached.results.length,
        cacheAgeMinutes: cacheAge,
        timeSaved: `${Date.now() - startTime}ms`,
      });

      return {
        results: cached.results,
        totalCount: cached.totalCount,
        originalCount: cached.originalCount,
        excludedCount: cached.excludedCount,
        fromCache: true,
        cacheAge,
        message: `Results from cache (${cacheAge} minutes old)`,
      };
    }
  }

  // Execute fresh search
  logger.info('[CachedSemanticSearch] Cache miss, executing fresh search');
  const searchResult = await executeSemanticSearch(params, apiKey);

  // Cache the results (unless explicitly disabled)
  if (params.useCache !== false) {
    await searchCache.setCachedResults(
      {
        queries: params.searchInputs,
        projectId: params.projectId,
        filterCPCs: params.filterCPCs,
        filterIPCRs: params.filterIPCRs,
        jurisdiction: params.jurisdiction,
      },
      {
        results: searchResult.results.map((ref: any) => ({
          ...ref,
          patentNumber: ref.number, // Map 'number' to 'patentNumber'
        })) as SearchResult[],
        totalCount: searchResult.totalCount,
        originalCount: searchResult.originalCount,
        excludedCount: searchResult.excludedCount,
      },
      params.cacheTTL
    );
  }

  const searchTime = Date.now() - startTime;
  logger.info('[CachedSemanticSearch] Fresh search completed', {
    resultCount: searchResult.results.length,
    totalTime: `${searchTime}ms`,
  });

  return {
    ...searchResult,
    fromCache: false,
  };
}

/**
 * Quick similarity search for common queries
 */
export async function quickSimilaritySearch(
  query: string,
  searchCache: SearchResultCache,
  _options?: {
    maxResults?: number;
    threshold?: number;
  }
): Promise<string[]> {
  // Implementation for finding similar cached queries
  // This could help suggest faster alternatives to users
  const stats = searchCache.getCacheStats();

  if (stats.validEntries === 0) {
    return [];
  }

  // For now, return empty array - could implement fuzzy matching later
  logger.debug('[CachedSemanticSearch] Quick similarity search', {
    query: query.substring(0, 50),
    cacheEntries: stats.validEntries,
  });

  return [];
}

/**
 * Preload search results for common queries
 */
export async function preloadCommonSearches(
  projectId: string,
  commonQueries: string[],
  apiKey: string,
  searchCache: SearchResultCache
): Promise<void> {
  logger.info('[CachedSemanticSearch] Preloading common searches', {
    projectId,
    queryCount: commonQueries.length,
  });

  // Execute searches in parallel for preloading
  const preloadPromises = commonQueries.map(async query => {
    try {
      await executeOptimizedSearch(
        {
          searchInputs: [query],
          projectId,
          useCache: true, // Will cache the results
        },
        apiKey,
        searchCache
      );
    } catch (error) {
      logger.warn('[CachedSemanticSearch] Preload failed for query', {
        query: query.substring(0, 50),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  await Promise.allSettled(preloadPromises);
  logger.info('[CachedSemanticSearch] Preload completed');
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStatistics(searchCache: SearchResultCache) {
  return searchCache.getCacheStats();
}

/**
 * Clear search cache (useful for debugging or manual refresh)
 */
export async function clearSearchCache(
  searchCache: SearchResultCache
): Promise<void> {
  await searchCache.clearCache();
  logger.info('[CachedSemanticSearch] Cache cleared');
}
