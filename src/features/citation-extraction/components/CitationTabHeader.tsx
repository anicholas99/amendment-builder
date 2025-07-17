import React from 'react';
import { X, Cpu, ArrowUpDown, SortDesc, ChevronDown, Calendar, CalendarDays } from 'lucide-react';
import { Bookmark } from 'lucide-react';
import { BsBookmarkFill } from 'react-icons/bs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { LoadingState, LoadingMinimal } from '@/components/common/LoadingState';
import { ActionButtons } from '@/features/search/components/citation-header/ActionButtons';
import { logger } from '@/utils/clientLogger';
import { SearchSelectionDropdown } from '@/features/search/components/SearchSelectionDropdown';
import { formatRelevanceScore } from '../utils/relevanceScore';

interface Search {
  id: string;
  query: string;
}

interface ReferenceStatus {
  referenceNumber: string;
  status: string;
  isOptimistic?: boolean;
  wasOptimistic?: boolean;
  showAsOptimistic?: boolean;
}

export type SortOption = 'default' | 'relevance' | 'date-desc' | 'date-asc';

interface CitationTabHeaderProps {
  currentSearchId: string | null;
  onSearchChange: (searchId: string) => void;
  searchHistory: Search[];
  referenceStatuses: ReferenceStatus[];
  selectedReference: string | null;
  onSelectReference: (ref: string) => void;
  isLoading: boolean;
  onCombinedAnalysis: () => void;
  onSaveReference: () => void;
  onExcludeReference?: () => void;
  isReferenceSaved?: boolean;
  isReferenceExcluded?: boolean;
  referenceMetadata: {
    title?: string | null;
    applicant?: string | null;
    publicationDate?: string | null;
    relevanceScore?: number;
    matchCount?: number;
    hasLowConfidenceMatches?: boolean;
  } | null;
  // Sorting props
  sortOption?: SortOption;
  onSortChange?: (sortOption: SortOption) => void;
  // Deep analysis props
  isDeepAnalysisAvailable?: boolean;
  showDeepAnalysis?: boolean;
  hasDeepAnalysisData?: boolean;
  hasHighRelevanceAnalysis?: boolean;
  isRunningDeepAnalysis?: boolean;
  onToggleDeepAnalysis?: (isEnabled: boolean) => void;
  onRunDeepAnalysis?: () => void;
  // Rerun extraction props
  onRerunCitationExtraction?: () => void;
  isRerunningExtraction?: boolean;
  // Citation history props
  citationHistory?: Array<{
    id: string;
    createdAt: Date;
    status: string;
    isCurrent: boolean;
  }>;
  onViewHistoricalRun?: (jobId: string) => void;
}

