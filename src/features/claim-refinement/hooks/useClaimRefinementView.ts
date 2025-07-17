import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/useToastWrapper';
import { useStartAsyncSearch } from '@/hooks/api/useSearchMutations';
import { logger } from '@/utils/clientLogger';
import { TABS } from '../constants';
import { useQueryClient } from '@tanstack/react-query';
import { useClaimSyncState } from './useClaimSyncState';
import {
  useClaimsQuery,
  useUpdateClaimMutation,
  useAddClaimMutation,
  useDeleteClaimMutation,
  useUpdateClaimNumberMutation,
  claimQueryKeys,
} from '@/hooks/api/useClaims';
import { useClaimBatchOperations } from '@/hooks/api/useClaimBatchOperations';
import { useInventionData } from '@/hooks/useInventionData';
import { extractClaimPreamble } from '../utils/analysis';
import { useDebouncedCallback } from 'use-debounce';
import { ProjectApiService } from '@/client/services/project.client-service';
import { subscribeToClaimUpdateEvents } from '../utils/claimUpdateEvents';
import { useSimpleClaimGeneration } from './useSimpleClaimGeneration';
import { useSearchHistory } from '@/hooks/api/useSearchHistory';

interface Claim {
  id: string;
  number: number;
  text: string;
  inventionId?: string;
}

