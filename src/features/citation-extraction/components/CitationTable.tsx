/**
 * CitationTable - Used in the Claim Refinement Citations Tab
 *
 * This component displays citation matches with the ability to:
 * - Browse multiple citations per element
 * - Toggle location column visibility
 * - Save citations to prior art
 * - View relevance scores and summaries
 */
import React, { useState, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  AlertCircle,
  Bookmark,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Folder,
} from 'lucide-react';
import { BsBookmarkFill } from 'react-icons/bs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
} from '@/components/ui/dropdown-menu';
import {
  GroupedCitation,
  CitationMatch,
} from '@/features/search/hooks/useCitationMatches';
import { logger } from '@/utils/clientLogger';
import { useToast } from '@/hooks/useToastWrapper';

import { LoadingState } from '@/components/common/LoadingState';

interface CitationTableProps {
  isLoading: boolean;
  error?: Error | null;
  groupedResults: GroupedCitation[];
  onSaveCitationMatch?: (match: CitationMatch) => void;
  savedCitationIds?: Set<string>;
  selectedReference?: string | null;
  referenceStatuses?: Array<{
    referenceNumber: string;
    status?: string;
    isOptimistic?: boolean;
    showAsOptimistic?: boolean;
  }>;
}

// Helper function to format location data
const formatLocationData = (
  locationData:
    | string
    | {
        foundInAbstract?: boolean;
        claimLocations?: Array<{
          startClaimNumber: number;
          endClaimNumber: number;
        }>;
        patentDescriptionLocations?: Array<unknown>;
      }
    | null
): string => {
  if (!locationData) return '-';

  try {
    // If it's already parsed
    const location =
      typeof locationData === 'string'
        ? JSON.parse(locationData)
        : locationData;

    const parts: string[] = [];

    if (location.foundInAbstract) {
      parts.push('Abstract');
    }

    if (location.claimLocations?.length > 0) {
      const claimRanges = location.claimLocations.map(
        (loc: { startClaimNumber: number; endClaimNumber: number }) => {
          if (loc.startClaimNumber === loc.endClaimNumber) {
            return `Claim ${loc.startClaimNumber}`;
          }
          return `Claims ${loc.startClaimNumber}-${loc.endClaimNumber}`;
        }
      );
      parts.push(...claimRanges);
    }

    if (location.patentDescriptionLocations?.length > 0) {
      parts.push('Description');
    }

    return parts.length > 0 ? parts.join(', ') : '-';
  } catch (e) {
    return '-';
  }
};

