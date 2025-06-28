import { useCallback } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { useCitationStore } from '../../citation-extraction/store';
import { useCitationsTabLogic } from '../../citation-extraction/hooks/useCitationsTabLogic';

interface UseSidebarCitationLogicProps {
  activeProjectId: string | null;
  searchHistory: any[];
  parsedElements: string[];
  handleTabChange: (index: number) => void;
  persistentSelectedSearchIdRef: React.MutableRefObject<string | null>;
  onSetSelectedSearchId?: (id: string) => void;
}

/**
 * Custom hook for managing citation extraction logic in the sidebar
 */
export const useSidebarCitationLogic = ({
  activeProjectId,
  searchHistory,
  parsedElements,
  handleTabChange,
  persistentSelectedSearchIdRef,
  onSetSelectedSearchId,
}: UseSidebarCitationLogicProps) => {
  // Get citation store functions
  const setSelectedReference = useCitationStore(
    state => state.setSelectedReference
  );
  const setActiveSearchId = useCitationStore(state => state.setActiveSearchId);
  const addOptimisticRefs = useCitationStore(state => state.addOptimisticRefs);
  const clearOptimisticRefs = useCitationStore(
    state => state.clearOptimisticRefs
  );

  // Use the citations tab logic hook
  const {
    hasNewCitations,
    setHasNewCitations,
    handleExtractCitationForReference: extractCitationFromApi,
  } = useCitationsTabLogic({
    activeProject: activeProjectId,
    searchHistory: searchHistory,
    parsedElements,
    handleTabChange: handleTabChange,
    persistentSelectedSearchIdRef: persistentSelectedSearchIdRef,
    onSetSelectedSearchId,
    setSelectedReference,
  });

  // Function to handle extraction and update optimistic state
  const handleExtractCitationForReference = useCallback(
    async (searchId: string, referenceNumber: string) => {
      const refKey = referenceNumber;

      // Optimistically update UI state
      addOptimisticRefs(searchId, [refKey]);

      try {
        // Call the API
        const result = await extractCitationFromApi(searchId, referenceNumber);

        return result;
      } catch (error) {
        logger.error('Failed to extract citation:', {
          error: error instanceof Error ? error : undefined,
        });

        // On error, clear the optimistic state immediately
        clearOptimisticRefs(searchId);

        throw error;
      }
    },
    [extractCitationFromApi, addOptimisticRefs, clearOptimisticRefs]
  );

  return {
    hasNewCitations,
    setHasNewCitations,
    handleExtractCitationForReference,
    setSelectedReference,
    setActiveSearchId,
  };
};
