import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { logger } from '@/lib/monitoring/logger';
import type { UseClaimSyncStateReturn } from '@/features/claim-refinement/hooks/useClaimSyncState';

interface UseSearchExecutionOptions {
  onSearch: (mode: 'basic' | 'advanced') => void;
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
}: UseSearchExecutionOptions) {
  const toast = useToast();
  const [isSearching, setIsSearching] = useState(false);

  const executeSearch = useCallback(
    async (mode: 'basic' | 'advanced') => {
      logger.info('[SearchTabContainer] Starting search execution', {
        mode,
        hasQueries: claimSyncState && claimSyncState.searchQueries.length > 0,
        outOfSync: claimSyncState?.syncStatus === 'out-of-sync',
        claimSyncState: claimSyncState?.syncStatus,
      });

      try {
        setIsSearching(true);
        searchStartTimeRef.current = Date.now();

        // Create optimistic search
        const tempSearchId = `optimistic-${Date.now()}`;
        onStartOptimisticSearch(
          tempSearchId,
          projectId || '',
          claimSyncState?.searchQueries,
          claimSyncState?.parsedElements
        );

        // Execute search through the onSearch prop
        await onSearch(mode);

        // If direct search handler exists, use it for the full flow
        if (onDirectSearch) {
          await onDirectSearch();
        }
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
      } finally {
        // Ensure minimum duration for loading state to prevent flicker
        const elapsed = Date.now() - searchStartTimeRef.current;
        const remaining = minimumSearchDuration - elapsed;

        if (remaining > 0) {
          setTimeout(() => {
            setIsSearching(false);
          }, remaining);
        } else {
          setIsSearching(false);
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
    ]
  );

  return {
    isSearching,
    executeSearch,
  };
}
