import { useState, useEffect, useRef } from 'react';
import {
  useParseClaim,
  useGenerateQueries,
} from '@/hooks/api/useSearchMutations';
import { logger } from '@/utils/clientLogger';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToastWrapper';
import { ProjectApiService } from '@/client/services/project.client-service';

export type SyncStatus =
  | 'idle'
  | 'parsing'
  | 'generating'
  | 'synced'
  | 'error'
  | 'out-of-sync';

export interface ClaimSyncState {
  parsedElements: string[];
  searchQueries: string[];
  syncStatus: SyncStatus;
  error: string | null;
  lastSyncedClaim: string | null;
  lastSyncTime: Date | null;
  hasManualEdits?: boolean;
  needsSync?: boolean;
  isInitialLoading?: boolean; // Prevent flicker on mount
}

export interface UseClaimSyncStateReturn extends ClaimSyncState {
  resync: () => void;
  syncClaim: () => Promise<void>;
  updateElements: (newElements: string[]) => Promise<void>;
  updateElementsWithoutRegeneration: (newElements: string[]) => Promise<void>;
  updateQueries: (newQueries: string[]) => Promise<void>;
  isSynced: boolean;
  canSearch: boolean;
  resyncElementsOnly: () => Promise<void>;
  resyncQueriesOnly: (elements?: string[]) => Promise<void>;
}

interface UseClaimSyncStateProps {
  projectId: string;
  claim1Text: string | null;
  enabled?: boolean;
  debounceMs?: number;
}

/**
 * Hook that automatically parses claim 1 and generates search queries in the background
 * whenever the claim text changes. Provides sync status and pre-generated data.
 */
