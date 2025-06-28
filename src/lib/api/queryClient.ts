/**
 * Standardized React Query hooks and utilities
 *
 * This module provides type-safe React Query hooks that automatically
 * use apiFetch for all API calls, ensuring consistent tenant handling,
 * CSRF protection, and error handling.
 */

import React from 'react';
import {
  useMutation,
  useQuery,
  UseQueryOptions,
  UseMutationOptions,
  QueryClient,
} from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { apiFetch } from './apiClient';
import { logger } from '@/lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { STALE_TIME } from '@/constants/time';

/**
 * Global mutation error handler for React Query
 * Automatically shows toast notifications for all mutation errors
 */
function createGlobalMutationErrorHandler() {
  return (error: unknown) => {
    const appError =
      error instanceof ApplicationError
        ? error
        : new ApplicationError(
            ErrorCode.INTERNAL_ERROR,
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred'
          );

    // Log the error
    logger.error('[RQ Mutation Error]', {
      error: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
    });

    // Don't show toast for certain error types that components handle themselves
    const suppressToastCodes = [
      ErrorCode.AUTH_UNAUTHORIZED,
      ErrorCode.AUTH_SESSION_EXPIRED,
    ];

    if (!suppressToastCodes.includes(appError.code as any)) {
      // Emit a custom event that the error handler component can listen to
      window.dispatchEvent(
        new CustomEvent('global-mutation-error', {
          detail: appError,
        })
      );
    }
  };
}

/**
 * Create and configure the React Query client with global error handling
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (error instanceof ApplicationError) {
            // Don't retry user errors (4xx) including rate limits
            if (error.statusCode >= 400 && error.statusCode < 500) {
              return false;
            }
            // Specifically don't retry rate limit errors
            if (error.statusCode === 429) {
              return false;
            }
          }

          // Retry server errors and network errors up to 2 times
          return failureCount < 2;
        },
        staleTime: STALE_TIME.DEFAULT,
        gcTime: 10 * 60 * 1000, // 10 minutes - prevents memory bloat from unbounded cache growth
        // Optimized refetch settings for snappier navigation
        refetchOnWindowFocus: false, // Disable to prevent unnecessary refetches
        refetchOnMount: false, // Don't refetch when components mount - trust cache
        refetchInterval: false, // Disable automatic refetching by default
        networkMode: 'offlineFirst', // Use cached data first for instant display
      },
      mutations: {
        retry: (failureCount, error) => {
          if (error instanceof ApplicationError) {
            // Don't retry rate limit errors
            if (error.statusCode === 429) {
              return false;
            }
            // Only retry mutations for network errors or server errors
            if (
              error.code === ErrorCode.API_NETWORK_ERROR ||
              error.statusCode >= 500
            ) {
              return failureCount < 1; // Only retry once for mutations
            }
          }

          return false;
        },
        networkMode: 'offlineFirst', // Continue mutations even when offline
        // Global error handler for all mutations
        onError: createGlobalMutationErrorHandler(),
      },
    },
  });
}

/**
 * Hook to listen for global mutation errors and show toasts
 * Use this in your root component or layout (_app.tsx)
 */
export function useGlobalErrorHandler() {
  const toast = useToast();

  React.useEffect(() => {
    const handleGlobalError = (event: Event) => {
      const customEvent = event as CustomEvent<ApplicationError>;
      const error = customEvent.detail;

      // Check if a toast with the same ID is already shown to prevent duplicates
      const toastId = `error-${error.code}-${error.statusCode}`;

      if (!toast.isActive(toastId)) {
        toast({
          id: toastId,
          title: 'Error',
          description: error.message,
          status: 'error',
          duration: error.code === ErrorCode.API_NETWORK_ERROR ? 8000 : 5000,
          isClosable: true,
          position: 'bottom-right',
        });
      }
    };

    window.addEventListener('global-mutation-error', handleGlobalError);

    return () => {
      window.removeEventListener('global-mutation-error', handleGlobalError);
    };
  }, [toast]);
}

/**
 * Standard API response type
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Options for API queries
 */
export interface ApiQueryOptions<TQueryFnData = unknown, TData = TQueryFnData>
  extends Omit<
    UseQueryOptions<TQueryFnData, ApplicationError, TData>,
    'queryKey' | 'queryFn'
  > {
  url: string;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

/**
 * Options for API mutations
 */
export interface ApiMutationOptions<TData = unknown, TVariables = unknown>
  extends Omit<
    UseMutationOptions<TData, ApplicationError, TVariables>,
    'mutationKey'
  > {
  url?: string; // URL is now optional if mutationFn is provided
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
}

/**
 * Build URL with query parameters
 */
function buildUrl(
  baseUrl: string,
  params?: Record<string, string | number | boolean>
): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  return `${baseUrl}?${searchParams.toString()}`;
}

