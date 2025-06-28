import React, { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { useToast } from '@chakra-ui/react';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';
import { useCitationHandler } from './useCitationHandler';
import { SearchHistoryApiService } from '@/client/services/search-history.client-service';
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery } from '@/lib/api/queryClient';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { useCreateCitationJob } from '@/hooks/api/useCitationExtraction';
import { CitationClientService } from '@/client/services/citation.client-service';
import { STALE_TIME } from '@/constants/time';
import { CITATION_THRESHOLDS } from '@/config/citationExtractionConfig';

// Define a more detailed type for the data used in this specific hook
export interface DetailedSearchHistoryEntry
  extends ProcessedSearchHistoryEntry {
  parsedElementsFromVersion?: string | string[];
}

interface UseCitationsTabLogicProps {
  activeProject: string | null;
  searchHistory: ProcessedSearchHistoryEntry[];
  parsedElements: string[];
  handleTabChange: (index: number) => void;
  persistentSelectedSearchIdRef: React.MutableRefObject<string | null>;
  onSetSelectedSearchId?: (id: string) => void;
  setSelectedReference?: (reference: string) => void;
}

interface UseCitationsTabLogicResult {
  isExtracting: boolean;
  forceCitationDataRefreshRef: React.MutableRefObject<(() => void) | null>;
  refreshCitationData: () => void;
  handleExtractCitations: (entryId: string) => Promise<void>;
  handleExtractCitationForReference: (
    searchId: string,
    referenceNumber: string,
    threshold?: number
  ) => Promise<void>;
  handleViewCitationsForReference: (
    searchId: string,
    referenceNumber: string
  ) => Promise<void>;
  hasNewCitations: boolean;
  setHasNewCitations: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Custom hook for managing citation tab logic in the ClaimSidebar
 * Simplified to work with server-side polling
 */
export function useCitationsTabLogic({
  activeProject,
  searchHistory,
  parsedElements,
  handleTabChange,
  persistentSelectedSearchIdRef,
  onSetSelectedSearchId,
  setSelectedReference,
}: UseCitationsTabLogicProps): UseCitationsTabLogicResult {
  const toast = useToast();
  const queryClient = useQueryClient();
  const createCitationJobMutation = useCreateCitationJob();

  // Use the citation handler hook for basic citation extraction functionality
  const { isExtracting, handleExtractCitations: baseHandleExtractCitations } =
    useCitationHandler({
      searchHistory,
      parsedElements,
      handleTabChange,
      persistentSelectedSearchId: persistentSelectedSearchIdRef,
    });

  // Ref for external refresh trigger
  const forceCitationDataRefreshRef = useRef<(() => void) | null>(null);

  const [hasNewCitations, setHasNewCitations] = useState(false);

  // Function to refresh citation data
  const refreshCitationData = useCallback(() => {
    logger.log('[useCitationsTabLogic] Refreshing citation data');

    // Invalidate queries related to citation data
    const searchId = persistentSelectedSearchIdRef.current;
    if (searchId) {
      // Invalidate citation jobs query
      queryClient.invalidateQueries({ queryKey: ['citationJobs', searchId] });

      // Invalidate citation matches query
      queryClient.invalidateQueries({
        queryKey: ['citationMatches', searchId],
      });

      // Explicitly trigger refetch for citationJobs immediately after invalidation
      queryClient.refetchQueries({ queryKey: ['citationJobs', searchId] });

      logger.log(
        `[useCitationsTabLogic] Invalidated and triggered refetch for queries for search ID: ${searchId}`
      );
    } else {
      logger.warn(
        '[useCitationsTabLogic] Attempted to refresh data with no currentSearchId'
      );
    }
  }, [queryClient, persistentSelectedSearchIdRef]);

  // Store the refresh function in a ref so external components can trigger it
  forceCitationDataRefreshRef.current = refreshCitationData;

  // Modified version of handleExtractCitations that no longer starts polling
  const handleExtractCitations = useCallback(
    async (entryId: string) => {
      await baseHandleExtractCitations(entryId);

      // Update the persistent selected search ID
      if (entryId) {
        persistentSelectedSearchIdRef.current = entryId;

        // Refresh citation data immediately and let React Query handle timing
        refreshCitationData();
      }
    },
    [
      baseHandleExtractCitations,
      persistentSelectedSearchIdRef,
      refreshCitationData,
    ]
  );

  // Handler for extracting citations for a specific reference
  const handleExtractCitationForReference = useCallback(
    async (
      searchHistoryId: string,
      referenceNumber: string,
      threshold: number = CITATION_THRESHOLDS.default
    ) => {
      if (!activeProject || !searchHistoryId || !referenceNumber) {
        logger.error(
          '[useCitationsTabLogic] Missing required parameters for citation extraction:',
          {
            activeProject,
            searchHistoryId,
            referenceNumber,
          }
        );
        toast({
          title: 'Error',
          description: 'Missing required information for citation extraction',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      logger.log(
        `[useCitationsTabLogic] Creating citation job for reference ${referenceNumber} from search ${searchHistoryId} with threshold ${threshold}`
      );

      try {
        // Use the new, simplified mutation
        const response = await createCitationJobMutation.mutateAsync({
          searchId: searchHistoryId,
          referenceNumber: referenceNumber,
          parsedElements: parsedElements,
          threshold: threshold,
        });

        if (response && response.success) {
          // Update the persistent selected search ID
          persistentSelectedSearchIdRef.current = searchHistoryId;

          // Refresh citation data immediately
          refreshCitationData();
        } else {
          const errorMessage =
            response?.message || 'Failed to create extraction job.';
          logger.error('[useCitationsTabLogic] Failed creating citation job', {
            referenceNumber,
            searchHistoryId,
            response,
          });
          toast({
            title: 'Creation Error',
            description: `Failed to create job for ${referenceNumber}. ${errorMessage}`,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error('Unknown error occurred during job creation.');
        logger.error(
          '[useCitationsTabLogic] Error creating citation job for reference:',
          {
            errorMessage: err.message,
            originalErrorObject: error,
            referenceNumber,
            searchHistoryId,
          }
        );
        toast({
          title: 'Error',
          description: `An unexpected error occurred while creating the job for ${referenceNumber}.`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [
      activeProject,
      toast,
      refreshCitationData,
      persistentSelectedSearchIdRef,
      createCitationJobMutation,
      parsedElements,
    ]
  );

  // Handler for viewing citations for a reference
  const handleViewCitationsForReference = useCallback(
    async (searchHistoryId: string, referenceNumber: string) => {
      if (!activeProject || !searchHistoryId || !referenceNumber) {
        logger.error(
          '[useCitationsTabLogic] Missing required parameters for citation viewing:',
          {
            activeProject,
            searchHistoryId,
            referenceNumber,
          }
        );

        toast({
          title: 'Error',
          description: 'Missing required information for citation viewing',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });

        return;
      }

      logger.log(
        `[useCitationsTabLogic] VIEW CLICK: Setting context for Search ID ${searchHistoryId}, Reference ${referenceNumber}`
      );

      // Update the shared state/ref for the search ID
      persistentSelectedSearchIdRef.current = searchHistoryId;
      if (onSetSelectedSearchId) {
        onSetSelectedSearchId(searchHistoryId);
      }

      // Set the target reference
      if (setSelectedReference) {
        logger.log(
          `[useCitationsTabLogic] VIEW CLICK: Setting selected reference to ${referenceNumber}`
        );
        setSelectedReference(referenceNumber);
      } else {
        logger.warn(
          '[useCitationsTabLogic] setSelectedReference function not available to set target reference.'
        );
      }

      // Switch to Citations tab
      logger.log(
        `[useCitationsTabLogic] VIEW CLICK: Calling handleTabChange(1)...`
      );
      handleTabChange(1);

      // Show a toast notification
      toast({
        title: 'Viewing Citations',
        description: `Showing citations for ${referenceNumber}`,
        status: 'info',
        duration: 2500,
        isClosable: true,
      });

      // Refresh citation data to ensure we have the latest
      refreshCitationData();
    },
    [
      activeProject,
      handleTabChange,
      toast,
      onSetSelectedSearchId,
      setSelectedReference,
      persistentSelectedSearchIdRef,
      refreshCitationData,
    ]
  );

  const {
    data: activeSearchHistory,
    isLoading: isActiveSearchHistoryLoading,
    error: activeSearchHistoryError,
  } = useApiQuery(
    persistentSelectedSearchIdRef.current
      ? ['searchHistory', persistentSelectedSearchIdRef.current]
      : ['searchHistory'],
    {
      url: persistentSelectedSearchIdRef.current
        ? `/api/search-history/${persistentSelectedSearchIdRef.current}`
        : '/api/search-history/placeholder', // This won't be called due to enabled: false
      enabled: !!persistentSelectedSearchIdRef.current,
      staleTime: STALE_TIME.DEFAULT,
    }
  );

  const handleGenerateReasoning = async () => {
    if (!persistentSelectedSearchIdRef.current) return;
    const activeSearchId = persistentSelectedSearchIdRef.current;

    const searchHistoryEntry =
      activeSearchHistory ||
      (await SearchHistoryApiService.getSearchHistoryEntry(activeSearchId));

    if (!searchHistoryEntry) {
      logger.error(
        '[useCitationsTabLogic] Error fetching search history entry:',
        activeSearchHistoryError
      );
      return;
    }

    // ... existing code ...
  };

  return {
    isExtracting,
    forceCitationDataRefreshRef,
    refreshCitationData,
    handleExtractCitations,
    handleExtractCitationForReference,
    handleViewCitationsForReference,
    hasNewCitations,
    setHasNewCitations,
  };
}