export const CitationTabHeader: React.FC<CitationTabHeaderProps> = React.memo(
  ({
    currentSearchId,
    onSearchChange,
    searchHistory,
    referenceStatuses,
    selectedReference,
    onSelectReference,
    isLoading,
    onCombinedAnalysis,
    onSaveReference,
    onExcludeReference,
    isReferenceSaved = false,
    isReferenceExcluded = false,
    referenceMetadata,
    sortOption = 'default',
    onSortChange,
    isDeepAnalysisAvailable,
    showDeepAnalysis,
    hasDeepAnalysisData,
    hasHighRelevanceAnalysis,
    isRunningDeepAnalysis,
    onToggleDeepAnalysis,
    onRunDeepAnalysis,
    onRerunCitationExtraction,
    isRerunningExtraction,
    citationHistory,
    onViewHistoricalRun,
  }) => {
    const formatReferenceNumber = (ref: string) => {
      return ref.replace(/-/g, '');
    };

    const handleSaveClick = React.useCallback(() => {
      onSaveReference();
    }, [onSaveReference]);

    const getSortIcon = () => {
      switch (sortOption) {
        case 'relevance':
          return <SortDesc className="w-3 h-3 mr-1" />;
        case 'date-desc':
          return <CalendarDays className="w-3 h-3 mr-1" />;
        case 'date-asc':
          return <Calendar className="w-3 h-3 mr-1" />;
        default:
          return <ArrowUpDown className="w-3 h-3 mr-1" />;
      }
    };

    return (
      <TooltipProvider>
        <div className="p-3 border-b border-border">
          {/* First row: Title, search dropdown, and action buttons */}
          <div
            className={`flex justify-between items-center ${currentSearchId && referenceStatuses.length > 0 ? 'mb-2' : ''}`}
          >
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-foreground">
                Citation Analysis
              </h2>

              {/* Search dropdown */}
              {searchHistory.length > 0 && (
                <>
                  <div className="w-px h-5 bg-border" />
                  <SearchSelectionDropdown
                    selectedSearchId={currentSearchId}
                    searchHistory={searchHistory}
                    onChange={e => onSearchChange(e.target.value)}
                    inline
                    placeholder="Please select"
                  />
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              {/* Sort dropdown */}
              {referenceStatuses.length > 1 && onSortChange && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                    >
                      {getSortIcon()}
                      Sort
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={() => onSortChange('default')}
                      className={sortOption === 'default' ? 'bg-accent' : ''}
                    >
                      <ArrowUpDown className="w-3 h-3 mr-2" />
                      Default Order
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onSortChange('relevance')}
                      className={sortOption === 'relevance' ? 'bg-accent' : ''}
                    >
                      <SortDesc className="w-3 h-3 mr-2" />
                      By Relevance
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onSortChange('date-desc')}
                      className={sortOption === 'date-desc' ? 'bg-accent' : ''}
                    >
                      <CalendarDays className="w-3 h-3 mr-2" />
                      Newest First
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onSortChange('date-asc')}
                      className={sortOption === 'date-asc' ? 'bg-accent' : ''}
                    >
                      <Calendar className="w-3 h-3 mr-2" />
                      Oldest First
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button
                size="sm"
                onClick={onCombinedAnalysis}
                disabled={false}
                className="text-xs px-2 py-1 h-7 hidden sm:flex"
              >
                Combined Analysis
              </Button>

              {/* Mobile version - icon only */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={onCombinedAnalysis}
                    disabled={false}
                    className="w-7 h-7 p-0 sm:hidden"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Combined Analysis</p>
                </TooltipContent>
              </Tooltip>

              <ActionButtons
                selectedReference={selectedReference}
                isReferenceSaved={isReferenceSaved}
                isReferenceExcluded={isReferenceExcluded}
                isLoading={isLoading}
                onSaveReference={handleSaveClick}
                onExcludeReference={onExcludeReference}
                onRerunExtraction={onRerunCitationExtraction}
                isRerunningExtraction={isRerunningExtraction}
                citationHistory={citationHistory}
                onViewHistoricalRun={onViewHistoricalRun}
              />
            </div>
          </div>

          {/* Second row: Reference badges */}
          {referenceStatuses.length > 0 && (
            <div className="mb-2">
              {isLoading && referenceStatuses.length === 0 ? (
                <LoadingState variant="spinner" size="sm" minHeight="32px" />
              ) : (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-0.5">
                  {referenceStatuses.map(ref => {
                    const isSelected =
                      selectedReference === ref.referenceNumber;
                    const shouldShowSpinner =
                      ref.showAsOptimistic || ref.isOptimistic;

                    return (
                      <div
                        key={ref.referenceNumber}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            onSelectReference(ref.referenceNumber);
                          }
                        }}
                        className={`
                          px-3 py-1 text-xs rounded-full cursor-pointer relative flex-shrink-0
                          transition-colors duration-150 ease-out border flex items-center gap-1.5
                          ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-700'
                              : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600'
                          }
                          ${shouldShowSpinner ? 'opacity-50' : ''}
                          hover:border-blue-500 hover:dark:border-blue-400
                        `}
                        onClick={() => onSelectReference(ref.referenceNumber)}
                      >
                        {formatReferenceNumber(ref.referenceNumber)}
                        {shouldShowSpinner && (
                          <span className="ml-1 inline-block">
                            <LoadingMinimal size="sm" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Third row: Selected reference metadata */}
          {selectedReference && referenceMetadata && (
            <div className="pt-1">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">
                    {referenceMetadata.title || 'No Title Available'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {/* Relevance Score Badge */}
                    {typeof referenceMetadata.relevanceScore === 'number' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="secondary"
                            className={`text-xs px-2 py-0.5 border ${formatRelevanceScore(referenceMetadata.relevanceScore).styleClass}`}
                          >
                            {formatRelevanceScore(referenceMetadata.relevanceScore).percentage}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Overall relevance score based on {referenceMetadata.matchCount || 0} citation matches
                            {referenceMetadata.hasLowConfidenceMatches && ' (some low-confidence matches excluded)'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    
                    {/* Author/Applicant and Date */}
                    <p className="text-muted-foreground text-xs flex-1 min-w-0">
                      {referenceMetadata.applicant || 'Unknown Applicant'}
                      {referenceMetadata.publicationDate && (
                        <>
                          {' '}
                          •{' '}
                          {(() => {
                            const dateStr = String(
                              referenceMetadata.publicationDate
                            );
                            if (dateStr.length === 8) {
                              return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
                            }
                            return 'Invalid Date';
                          })()}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Action buttons for selected reference */}
                <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                  {/* AI Analysis Button */}
                  {isDeepAnalysisAvailable && (
                    <div className="relative flex items-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant={showDeepAnalysis ? 'default' : 'outline'}
                            className={`
                              h-6 w-6 p-0
                              ${
                                showDeepAnalysis
                                  ? 'bg-purple-500 text-white hover:bg-purple-600'
                                  : 'text-purple-500 border-purple-200 hover:text-purple-600 hover:bg-purple-50'
                              }
                            `}
                            onClick={() =>
                              onToggleDeepAnalysis &&
                              onToggleDeepAnalysis(!showDeepAnalysis)
                            }
                            disabled={
                              !selectedReference ||
                              isLoading ||
                              isRunningDeepAnalysis
                            }
                          >
                            {isRunningDeepAnalysis ? (
                              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Cpu className="h-3 w-3" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {showDeepAnalysis
                              ? 'Hide AI Analysis'
                              : 'Show AI Analysis'}
                          </p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Notification dot for new analysis */}
                      {!showDeepAnalysis &&
                        !isRunningDeepAnalysis &&
                        hasDeepAnalysisData && (
                          <div
                            className={`
                              absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-white
                              ${hasHighRelevanceAnalysis ? 'bg-red-500' : 'bg-purple-400'}
                            `}
                          />
                        )}
                    </div>
                  )}

                  {/* Save/Unsave Icon Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant={isReferenceSaved ? 'ghost' : 'outline'}
                        className={`
                          h-6 w-6 p-0
                          ${
                            isReferenceSaved
                              ? 'text-blue-500 hover:text-blue-600 hover:bg-blue-50'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }
                        `}
                        onClick={handleSaveClick}
                        disabled={!selectedReference || isLoading}
                      >
                        {isReferenceSaved ? (
                          <BsBookmarkFill className="h-3 w-3" />
                        ) : (
                          <Bookmark className="h-3 w-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {isReferenceSaved
                          ? 'Reference saved to prior art'
                          : 'Save reference to prior art'}
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Exclude Icon Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={onExcludeReference}
                        disabled={!onExcludeReference || isReferenceExcluded}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Exclude this reference from future searches</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          )}
        </div>
      </TooltipProvider>
    );
  }
);

CitationTabHeader.displayName = 'CitationTabHeader';
