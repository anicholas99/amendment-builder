import React, { useCallback, useState, useMemo } from 'react';
import {
  Box,
  VStack,
  Icon,
  Text,
  Spinner,
  Center,
  useToast,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { SearchHistoryTab } from './SearchHistoryTab';
import { SearchHeader } from './SearchHeader';
import { OutOfSyncConfirmationDialog } from './OutOfSyncConfirmationDialog';
import { SearchEmptyState } from './SearchEmptyState';
import { logger } from '@/lib/monitoring/logger';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';
import { ProcessedSavedPriorArt } from '@/types/domain/priorArt';
import { PriorArtReference } from '@/types/claimTypes';
import type { UseClaimSyncStateReturn } from '@/features/claim-refinement/hooks/useClaimSyncState';
import { useDebounce } from '@/hooks/useDebounce';
import { useOptimisticSearch } from '../hooks/useOptimisticSearch';
import { useSearchExecution } from '../hooks/useSearchExecution';

interface SearchTabContainerProps {
  // Data
  searchHistory: ProcessedSearchHistoryEntry[];
  savedPriorArt: ProcessedSavedPriorArt[];
  parsedElements: string[];

  // Loading states
  isLoading: boolean;
  isParsingClaim: boolean;

  // Handlers
  onSearch: (mode: 'basic' | 'advanced') => void;
  onDirectSearch?: () => void;
  onSavePriorArt: (reference: PriorArtReference) => void;
  onRemovePriorArt: (index: number, art: ProcessedSavedPriorArt) => void;
  onOpenPriorArtDetails: (reference: PriorArtReference) => void;

  // Project context
  projectId?: string;
  refreshProjectData: () => Promise<void>;

  // Citation handlers
  onExtractCitations?: (searchId: string) => void;
  onExtractCitationForReference?: (
    searchId: string,
    referenceNumber: string
  ) => Promise<{ id?: string | number; isSuccess?: boolean } | undefined>;
  onViewCitationsForReference?: (
    searchId: string,
    referenceNumber: string
  ) => void;

  // UI state
  isActive?: boolean;
  savedArtNumbers?: Set<string>;
  excludedPatentNumbers?: Set<string>;

  // Selection handlers
  onSetSelectedSearchId?: (id: string) => void;
  setCitationContext?: (context: {
    searchId: string;
    referenceNumber: string;
  }) => void;
  setSelectedReference?: (ref: string | null) => void;

  // Claim sync state
  claimSyncState?: UseClaimSyncStateReturn & {
    onOpenModal?: () => void;
  };

  claimSetVersionId?: string | null;
  onPatentNumberSelected?: (patentNumber: string) => void;
}

/**
 * Search Tab Container - Provides search functionality and history
 * Refactored for better maintainability with extracted hooks and components
 */
export const SearchTabContainer: React.FC<SearchTabContainerProps> = ({
  searchHistory,
  savedPriorArt,
  parsedElements,
  isLoading,
  isParsingClaim,
  onSearch,
  onDirectSearch,
  onSavePriorArt,
  onRemovePriorArt,
  onOpenPriorArtDetails,
  projectId,
  refreshProjectData,
  onExtractCitations,
  onExtractCitationForReference,
  onViewCitationsForReference,
  isActive = true,
  savedArtNumbers,
  excludedPatentNumbers,
  onSetSelectedSearchId,
  setCitationContext,
  setSelectedReference,
  claimSyncState,
  claimSetVersionId,
  onPatentNumberSelected,
}) => {
  const toast = useToast();
  const spinnerColor = useColorModeValue('blue.500', 'blue.300');

  // Debounce parsing flag to avoid quick flicker when component mounts
  const debouncedParsing = useDebounce(isParsingClaim, 200);

  // Out-of-sync confirmation dialog state
  const {
    isOpen: isOutOfSyncDialogOpen,
    onOpen: openOutOfSyncDialog,
    onClose: closeOutOfSyncDialog,
  } = useDisclosure();

  // Use optimistic search hook
  const {
    optimisticSearch,
    displaySearchHistory,
    searchStartTimeRef,
    startOptimisticSearch,
    clearOptimisticSearch,
  } = useOptimisticSearch(searchHistory);

  // Check if any search is currently processing
  const hasProcessingSearch = useMemo(() => {
    return displaySearchHistory.some(entry => {
      // Skip optimistic entries from this check
      if (entry.id.startsWith('optimistic-')) {
        return false;
      }

      // Primary check: explicitly processing status
      if (entry.citationExtractionStatus === 'processing') {
        return true;
      }

      // Secondary check: no results yet and not failed
      return (
        (entry.resultCount === 0 ||
          !entry.results ||
          entry.results.length === 0) &&
        entry.citationExtractionStatus !== 'failed' &&
        entry.citationExtractionStatus !== 'completed'
      );
    });
  }, [displaySearchHistory]);

  // Check sync state and queries availability
  const outOfSync = claimSyncState?.syncStatus === 'out-of-sync';
  const hasQueries =
    !!claimSyncState && claimSyncState.searchQueries.length > 0;

  // Use search execution hook
  const { isSearching, executeSearch } = useSearchExecution({
    onSearch,
    onDirectSearch,
    projectId,
    claimSyncState,
    onStartOptimisticSearch: startOptimisticSearch,
    onClearOptimisticSearch: clearOptimisticSearch,
    searchStartTimeRef,
  });

  /**
   * Handle search execution with out-of-sync check
   */
  const handleSearch = useCallback(
    async (mode: 'basic' | 'advanced') => {
      // Always show confirmation dialog when claim 1 is out-of-sync
      if (claimSyncState?.syncStatus === 'out-of-sync') {
        openOutOfSyncDialog();
        return;
      }

      // Otherwise proceed with search
      await executeSearch(mode);
    },
    [claimSyncState, openOutOfSyncDialog, executeSearch]
  );

  /**
   * Handle proceeding with search using old data
   */
  const handleProceedWithOldData = useCallback(async () => {
    closeOutOfSyncDialog();

    // Check if we actually have queries to search with
    if (!hasQueries) {
      toast({
        title: 'No search queries available',
        description: 'Please re-sync Claim 1 to generate search queries.',
        status: 'error',
        duration: 5000,
      });
      return;
    }

    // Show info about using old data
    toast({
      title: 'Searching with previous data',
      description:
        'Using search queries from the last sync. Results may not match your current claim.',
      status: 'info',
      duration: 5000,
    });

    await executeSearch('basic');
  }, [closeOutOfSyncDialog, hasQueries, toast, executeSearch]);

  /**
   * Handle syncing before search
   */
  const handleSyncBeforeSearch = useCallback(() => {
    closeOutOfSyncDialog();
    // Trigger the sync process
    if (claimSyncState?.resync) {
      claimSyncState.resync();
    }
  }, [closeOutOfSyncDialog, claimSyncState]);

  /**
   * Handle clearing search history
   */
  const handleClearHistory = useCallback(async () => {
    if (!projectId) return;

    try {
      // TODO: Implement clear history API call
      logger.info('[SearchTabContainer] Clearing search history', {
        projectId,
      });
      await refreshProjectData();

      toast({
        title: 'History Cleared',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      logger.error('[SearchTabContainer] Failed to clear history:', { error });
      toast({
        title: 'Failed to clear history',
        status: 'error',
        duration: 3000,
      });
    }
  }, [projectId, refreshProjectData, toast]);

  /**
   * Handle delete single search entry
   */
  const handleDeleteSearch = useCallback(
    async (searchId: string) => {
      try {
        // TODO: Implement delete search API call
        logger.info('[SearchTabContainer] Deleting search:', { searchId });
        await refreshProjectData();

        toast({
          title: 'Search deleted',
          status: 'success',
          duration: 2000,
        });
      } catch (error) {
        logger.error('[SearchTabContainer] Failed to delete search:', {
          error,
        });
        toast({
          title: 'Failed to delete search',
          status: 'error',
          duration: 3000,
        });
      }
    },
    [refreshProjectData, toast]
  );

  return (
    <Box h="100%" display="flex" flexDirection="column">
      {/* Search Header */}
      <SearchHeader
        claimSyncState={claimSyncState}
        isSearching={isSearching}
        debouncedParsing={debouncedParsing}
        hasProcessingSearch={hasProcessingSearch}
        hasOptimisticSearch={!!optimisticSearch}
        outOfSync={outOfSync}
        hasQueries={hasQueries}
        onSearch={() => handleSearch('basic')}
      />

      {/* Search History */}
      <Box flex="1" overflow="hidden">
        {isLoading ? (
          <Center pt={20}>
            <VStack spacing={4}>
              <Spinner size="lg" color={spinnerColor} />
              <Text color="text.secondary">Loading search data...</Text>
            </VStack>
          </Center>
        ) : searchHistory.length === 0 ? (
          <SearchEmptyState />
        ) : (
          <SearchHistoryTab
            searchHistory={displaySearchHistory}
            onSavePriorArt={onSavePriorArt}
            savedPriorArt={savedPriorArt.map(art => ({
              number: art.patentNumber,
              patentNumber: art.patentNumber,
              title: art.title || '',
              source: 'Manual' as const,
              relevance: 100,
              abstract: art.abstract || undefined,
              url: art.url || undefined,
              authors: art.authors ? [art.authors] : undefined,
              publicationDate: art.publicationDate || undefined,
            }))}
            onExtractCitations={onExtractCitations}
            onDeleteSearch={handleDeleteSearch}
            onClearHistory={handleClearHistory}
            isExtractingCitations={false}
            projectId={projectId}
            onExtractCitationForReference={onExtractCitationForReference}
            onViewCitationsForReference={onViewCitationsForReference}
            isActive={isActive}
            savedArtNumbers={savedArtNumbers}
            excludedPatentNumbers={excludedPatentNumbers}
            refreshSavedArtData={refreshProjectData}
          />
        )}
      </Box>

      {/* Out-of-sync Confirmation Dialog */}
      <OutOfSyncConfirmationDialog
        isOpen={isOutOfSyncDialogOpen}
        onClose={closeOutOfSyncDialog}
        hasQueries={hasQueries}
        onProceedWithOldData={handleProceedWithOldData}
        onSyncBeforeSearch={handleSyncBeforeSearch}
      />
    </Box>
  );
};