export const useClaimRefinementView = ({
  projectId,
}: {
  projectId: string;
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const searchInProgressRef = useRef(false);

  const { data: claimsData, isLoading: isLoadingClaims } =
    useClaimsQuery(projectId);

  // Ensure claims is always an array, defaulting to empty array if data is undefined
  const claims: Claim[] = useMemo(() => {
    if (!claimsData) return [];
    // Handle both direct array and wrapped object formats
    if (Array.isArray(claimsData)) {
      return claimsData;
    }
    if (
      claimsData &&
      typeof claimsData === 'object' &&
      'claims' in claimsData
    ) {
      return (claimsData as { claims: Claim[] }).claims;
    }
    return [];
  }, [claimsData]);

  // Only show loading spinner on initial load, not on background refetches
  const isInitialLoading = isLoadingClaims && !claimsData;

  const { data: inventionData } = useInventionData(projectId);
  const { mutate: updateClaim } = useUpdateClaimMutation();
  const { mutate: addClaim } = useAddClaimMutation(projectId);
  const { mutate: deleteClaim } = useDeleteClaimMutation();
  const { mutate: updateClaimNumber } = useUpdateClaimNumberMutation();
  const { insertClaimWithRenumberingAsync } = useClaimBatchOperations();

  const [activeTab, setActiveTab] = useState<string>(TABS.SEARCH);
  const [parsedElements, setParsedElements] = useState<string[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [messages, _setMessages] = useState<any[]>([]);
  const [isEditParsedDataModalOpen, setIsEditParsedDataModalOpen] =
    useState(false);
  const [newlyAddedClaimNumbers, setNewlyAddedClaimNumbers] = useState<
    number[]
  >([]);

  // Add flag to prevent concurrent claim additions
  const isAddingClaimRef = useRef(false);

  // Add flag to prevent concurrent claim insertions
  const isInsertingClaimRef = useRef(false);

  const startAsyncSearchMutation = useStartAsyncSearch();

  // Fetch search history from API
  const { data: searchHistory = [] } = useSearchHistory(projectId);

  const claim1Text = useMemo(() => {
    if (!claims || claims.length === 0) return null;
    const claim1 = claims.find((c: Claim) => c.number === 1);
    return claim1 ? claim1.text : null;
  }, [claims]);

  const claimSyncState = useClaimSyncState({
    projectId,
    claim1Text,
    enabled: !!projectId && !!claim1Text,
    debounceMs: 500,
  });

  useEffect(() => {
    if (
      claimSyncState.syncStatus === 'synced' &&
      !claimSyncState.hasManualEdits
    ) {
      setParsedElements(claimSyncState.parsedElements);
      setSearchQueries(claimSyncState.searchQueries);
    }
  }, [
    claimSyncState.syncStatus,
    claimSyncState.parsedElements,
    claimSyncState.searchQueries,
    claimSyncState.hasManualEdits,
  ]);

  // Listen for claim update events from external sources (e.g., chat agent)
  useEffect(() => {
    if (!projectId) return;

    logger.info(
      '[ClaimRefinementView] Setting up claim update event listener',
      {
        projectId,
      }
    );

    const unsubscribe = subscribeToClaimUpdateEvents(event => {
      logger.info('[ClaimRefinementView] Claim update event received', {
        event,
        currentProjectId: projectId,
        eventProjectId: event.projectId,
        matches: event.projectId === projectId,
      });

      // Only process if this event is for our project
      if (event.projectId === projectId) {
        logger.info(
          '[ClaimRefinementView] Processing claim update for our project',
          {
            action: event.action,
            claimNumbers: event.claimNumbers,
          }
        );

        // If claims were added, store the numbers for highlighting
        if (event.action === 'added' && event.claimNumbers) {
          setNewlyAddedClaimNumbers(event.claimNumbers);
          // Clear after 5 seconds
          setTimeout(() => {
            setNewlyAddedClaimNumbers([]);
          }, 5000);
        }

        // Show a subtle notification
        toast({
          title: 'Claims updated',
          description: `Claims have been ${event.action} successfully`,
          status: 'success',
          duration: 2000,
          position: 'bottom-right',
          isClosable: true,
        });

        // The chat hook has already handled the cache invalidation,
        // so we just need to ensure the UI is responsive
        logger.info(
          '[ClaimRefinementView] Event processed - UI should update automatically'
        );
      }
    });

    return () => {
      logger.info(
        '[ClaimRefinementView] Cleaning up claim update event listener',
        {
          projectId,
        }
      );
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]); // Intentionally omit toast to prevent re-renders when toast state changes

  // Listen for claim restoration events
  useEffect(() => {
    if (!projectId) return;

    const handleClaimsRestored = (event: CustomEvent) => {
      const detail = event.detail as {
        projectId: string;
        versionId: string;
        claimCount: number;
      };

      logger.info(
        '[ClaimRefinementView] Claims restored event received',
        detail
      );

      // Only process if this event is for our project
      if (detail.projectId === projectId) {
        logger.info('[ClaimRefinementView] Claims restored event processed', {
          projectId,
          versionId: detail.versionId,
          claimCount: detail.claimCount,
        });
        // No need to invalidate here - the restoration hook already updated the cache
      }
    };

    window.addEventListener(
      'claimsRestored',
      handleClaimsRestored as EventListener
    );

    return () => {
      window.removeEventListener(
        'claimsRestored',
        handleClaimsRestored as EventListener
      );
    };
  }, [projectId, queryClient]);

  const debouncedUpdateClaim = useDebouncedCallback(
    ({ claimId, text }: { claimId: string; text: string }) => {
      // Skip updates for temporary claim IDs
      if (claimId.startsWith('temp-')) {
        logger.debug(
          '[useClaimRefinementView] Skipping update for temporary claim ID',
          { claimId }
        );
        return;
      }
      updateClaim({ claimId, text });
    },
    300 // Reduced from 800ms to send updates faster
  );

  // Initialize the claim generation hook
  const { generateClaim1, isGenerating: isGeneratingClaim1 } =
    useSimpleClaimGeneration({
      onClaimGenerated: async (newClaimText: string) => {
        logger.info('[onClaimGenerated] Processing generated claim', {
          newTextLength: newClaimText.length,
        });

        // Check current claims in the React Query cache
        const currentClaims = claims || [];
        const existingClaim1 = currentClaims.find((c: Claim) => c.number === 1);

        if (existingClaim1) {
          // Update existing claim 1 with the new text
          logger.info('[onClaimGenerated] Updating existing claim 1', {
            claimId: existingClaim1.id,
            newTextLength: newClaimText.length,
          });
          updateClaim({ claimId: existingClaim1.id, text: newClaimText });
        } else {
          // Add new claim 1 if it doesn't exist
          logger.info('[onClaimGenerated] Adding new claim 1', {
            newTextLength: newClaimText.length,
          });
          addClaim({ number: 1, text: newClaimText });
        }
      },
    });

  const onGenerateClaim1 = useCallback(async () => {
    if (!inventionData) {
      toast({
        title: 'Cannot generate claim',
        description: 'Invention data is not loaded yet. Please wait.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    // Use the mutation from useSimpleClaimGeneration
    generateClaim1({ projectId, invention: inventionData });
  }, [projectId, inventionData, generateClaim1, toast]);

  const handleClaimChange = useCallback(
    (claimId: string, text: string) => {
      // Additional validation to prevent updates on temporary IDs
      if (!claimId || claimId.startsWith('temp-')) {
        logger.warn('[useClaimRefinementView] Invalid claim ID for update', {
          claimId,
        });
        return;
      }

      // Check if the claim exists in our current data
      const claimExists = claims.some((c: Claim) => c.id === claimId);
      if (!claimExists) {
        logger.warn(
          '[useClaimRefinementView] Claim not found in current data, refreshing',
          { claimId }
        );
        toast({
          title: 'Claim not found',
          description: 'Refreshing claims data...',
          status: 'info',
          duration: 2000,
        });
        // Refresh claims to get latest data
        queryClient.invalidateQueries({
          queryKey: claimQueryKeys.list(projectId),
          refetchType: 'active',
        });
        return;
      }

      debouncedUpdateClaim({ claimId, text });
    },
    [debouncedUpdateClaim, claims, projectId, queryClient, toast]
  );

  const handleDeleteClaim = useCallback(
    (claimId: string, shouldRenumber: boolean = true) => {
      // Check if it's a temporary claim
      if (claimId && claimId.startsWith('temp-')) {
        logger.debug(
          '[useClaimRefinementView] Removing temporary claim from UI',
          { claimId }
        );

        // Remove the temporary claim from the cache immediately
        queryClient.setQueryData(claimQueryKeys.list(projectId), (old: any) => {
          if (!old) return old;

          if (
            typeof old === 'object' &&
            'claims' in old &&
            Array.isArray(old.claims)
          ) {
            return {
              ...old,
              claims: old.claims.filter((c: any) => c.id !== claimId),
            };
          } else if (Array.isArray(old)) {
            return old.filter((c: any) => c.id !== claimId);
          }

          return old;
        });

        toast({
          title: 'Claim removed',
          status: 'success',
          duration: 1500,
          isClosable: true,
        });

        return;
      }

      // Check if page has been loaded for at least 2 seconds
      // This helps prevent issues with tenant context not being ready
      const pageLoadTime = window.performance?.timing?.loadEventEnd || 0;
      const timeSinceLoad = Date.now() - pageLoadTime;

      if (timeSinceLoad < 2000 && pageLoadTime > 0) {
        toast({
          title: 'Please wait',
          description: 'The page is still loading. Try again in a moment.',
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
        return;
      }

      // Execute the deletion directly with the renumbering choice
      deleteClaim({ claimId, renumber: shouldRenumber, projectId });
    },
    [deleteClaim, toast, queryClient, projectId]
  );

  const handleInsertClaim = useCallback(
    async (afterClaimId: string) => {
      // Prevent concurrent insertions
      if (isInsertingClaimRef.current) {
        logger.debug(
          '[useClaimRefinementView] Claim insertion already in progress'
        );
        return;
      }
      isInsertingClaimRef.current = true;
      try {
        if (!claims || claims.length === 0) {
          toast({
            title: 'Cannot add claim',
            description: 'No existing claims found.',
            status: 'warning',
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        // Find the claim that was clicked
        const clickedClaim = claims.find((c: Claim) => c.id === afterClaimId);
        if (!clickedClaim) {
          toast({
            title: 'Error',
            description: 'Could not find the selected claim.',
            status: 'error',
            duration: 3000,
          });
          return;
        }

        // Get the inventionId from any existing claim
        const inventionId = claims[0]?.inventionId;

        if (!inventionId) {
          toast({
            title: 'Error',
            description: 'No invention found for this project',
            status: 'error',
            duration: 4000,
          });
          return;
        }

        // For new claims, create default dependent claim text based on where it's being inserted
        let defaultText = '';

        // If inserting after claim 1 or the clicked claim is independent, reference claim 1
        if (
          clickedClaim.number === 1 ||
          clickedClaim.text.toLowerCase().includes('a system') ||
          clickedClaim.text.toLowerCase().includes('a method') ||
          clickedClaim.text.toLowerCase().includes('an apparatus')
        ) {
          const preamble = extractClaimPreamble(clickedClaim.text);
          defaultText = `${preamble} of claim ${clickedClaim.number}, wherein `;
        } else {
          // For dependent claims, reference the same parent claim or the clicked claim
          const preamble = extractClaimPreamble(clickedClaim.text);
          defaultText = `${preamble} of claim ${clickedClaim.number}, wherein `;
        }

        // Desired highlight number is always the next integer after the clicked claim
        const highlightNumber = clickedClaim.number + 1;

        // Use the batch operations for smart insert with automatic renumbering
        const result = await insertClaimWithRenumberingAsync({
          projectId,
          inventionId: inventionId as string,
          afterClaimNumber: clickedClaim.number,
          text: defaultText,
        });

        // If the server returned the new claim number, use it for highlight
        const addedNumber =
          (result as any)?.newClaim?.number ?? highlightNumber;

        // Highlight for 5 s so user notices
        setNewlyAddedClaimNumbers([addedNumber]);
        setTimeout(() => setNewlyAddedClaimNumbers([]), 5000);
      } catch (error) {
        logger.error('[useClaimRefinementView] Failed to insert claim', {
          error,
        });
        toast({
          title: 'Error adding claim',
          description: 'Something went wrong while inserting the claim.',
          status: 'error',
          duration: 4000,
        });
      } finally {
        // small delay before allowing another insertion
        setTimeout(() => {
          isInsertingClaimRef.current = false;
        }, 500);
      }
    },
    [projectId, claims, toast, insertClaimWithRenumberingAsync]
  );

  const handleAddNewClaim = useCallback(
    async ({
      text,
      dependsOn: _dependsOn,
    }: {
      text: string;
      dependsOn: string;
    }) => {
      // Prevent concurrent additions
      if (isAddingClaimRef.current) {
        logger.debug(
          '[useClaimRefinementView] Claim addition already in progress'
        );
        return;
      }

      isAddingClaimRef.current = true;

      try {
        // Fetch fresh claims data to ensure accurate numbering
        const freshClaimsData = await queryClient.fetchQuery({
          queryKey: claimQueryKeys.list(projectId),
          queryFn: () => ProjectApiService.getClaims(projectId),
          staleTime: 0, // Force fresh fetch
        });

        const freshClaims = freshClaimsData || [];

        // Find the highest current claim number from fresh data
        const maxNumber = freshClaims.reduce(
          (currentMax: number, c: Claim) =>
            c.number > currentMax ? c.number : currentMax,
          0
        );

        const newClaimNumber = maxNumber + 1;

        // Simply use the text as provided by the user, no modifications
        const formattedText = text.trim();

        addClaim({ number: newClaimNumber, text: formattedText });

        // Add a small delay before allowing next addition
        await new Promise(resolve => setTimeout(resolve, 1000));

        return newClaimNumber; // Return the new claim number for UI updates
      } catch (error) {
        logger.error('[useClaimRefinementView] Failed to add new claim', {
          error,
        });
        // The mutation will show its own error toast, so we don't need one here
        throw error;
      } finally {
        // Reset the flag after a delay to prevent rapid additions
        setTimeout(() => {
          isAddingClaimRef.current = false;
        }, 500);
      }
    },
    [projectId, addClaim, queryClient]
  );

  const handleReorderClaim = useCallback(
    (claimId: string, direction: 'up' | 'down') => {
      if (!claims) return;

      // Find current claim
      const current = claims.find((c: Claim) => c.id === claimId);
      if (!current) return;

      // Calculate target number based on direction
      const targetNumber =
        direction === 'up' ? current.number - 1 : current.number + 1;

      // Don't go below 1
      if (targetNumber < 1) return;

      // Use the updateClaimNumber mutation which will:
      // 1. If target number is empty (gap) → simply move claim to that number
      // 2. If target number is occupied → swap the two claims
      // This allows filling gaps before swapping, exactly as desired!
      updateClaimNumber({ claimId: current.id, number: targetNumber });
    },
    [claims, updateClaimNumber]
  );

  const handleExecuteSearch = useCallback(
    async (mode?: 'basic' | 'advanced', correlationId?: string) => {
      // Prevent duplicate searches
      if (searchInProgressRef.current) {
        logger.debug(
          '[useClaimRefinementView] Search already in progress, ignoring duplicate request'
        );
        return;
      }

      // Allow search if we have projectId and either canSearch OR (out-of-sync with queries)
      const hasQueries = claimSyncState.searchQueries.length > 0;
      const canProceed = projectId && (claimSyncState.canSearch || hasQueries);

      if (!canProceed) {
        logger.warn('[useClaimRefinementView] Cannot execute search', {
          projectId,
          canSearch: claimSyncState.canSearch,
          hasQueries,
          syncStatus: claimSyncState.syncStatus,
        });
        return;
      }

      searchInProgressRef.current = true;

      try {
        // Pass parsed elements directly as strings
        await startAsyncSearchMutation.mutateAsync({
          projectId,
          searchQueries: claimSyncState.searchQueries,
          parsedElements: claimSyncState.parsedElements,
          correlationId,
        });
        setActiveTab(TABS.SEARCH);
      } catch (error) {
        logger.error(
          '[useClaimRefinementView] Failed to execute search:',
          error
        );
        toast({
          title: 'Search failed',
          status: 'error',
          duration: 5000,
        });
      } finally {
        // Reset the flag after a small delay to account for state updates
        // eslint-disable-next-line no-restricted-globals -- Delay needed to prevent race conditions with state updates
        setTimeout(() => {
          searchInProgressRef.current = false;
        }, 100);
      }
    },
    [projectId, claimSyncState, startAsyncSearchMutation, toast, setActiveTab]
  );

  const handleDirectSearch = useCallback(async () => {
    setIsSearching(true);
    await handleExecuteSearch();
    setIsSearching(false);
  }, [handleExecuteSearch]);

  const handleQueriesUpdate = useCallback(
    async (newQueries: string[]) => {
      setSearchQueries(newQueries);
      try {
        await claimSyncState.updateQueries(newQueries);
      } catch (error) {
        setSearchQueries(claimSyncState.searchQueries);
        throw error;
      }
    },
    [claimSyncState]
  );

  const handleElementsUpdate = useCallback(
    (newElements: string[]) => {
      setParsedElements(newElements);
      claimSyncState.updateElements(newElements);
    },
    [claimSyncState]
  );

  const handleElementsUpdateWithoutRegeneration = useCallback(
    async (newElements: string[]) => {
      setParsedElements(newElements);
      try {
        await claimSyncState.updateElementsWithoutRegeneration(newElements);
      } catch (error) {
        setParsedElements(claimSyncState.parsedElements);
        throw error;
      }
    },
    [claimSyncState]
  );

  const handleSaveParsedData = useCallback(
    async (data: { elements: string[]; queries: string[] }) => {
      const { elements, queries } = data;

      // Elements are now always strings
      await Promise.all([
        claimSyncState.updateElementsWithoutRegeneration(elements),
        claimSyncState.updateQueries(queries),
      ]);
    },
    [claimSyncState]
  );

  const handleSaveAndResyncParsedData = useCallback(
    async (data: { elements: string[]; queries: string[] }) => {
      const { elements, queries } = data;

      // Elements are now always strings
      await Promise.all([
        claimSyncState.updateElementsWithoutRegeneration(elements),
        claimSyncState.updateQueries(queries),
      ]);
      claimSyncState.resync();
    },
    [claimSyncState]
  );

  const handleResyncElementsOnly = useCallback(async () => {
    await claimSyncState.resyncElementsOnly();
  }, [claimSyncState]);

  const handleResyncQueriesOnly = useCallback(
    async (elements: string[]) => {
      await claimSyncState.resyncQueriesOnly(elements);
    },
    [claimSyncState]
  );

  // Cleanup on unmount - flush pending updates
  useEffect(() => {
    return () => {
      // Flush any pending claim updates before unmounting
      debouncedUpdateClaim.flush();
      logger.debug(
        '[useClaimRefinementView] Flushed pending claim updates on unmount'
      );
    };
  }, [debouncedUpdateClaim]);

  return {
    projectId,
    claims,
    isLoadingClaims: isInitialLoading, // Only show spinner on initial load
    isGeneratingClaim1,
    handleClaimChange,
    handleDeleteClaim,
    handleInsertClaim,
    handleReorderClaim,
    handleAddNewClaim,
    onGenerateClaim1,
    activeTab,
    setActiveTab,
    newlyAddedClaimNumbers,
    messagesState: {
      messages: [],
      addUserMessage: () => {
        // Placeholder - chat functionality not implemented in this view
      },
      addAssistantMessage: () => {
        // Placeholder - chat functionality not implemented in this view
      },
    },
    handleSendMessage: () => {
      // Placeholder - chat functionality not implemented in this view
    },
    parsedElements,
    searchQueries,
    searchHistory,
    selectedClaimForParsing: null,
    searchMode: 'basic' as 'basic' | 'advanced',
    isParsingClaim: claimSyncState.syncStatus === 'parsing',
    isSearching,
    messages,
    handleParseClaim: async () => {
      // Placeholder - claim parsing handled automatically via claimSyncState
    },
    handleExecuteSearch,
    handleDirectSearch,
    isAnalyzing: false,
    handleAnalyzePriorArt: () => {
      // Placeholder - prior art analysis not implemented in this view
    },
    openApplyModal: () => {
      // Placeholder - apply modal not implemented in this view
    },
    isEditParsedDataModalOpen,
    openEditParsedDataModal: () => setIsEditParsedDataModalOpen(true),
    closeEditParsedDataModal: () => setIsEditParsedDataModalOpen(false),
    handleSaveParsedData,
    handleSaveAndResyncParsedData,
    handleResyncElementsOnly,
    handleResyncQueriesOnly,
    claimSyncState: {
      ...claimSyncState,
      onQueriesUpdate: handleQueriesUpdate,
      onElementsUpdate: handleElementsUpdate,
      onElementsUpdateWithoutRegeneration:
        handleElementsUpdateWithoutRegeneration,
    },
  };
};
