import { useState, useCallback, useMemo, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useStartAsyncSearch } from '@/hooks/api/useSearchMutations';
import { logger } from '@/lib/monitoring/logger';
import { TABS } from '../constants';
import { useQueryClient } from '@tanstack/react-query';
import { useClaimSyncState } from './useClaimSyncState';
import {
  useClaimsQuery,
  useUpdateClaimMutation,
  useAddClaimMutation,
  useDeleteClaimMutation,
  claimQueryKeys,
} from '@/hooks/api/useClaims';
import { useInventionData } from '@/hooks/useInventionData';
import { ClaimsClientService } from '@/client/services/claims.client-service';
import { extractClaimPreamble } from '../utils/analysis';
import { useDebouncedCallback } from 'use-debounce';
import { ProjectApiService } from '@/client/services/project.client-service';
import { subscribeToClaimUpdateEvents } from '../utils/claimUpdateEvents';

interface Claim {
  id: string;
  number: number;
  text: string;
}

/**
 * Transform parsed elements from claim parsing format to async search format
 *
 * Claim parsing returns: { text: string, label: 'device' | 'component', variants?: string[] }
 * Async search expects: { id: string, type: string, text: string }
 */
const transformParsedElementsForSearch = (elements: any[]) => {
  return elements.map((element, index) => ({
    ...element, // Spread first to allow overwriting
    id: String(element.id || `element-${index}`), // Ensure ID is a string
    type: element.label || 'component',
    text: element.text || '',
  }));
};

