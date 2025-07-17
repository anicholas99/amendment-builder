/**
 * Global type declarations for window object extensions
 */

interface TenantCache {
  cachedTenantSlug?: string | null;
}

interface TenantDebugFunctions {
  getTenantDebugInfo: () => unknown;
  fixTenantContext: (targetTenant?: string) => Promise<void>;
  logTenantState: () => void;
  clearAllTenantCaches: () => void;
  clearProjectCaches: () => void;
}

interface ReactQueryDevtoolsStore {
  getQueryCache?: () => {
    getAll?: () => Array<{
      queryKey?: unknown[];
      state?: {
        status?: string;
        data?: unknown;
      };
    }>;
    getQueryClient?: () => unknown;
  };
}

interface ApiDebug {
  clearCache?: () => void;
}

interface LoggerConfig {
  enableVerboseLogging?: () => void;
  disableVerboseLogging?: () => void;
  loggerConfig?: () => unknown;
  __LOGGER_CONFIG__?: unknown;
}

declare global {
  interface Window {
    // Tenant debugging
    __tenantDebug?: TenantDebugFunctions;
    __tenantCache?: TenantCache;

    // React Query
    __REACT_QUERY_DEVTOOLS_GLOBAL_STORE__?: ReactQueryDevtoolsStore;
    __queryClient?: unknown;
    queryClient?: unknown;
    __REACT_QUERY_CLIENT__?: unknown;

    // API debugging
    __apiDebug?: ApiDebug;

    // Logger configuration
    __LOGGER_CONFIG__?: unknown;
    enableVerboseLogging?: () => void;
    disableVerboseLogging?: () => void;
    loggerConfig?: () => unknown;

    // Query key debugging
    __debugTenantKeys?: () => void;
    debugQueryKeys?: () => void;
  }
}

export {};
