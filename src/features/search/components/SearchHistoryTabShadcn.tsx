import React, { useState, useMemo, useCallback, FC } from 'react';
import { cn } from '@/lib/utils';
import {
  FiSlash,
  FiTrash2,
  FiFileText,
  FiPlay,
  FiChevronDown,
} from 'react-icons/fi';
import { PriorArtReference } from '../../../types/claimTypes';
import SearchHistoryRowShadcn from './SearchHistoryRowShadcn';
import DeleteConfirmationDialog from '@/components/common/DeleteConfirmationDialogV2';
import ExclusionsManager from './ExclusionsManager';
import { useSearchHistoryData } from '@/hooks/api/useSearchHistoryData';
import { useCitationJobsForExpandedSearches } from '@/hooks/api/useCitationJobs';
import { useSearchHistoryColors } from '../hooks/useSearchHistoryColors';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';
import { subscribeToPriorArtEvents } from '../utils/priorArtEvents';
import { LoadingState } from '@/components/common/LoadingState';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SearchHistoryTabShadcnProps {
  searchHistory: ProcessedSearchHistoryEntry[];
  displaySearchHistory?: ProcessedSearchHistoryEntry[];
  onSavePriorArt: (reference: PriorArtReference) => void;
  savedPriorArt: PriorArtReference[];
  onExtractCitations?: (entryId: string) => void;
  onDeleteSearch?: (entryId: string) => void;
  onClearHistory?: () => void;
  isExtractingCitations?: boolean;
  projectId?: string;
  onExtractCitationForReference?: (
    searchId: string,
    referenceNumber: string
  ) => Promise<{ id?: string | number; isSuccess?: boolean } | undefined>;
  onViewCitationsForReference?: (
    searchId: string,
    referenceNumber: string
  ) => void;
  isActive?: boolean;
  refreshSavedArtData?: (projectId: string | null) => Promise<void>;
  savedArtNumbers?: Set<string>;
  excludedPatentNumbers?: Set<string>;
}

