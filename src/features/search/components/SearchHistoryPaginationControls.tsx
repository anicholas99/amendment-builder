/* eslint-disable no-restricted-imports */
import React from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface SearchHistoryPaginationControlsProps {
  totalResults: number;
  visibleResultsCount: number;
  initialVisibleCount: number;
  incrementCount: number;
  onShowMore: () => void;
  onShowLess: () => void;
}

export const SearchHistoryPaginationControls: React.FC<
  SearchHistoryPaginationControlsProps
> = ({
  totalResults,
  visibleResultsCount,
  initialVisibleCount,
  incrementCount,
  onShowMore,
  onShowLess,
}) => {
  return (
    <>
      {totalResults > visibleResultsCount && (
        <div
          className={cn(
            'mt-3 text-sm text-center text-muted-foreground cursor-pointer',
            'hover:text-foreground hover:underline',
            'flex items-center justify-center'
          )}
          onClick={onShowMore}
        >
          {(() => {
            const remainingResults = totalResults - visibleResultsCount;
            const showNextCount = Math.min(incrementCount, remainingResults);
            return `Show ${remainingResults <= incrementCount ? 'all' : showNextCount} ${remainingResults === 1 ? 'remaining result' : `more results (${remainingResults} remaining)`}`;
          })()}
          <FiChevronDown className="ml-1 w-3 h-3" />
        </div>
      )}
      {visibleResultsCount > initialVisibleCount && (
        <div
          className={cn(
            'mt-3 text-sm text-center text-muted-foreground cursor-pointer',
            'hover:text-foreground hover:underline',
            'flex items-center justify-center'
          )}
          onClick={onShowLess}
        >
          Show less
          <FiChevronUp className="ml-1 w-3 h-3" />
        </div>
      )}
    </>
  );
};
