import React, {
  useCallback,
  useState,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { cn } from '@/lib/utils';
import { FiSearch } from 'react-icons/fi';
import { SearchHistoryTabShadcn } from './SearchHistoryTabShadcn';
import { SearchHeaderShadcn } from './SearchHeaderShadcn';
import { OutOfSyncConfirmationDialog } from './OutOfSyncConfirmationDialog';
import { SearchEmptyStateShadcn } from './SearchEmptyStateShadcn';
import { logger } from '@/utils/clientLogger';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';
import { ProcessedSavedPriorArt } from '@/types/domain/priorArt';
import { PriorArtReference } from '@/types/claimTypes';
import type { UseClaimSyncStateReturn } from '@/features/claim-refinement/hooks/useClaimSyncState';
import { useDebounce } from '@/hooks/useDebounce';
import { useOptimisticSearch } from '../hooks/useOptimisticSearch';
import { useSearchExecution } from '../hooks/useSearchExecution';
import { LoadingState } from '@/components/common/LoadingState';
import { useThemeContext } from '@/contexts/ThemeContext';
import { toast } from '@/hooks/use-toast';

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
 * Migrated to shadcn/ui with exact visual consistency
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
  const { isDarkMode } = useThemeContext();
  const lastSearchClickRef = useRef<number>(0);

  // Track completed searches to prevent duplicate toasts
  const completedSearchesToastedRef = useRef<Set<string>>(new Set());
  const previousSearchHistoryRef = useRef<ProcessedSearchHistoryEntry[]>([]);

  // Monitor search history for completion and show toast
  useEffect(() => {
    if (!isActive || !searchHistory || searchHistory.length === 0) return;

    const previousHistory = previousSearchHistoryRef.current;

    // Check for newly completed searches
    searchHistory.forEach(currentEntry => {
      const previousEntry = previousHistory.find(e => e.id === currentEntry.id);

      // Search completion toast
      if (
        previousEntry?.citationExtractionStatus === 'processing' &&
        currentEntry.citationExtractionStatus === 'completed' &&
        !completedSearchesToastedRef.current.has(currentEntry.id)
      ) {
        completedSearchesToastedRef.current.add(currentEntry.id);
        const resultCount = currentEntry.results?.length || 0;

        logger.info(
          '[SearchTabContainer] 🎉 SHOWING TOAST - Search completed!',
          {
            entryId: currentEntry.id,
            resultCount,
            previousStatus: previousEntry?.citationExtractionStatus,
            currentStatus: currentEntry.citationExtractionStatus,
          }
        );

        toast({
          title: 'Search Complete',
          description: `Found ${resultCount} patent${resultCount !== 1 ? 's' : ''} matching your search criteria.`,
          variant: 'success',
        });
      }
    });

    // Update previous history reference
    previousSearchHistoryRef.current = searchHistory;
  }, [searchHistory, isActive, toast]);

  // Clear toast tracking when project changes
  useEffect(() => {
    completedSearchesToastedRef.current.clear();
  }, [projectId]);

  // Debounce parsing flag to avoid quick flicker when component mounts
  const debouncedParsing = useDebounce(isParsingClaim, 200);

  // Out-of-sync confirmation dialog state
  const [isOutOfSyncDialogOpen, setIsOutOfSyncDialogOpen] = useState(false);

  // Use optimistic search hook
  const {
    optimisticSearch,
    displaySearchHistory,
    searchStartTimeRef,
    correlationIdRef,
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
    correlationIdRef,
  });

  /**
   * Handle search execution with out-of-sync check
   */
  const handleSearch = useCallback(
    async (mode: 'basic' | 'advanced') => {
      // Prevent rapid double-clicks
      const now = Date.now();
      if (now - lastSearchClickRef.current < 300) {
        logger.debug('[SearchTabContainer] Ignoring rapid double-click');
        return;
      }
      lastSearchClickRef.current = now;

      // Always show confirmation dialog when claim 1 is out-of-sync
      if (claimSyncState?.syncStatus === 'out-of-sync') {
        setIsOutOfSyncDialogOpen(true);
        return;
      }

      // Otherwise proceed with search
      await executeSearch(mode);
    },
    [claimSyncState, executeSearch]
  );

  /**
   * Handle proceeding with search using old data
   */
  const handleProceedWithOldData = useCallback(async () => {
    setIsOutOfSyncDialogOpen(false);

    // Check if we actually have queries to search with
    if (!hasQueries) {
      toast({
        title: 'No search queries available',
        description: 'Please re-sync Claim 1 to generate search queries.',
        variant: 'destructive',
      });
      return;
    }

    // Show info about using old data
    toast({
      title: 'Searching with previous data',
      description:
        'Using search queries from the last sync. Results may not match your current claim.',
      variant: 'info',
    });

    await executeSearch('basic');
  }, [hasQueries, toast, executeSearch]);

  /**
   * Handle syncing before search
   */
  const handleSyncBeforeSearch = useCallback(() => {
    setIsOutOfSyncDialogOpen(false);
    // Trigger the sync process
    if (claimSyncState?.resync) {
      claimSyncState.resync();
    }
  }, [claimSyncState]);

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
        description: 'Search history has been cleared.',
        variant: 'success',
      });
    } catch (error) {
      logger.error('[SearchTabContainer] Failed to clear history:', { error });
      toast({
        title: 'Failed to clear history',
        description: 'Failed to clear search history.',
        variant: 'destructive',
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
          description: 'Search entry has been deleted.',
          variant: 'success',
        });
      } catch (error) {
        logger.error('[SearchTabContainer] Failed to delete search:', {
          error,
        });
        toast({
          title: 'Failed to delete search',
          description: 'Failed to delete search entry.',
          variant: 'destructive',
        });
      }
    },
    [refreshProjectData, toast]
  );

  // Loading state while projects load
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <LoadingState
          variant="spinner"
          size="lg"
          message="Loading search data..."
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search Header */}
      <SearchHeaderShadcn
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
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center pt-20">
            <LoadingState
              variant="spinner"
              size="lg"
              message="Loading search data..."
            />
          </div>
        ) : searchHistory.length === 0 ? (
          <SearchEmptyStateShadcn />
        ) : (
          <SearchHistoryTabShadcn
            searchHistory={searchHistory}
            displaySearchHistory={displaySearchHistory}
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
      </div>

      {/* Out-of-sync Confirmation Dialog */}
      <OutOfSyncConfirmationDialog
        isOpen={isOutOfSyncDialogOpen}
        onClose={() => setIsOutOfSyncDialogOpen(false)}
        hasQueries={hasQueries}
        onProceedWithOldData={handleProceedWithOldData}
        onSyncBeforeSearch={handleSyncBeforeSearch}
      />
    </div>
  );
};
