import { createHash } from 'crypto';
import { SearchResult } from '@/types/searchTypes';

interface SearchParams {
  queries: string[];
  projectId?: string;
  filterCPCs?: string[];
  filterIPCRs?: string[];
  jurisdiction?: string;
}

interface SearchResultData {
  results: SearchResult[];
  totalCount: number;
  originalCount?: number;
  excludedCount?: number;
}

interface CachedSearchResult extends SearchResultData {
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class SearchResultCache {
  private cache = new Map<string, CachedSearchResult>();
  private readonly DEFAULT_TTL = 1000 * 60 * 30; // 30 minutes

  /**
   * Generate cache key from search parameters
   */
  private generateCacheKey(params: SearchParams): string {
    const normalizedParams = {
      queries: params.queries.sort(), // Sort for consistent key
      projectId: params.projectId || '',
      filterCPCs: (params.filterCPCs || []).sort(),
      filterIPCRs: (params.filterIPCRs || []).sort(),
      jurisdiction: params.jurisdiction || 'US',
    };

    const keyString = JSON.stringify(normalizedParams);
    return createHash('md5').update(keyString).digest('hex');
  }

  /**
   * Check if cached result is still valid
   */
  private isValidCache(cached: CachedSearchResult): boolean {
    const now = Date.now();
    return now - cached.timestamp < cached.ttl;
  }

  /**
   * Get cached search results if available and valid
   */
  async getCachedResults(
    params: SearchParams
  ): Promise<CachedSearchResult | null> {
    const cacheKey = this.generateCacheKey(params);
    const cached = this.cache.get(cacheKey);

    if (!cached) {
      // Debug logging removed for client compatibility
      return null;
    }

    if (!this.isValidCache(cached)) {
      // Debug logging removed for client compatibility
      this.cache.delete(cacheKey);
      return null;
    }
    // Info logging removed for client compatibility

    return cached;
  }

  /**
   * Cache search results
   */
  async setCachedResults(
    params: SearchParams,
    results: SearchResultData,
    customTTL?: number
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(params);
    const ttl = customTTL || this.DEFAULT_TTL;

    const cachedResult: CachedSearchResult = {
      ...results,
      timestamp: Date.now(),
      ttl,
    };

    this.cache.set(cacheKey, cachedResult);
    // Info logging removed for client compatibility

    // Cleanup old entries periodically
    this.cleanupExpiredEntries();
  }

  /**
   * Remove expired entries from cache
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let removedCount = 0;

    Array.from(this.cache.entries()).forEach(([key, cached]) => {
      if (!this.isValidCache(cached)) {
        this.cache.delete(key);
        removedCount++;
      }
    });

    if (removedCount > 0) {
      // Debug logging removed for client compatibility
    }
  }

  /**
   * Clear all cached results
   */
  async clearCache(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    // Info logging removed for client compatibility
  }

  /**
   * Get cache stats
   */
  getCacheStats(): {
    size: number;
    validEntries: number;
    expiredEntries: number;
  } {
    let validEntries = 0;
    let expiredEntries = 0;

    Array.from(this.cache.values()).forEach(cached => {
      if (this.isValidCache(cached)) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    });

    return {
      size: this.cache.size,
      validEntries,
      expiredEntries,
    };
  }
}

// Export the class for request-scoped instantiation
export { SearchResultCache };

/**
 * Redis-based cache for production (optional enhancement)
 */
export class RedisSearchCache {
  // TODO: Replace with actual Redis client type from the Redis library being used (e.g., ioredis)
  private redis: unknown; // Redis client - type depends on Redis library
  private readonly DEFAULT_TTL = 60 * 30; // 30 minutes in seconds

  constructor(redisClient?: unknown) {
    this.redis = redisClient;
  }

  private generateCacheKey(params: SearchParams): string {
    const keyString = JSON.stringify(params);
    return `search:${createHash('md5').update(keyString).digest('hex')}`;
  }

  async getCachedResults(
    params: SearchParams
  ): Promise<CachedSearchResult | null> {
    if (!this.redis) return null;

    try {
      const cacheKey = this.generateCacheKey(params);
      // TODO: Add proper typing once Redis client type is determined
      const cached = await (
        this.redis as { get: (key: string) => Promise<string | null> }
      ).get(cacheKey);

      if (!cached) return null;

      const result = JSON.parse(cached) as CachedSearchResult;
      // Info logging removed for client compatibility

      return result;
    } catch (error) {
      // Error logging removed for client compatibility
      return null;
    }
  }

  async setCachedResults(
    params: SearchParams,
    results: SearchResultData,
    customTTL?: number
  ): Promise<void> {
    if (!this.redis) return;

    try {
      const cacheKey = this.generateCacheKey(params);
      const ttl = customTTL || this.DEFAULT_TTL;

      const cachedResult: CachedSearchResult = {
        ...results,
        timestamp: Date.now(),
        ttl: ttl * 1000, // Convert seconds to milliseconds for consistency
      };

      // TODO: Add proper typing once Redis client type is determined
      await (
        this.redis as {
          setex: (key: string, ttl: number, value: string) => Promise<string>;
        }
      ).setex(cacheKey, ttl, JSON.stringify(cachedResult));
      // Info logging removed for client compatibility
    } catch (error) {
      // Error logging removed for client compatibility
    }
  }
}