export function useClaimSync({
  projectId,
  claim1Text,
  enabled = true,
  debounceMs = 500, // Reduced from 1000ms for more responsive saves
}: UseClaimSyncStateProps): UseClaimSyncStateReturn {
  const [state, setState] = useState<ClaimSyncState>({
    parsedElements: [],
    searchQueries: [],
    syncStatus: 'idle',
    error: null,
    lastSyncedClaim: null,
    lastSyncTime: null,
    hasManualEdits: false,
    needsSync: false,
    isInitialLoading: true, // Set initial loading to true
  });

  const toast = useToast();

  // Debounce the claim text to avoid excessive change detection
  const debouncedClaim = useDebounce(claim1Text, debounceMs);

  // Track if we're currently syncing to prevent duplicate calls
  const isSyncingRef = useRef(false);

  const parseClaimMutation = useParseClaim();
  const generateQueriesMutation = useGenerateQueries();

  // Load sync data from database on mount
  useEffect(() => {
    if (!projectId) return;

    const loadSyncData = async () => {
      try {
        const syncData = await ProjectApiService.getClaimSync(projectId);

        if (syncData && syncData.parsedElements.length > 0) {
          setState({
            parsedElements: syncData.parsedElements,
            searchQueries: syncData.searchQueries,
            syncStatus: 'synced',
            error: null,
            lastSyncedClaim: syncData.lastSyncedClaim || null,
            lastSyncTime: null, // No timestamp available in sync data
            hasManualEdits: false,
            needsSync: false,
            isInitialLoading: false, // Set loading to false after data is loaded
          });

          logger.info('[useClaimSyncState] Loaded sync data from database', {
            elementCount: syncData.parsedElements.length,
            queryCount: syncData.searchQueries.length,
          });
        } else {
          setState({
            parsedElements: [],
            searchQueries: [],
            syncStatus: 'idle',
            error: null,
            lastSyncedClaim: null,
            lastSyncTime: null,
            hasManualEdits: false,
            needsSync: false,
            isInitialLoading: false, // Set loading to false even if no data
          });
        }
      } catch (error) {
        logger.error('[useClaimSyncState] Failed to load sync data', error);
        // Don't show error toast - this is expected on first load
        setState({
          parsedElements: [],
          searchQueries: [],
          syncStatus: 'idle',
          error: null,
          lastSyncedClaim: null,
          lastSyncTime: null,
          hasManualEdits: false,
          needsSync: false,
          isInitialLoading: false, // Set loading to false on error
        });
      }
    };

    loadSyncData();
  }, [projectId]);

  // Effect to detect changes (but not auto-sync)
  useEffect(() => {
    if (
      !enabled ||
      !projectId ||
      !debouncedClaim ||
      debouncedClaim.trim() === ''
    ) {
      return;
    }

    // Skip if we have manual edits - user has taken control
    if (state.hasManualEdits) {
      return;
    }

    // Check if claim has changed from last sync
    if (state.lastSyncedClaim !== debouncedClaim) {
      setState(prev => ({
        ...prev,
        syncStatus: prev.parsedElements.length > 0 ? 'out-of-sync' : 'idle',
        needsSync: true,
      }));
    }
  }, [
    debouncedClaim,
    state.lastSyncedClaim,
    state.hasManualEdits,
    enabled,
    projectId,
  ]);

  // Manual sync function
  const syncClaim = async () => {
    if (!projectId || !debouncedClaim || debouncedClaim.trim() === '') {
      return;
    }

    // Skip if currently syncing
    if (isSyncingRef.current) {
      return;
    }

    isSyncingRef.current = true;

    try {
      // Start parsing
      setState(prev => ({ ...prev, syncStatus: 'parsing', error: null }));

      logger.info('[useClaimSyncState] Starting claim parse', {
        projectId,
        claimLength: debouncedClaim.length,
      });

      const parseResult = await parseClaimMutation.mutateAsync({
        projectId,
        claimOneText: debouncedClaim,
      });

      if (
        !parseResult.parsedElements ||
        parseResult.parsedElements.length === 0
      ) {
        throw new Error('No elements extracted from claim');
      }

      // Update state with parsed elements
      setState(prev => ({
        ...prev,
        parsedElements: parseResult.parsedElements,
        syncStatus: 'generating',
      }));

      logger.info('[useClaimSyncState] Generating queries', {
        elementCount: parseResult.parsedElements.length,
      });

      // Generate queries
      const queriesResult = await generateQueriesMutation.mutateAsync({
        parsedElements: parseResult.parsedElements,
        projectId: projectId,
      });

      const queries =
        (queriesResult as any).searchQueries || queriesResult.queries || [];

      if (queries.length === 0) {
        throw new Error('No queries generated');
      }

      // Successfully synced!
      setState({
        parsedElements: parseResult.parsedElements,
        searchQueries: queries,
        syncStatus: 'synced',
        error: null,
        lastSyncedClaim: debouncedClaim,
        lastSyncTime: new Date(),
        hasManualEdits: false,
        needsSync: false,
      });

      logger.info('[useClaimSyncState] Successfully synced', {
        elementCount: parseResult.parsedElements.length,
        queryCount: queries.length,
      });

      // Save to database
      try {
        await ProjectApiService.saveClaimSync(projectId, {
          parsedElements: parseResult.parsedElements,
          searchQueries: queries,
          lastSyncedClaim: debouncedClaim,
        });

        logger.info('[useClaimSyncState] Saved sync data to database');
      } catch (error) {
        logger.error('[useClaimSyncState] Failed to save sync data', error);
        // Don't fail the sync if save fails - data is already in state
      }
    } catch (error) {
      logger.error('[useClaimSyncState] Sync failed', error);

      let errorMessage = 'Failed to sync claim data';

      // Check for specific error types
      if (error instanceof Error) {
        if (error.message.includes('AI processing limit reached')) {
          errorMessage =
            'AI processing limit reached. Please try again in a few minutes.';

          // Show toast for rate limit error
          toast({
            title: 'Rate Limit Reached',
            description:
              "You've hit the AI processing limit. Please wait a few minutes before trying again.",
            status: 'warning',
            duration: 10000,
            isClosable: true,
          });
        } else if (error.message.includes('No elements extracted')) {
          errorMessage =
            'Could not extract elements from claim. Please check your claim text.';
        } else if (error.message.includes('No queries generated')) {
          errorMessage = 'Could not generate search queries. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }

      setState(prev => ({
        ...prev,
        syncStatus: 'error',
        error: errorMessage,
        needsSync: true,
      }));
    } finally {
      isSyncingRef.current = false;
    }
  };

  // Manual resync function - now just calls syncClaim
  const resync = () => {
    setState(prev => ({
      ...prev,
      hasManualEdits: false, // Clear manual edits flag when resyncing
      needsSync: true,
    }));
    syncClaim();
  };

  // Resync elements only - keeps existing queries
  const resyncElementsOnly = async () => {
    if (!projectId || !debouncedClaim || debouncedClaim.trim() === '') {
      return;
    }

    // Skip if currently syncing
    if (isSyncingRef.current) {
      return;
    }

    isSyncingRef.current = true;

    try {
      // Start parsing
      setState(prev => ({ ...prev, syncStatus: 'parsing', error: null }));

      logger.info('[useClaimSyncState] Resyncing elements only', {
        projectId,
        claimLength: debouncedClaim.length,
      });

      const parseResult = await parseClaimMutation.mutateAsync({
        projectId,
        claimOneText: debouncedClaim,
      });

      if (
        !parseResult.parsedElements ||
        parseResult.parsedElements.length === 0
      ) {
        throw new Error('No elements extracted from claim');
      }

      // Update state with new parsed elements but keep existing queries
      setState(prev => ({
        ...prev,
        parsedElements: parseResult.parsedElements,
        syncStatus: 'synced',
        error: null,
        lastSyncedClaim: debouncedClaim,
        lastSyncTime: new Date(),
        hasManualEdits: true, // Keep manual edits flag since queries are preserved
        needsSync: false,
      }));

      logger.info('[useClaimSyncState] Successfully resynced elements only', {
        elementCount: parseResult.parsedElements.length,
        queryCount: state.searchQueries.length,
      });

      // Save to database with existing queries
      try {
        await ProjectApiService.saveClaimSync(projectId, {
          parsedElements: parseResult.parsedElements,
          searchQueries: state.searchQueries, // Keep existing queries
          lastSyncedClaim: debouncedClaim,
        });

        logger.info('[useClaimSyncState] Saved element resync to database');
      } catch (error) {
        logger.error(
          '[useClaimSyncState] Failed to save element resync',
          error
        );
      }
    } catch (error) {
      logger.error('[useClaimSyncState] Element resync failed', error);

      let errorMessage = 'Failed to resync elements';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setState(prev => ({
        ...prev,
        syncStatus: 'error',
        error: errorMessage,
      }));

      throw error; // Re-throw for UI handling
    } finally {
      isSyncingRef.current = false;
    }
  };

  // Resync queries only - regenerate from current or provided elements
  const resyncQueriesOnly = async (elements?: string[]) => {
    const elementsToUse = elements || state.parsedElements;

    if (elementsToUse.length === 0) {
      throw new Error('No elements available to generate queries from');
    }

    // Prevent concurrent syncing
    if (isSyncingRef.current) {
      return;
    }

    isSyncingRef.current = true;

    try {
      setState(prev => ({
        ...prev,
        syncStatus: 'generating',
        error: null,
      }));

      logger.info('[useClaimSyncState] Regenerating queries only', {
        elementCount: elementsToUse.length,
      });

      const queriesResult = await generateQueriesMutation.mutateAsync({
        parsedElements: elementsToUse,
        projectId: projectId,
      });

      const queries =
        (queriesResult as any).searchQueries || queriesResult.queries || [];

      if (queries.length === 0) {
        throw new Error('No queries generated');
      }

      setState(prev => ({
        ...prev,
        searchQueries: queries,
        syncStatus: 'synced',
        error: null,
        lastSyncTime: new Date(),
        // Don't change hasManualEdits or parsedElements
      }));

      logger.info('[useClaimSyncState] Successfully regenerated queries', {
        queryCount: queries.length,
      });

      // Save to database
      try {
        const syncedClaim = state.lastSyncedClaim || debouncedClaim;
        if (syncedClaim) {
          await ProjectApiService.saveClaimSync(projectId, {
            parsedElements: elementsToUse,
            searchQueries: queries,
            lastSyncedClaim: syncedClaim,
          });

          logger.info('[useClaimSyncState] Saved query resync to database');
        }
      } catch (error) {
        logger.error('[useClaimSyncState] Failed to save query resync', error);
      }
    } catch (error) {
      logger.error('[useClaimSyncState] Query resync failed', error);

      let errorMessage = 'Failed to regenerate queries';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setState(prev => ({
        ...prev,
        syncStatus: 'error',
        error: errorMessage,
      }));

      throw error; // Re-throw for UI handling
    } finally {
      isSyncingRef.current = false;
    }
  };

  // Manual query update function (doesn't trigger regeneration)
  const updateQueries = (newQueries: string[]): Promise<void> => {
    logger.info('[useClaimSyncState] Updating queries manually', {
      oldCount: state.searchQueries.length,
      newCount: newQueries.length,
      newQueries,
    });

    setState(prev => ({
      ...prev,
      searchQueries: newQueries,
      hasManualEdits: true, // Mark as manually edited
    }));

    // Always try to save, using current claim or debounced claim
    const syncedClaim = state.lastSyncedClaim || debouncedClaim;

    if (!syncedClaim) {
      logger.warn(
        '[useClaimSyncState] No claim text available, cannot save query updates'
      );
      return Promise.reject(new Error('No claim text available for saving'));
    }

    // Save to database with better error handling
    logger.info('[useClaimSyncState] Saving query updates to database', {
      projectId,
      queryCount: newQueries.length,
      elementCount: state.parsedElements.length,
    });

    return ProjectApiService.saveClaimSync(projectId, {
      parsedElements: state.parsedElements,
      searchQueries: newQueries,
      lastSyncedClaim: syncedClaim,
    })
      .then(() => {
        logger.info(
          '[useClaimSyncState] Successfully saved query updates to database'
        );
      })
      .catch((error: any) => {
        logger.error('[useClaimSyncState] Failed to save query updates', error);
        throw error; // Re-throw to allow caller to handle
      });
  };

  // Manual element update function (doesn't trigger regeneration)
  const updateElementsWithoutRegeneration = (
    newElements: string[]
  ): Promise<void> => {
    logger.info(
      '[useClaimSyncState] Updating elements manually without regeneration',
      {
        oldCount: state.parsedElements.length,
        newCount: newElements.length,
        newElements,
      }
    );

    setState(prev => ({
      ...prev,
      parsedElements: newElements,
      hasManualEdits: true, // Mark as manually edited
    }));

    // Always try to save, using current claim or debounced claim
    const syncedClaim = state.lastSyncedClaim || debouncedClaim;

    if (!syncedClaim) {
      logger.warn(
        '[useClaimSyncState] No claim text available, cannot save element updates'
      );
      return Promise.reject(new Error('No claim text available for saving'));
    }

    // Save to database with better error handling
    logger.info('[useClaimSyncState] Saving element updates to database', {
      projectId,
      elementCount: newElements.length,
      queryCount: state.searchQueries.length,
    });

    return ProjectApiService.saveClaimSync(projectId, {
      parsedElements: newElements,
      searchQueries: state.searchQueries, // Keep existing queries
      lastSyncedClaim: syncedClaim,
    })
      .then(() => {
        logger.info(
          '[useClaimSyncState] Successfully saved element updates to database'
        );
      })
      .catch((error: any) => {
        logger.error(
          '[useClaimSyncState] Failed to save element updates',
          error
        );
        throw error; // Re-throw to allow caller to handle
      });
  };

  // Manual element update function
  const updateElements = async (newElements: string[]) => {
    if (newElements.length === 0) {
      setState(prev => ({
        ...prev,
        parsedElements: [],
        searchQueries: [],
        syncStatus: 'idle',
        hasManualEdits: true, // Mark as manually edited
      }));
      return;
    }

    // Update elements and trigger query regeneration
    setState(prev => ({
      ...prev,
      parsedElements: newElements,
      syncStatus: 'generating',
      hasManualEdits: true, // Mark as manually edited
    }));

    try {
      logger.info(
        '[useClaimSyncState] Regenerating queries from manual elements',
        {
          elementCount: newElements.length,
        }
      );

      const queriesResult = await generateQueriesMutation.mutateAsync({
        parsedElements: newElements,
        projectId: projectId,
      });

      const queries =
        (queriesResult as any).searchQueries || queriesResult.queries || [];

      setState(prev => ({
        ...prev,
        searchQueries: queries,
        syncStatus: 'synced',
        error: null,
        lastSyncTime: new Date(),
      }));

      logger.info('[useClaimSyncState] Successfully regenerated queries', {
        queryCount: queries.length,
      });

      // Save to database
      try {
        // Only save if we have valid claim text
        if (debouncedClaim) {
          await ProjectApiService.saveClaimSync(projectId, {
            parsedElements: newElements,
            searchQueries: queries,
            lastSyncedClaim: debouncedClaim,
          });

          logger.info('[useClaimSyncState] Saved manual updates to database');
        }
      } catch (error) {
        logger.error(
          '[useClaimSyncState] Failed to save manual updates',
          error
        );
      }
    } catch (error) {
      logger.error('[useClaimSyncState] Failed to regenerate queries', error);
      setState(prev => ({
        ...prev,
        syncStatus: 'error',
        error: 'Failed to regenerate queries from elements',
      }));
    }
  };

  return {
    ...state,
    resync,
    syncClaim,
    updateElements,
    updateElementsWithoutRegeneration,
    updateQueries,
    isSynced: state.syncStatus === 'synced',
    canSearch: state.syncStatus === 'synced' && state.searchQueries.length > 0,
    resyncElementsOnly,
    resyncQueriesOnly,
  };
}
