import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import type { UseClaimSyncStateReturn } from '@/features/claim-refinement/hooks/useClaimSyncState';

interface UseSearchExecutionOptions {
  onSearch: (mode: 'basic' | 'advanced', correlationId?: string) => void;
  onDirectSearch?: () => void;
  projectId?: string;
  claimSyncState?: UseClaimSyncStateReturn & { onOpenModal?: () => void };
  minimumSearchDuration?: number;
  onStartOptimisticSearch: (
    tempSearchId: string,
    projectId: string,
    searchQueries?: string[],
    parsedElements?: string[]
  ) => void;
  onClearOptimisticSearch: () => void;
  searchStartTimeRef: React.MutableRefObject<number>;
  correlationIdRef?: React.MutableRefObject<string | null>;
}

export function useSearchExecution({
  onSearch,
  onDirectSearch,
  projectId,
  claimSyncState,
  minimumSearchDuration = 1000,
  onStartOptimisticSearch,
  onClearOptimisticSearch,
  searchStartTimeRef,
  correlationIdRef,
}: UseSearchExecutionOptions) {
  const toast = useToast();
  const [isSearching, setIsSearching] = useState(false);
  const searchInProgressRef = useRef(false);
  const currentSearchIdRef = useRef<string | null>(null);

  const executeSearch = useCallback(
    async (mode: 'basic' | 'advanced') => {
      // Guard against double execution in StrictMode
      if (searchInProgressRef.current) {
        logger.debug(
          '[SearchExecution] Search already in progress, skipping duplicate execution'
        );
        return;
      }

      logger.info('[SearchTabContainer] Starting search execution', {
        mode,
        hasQueries: claimSyncState && claimSyncState.searchQueries.length > 0,
        outOfSync: claimSyncState?.syncStatus === 'out-of-sync',
        claimSyncState: claimSyncState?.syncStatus,
      });

      try {
        searchInProgressRef.current = true;
        setIsSearching(true);
        searchStartTimeRef.current = Date.now();

        // Generate a stable search ID - reuse if we have one from a recent attempt
        const now = Date.now();
        if (
          !currentSearchIdRef.current ||
          now - searchStartTimeRef.current > 1000
        ) {
          currentSearchIdRef.current = `optimistic-${now}-${Math.random().toString(36).substr(2, 9)}`;
        }

        const tempSearchId = currentSearchIdRef.current;

        onStartOptimisticSearch(
          tempSearchId,
          projectId || '',
          claimSyncState?.searchQueries,
          claimSyncState?.parsedElements
        );

        // Pass correlation ID to the search handler
        const correlationId = correlationIdRef?.current || undefined;

        // Execute search through the onSearch prop with correlation ID
        await onSearch(mode, correlationId);

        // If direct search handler exists, use it for the full flow
        if (onDirectSearch) {
          await onDirectSearch();
        }

        // Clear the search ID after successful execution
        currentSearchIdRef.current = null;
      } catch (error) {
        logger.error('[SearchTabContainer] Search failed:', { error });
        toast({
          title: 'Search Failed',
          description: 'An error occurred while searching. Please try again.',
          status: 'error',
          duration: 5000,
        });

        // Remove optimistic entry on error
        onClearOptimisticSearch();
        currentSearchIdRef.current = null;
      } finally {
        // Ensure minimum duration for loading state to prevent flicker
        const elapsed = Date.now() - searchStartTimeRef.current;
        const remaining = minimumSearchDuration - elapsed;

        if (remaining > 0) {
          setTimeout(() => {
            setIsSearching(false);
            searchInProgressRef.current = false;
          }, remaining);
        } else {
          setIsSearching(false);
          searchInProgressRef.current = false;
        }
      }
    },
    [
      onSearch,
      onDirectSearch,
      toast,
      claimSyncState,
      projectId,
      minimumSearchDuration,
      onStartOptimisticSearch,
      onClearOptimisticSearch,
      searchStartTimeRef,
      correlationIdRef,
    ]
  );

  return {
    isSearching,
    executeSearch,
  };
}