const CitationTableRow: React.FC<{
  group: GroupedCitation;
  showLocationColumn: boolean;
  showActionsColumn: boolean;
  canShowActions: boolean;
  onSaveCitationMatch?: (match: CitationMatch) => void;
  savedCitationIds?: Set<string>;
}> = ({
  group,
  showLocationColumn,
  showActionsColumn,
  canShowActions,
  onSaveCitationMatch,
  savedCitationIds,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentMatch = group.matches[currentIndex];
  const [isSaving, setIsSaving] = useState(false);

  // Check if this citation is already saved - handle undefined savedCitationIds gracefully
  const isCitationSaved = useMemo(() => {
    if (!savedCitationIds) return false;
    return group.matches.some(match => savedCitationIds.has(match.id));
  }, [group.matches, savedCitationIds]);

  if (!currentMatch) return null;

  // Debug log to see what fields are available
  if (showLocationColumn && currentIndex === 0) {
    logger.debug('[CitationTableRow] Match data:', {
      matchId: currentMatch.id,
      hasLocationDataRaw: !!currentMatch.locationDataRaw,
      hasLocation: !!currentMatch.location,
      hasLocationData: !!currentMatch.locationData,
      locationDataRawValue: currentMatch.locationDataRaw,
      locationDataValue: currentMatch.locationData,
      locationValue: currentMatch.location,
    });
  }

  const handleSaveCitation = () => {
    if (onSaveCitationMatch && !isCitationSaved) {
      // Call without awaiting - let it run in background
      onSaveCitationMatch(currentMatch);
    }
  };

  return (
    <tr className="border-b border-border hover:bg-muted/50">
      {/* Element */}
      <td
        className={`align-top p-3 ${showLocationColumn ? 'w-[18%]' : 'w-[23%]'}`}
      >
        <p className="text-sm font-medium text-foreground">
          {group.elementText}
        </p>
      </td>

      {/* Citation */}
      <td
        className={`align-top p-3 whitespace-normal ${showLocationColumn ? 'w-[33%]' : 'w-[45%]'}`}
      >
        <div className="flex flex-col items-start space-y-2">
          <p className="text-sm text-foreground">{currentMatch.citation}</p>
          {group.matches.length > 1 && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(i => i - 1)}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <p className="text-xs text-muted-foreground">
                {currentIndex + 1} of {group.matches.length}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                disabled={currentIndex === group.matches.length - 1}
                onClick={() => setCurrentIndex(i => i + 1)}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </td>

      {/* Location - Conditional */}
      {showLocationColumn && (
        <td className="align-top p-3 w-[15%]">
          {currentMatch.locationStatus === 'PROCESSING' ||
          currentMatch.locationStatus === 'PENDING' ? (
            <p className="text-xs text-muted-foreground">Locating...</p>
          ) : currentMatch.locationStatus === 'FAILED' ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-1 text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  <p className="text-xs">Failed</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{currentMatch.locationError || 'Location finding failed'}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <p className="text-xs text-foreground">
              {/* Check for locationDataRaw (simple string) or location (parsed JSON) */}
              {currentMatch.locationDataRaw ||
                (currentMatch.location
                  ? formatLocationData(currentMatch.location)
                  : '-')}
            </p>
          )}
        </td>
      )}

      {/* Relevance / Score */}
      <td
        className={`align-top p-3 ${canShowActions && showActionsColumn ? 'w-[20%]' : 'w-[25%]'}`}
      >
        {currentMatch.reasoningScore != null ? (
          <div className="flex flex-col items-start space-y-1">
            <Badge
              variant="secondary"
              className={`
                ${
                  currentMatch.reasoningScore >= 0.8
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : currentMatch.reasoningScore >= 0.5
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }
              `}
            >
              {(currentMatch.reasoningScore * 100).toFixed(0)}%
            </Badge>
            <p className="text-xs text-muted-foreground">
              {currentMatch.reasoningSummary}
            </p>
          </div>
        ) : (
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
          >
            {currentMatch.reasoningStatus || 'Pending'}
          </Badge>
        )}
      </td>

      {/* Actions - Save Citation */}
      {showActionsColumn && canShowActions && onSaveCitationMatch && (
        <td className="align-top p-3 w-[8%]">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`
                  h-8 w-8 p-0
                  ${
                    isCitationSaved
                      ? 'text-blue-500 hover:text-blue-600 hover:bg-blue-50'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }
                `}
                disabled={isCitationSaved}
                onClick={handleSaveCitation}
              >
                {isCitationSaved ? (
                  <BsBookmarkFill className="h-3 w-3" />
                ) : (
                  <Bookmark className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>
                {isCitationSaved
                  ? 'Citation saved to prior art'
                  : 'Save citation to prior art'}
              </p>
            </TooltipContent>
          </Tooltip>
        </td>
      )}
    </tr>
  );
};

const CitationTable: React.FC<CitationTableProps> = ({
  isLoading,
  error,
  groupedResults,
  onSaveCitationMatch,
  savedCitationIds,
  selectedReference,
  referenceStatuses,
}) => {
  const [showLocationColumn, setShowLocationColumn] = useState(false);
  const [showActionsColumn, setShowActionsColumn] = useState(true); // Show by default when user has permission

  // Security: Only allow actions column if user has permission to save citations
  const canShowActions = Boolean(onSaveCitationMatch);

  // Memoized toggle functions following codebase patterns
  const toggleLocationColumn = useCallback(() => {
    setShowLocationColumn(prev => !prev);
  }, []);

  const toggleActionsColumn = useCallback(() => {
    if (!canShowActions) {
      logger.warn('Actions column access denied: no save permission');
      return;
    }
    setShowActionsColumn(prev => !prev);
  }, [canShowActions]);

  // Check if the selected reference is in optimistic/processing state
  const isSelectedReferenceProcessing = useMemo(() => {
    if (!selectedReference || !referenceStatuses) return false;
    
    const referenceStatus = referenceStatuses.find(
      ref => ref.referenceNumber === selectedReference
    );
    
    return referenceStatus?.showAsOptimistic === true;
  }, [selectedReference, referenceStatuses]);

  // Check if the selected reference has failed
  const isSelectedReferenceFailed = useMemo(() => {
    if (!selectedReference || !referenceStatuses) return false;
    
    const referenceStatus = referenceStatuses.find(
      ref => ref.referenceNumber === selectedReference
    );
    
    return referenceStatus?.status === 'FAILED' || referenceStatus?.status === 'ERROR';
  }, [selectedReference, referenceStatuses]);

  // Show loading state for data queries OR optimistic processing
  const shouldShowLoading = isLoading || isSelectedReferenceProcessing;

  // Show regular data loading as skeleton
  if (isLoading && !isSelectedReferenceProcessing) {
    return (
      <div>
        <LoadingState
          variant="skeleton"
          skeletonType="table"
          skeletonRows={5}
        />
      </div>
    );
  }

  // Show optimistic processing as message with spinner
  if (isSelectedReferenceProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
        <h3 className="text-lg font-medium text-foreground mb-2">
          Extracting Citations
        </h3>
        <p className="text-sm text-muted-foreground text-center leading-relaxed">
          Analyzing {selectedReference ? `Reference ${selectedReference.replace(/-/g, '')}` : 'this reference'} for relevant citations.
          <br />
          This may take a few moments...
        </p>
      </div>
    );
  }

  // Show error state for failed extractions
  if (isSelectedReferenceFailed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
        <AlertCircle className="h-8 w-8 text-destructive mb-3" />
        <h3 className="text-lg font-medium text-destructive mb-2">
          Extraction Failed
        </h3>
        <p className="text-sm text-muted-foreground text-center leading-relaxed">
          Citation extraction failed for {selectedReference ? `Reference ${selectedReference.replace(/-/g, '')}` : 'this reference'}.
          <br />
          Please try running the extraction again.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/10">
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          Error loading citation matches: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!groupedResults || groupedResults.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[200px]">
        <p className="text-muted-foreground">
          No citation matches found for this reference.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="overflow-y-auto h-full">
        <table className="w-full">
          <thead className="sticky top-0 bg-muted z-10">
            <tr>
              <th
                className={`${showLocationColumn ? 'w-[18%]' : 'w-[23%]'} text-left p-3 text-sm font-medium text-foreground border-b border-border`}
              >
                Element
              </th>
              <th
                className={`${showLocationColumn ? 'w-[33%]' : 'w-[45%]'} text-left p-3 text-sm font-medium text-foreground border-b border-border`}
              >
                <div className="flex items-center">
                  <span className="mr-2">Citation</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={toggleLocationColumn}>
                        {showLocationColumn ? (
                          <EyeOff className="mr-2 h-4 w-4" />
                        ) : (
                          <Eye className="mr-2 h-4 w-4" />
                        )}
                        {showLocationColumn
                          ? 'Hide Location column'
                          : 'Show Location column'}
                      </DropdownMenuItem>
                      {canShowActions && (
                        <DropdownMenuItem onClick={toggleActionsColumn}>
                          {showActionsColumn ? (
                            <EyeOff className="mr-2 h-4 w-4" />
                          ) : (
                            <Eye className="mr-2 h-4 w-4" />
                          )}
                          {showActionsColumn
                            ? 'Hide Actions column'
                            : 'Show Actions column'}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </th>
              {showLocationColumn && (
                <th className="w-[15%] text-left p-3 text-sm font-medium text-foreground border-b border-border">
                  Location
                </th>
              )}
              <th
                className={`${canShowActions && showActionsColumn ? 'w-[20%]' : 'w-[25%]'} text-left p-3 text-sm font-medium text-foreground border-b border-border`}
              >
                Relevance
              </th>
              {canShowActions && showActionsColumn && (
                <th className="w-[8%] text-left p-3 text-sm font-medium text-foreground border-b border-border">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {groupedResults.map(group => (
              <CitationTableRow
                key={group.elementText}
                group={group}
                showLocationColumn={showLocationColumn}
                showActionsColumn={showActionsColumn}
                canShowActions={canShowActions}
                onSaveCitationMatch={onSaveCitationMatch}
                savedCitationIds={savedCitationIds}
              />
            ))}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
};

export default CitationTable;
