import React from 'react';
import { cn } from '@/lib/utils';
import { FiSearch, FiShield } from 'react-icons/fi';
import { useThemeContext } from '@/contexts/ThemeContext';
import { SearchSelectionDropdown } from '../SearchSelectionDropdown';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';

interface CombinedAnalysisHeaderProps {
  searchHistory: ProcessedSearchHistoryEntry[];
  searchHistoryId: string | null;
  onSearchChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const CombinedAnalysisHeader: React.FC<CombinedAnalysisHeaderProps> = ({
  searchHistory,
  searchHistoryId,
  onSearchChange,
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Header Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <FiShield className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Combined Examiner Analysis
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Comprehensive patentability analysis combining multiple prior art
            references to evaluate claim strength and identify potential
            rejection grounds.
          </p>
        </div>

        {/* Search Selection */}
        {searchHistory.length > 0 && (
          <div className="w-full lg:w-72">
            <div className="flex items-center gap-2 mb-2">
              <FiSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Analysis Source
              </p>
            </div>
            <SearchSelectionDropdown
              selectedSearchId={searchHistoryId}
              searchHistory={searchHistory}
              onChange={onSearchChange}
              inline={true}
              placeholder="Please select a search"
            />
          </div>
        )}
      </div>
    </div>
  );
};
