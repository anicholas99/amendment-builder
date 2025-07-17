import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { LoadingMinimal } from '@/components/common/LoadingState';
import { SearchHistoryRowHeaderProps } from '../../types/searchHistoryRow';
import { formatDisplayDate } from '../../utils/searchHistoryRowUtils';
import { formatDate } from '../../utils/searchHistoryUtils';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Badge } from '@/components/ui/badge';

// This component provides the header for search history rows, using shadcn/ui components.
// It is designed to be visually consistent with previous versions.
export const SearchHistoryRowHeaderShadcn: React.FC<SearchHistoryRowHeaderProps> =
  React.memo(
    ({
      entry,
      isExpanded,
      searchNumber,
      colors,
      toggleExpand,
      setDeleteConfirmId,
      isExtractingCitations = false,
      hasEntryJobId,
      results,
    }) => {
      const { isDarkMode } = useThemeContext();

      // Memoize the toggle handler
      const handleToggleExpand = useCallback(() => {
        toggleExpand(entry.id);
      }, [entry.id, toggleExpand]);

      // Get display date
      const timestampString =
        entry.timestamp instanceof Date
          ? entry.timestamp.toISOString()
          : entry.timestamp;
      const displayDate = formatDisplayDate(timestampString, entry.date);

      // Check if search is still processing
      // Primary check: explicit processing status
      const isSearchProcessing =
        entry.citationExtractionStatus === 'processing' ||
        // Secondary check: no results yet and not completed/failed
        ((!results || results.length === 0) &&
          entry.citationExtractionStatus !== 'failed' &&
          entry.citationExtractionStatus !== 'completed');

      return (
        <div
          className={cn(
            'flex items-center justify-between w-full p-4 cursor-pointer transition-colors duration-200',
            'select-none',
            isDarkMode
              ? 'bg-gray-800 hover:bg-gray-700'
              : 'bg-white hover:bg-gray-50'
          )}
          onClick={handleToggleExpand}
        >
          <div className="flex items-center space-x-3 flex-grow overflow-hidden min-w-0">
            {/* Expand/Collapse Icon */}
            {isExpanded ? (
              <FiChevronUp
                className={cn(
                  'w-4 h-4 flex-shrink-0',
                  isDarkMode ? 'text-white' : 'text-gray-700'
                )}
              />
            ) : (
              <FiChevronDown
                className={cn(
                  'w-4 h-4 flex-shrink-0',
                  isDarkMode ? 'text-white' : 'text-gray-700'
                )}
              />
            )}

            {/* Search Number Badge */}
            <Badge
              variant="secondary"
              className={cn(
                'text-xs px-2 py-1 rounded-md flex-shrink-0',
                'bg-blue-100 text-blue-800 hover:bg-blue-200',
                isDarkMode && 'bg-blue-900 text-blue-200 hover:bg-blue-800'
              )}
            >
              SEARCH #{searchNumber}
            </Badge>

            {/* Date and Status */}
            <div className="flex items-baseline space-x-2">
              <span
                className={cn(
                  'text-sm whitespace-nowrap flex-shrink-0',
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                )}
              >
                {formatDate(displayDate)}
              </span>

              {isSearchProcessing ? (
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <LoadingMinimal size="sm" />
                  <span
                    className={cn(
                      'text-xs whitespace-nowrap',
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    )}
                  >
                    Searching...
                  </span>
                </div>
              ) : entry.citationExtractionStatus === 'failed' ? (
                <span
                  className={cn(
                    'text-xs whitespace-nowrap flex-shrink-0',
                    isDarkMode ? 'text-red-400' : 'text-red-500'
                  )}
                >
                  (Search failed)
                </span>
              ) : (
                <span
                  className={cn(
                    'text-xs whitespace-nowrap flex-shrink-0',
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  )}
                  title={`${results?.length || 0} results found`}
                >
                  ({results && Array.isArray(results) ? results.length : 0}{' '}
                  results)
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }
  );

SearchHistoryRowHeaderShadcn.displayName = 'SearchHistoryRowHeaderShadcn';