export const useClaimRefinementView = ({
  projectId,
}: {
  projectId: string;
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();

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

  const { data: inventionData } = useInventionData(projectId);
  const { mutate: updateClaim } = useUpdateClaimMutation();
  const { mutate: addClaim } = useAddClaimMutation(projectId);
  const { mutate: deleteClaim } = useDeleteClaimMutation();

  const [activeTab, setActiveTab] = useState<string>(TABS.SEARCH);
  const [parsedElements, setParsedElements] = useState<any[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [isEditParsedDataModalOpen, setIsEditParsedDataModalOpen] =
    useState(false);
  const [isGeneratingClaim1, setIsGeneratingClaim1] = useState(false);

  const startAsyncSearchMutation = useStartAsyncSearch();

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
    
    const unsubscribe = subscribeToClaimUpdateEvents((event) => {
      logger.info('[ClaimRefinementView] Claim update event received', {
        event,
        currentProjectId: projectId,
      });
      
      // Only refetch if this event is for our project
      if (event.projectId === projectId) {
        logger.info('[ClaimRefinementView] Refetching claims due to external update');
        
        // Show a subtle notification
        toast({
          title: 'Claims updated',
          description: `Claims have been ${event.action} successfully`,
          status: 'success',
          duration: 2000,
          position: 'bottom-right',
          isClosable: true,
        });
        
        // Invalidate and refetch claims immediately
        queryClient.invalidateQueries({
          queryKey: claimQueryKeys.list(projectId),
          exact: false,
          refetchType: 'active',
        });
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [projectId, queryClient, toast]);

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
    400
  );

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

    setIsGeneratingClaim1(true);
    try {
      const { claim: newClaimText } = await ClaimsClientService.generateClaim1(
        projectId,
        inventionData
      );

      // Wait a moment for any pending updates to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Invalidate claims immediately to get fresh IDs from server
      await queryClient.invalidateQueries({
        queryKey: claimQueryKeys.list(projectId),
        refetchType: 'active',
      });

      // After invalidation, get the fresh claims data
      const freshClaimsData = await queryClient.fetchQuery({
        queryKey: claimQueryKeys.list(projectId),
        queryFn: () => ProjectApiService.getClaims(projectId),
        staleTime: 0, // Force fresh fetch
      });

      const freshClaims = Array.isArray(freshClaimsData)
        ? freshClaimsData
        : freshClaimsData?.claims || [];

      const existingClaim1 = freshClaims.find((c: Claim) => c.number === 1);

      if (existingClaim1) {
        // Only update if we have a real ID (not temporary)
        if (!existingClaim1.id.startsWith('temp-')) {
          updateClaim({ claimId: existingClaim1.id, text: newClaimText });
        } else {
          logger.warn(
            '[onGenerateClaim1] Claim 1 has temporary ID, adding new claim instead'
          );
          addClaim({ number: 1, text: newClaimText });
        }
      } else {
        addClaim({ number: 1, text: newClaimText });
      }
      toast({ title: 'Claim 1 generated successfully!', status: 'success' });
    } catch (error) {
      logger.error('Failed to generate Claim 1', { error });
      toast({ title: 'Failed to generate claim', status: 'error' });
    } finally {
      setIsGeneratingClaim1(false);
    }
  }, [projectId, inventionData, updateClaim, addClaim, toast, queryClient]);

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
    (claimId: string) => {
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

      deleteClaim(claimId);
    },
    [deleteClaim, toast, queryClient, projectId]
  );

  const handleInsertClaim = useCallback(
    async (afterClaimId: string) => {
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

        // Fetch fresh claims data to ensure accurate numbering
        const freshClaimsData = await queryClient.fetchQuery({
          queryKey: claimQueryKeys.list(projectId),
          queryFn: () => ProjectApiService.getClaims(projectId),
          staleTime: 0, // Force fresh fetch
        });

        const freshClaims = Array.isArray(freshClaimsData)
          ? freshClaimsData
          : freshClaimsData?.claims || [];

        // Find the claim that was clicked
        const clickedClaim = freshClaims.find(
          (c: Claim) => c.id === afterClaimId
        );
        if (!clickedClaim) {
          toast({
            title: 'Error',
            description: 'Could not find the selected claim.',
            status: 'error',
            duration: 3000,
          });
          return;
        }

        // Find the highest current claim number from fresh data
        const maxNumber = freshClaims.reduce(
          (currentMax: number, c: Claim) =>
            c.number > currentMax ? c.number : currentMax,
          0
        );

        const newClaimNumber = maxNumber + 1;

        // For new claims other than claim 1, default to dependent claim text
        let defaultText = '\u200B'; // Default empty text

        if (newClaimNumber > 1) {
          // Extract the preamble from the clicked claim
          const preamble = extractClaimPreamble(clickedClaim.text);
          // Create default dependent claim text depending on the clicked claim
          defaultText = `${preamble} of claim ${clickedClaim.number}, wherein `;
        }

        addClaim({ number: newClaimNumber, text: defaultText });
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
      }
    },
    [projectId, addClaim, toast, queryClient]
  );

  const handleAddNewClaim = useCallback(
    async ({ text, dependsOn }: { text: string; dependsOn: string }) => {
      try {
        // Fetch fresh claims data to ensure accurate numbering
        const freshClaimsData = await queryClient.fetchQuery({
          queryKey: claimQueryKeys.list(projectId),
          queryFn: () => ProjectApiService.getClaims(projectId),
          staleTime: 0, // Force fresh fetch
        });

        const freshClaims = Array.isArray(freshClaimsData)
          ? freshClaimsData
          : freshClaimsData?.claims || [];

        // Find the highest current claim number from fresh data
        const maxNumber = freshClaims.reduce(
          (currentMax: number, c: Claim) =>
            c.number > currentMax ? c.number : currentMax,
          0
        );

        const newClaimNumber = maxNumber + 1;

        // Format the claim text based on whether it's dependent or independent
        let formattedText = text.trim();

        if (dependsOn && dependsOn.trim()) {
          // For dependent claims, ensure proper formatting
          const dependsOnNum = parseInt(dependsOn, 10);
          if (!isNaN(dependsOnNum)) {
            // Check if the text already includes a dependency reference
            const hasExistingDependency = /claim\s+\d+/i.test(formattedText);

            if (!hasExistingDependency) {
              // Extract preamble from the referenced claim if available
              const referencedClaim = freshClaims.find(
                (c: Claim) => c.number === dependsOnNum
              );
              if (referencedClaim) {
                const preamble = extractClaimPreamble(referencedClaim.text);
                // Add dependency reference if not already present
                formattedText = `${preamble} of claim ${dependsOnNum}, ${formattedText}`;
              } else {
                // Fallback if referenced claim not found
                formattedText = `The method of claim ${dependsOnNum}, ${formattedText}`;
              }
            }
          }
        }

        addClaim({ number: newClaimNumber, text: formattedText });

        return newClaimNumber; // Return the new claim number for UI updates
      } catch (error) {
        logger.error('[useClaimRefinementView] Failed to add new claim', {
          error,
        });
        // The mutation will show its own error toast, so we don't need one here
        throw error;
      }
    },
    [projectId, addClaim, queryClient]
  );

  const handleReorderClaim = useCallback(
    (claimId: string, direction: 'up' | 'down') => {
      if (!claims) return;

      // find current claim and target claim based on sorted by number
      const current = claims.find((c: Claim) => c.id === claimId);
      if (!current) return;

      const sorted = [...claims].sort(
        (a: Claim, b: Claim) => a.number - b.number
      );
      const currentIdx = sorted.findIndex((c: Claim) => c.id === claimId);
      const targetIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
      if (targetIdx < 0 || targetIdx >= sorted.length) return;

      const target = sorted[targetIdx];

      // Store texts to swap
      const currentText = current.text;
      const targetText = target.text;

      // Perform optimistic update immediately in the cache
      queryClient.setQueriesData(
        { queryKey: claimQueryKeys.all },
        (oldData: any) => {
          if (!oldData) return oldData;

          if (oldData && typeof oldData === 'object' && 'claims' in oldData) {
            // Handle response format with { claims: [...] }
            const typedData = oldData as { claims: Claim[] };
            return {
              ...typedData,
              claims: typedData.claims.map((claim: Claim) => {
                if (claim.id === current.id) {
                  return { ...claim, text: targetText };
                } else if (claim.id === target.id) {
                  return { ...claim, text: currentText };
                }
                return claim;
              }),
            };
          } else if (Array.isArray(oldData)) {
            // Handle direct array format
            return oldData.map((claim: Claim) => {
              if (claim.id === current.id) {
                return { ...claim, text: targetText };
              } else if (claim.id === target.id) {
                return { ...claim, text: currentText };
              }
              return claim;
            });
          }
          return oldData;
        }
      );

      updateClaim({ claimId: current.id, text: targetText });
      updateClaim({ claimId: target.id, text: currentText });
    },
    [claims, updateClaim, queryClient]
  );

  const handleExecuteSearch = useCallback(async () => {
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

    try {
      // Transform parsed elements to match the expected format
      const transformedElements = transformParsedElementsForSearch(
        claimSyncState.parsedElements
      );

      await startAsyncSearchMutation.mutateAsync({
        projectId,
        searchQueries: claimSyncState.searchQueries,
        parsedElements: transformedElements,
      });
      setActiveTab(TABS.SEARCH);
    } catch (error) {
      logger.error('[useClaimRefinementView] Failed to execute search:', error);
      toast({
        title: 'Search failed',
        status: 'error',
        duration: 5000,
      });
    }
  }, [
    projectId,
    claimSyncState,
    startAsyncSearchMutation,
    toast,
    setActiveTab,
  ]);

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
    (newElements: any[]) => {
      setParsedElements(newElements);
      claimSyncState.updateElements(newElements);
    },
    [claimSyncState]
  );

  const handleElementsUpdateWithoutRegeneration = useCallback(
    async (newElements: any[]) => {
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
    async (data: { elements: any[]; queries: string[] }) => {
      const { elements, queries } = data;

      // Elements are already in the correct format (either V1 objects or V2 strings)
      await Promise.all([
        claimSyncState.updateElementsWithoutRegeneration(elements),
        claimSyncState.updateQueries(queries),
      ]);
    },
    [claimSyncState]
  );

  const handleSaveAndResyncParsedData = useCallback(
    async (data: { elements: any[]; queries: string[] }) => {
      const { elements, queries } = data;

      // Elements are already in the correct format (either V1 objects or V2 strings)
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
    async (elements: any[]) => {
      await claimSyncState.resyncQueriesOnly(elements);
    },
    [claimSyncState]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Any cleanup needed on unmount can go here
    };
  }, []);

  return {
    projectId,
    claims,
    isLoadingClaims,
    isGeneratingClaim1,
    handleClaimChange,
    handleDeleteClaim,
    handleInsertClaim,
    handleReorderClaim,
    handleAddNewClaim,
    onGenerateClaim1,
    activeTab,
    setActiveTab,
    messagesState: {
      messages: [],
      addUserMessage: () => {},
      addAssistantMessage: () => {},
    },
    handleSendMessage: () => {},
    parsedElements,
    searchQueries,
    searchHistory,
    selectedClaimForParsing: null,
    searchMode: 'basic' as 'basic' | 'advanced',
    isParsingClaim: claimSyncState.syncStatus === 'parsing',
    isSearching,
    messages,
    handleParseClaim: async () => {}, // Placeholder
    handleExecuteSearch,
    handleDirectSearch,
    isAnalyzing: false,
    handleAnalyzePriorArt: () => {},
    openApplyModal: () => {},
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
