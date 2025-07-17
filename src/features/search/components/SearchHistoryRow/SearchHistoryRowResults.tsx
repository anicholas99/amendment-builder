import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { logger } from '@/utils/clientLogger';
import { useAddPatentExclusion } from '@/hooks/api/usePatentExclusions';
import { useToast } from '@/hooks/useToastWrapper';
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
import { PriorArtReference } from '@/types/claimTypes';

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
      referencesWithJobs: _referencesWithJobs = new Set(),
      citationJobNumbers,
      setCitationJobNumbers,
    }) => {
      const toast = useToast();
      const { mutateAsync: addExclusion } = useAddPatentExclusion();

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
        async (referenceToExclude: PriorArtReference) => {
          if (!projectId) return;

          try {
            await processReferenceExclusion(
              referenceToExclude,
              projectId,
              async params => {
                await addExclusion(params);
                // Return void to match expected type
              },
              setLocalExcludedPatentNumbers, // Pass the actual state setter
              toast
            );

            // Note: No need to refresh data here - optimistic updates and React Query
            // cache invalidation from useAddPatentExclusion hook handle UI updates
          } catch (error) {
            // Error handling is done in the utility function
            logger.error(
              '[SearchHistoryRowResults] Error in handleExcludeReference:',
              error
            );
          }
        },
        [projectId, addExclusion, toast]
      );

      // Prior art save handler
      const handleSavePriorArtClick = useCallback(
        async (priorArtRef: PriorArtReference) => {
          if (!onSavePriorArt) return;

          try {
            const normalized = priorArtRef.number
              ? priorArtRef.number.replace(/-/g, '').toUpperCase()
              : priorArtRef.patentNumber
                ? priorArtRef.patentNumber.replace(/-/g, '').toUpperCase()
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
        <div className="mt-0 px-4 pb-3">
          {/* Flexible results container */}
          <div className="flex flex-col space-y-3 pr-2">
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
                  onSave={handleSavePriorArtClick}
                  onExclude={handleExcludeReference}
                  resultIndex={resultIndex}
                />
              ))}
          </div>

          {/* Pagination controls - outside scrollable area */}
          <div className="mt-3">
            {/* Show More Results */}
            {results.length > visibleResultsCount && (
              <p
                className={cn(
                  'text-sm text-center text-muted-foreground',
                  'hover:text-foreground hover:underline cursor-pointer',
                  'flex items-center justify-center py-2'
                )}
                onClick={handleShowMoreResults}
              >
                {generatePaginationText(
                  results.length - visibleResultsCount,
                  PAGINATION_CONSTANTS.INCREMENT_COUNT
                )}
                <FiChevronDown className="ml-1 h-3 w-3" />
              </p>
            )}

            {/* Show Less Results */}
            {visibleResultsCount >
              PAGINATION_CONSTANTS.INITIAL_VISIBLE_COUNT && (
              <p
                className={cn(
                  'text-sm text-center text-muted-foreground',
                  'hover:text-foreground hover:underline cursor-pointer',
                  'flex items-center justify-center py-2'
                )}
                onClick={handleShowLessResults}
              >
                Show less
                <FiChevronUp className="ml-1 h-3 w-3" />
              </p>
            )}
          </div>
        </div>
      );
    }
  );

SearchHistoryRowResults.displayName = 'SearchHistoryRowResults';
