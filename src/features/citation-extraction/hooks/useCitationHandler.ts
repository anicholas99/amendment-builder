import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { logger } from '@/lib/monitoring/logger';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';
import { useCreateCitationJob } from '@/hooks/api/useCitationExtraction';

interface UseCitationHandlerProps {
  searchHistory: ProcessedSearchHistoryEntry[];
  parsedElements: string[];
  handleTabChange: (index: number) => void;
  persistentSelectedSearchId: React.MutableRefObject<string | null>;
}

export function useCitationHandler({
  searchHistory,
  parsedElements,
  handleTabChange,
  persistentSelectedSearchId,
}: UseCitationHandlerProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const toast = useToast();
  const createCitationJobMutation = useCreateCitationJob();

  const handleExtractCitations = useCallback(
    async (entryId: string) => {
      if (!entryId) {
        logger.error('[useCitationHandler] No entry ID provided');
        return;
      }

      setIsExtracting(true);

      try {
        logger.info('[useCitationHandler] Starting citation extraction', {
          entryId,
        });

        // Find the search history entry
        const entry = searchHistory.find(e => e.id === entryId);
        if (!entry) {
          throw new Error(`Search history entry ${entryId} not found`);
        }

        // Create citation job
        const response = await createCitationJobMutation.mutateAsync({
          searchId: entryId,
          referenceNumber: '', // Empty string for general extraction
          parsedElements: parsedElements, // Pass the parsed elements
        });

        if (response?.success) {
          toast({
            title: 'Citation extraction started',
            description: 'Citations are being extracted in the background',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });

          // Update the persistent selected search ID
          persistentSelectedSearchId.current = entryId;

          // Switch to citations tab
          handleTabChange(1);
        } else {
          throw new Error(response?.message || 'Failed to start extraction');
        }
      } catch (error) {
        logger.error('[useCitationHandler] Error extracting citations', {
          error,
        });
        toast({
          title: 'Extraction failed',
          description:
            error instanceof Error ? error.message : 'Unknown error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsExtracting(false);
      }
    },
    [
      searchHistory,
      parsedElements,
      handleTabChange,
      persistentSelectedSearchId,
      toast,
      createCitationJobMutation,
    ]
  );

  return {
    isExtracting,
    handleExtractCitations,
    // Add missing properties for compatibility
    activeSearchEntry: null,
    selectedEntryForCitations: null,
    activeSelectedSearchIndex: -1,
  };
}
