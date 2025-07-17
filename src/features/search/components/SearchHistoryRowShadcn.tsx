/* eslint-disable no-restricted-imports */
import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { logger } from '@/utils/clientLogger';
import { PriorArtReference } from '../../../types/claimTypes';
import { SearchHistoryRowProps } from '../types/searchHistoryRow';
import { useThemeContext } from '@/contexts/ThemeContext';

// Import ShadCN sub-components
import { SearchHistoryRowHeaderShadcn } from './SearchHistoryRow/SearchHistoryRowHeaderShadcn';
import { SearchHistoryRowResults } from './SearchHistoryRow/SearchHistoryRowResults';

// Import custom hooks
import { useSavedArtAndExclusions } from '../hooks/useSavedArtAndExclusions';

/**
 * SearchHistoryRow - ShadCN/Tailwind version of the orchestration component for rendering search history entries
 * Displays a single row in the search history, using shadcn/ui components.
 * It is designed to be visually consistent with previous versions.
 */
const SearchHistoryRowShadcn: React.FC<SearchHistoryRowProps> = React.memo(
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
  }) => {
    const { isDarkMode } = useThemeContext();

    // Use custom hooks for state management
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
      <div
        className={cn(
          'border-b relative',
          isDarkMode
            ? 'border-gray-700 bg-gray-800'
            : 'border-gray-200 bg-white'
        )}
      >
        {/* Header Section */}
        <SearchHistoryRowHeaderShadcn
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
          />
        )}
      </div>
    );
  }
);

SearchHistoryRowShadcn.displayName = 'SearchHistoryRowShadcn';

export default SearchHistoryRowShadcn;
