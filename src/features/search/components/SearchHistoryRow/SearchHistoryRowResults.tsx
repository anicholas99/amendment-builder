import React, { useState, useCallback, useEffect } from 'react';
import { Box, VStack, Text, Icon, useToast } from '@chakra-ui/react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { logger } from '@/lib/monitoring/logger';
import { useAddProjectExclusion } from '@/hooks/api/usePriorArt';
import {
  SearchHistoryRowResultsProps,
  PAGINATION_CONSTANTS,
} from '../../types/searchHistoryRow';
import {
  isReferenceSavedLocally,
  isReferenceExcludedLocally,
  processReferenceExclusion,
  processPriorArtSave,
  generatePaginationText,
} from '../../utils/searchHistoryRowUtils';
import { ReferenceCardActions } from './ReferenceCardActions';
import ReferenceCard from '../ReferenceCard';

/**
 * SearchHistoryRowResults - Handles the expanded results list with pagination
 * and reference actions (save, exclude, citation extraction)
 */
export const SearchHistoryRowResults: React.FC<SearchHistoryRowResultsProps> =
  React.memo(
    ({
      entry,
      results,
      colors,
      projectId,
      onSavePriorArt,
      onExtractCitationForReference,
      onViewCitationsForReference,
      refreshSavedArtData,
      savedArtNumbers = new Set<string>(),
      excludedPatentNumbers = new Set<string>(),
      isReferenceSaved,
      referencesWithJobs = new Set(),
      citationJobNumbers,
      setCitationJobNumbers,
      isLoadingJobs = false,
    }) => {
      const toast = useToast();
      const { mutateAsync: addExclusion } = useAddProjectExclusion();

      // State for pagination
      const [visibleResultsCount, setVisibleResultsCount] = useState<number>(
        PAGINATION_CONSTANTS.INITIAL_VISIBLE_COUNT
      );

      // State for extraction tracking
      const [extractingReferenceNumber, setExtractingReferenceNumber] =
        useState<string | null>(null);

      // Optimistic set of saved numbers to keep UI filled while waiting for cache propagation
      const [optimisticSavedNumbers, setOptimisticSavedNumbers] = useState<
        Set<string>
      >(new Set());

      // Local state for excluded patent numbers to provide instant UI feedback
      const [localExcludedPatentNumbers, setLocalExcludedPatentNumbers] =
        useState<Set<string>>(excludedPatentNumbers);

      // Update local excluded numbers when props change (still keep separate optimistic state)
      useEffect(() => {
        setLocalExcludedPatentNumbers(
          prev =>
            new Set([...Array.from(prev), ...Array.from(excludedPatentNumbers)])
        );
      }, [excludedPatentNumbers]);

      // Merge incoming savedArtNumbers into optimistic set so it stays superset
      useEffect(() => {
        if (savedArtNumbers.size) {
          setOptimisticSavedNumbers(prev => {
            const merged = new Set<string>([
              ...Array.from(prev),
              ...Array.from(savedArtNumbers),
            ]);
            return merged;
          });
        }
      }, [savedArtNumbers]);

      // Pagination handlers
      const handleShowMoreResults = useCallback(() => {
        setVisibleResultsCount(prevCount =>
          Math.min(
            prevCount + PAGINATION_CONSTANTS.INCREMENT_COUNT,
            results.length
          )
        );
      }, [results.length]);

      const handleShowLessResults = useCallback(() => {
        setVisibleResultsCount(PAGINATION_CONSTANTS.INITIAL_VISIBLE_COUNT);
      }, []);

      // Reference exclusion handler
      const handleExcludeReference = useCallback(
        async (referenceToExclude: { referenceNumber: string; title?: string }) => {
          if (!projectId) return;

          try {
            await processReferenceExclusion(
              referenceToExclude,
              projectId,
              addExclusion,
              setLocalExcludedPatentNumbers, // Pass the actual state setter
              toast
            );

            // Refresh the data after successful exclusion
            if (refreshSavedArtData) {
              await refreshSavedArtData(projectId);
            }
          } catch (error) {
            // Error handling is done in the utility function
            logger.error(
              '[SearchHistoryRowResults] Error in handleExcludeReference:',
              error
            );
          }
        },
        [projectId, addExclusion, toast, refreshSavedArtData]
      );

      // Prior art save handler
      const handleSavePriorArtClick = useCallback(
        async (priorArtRef: { referenceNumber: string; title?: string; abstract?: string }) => {
          if (!onSavePriorArt) return;

          try {
            const normalized = priorArtRef.number
              ? priorArtRef.number.replace(/-/g, '').toUpperCase()
              : '';

            // Optimistically mark as saved immediately
            setOptimisticSavedNumbers(
              prev => new Set([...Array.from(prev), normalized])
            );

            await processPriorArtSave(
              priorArtRef,
              onSavePriorArt,
              refreshSavedArtData,
              projectId,
              toast
            );
          } catch (error) {
            // Error handling is done in the utility function
            logger.error(
              '[SearchHistoryRowResults] Error in handleSavePriorArtClick:',
              error
            );
          }
        },
        [onSavePriorArt, refreshSavedArtData, projectId, toast]
      );

      // Create citation icon renderer
      const getCitationIconForRow = useCallback(
        (referenceNumber: string): React.ReactNode => {
          return (
            <ReferenceCardActions
              referenceNumber={referenceNumber}
              entry={entry}
              onExtractCitationForReference={onExtractCitationForReference}
              onViewCitationsForReference={onViewCitationsForReference}
              citationJobNumbers={citationJobNumbers}
              setCitationJobNumbers={setCitationJobNumbers}
              extractingReferenceNumber={extractingReferenceNumber}
              setExtractingReferenceNumber={setExtractingReferenceNumber}
              isLoadingJobs={isLoadingJobs}
            />
          );
        },
        [
          entry,
          onExtractCitationForReference,
          onViewCitationsForReference,
          citationJobNumbers,
          setCitationJobNumbers,
          extractingReferenceNumber,
          isLoadingJobs,
        ]
      );

      // Helper functions using utilities
      const isReferenceSavedLocal = useCallback(
        (refNumber: string): boolean => {
          const normalized = refNumber.replace(/-/g, '').toUpperCase();
          return (
            optimisticSavedNumbers.has(normalized) ||
            isReferenceSavedLocally(
              normalized,
              savedArtNumbers,
              isReferenceSaved
            )
          );
        },
        [optimisticSavedNumbers, savedArtNumbers, isReferenceSaved]
      );

      const isReferenceExcludedLocal = useCallback(
        (refNumber: string): boolean => {
          return isReferenceExcludedLocally(
            refNumber,
            localExcludedPatentNumbers
          );
        },
        [localExcludedPatentNumbers]
      );

      return (
        <Box mt={0} px={3} pb={3}>
          <VStack
            spacing={3}
            align="stretch"
            maxH="350px"
            overflowY="auto"
            pr={2}
          >
            {results
              .slice(0, visibleResultsCount)
              .map((result, resultIndex: number) => (
                <ReferenceCard
                  key={`${entry.id}-ref-${result.number || resultIndex}`}
                  reference={result}
                  colors={colors}
                  isSaved={
                    result.number ? isReferenceSavedLocal(result.number) : false
                  }
                  isExcluded={
                    result.number
                      ? isReferenceExcludedLocal(result.number)
                      : false
                  }
                  getCitationIcon={getCitationIconForRow}
                  onSave={() => handleSavePriorArtClick(result)}
                  onExclude={handleExcludeReference}
                  resultIndex={resultIndex}
                />
              ))}

            {/* Show More Results */}
            {results.length > visibleResultsCount && (
              <Text
                mt={3}
                fontSize="sm"
                textAlign="center"
                color="text.secondary"
                _hover={{
                  color: 'text.primary',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
                onClick={handleShowMoreResults}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {generatePaginationText(
                  results.length - visibleResultsCount,
                  PAGINATION_CONSTANTS.INCREMENT_COUNT
                )}
                <Icon as={FiChevronDown} ml={1} boxSize={3} />
              </Text>
            )}

            {/* Show Less Results */}
            {visibleResultsCount >
              PAGINATION_CONSTANTS.INITIAL_VISIBLE_COUNT && (
              <Text
                mt={3}
                fontSize="sm"
                textAlign="center"
                color="text.secondary"
                _hover={{
                  color: 'text.primary',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
                onClick={handleShowLessResults}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                Show less
                <Icon as={FiChevronUp} ml={1} boxSize={3} />
              </Text>
            )}
          </VStack>
        </Box>
      );
    }
  );

SearchHistoryRowResults.displayName = 'SearchHistoryRowResults';