export const SearchHistoryTabShadcn: FC<SearchHistoryTabShadcnProps> =
  React.memo(
    ({
      searchHistory,
      displaySearchHistory,
      onSavePriorArt,
      savedPriorArt,
      onExtractCitations,
      onDeleteSearch,
      onClearHistory: _onClearHistory,
      isExtractingCitations = false,
      projectId,
      onExtractCitationForReference,
      onViewCitationsForReference,
      isActive = true,
      refreshSavedArtData,
      savedArtNumbers: propsSavedArtNumbers,
      excludedPatentNumbers: propsExcludedPatentNumbers,
    }) => {
      const { isDarkMode } = useThemeContext();
      const colors = useSearchHistoryColors();
      const [expandedSearchId, setExpandedSearchId] = useState<string | null>(
        null
      );
      const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(
        null
      );
      const [isExclusionsModalOpen, setIsExclusionsModalOpen] = useState(false);

      // Use displaySearchHistory if provided, otherwise fall back to searchHistory
      const effectiveSearchHistory = displaySearchHistory || searchHistory;

      const shouldUseCentralizedHook =
        !propsSavedArtNumbers && !propsExcludedPatentNumbers;

      const {
        data: hookData,
        isLoading: isLoadingHistoryData,
        refetch: refetchSearchHistoryData,
      } = useSearchHistoryData(projectId, {
        enabled: shouldUseCentralizedHook,
      });

      const savedArtNumbers = useMemo(
        () =>
          propsSavedArtNumbers ||
          hookData?.savedArtNumbers ||
          new Set<string>(),
        [propsSavedArtNumbers, hookData?.savedArtNumbers]
      );

      const excludedPatentNumbers = useMemo(
        () =>
          propsExcludedPatentNumbers ||
          hookData?.excludedPatentNumbers ||
          new Set<string>(),
        [propsExcludedPatentNumbers, hookData?.excludedPatentNumbers]
      );

      // Subscribe to prior art events to refresh data when items are saved/removed
      React.useEffect(() => {
        if (!projectId) return;

        const unsubscribe = subscribeToPriorArtEvents(eventDetail => {
          // Only handle events for the current project
          if (eventDetail.projectId !== projectId) return;

          // Refresh the search history data which includes saved art numbers
          if (
            eventDetail.action === 'saved' ||
            eventDetail.action === 'removed'
          ) {
            refetchSearchHistoryData();
          }
        });

        return unsubscribe;
      }, [projectId]); // Remove refetchSearchHistoryData from dependencies - refetch functions are not stable

      // Fetch citation jobs for the currently expanded search entry
      const { data: allCitationJobs = {} } = useCitationJobsForExpandedSearches(
        effectiveSearchHistory,
        expandedSearchId,
        projectId,
        isActive
      );

      // Memoize citation jobs for each search entry
      const citationJobsByEntry = useMemo(() => {
        const result: Record<string, Set<string>> = {};

        Object.entries(allCitationJobs).forEach(([searchId, jobs]) => {
          if (Array.isArray(jobs)) {
            result[searchId] = new Set(
              jobs
                .filter(job => job.referenceNumber)
                .map(job =>
                  job.referenceNumber!.replace(/-/g, '').toUpperCase()
                )
            );
          } else {
            result[searchId] = new Set();
          }
        });

        return result;
      }, [allCitationJobs]);

      const isReferenceSavedWrapper = useCallback(
        (referenceNumber: string): boolean => {
          const normalizedRef = String(referenceNumber)
            .replace(/-/g, '')
            .toUpperCase();
          return savedArtNumbers.has(normalizedRef);
        },
        [savedArtNumbers]
      );

      const handleToggleExpand = useCallback((searchId: string) => {
        setExpandedSearchId(prevId => (prevId === searchId ? null : searchId));
      }, []);

      if (isLoadingHistoryData && shouldUseCentralizedHook && !hookData) {
        return (
          <div className="flex justify-center items-center min-h-[200px]">
            <LoadingState
              variant="skeleton"
              skeletonType="search-history"
              skeletonRows={3}
            />
          </div>
        );
      }

      if (effectiveSearchHistory.length === 0) return null;

      return (
        <div className="flex flex-col space-y-3 p-4 h-full">
          <div className="flex justify-between items-center pb-1">
            <p
              className={cn(
                'text-sm',
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              )}
            >
              Your recent searches and results
            </p>
            {effectiveSearchHistory.length > 0 && projectId && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'w-6 h-6',
                        isDarkMode
                          ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      )}
                      onClick={() => setIsExclusionsModalOpen(true)}
                    >
                      <FiSlash className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Manage excluded patents</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div
            className={cn(
              'flex-1 overflow-y-auto pr-2',
              'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100',
              isDarkMode && 'scrollbar-thumb-gray-600 scrollbar-track-gray-800'
            )}
          >
            {isLoadingHistoryData && shouldUseCentralizedHook && !hookData ? (
              <div className="flex justify-center py-20">
                <LoadingState
                  variant="skeleton"
                  skeletonType="search-history"
                  skeletonRows={3}
                />
              </div>
            ) : (
              effectiveSearchHistory.map((entry, idx) => (
                <SearchHistoryRowShadcn
                  key={`${entry.id}-${citationJobsByEntry[entry.id]?.size || 0}`}
                  entry={{
                    ...entry,
                    results: entry.results || [],
                    timestamp:
                      entry.timestamp instanceof Date
                        ? entry.timestamp.toISOString()
                        : entry.timestamp,
                    searchData: JSON.stringify(entry.searchData || {}),
                    citationJobId: entry.citationJobId || undefined,
                  }}
                  _index={idx}
                  isExpanded={expandedSearchId === entry.id}
                  searchNumber={effectiveSearchHistory.length - idx}
                  colors={colors}
                  toggleExpand={handleToggleExpand}
                  handleExtractCitations={(id: string, _e: React.MouseEvent) =>
                    onExtractCitations?.(id)
                  }
                  setDeleteConfirmId={setDeleteConfirmId}
                  isExtractingCitations={isExtractingCitations}
                  onSavePriorArt={onSavePriorArt}
                  _savedPriorArt={savedPriorArt}
                  isReferenceSaved={isReferenceSavedWrapper}
                  projectId={projectId}
                  onExtractCitationForReference={onExtractCitationForReference}
                  onViewCitationsForReference={onViewCitationsForReference}
                  referencesWithJobs={
                    citationJobsByEntry[entry.id] || new Set()
                  }
                  refreshSavedArtData={refreshSavedArtData}
                  savedArtNumbers={savedArtNumbers}
                  excludedPatentNumbers={excludedPatentNumbers}
                />
              ))
            )}
          </div>

          <DeleteConfirmationDialog
            isOpen={!!deleteConfirmId}
            onClose={() => setDeleteConfirmId(null)}
            onConfirm={() => {
              if (deleteConfirmId) onDeleteSearch?.(deleteConfirmId);
              setDeleteConfirmId(null);
            }}
            title="Delete Search"
            message="Are you sure you want to delete this search and its results?"
          />

          {projectId && (
            <ExclusionsManager
              isOpen={isExclusionsModalOpen}
              onClose={() => setIsExclusionsModalOpen(false)}
              projectId={projectId}
              onExclusionChange={refetchSearchHistoryData}
            />
          )}
        </div>
      );
    }
  );

SearchHistoryTabShadcn.displayName = 'SearchHistoryTabShadcn';
