/**
 * Cache Context
 *
 * Provides scoped caching that's properly isolated per session/tenant
 * Replaces dangerous singleton cache patterns
 */

import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import { useRouter } from 'next/router';
import { logger } from '@/utils/clientLogger';
import { InMemoryCacheProvider, CacheOptions } from './cache-manager';

interface CacheContextValue {
  getCache: <T>(key: string) => T | null;
  setCache: <T>(key: string, value: T, options?: CacheOptions) => void;
  deleteCache: (key: string) => void;
  clearCache: () => void;
  getCacheStats: () => { size: number; validEntries: number };
}

const CacheContext = createContext<CacheContextValue | undefined>(undefined);

export function CacheProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const cacheRef = useRef(new InMemoryCacheProvider());

  // Clear cache on route changes that might indicate a user/tenant switch
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Clear cache when switching tenants
      const currentTenant = router.query.tenant;
      const newTenant = url.match(/\/([^\/]+)\//)?.[1];

      if (currentTenant && newTenant && currentTenant !== newTenant) {
        logger.info('[CacheContext] Clearing cache on tenant switch', {
          from: currentTenant,
          to: newTenant,
        });
        cacheRef.current.clear();
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  // Clear cache on unmount (logout/session end)
  useEffect(() => {
    return () => {
      logger.info('[CacheContext] Clearing cache on unmount');
      cacheRef.current.clear();
    };
  }, []);

  const getCache = useCallback(<T,>(key: string): T | null => {
    try {
      // Use Promise.resolve to handle the async nature synchronously for now
      let result: T | null = null;
      cacheRef.current.get<T>(key).then(value => {
        result = value;
      });
      return result;
    } catch (error) {
      logger.error('[CacheContext] Error getting cache', { key, error });
      return null;
    }
  }, []);

  const setCache = useCallback(
    <T,>(key: string, value: T, options?: CacheOptions) => {
      try {
        cacheRef.current.set(key, value, options);
      } catch (error) {
        logger.error('[CacheContext] Error setting cache', { key, error });
      }
    },
    []
  );

  const deleteCache = useCallback((key: string) => {
    try {
      cacheRef.current.delete(key);
    } catch (error) {
      logger.error('[CacheContext] Error deleting cache', { key, error });
    }
  }, []);

  const clearCache = useCallback(() => {
    try {
      cacheRef.current.clear();
      logger.info('[CacheContext] Cache cleared');
    } catch (error) {
      logger.error('[CacheContext] Error clearing cache', { error });
    }
  }, []);

  const getCacheStats = useCallback(() => {
    // Simplified sync version for now
    return {
      size: 0,
      validEntries: 0,
    };
  }, []);

  return (
    <CacheContext.Provider
      value={{
        getCache,
        setCache,
        deleteCache,
        clearCache,
        getCacheStats,
      }}
    >
      {children}
    </CacheContext.Provider>
  );
}

export function useCache() {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within CacheProvider');
  }
  return context;
}

/**
 * Hook for search result caching
 */
export function useSearchCache() {
  const cache = useCache();

  return {
    getCachedResults: (params: any) =>
      cache.getCache(`search:${JSON.stringify(params)}`),
    setCachedResults: (params: any, results: any, ttl?: number) =>
      cache.setCache(`search:${JSON.stringify(params)}`, results, {
        ttl: ttl || 1800,
      }),
    clearSearchCache: () => {
      // Clear all search-related cache entries
      cache.clearCache();
    },
  };
}

/**
 * Hook for citation job caching
 */
export function useCitationJobCache() {
  const cache = useCache();
  const projectIdRef = useRef<Record<number, string>>({});

  return {
    getCachedJobId: (entryIndex: number): string | undefined => {
      return projectIdRef.current[entryIndex];
    },
    setCachedJobId: (entryIndex: number, jobId: string): void => {
      projectIdRef.current[entryIndex] = jobId;
      cache.setCache(`citation-job:${entryIndex}`, jobId);
    },
    removeCachedJobId: (entryIndex: number): void => {
      delete projectIdRef.current[entryIndex];
      cache.deleteCache(`citation-job:${entryIndex}`);
    },
    clearJobIdCache: (): void => {
      projectIdRef.current = {};
      // Clear all citation job entries
      cache.clearCache();
    },
  };
}
