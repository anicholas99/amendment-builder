/**
 * Development tool for debugging React Query cache state
 * This file provides utilities to inspect and debug the query cache
 */

import { QueryClient } from '@tanstack/react-query';
import { logger } from '@/utils/clientLogger';
import { isDevelopment } from '@/config/environment.client';

// Extend the Window interface for debug utilities
declare global {
  interface Window {
    debugQueryKeys?: () => void;
  }
}

/**
 * Debug utility to inspect React Query cache keys
 * Useful for verifying tenant isolation is working correctly
 */
export function debugQueryKeys(queryClient: QueryClient) {
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();

  const keysByTenant: Record<string, string[][]> = {};
  const noTenantKeys: string[][] = [];

  queries.forEach(query => {
    const queryKey = query.queryKey as string[];
    const firstKey = queryKey[0];

    // Group by first key (should be tenant slug)
    if (typeof firstKey === 'string' && firstKey !== 'no-tenant') {
      if (!keysByTenant[firstKey]) {
        keysByTenant[firstKey] = [];
      }
      keysByTenant[firstKey].push(queryKey);
    } else {
      noTenantKeys.push(queryKey);
    }
  });

  logger.info('=== React Query Cache Debug ===');
  logger.info(`Total queries in cache: ${queries.length}`);

  Object.entries(keysByTenant).forEach(([tenant, keys]) => {
    logger.info(`\nTenant "${tenant}": ${keys.length} queries`);
    keys.forEach(key => {
      logger.info(`  - ${JSON.stringify(key)}`);
    });
  });

  if (noTenantKeys.length > 0) {
    logger.warn(`\n⚠️  Queries without tenant prefix: ${noTenantKeys.length}`);
    noTenantKeys.forEach(key => {
      logger.warn(`  - ${JSON.stringify(key)}`);
    });
  }

  logger.info('===============================\n');
}

// Expose to window in development for easy debugging
if (typeof window !== 'undefined' && isDevelopment) {
  window.debugQueryKeys = () => {
    const queryClient = window.__REACT_QUERY_CLIENT__ as
      | QueryClient
      | undefined;
    if (queryClient instanceof QueryClient) {
      debugQueryKeys(queryClient);
    } else {
      logger.error(
        'Query client not found. Make sure to expose it in _app.tsx'
      );
    }
  };
}
