import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { logger } from '@/utils/clientLogger';

interface OptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: unknown[];
  updateCache: (oldData: any, variables: TVariables) => any;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}

/**
 * Custom hook that handles optimistic updates properly
 * Ensures that optimistic updates persist until fresh data arrives
 */
export function useOptimisticMutation<TData = unknown, TVariables = unknown>({
  mutationFn,
  queryKey,
  updateCache,
  onSuccess,
  onError,
}: OptimisticMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables, { previousData: any }>({
    mutationFn,
    onMutate: async variables => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old: any) => {
        const updated = updateCache(old, variables);
        logger.debug('[useOptimisticMutation] Applied optimistic update', {
          queryKey,
          previousData: old,
          newData: updated,
        });
        return updated;
      });

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (err, variables, context) => {
      logger.error('[useOptimisticMutation] Mutation failed, rolling back', {
        queryKey,
        error: err,
      });

      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }

      onError?.(err, variables);
    },
    onSuccess: async (data, variables) => {
      logger.debug('[useOptimisticMutation] Mutation succeeded', {
        queryKey,
        data,
      });

      // Call the success handler
      onSuccess?.(data, variables);
    },
    onSettled: async (data, error, variables, context) => {
      // Only invalidate on error - let optimistic updates persist on success
      if (error) {
        logger.debug('[useOptimisticMutation] Invalidating due to error', {
          queryKey,
          error,
        });
        queryClient.invalidateQueries({ queryKey });
      } else {
        logger.debug(
          '[useOptimisticMutation] Mutation succeeded - keeping optimistic data',
          {
            queryKey,
          }
        );
      }
    },
  });
}

/**
 * Helper to create a mutation that updates multiple related queries
 */
export function useOptimisticMultiMutation<
  TData = unknown,
  TVariables = unknown,
>({
  mutationFn,
  updates,
  onSuccess,
  onError,
}: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  updates: Array<{
    queryKey: unknown[];
    updateCache: (oldData: any, variables: TVariables) => any;
  }>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<
    TData,
    Error,
    TVariables,
    { previousDataMap: Map<string, any> }
  >({
    mutationFn,
    onMutate: async variables => {
      // Cancel queries for all affected keys
      await Promise.all(
        updates.map(({ queryKey }) => queryClient.cancelQueries({ queryKey }))
      );

      // Snapshot all previous values
      const previousDataMap = new Map();
      updates.forEach(({ queryKey }) => {
        previousDataMap.set(
          JSON.stringify(queryKey),
          queryClient.getQueryData(queryKey)
        );
      });

      // Apply all optimistic updates
      updates.forEach(({ queryKey, updateCache }) => {
        queryClient.setQueryData(queryKey, (old: any) => {
          const updated = updateCache(old, variables);
          logger.debug(
            '[useOptimisticMultiMutation] Applied optimistic update',
            {
              queryKey,
              updated,
            }
          );
          return updated;
        });
      });

      // Return context with all snapshots
      return { previousDataMap };
    },
    onError: (err, variables, context) => {
      logger.error(
        '[useOptimisticMultiMutation] Mutation failed, rolling back all',
        {
          error: err,
        }
      );

      // Roll back all updates
      if (context?.previousDataMap) {
        updates.forEach(({ queryKey }) => {
          const key = JSON.stringify(queryKey);
          const previousData = context.previousDataMap.get(key);
          if (previousData !== undefined) {
            queryClient.setQueryData(queryKey, previousData);
          }
        });
      }

      onError?.(err, variables);
    },
    onSuccess: async (data, variables) => {
      logger.debug('[useOptimisticMultiMutation] Mutation succeeded', {
        data,
      });

      onSuccess?.(data, variables);
    },
    onSettled: async (data, error) => {
      // Only invalidate on error - let optimistic updates persist on success
      if (error) {
        logger.debug('[useOptimisticMultiMutation] Invalidating due to error', {
          error,
        });
        updates.forEach(({ queryKey }) => {
          queryClient.invalidateQueries({ queryKey });
        });
      } else {
        logger.debug(
          '[useOptimisticMultiMutation] Mutation succeeded - keeping optimistic data'
        );
      }
    },
  });
}
