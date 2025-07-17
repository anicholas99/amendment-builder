import React from 'react';
import { cn } from '@/lib/utils';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { LoadingMinimal } from '@/components/common/LoadingState';
import { ClaimSyncIndicator } from '@/features/claim-refinement/components/ClaimSyncIndicator';
import { useThemeContext } from '@/contexts/ThemeContext';
import type { UseClaimSyncStateReturn } from '@/features/claim-refinement/hooks/useClaimSyncState';

interface SearchHeaderShadcnProps {
  // Claim sync state
  claimSyncState?: UseClaimSyncStateReturn & {
    onOpenModal?: () => void;
  };

  // Loading states
  isSearching: boolean;
  debouncedParsing: boolean;
  hasProcessingSearch: boolean;
  hasOptimisticSearch: boolean;

  // Search state
  outOfSync: boolean;
  hasQueries: boolean;

  // Handlers
  onSearch: () => void;
}

export const SearchHeaderShadcn: React.FC<SearchHeaderShadcnProps> = ({
  claimSyncState,
  isSearching,
  debouncedParsing,
  hasProcessingSearch,
  hasOptimisticSearch,
  outOfSync,
  hasQueries,
  onSearch,
}) => {
  const { isDarkMode } = useThemeContext();

  const showSearchLoadingState =
    isSearching || hasProcessingSearch || hasOptimisticSearch;
  const [isButtonDisabled, setIsButtonDisabled] = React.useState(false);

  // Stabilize needsSync calculation to prevent rapid changes
  const needsSync = React.useMemo(() => {
    return (
      claimSyncState &&
      !claimSyncState.isInitialLoading &&
      (claimSyncState.syncStatus === 'idle' ||
        claimSyncState.syncStatus === 'error') &&
      !hasQueries &&
      !showSearchLoadingState
    );
  }, [
    claimSyncState?.isInitialLoading,
    claimSyncState?.syncStatus,
    hasQueries,
    showSearchLoadingState,
  ]);

  const handleButtonClick = React.useCallback(() => {
    if (isButtonDisabled) return;

    // If we need sync, do sync instead of search
    if (needsSync && claimSyncState?.resync) {
      claimSyncState.resync();
      return;
    }

    // Disable button immediately
    setIsButtonDisabled(true);

    // Call the search function
    onSearch();

    // Re-enable after a delay
    setTimeout(() => {
      setIsButtonDisabled(false);
    }, 1000);
  }, [onSearch, isButtonDisabled, needsSync, claimSyncState]);

  // Determine button text and icon
  const getButtonContent = () => {
    if (showSearchLoadingState) {
      return { icon: FiSearch, text: 'Searching...' };
    }
    if (claimSyncState?.syncStatus === 'parsing') {
      return { icon: FiRefreshCw, text: 'Parsing...', spinning: true };
    }
    if (claimSyncState?.syncStatus === 'generating') {
      return { icon: FiRefreshCw, text: 'Generating...', spinning: true };
    }
    if (needsSync) {
      return { icon: FiRefreshCw, text: 'Sync Claim First' };
    }
    return { icon: FiSearch, text: 'Run New Search' };
  };

  const buttonContent = getButtonContent();

  return (
    <div
      className={cn(
        'p-3 border-b border-border',
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      )}
    >
      {/* First row: Header */}
      <div className="flex justify-between items-center mb-2">
        <h2
          className={cn(
            'text-sm font-semibold text-foreground',
            isDarkMode ? 'text-gray-100' : 'text-gray-900'
          )}
        >
          Patent Search
        </h2>
        {claimSyncState && !claimSyncState.isInitialLoading && (
          <ClaimSyncIndicator
            syncStatus={claimSyncState.syncStatus}
            error={claimSyncState.error}
            lastSyncTime={claimSyncState.lastSyncTime}
            onResync={claimSyncState.resync}
            onOpenModal={claimSyncState.onOpenModal}
          />
        )}
      </div>

      {/* Second row: Search/Sync Button */}
      <Button
        size="sm"
        onClick={handleButtonClick}
        disabled={
          isButtonDisabled ||
          showSearchLoadingState ||
          debouncedParsing ||
          claimSyncState?.isInitialLoading ||
          claimSyncState?.syncStatus === 'parsing' ||
          claimSyncState?.syncStatus === 'generating' ||
          (!hasQueries && !outOfSync && !needsSync) // Only disable if truly no action possible
        }
        className={cn(
          'w-full mb-2 transition-all duration-150', // Smooth transitions
          (showSearchLoadingState ||
            debouncedParsing ||
            claimSyncState?.isInitialLoading ||
            claimSyncState?.syncStatus === 'parsing' ||
            claimSyncState?.syncStatus === 'generating') &&
            'opacity-50 cursor-not-allowed'
        )}
      >
        <buttonContent.icon
          className={cn(
            'w-4 h-4 mr-2',
            buttonContent.spinning && 'animate-spin'
          )}
        />
        {buttonContent.text}
      </Button>

      {/* Subtle hint only when sync is needed */}
      {needsSync && (
        <p
          className={cn(
            'text-xs text-center opacity-60 mb-2',
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          )}
        >
          Parse claim into search queries
        </p>
      )}

      {/* Third row: Processing indicator */}
      {(hasProcessingSearch || hasOptimisticSearch) && (
        <div
          className={cn(
            'flex items-center p-2 rounded-md',
            isDarkMode
              ? 'bg-blue-900/20 border-blue-700'
              : 'bg-blue-50 border-blue-200',
            'border'
          )}
        >
          <div
            className={cn(
              'w-4 h-4 rounded-full mr-2',
              isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
            )}
          />
          <div className="flex-1">
            <p
              className={cn(
                'text-xs font-medium',
                isDarkMode ? 'text-blue-200' : 'text-blue-800'
              )}
            >
              Search in progress
            </p>
          </div>
          <LoadingMinimal size="sm" />
        </div>
      )}
    </div>
  );
};