/**
 * Generic fetch function that uses apiFetch
 * apiFetch already throws ApplicationError, so we just need to handle the response
 */
async function fetchWithApiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await apiFetch(url, options);

  // Handle empty responses (204 No Content, etc.)
  if (
    response.status === 204 ||
    response.headers.get('content-length') === '0'
  ) {
    return {} as T;
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return await response.json();
  }

  // For non-JSON responses, return the text as-is
  const text = await response.text();
  return text as unknown as T;
}

/**
 * Standardized React Query hook for GET requests
 */
export function useApiQuery<TQueryFnData = unknown, TData = TQueryFnData>(
  queryKey: string | string[],
  options: ApiQueryOptions<TQueryFnData, TData>
) {
  const { url, params, headers, ...queryOptions } = options;
  const finalUrl = buildUrl(url, params);

  return useQuery<TQueryFnData, ApplicationError, TData>({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: () =>
      fetchWithApiFetch<TQueryFnData>(finalUrl, {
        method: 'GET',
        headers,
      }),
    ...queryOptions,
  });
}

/**
 * Standardized React Query hook for mutations (POST, PUT, PATCH, DELETE)
 */
export function useApiMutation<TData = unknown, TVariables = unknown>(
  options: ApiMutationOptions<TData, TVariables>
) {
  const {
    url,
    method = 'POST',
    headers,
    mutationFn,
    ...mutationOptions
  } = options;

  const finalMutationFn =
    mutationFn ||
    ((variables: TVariables) => {
      if (!url) {
        throw new Error(
          "useApiMutation must be called with either a 'url' or a 'mutationFn' option."
        );
      }
      let finalUrl = url;
      let body: string | undefined;

      // Handle different HTTP methods
      if (method === 'DELETE') {
        // For DELETE, check if variables contain special parameters
        if (variables && typeof variables === 'object') {
          const vars = variables as any;

          // If there's a patentNumber, append it as a query parameter
          if (vars.patentNumber) {
            finalUrl = `${url}?patentNumber=${encodeURIComponent(vars.patentNumber)}`;
          }
          // If there's an id field, append it to the URL path
          else if (vars.id) {
            finalUrl = `${url}/${vars.id}`;
          }
        }
      } else {
        // For non-DELETE methods, send variables as JSON body
        if (variables !== undefined) {
          body = JSON.stringify(variables);
        }
      }

      return fetchWithApiFetch<TData>(finalUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body,
      });
    });

  return useMutation<TData, ApplicationError, TVariables>({
    mutationFn: finalMutationFn,
    ...mutationOptions,
  });
}

/**
 * Helper hook for paginated queries
 */
export function useApiPaginatedQuery<TData = unknown>(
  queryKey: string | string[],
  page: number,
  pageSize: number,
  options: Omit<ApiQueryOptions<TData>, 'params'>
) {
  const paginationParams: Record<string, string | number | boolean> = {
    page,
    pageSize,
  };

  const baseKey = Array.isArray(queryKey) ? queryKey : [queryKey];
  const finalKey = [...baseKey, `page_${page}`, `size_${pageSize}`];

  return useApiQuery(finalKey, {
    ...options,
    params: paginationParams,
  });
}

/**
 * Helper hook for infinite queries
 */
export function useApiInfiniteQuery<TData = unknown>(
  _queryKey: string | string[],
  _options: ApiQueryOptions<TData>
) {
  // Implementation would use useInfiniteQuery from React Query
  // This is a placeholder for now
  throw new ApplicationError(
    ErrorCode.NOT_IMPLEMENTED,
    'useApiInfiniteQuery not yet implemented'
  );
}

/**
 * Helper to invalidate queries with error handling
 */
export async function invalidateApiQueries(
  queryClient: QueryClient,
  queryKey: string | string[]
): Promise<void> {
  try {
    await queryClient.invalidateQueries({
      queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    });
  } catch (error) {
    logger.error('Failed to invalidate queries', { queryKey, error });
    throw new ApplicationError(
      ErrorCode.CACHE_INVALIDATION_ERROR,
      error instanceof Error ? error.message : 'Failed to update cache'
    );
  }
}

/**
 * Helper to prefetch queries with error handling
 */
export async function prefetchApiQuery<TData = unknown>(
  queryClient: QueryClient,
  queryKey: string | string[],
  options: ApiQueryOptions<TData>
): Promise<void> {
  try {
    const { url, params, headers } = options;
    const finalUrl = buildUrl(url, params);

    await queryClient.prefetchQuery({
      queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
      queryFn: () =>
        fetchWithApiFetch<TData>(finalUrl, {
          method: 'GET',
          headers,
        }),
    });
  } catch (error) {
    logger.error('Failed to prefetch query', { queryKey, error });
    throw new ApplicationError(
      ErrorCode.CACHE_INVALIDATION_ERROR,
      error instanceof Error ? error.message : 'Failed to prefetch data'
    );
  }
}
