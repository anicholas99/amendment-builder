/* eslint-disable no-restricted-imports */
import React, { useState, useMemo, useEffect } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { Box } from '@chakra-ui/react';
import { PriorArtReference } from '../../../types/claimTypes';
import { SearchHistoryRowProps } from '../types/searchHistoryRow';

// Import sub-components
import { SearchHistoryRowHeader } from './SearchHistoryRow/SearchHistoryRowHeader';
import { SearchHistoryRowResults } from './SearchHistoryRow/SearchHistoryRowResults';

// Import custom hooks
import { useSavedArtAndExclusions } from '../hooks/useSavedArtAndExclusions';

/**
 * SearchHistoryRow - Simplified orchestration component for rendering search history entries
 *
 * This component has been refactored from 847 lines to focus solely on orchestration.
 * Complex business logic, state management, and UI rendering have been extracted to:
 * - SearchHistoryRowHeader: Collapsible header with search info
 * - SearchHistoryRowResults: Results list with pagination and actions
 * - ReferenceCardActions: Citation extraction and viewing actions
 * - Utility functions in searchHistoryRowUtils.ts
 */
const SearchHistoryRow: React.FC<SearchHistoryRowProps> = React.memo(
  ({
    entry,
    _index,
    isExpanded,
    searchNumber,
    colors,
    toggleExpand,
    handleExtractCitations,
    setDeleteConfirmId,
    isExtractingCitations = false,
    onSavePriorArt,
    _savedPriorArt = [],
    isReferenceSaved,
    projectId,
    onExtractCitationForReference,
    onViewCitationsForReference,
    referencesWithJobs = new Set(),
    refreshSavedArtData,
    savedArtNumbers: propsSavedArtNumbers,
    excludedPatentNumbers: propsExcludedPatentNumbers,
    isLoadingCitationJobs = false,
  }) => {
    // Use custom hooks for state management
    // NOTE: Citation jobs are fetched by the parent SearchHistoryTab component
    // to avoid duplicate API calls. The referencesWithJobs prop contains the
    // normalized reference numbers that have citation jobs.
    const { savedArtNumbers, excludedPatentNumbers } = useSavedArtAndExclusions(
      {
        propsSavedArtNumbers,
        propsExcludedPatentNumbers,
      }
    );

    // Process results to ensure they're in the correct format
    const results = useMemo(() => {
      if (Array.isArray(entry.results)) {
        return entry.results as PriorArtReference[];
      }
      return [] as PriorArtReference[];
    }, [entry.results]);

    // Check if this entry has a citation job ID
    const hasEntryJobId = entry.citationJobId !== undefined;

    return (
      <Box
        borderBottomWidth={1}
        borderColor={colors.borderColor}
        bg={colors.bg}
        position="relative"
      >
        {/* Header Section */}
        <SearchHistoryRowHeader
          entry={entry}
          isExpanded={isExpanded}
          searchNumber={searchNumber}
          colors={colors}
          toggleExpand={toggleExpand}
          setDeleteConfirmId={setDeleteConfirmId}
          isExtractingCitations={isExtractingCitations}
          hasEntryJobId={hasEntryJobId}
          results={results}
        />

        {/* Results Section (only when expanded) */}
        {isExpanded && (
          <SearchHistoryRowResults
            entry={entry}
            results={results}
            colors={colors}
            projectId={projectId}
            onSavePriorArt={onSavePriorArt}
            onExtractCitationForReference={onExtractCitationForReference}
            onViewCitationsForReference={onViewCitationsForReference}
            refreshSavedArtData={refreshSavedArtData}
            savedArtNumbers={savedArtNumbers}
            excludedPatentNumbers={excludedPatentNumbers}
            isReferenceSaved={isReferenceSaved}
            referencesWithJobs={referencesWithJobs as Set<string>}
            citationJobNumbers={referencesWithJobs as Set<string>}
            setCitationJobNumbers={() => {}} // No-op since parent manages this
            isLoadingJobs={isLoadingCitationJobs}
          />
        )}
      </Box>
    );
  }
);

SearchHistoryRow.displayName = 'SearchHistoryRow';

export default SearchHistoryRow;
