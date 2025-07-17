import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { logger } from '@/utils/clientLogger';
import { cn } from '@/lib/utils';
import {
  FiCheckCircle,
  FiXCircle,
  FiBookmark,
  FiX,
  FiBarChart2,
  FiChevronDown,
  FiZap,
  FiAlertTriangle,
  FiInfo,
  FiCpu,
  FiFileText,
} from 'react-icons/fi';
import { BsBookmarkFill } from 'react-icons/bs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useThemeContext } from '@/contexts/ThemeContext';
import ReferenceRelevancySummary, {
  CitationMatchSummary,
} from './ReferenceRelevancySummary';
import VersionSelector from './VersionSelector';
import { isEnhancedCitationJob } from '@/types/ui-types';
import { LoadingState } from '@/components/common/LoadingState';

// Import extracted components
import {
  ReferenceBadges,
  ReferenceJobStatus,
} from './citation-header/ReferenceBadges';
import {
  MetadataDisplay,
  DisplayableMetadata,
} from './citation-header/MetadataDisplay';
import { ActionButtons } from './citation-header/ActionButtons';
import { PatentabilitySection } from './citation-header/PatentabilitySection';

// Re-export types for backward compatibility
export type { DisplayableMetadata, ReferenceJobStatus };

// Props interface
interface CitationTabHeaderProps {
  selectedSearchId: string;
  onSelectSearch: (id: string) => void;
  availableSearches: { id: string; display: string }[];
  referenceJobStatuses: ReferenceJobStatus[];
  selectedReference: string | null;
  onSelectReference: (refNumber: string | null) => void;
  isLoading: boolean;
  referenceMetadata: DisplayableMetadata | null;
  projectId?: string;
  onSaveReference?: (referenceNumber: string) => void;
  onExcludeReference?: (referenceNumber: string) => void;
  isReferenceSaved?: boolean;
  isReferenceExcluded?: boolean;
  // New props for reference relevancy
  citationMatches?: CitationMatchSummary[];
  claim1Text?: string;
  // New prop for patentability dashboard
  showPatentabilityDashboard?: boolean;
  onTogglePatentability?: (isEnabled: boolean) => void;
  isAnalyzingPatentability?: boolean;
  onAnalyzePatentability?: () => void;
  onCustomClaimAnalysis?: (claimText: string) => void;
  patentabilityScore?: number | null;
  onRunPatentabilityAnalysis?: () => void;
  // Use inline type for claimSetVersions
  claimSetVersions?: { id: string; name: string; createdAt: string }[];
  selectedClaimSetVersionId?: string;
  onClaimSetVersionChange?: (versionId: string) => void;
  onRerunExtraction?: (versionId: string, referenceNumber: string) => void;
  latestClaimSetVersionId?: string;
  showDeepAnalysis?: boolean;
  onToggleDeepAnalysis?: (isEnabled: boolean) => void;
  isDeepAnalysisAvailable?: boolean;
  hasHighRelevanceAnalysis?: boolean;
  hasDeepAnalysisData?: boolean;
  onRunDeepAnalysis?: () => void;
  isRunningDeepAnalysis?: boolean;
  onCombinedAnalysis?: () => void;
  // Examiner analysis props
  showExaminerAnalysis?: boolean;
  onToggleExaminerAnalysis?: (isEnabled: boolean) => void;
  isExaminerAnalysisAvailable?: boolean;
  hasHighImportanceFindings?: boolean;
  hasExaminerAnalysisData?: boolean;
  onRunExaminerAnalysis?: () => void;
  isRunningExaminerAnalysis?: boolean;
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

export const CitationTabHeader: React.FC<CitationTabHeaderProps> = ({
  selectedSearchId,
  onSelectSearch,
  availableSearches,
  referenceJobStatuses = [],
  selectedReference,
  onSelectReference,
  isLoading = false,
  referenceMetadata,
  projectId,
  onSaveReference,
  onExcludeReference,
  isReferenceSaved = false,
  isReferenceExcluded = false,
  citationMatches = [],
  claim1Text,
  showPatentabilityDashboard = false,
  onTogglePatentability,
  isAnalyzingPatentability = false,
  onAnalyzePatentability,
  onCustomClaimAnalysis,
  patentabilityScore,
  onRunPatentabilityAnalysis,
  claimSetVersions = [],
  selectedClaimSetVersionId,
  onClaimSetVersionChange,
  onRerunExtraction,
  latestClaimSetVersionId,
  showDeepAnalysis = false,
  onToggleDeepAnalysis,
  isDeepAnalysisAvailable,
  hasHighRelevanceAnalysis,
  hasDeepAnalysisData = false,
  onRunDeepAnalysis,
  isRunningDeepAnalysis = false,
  onCombinedAnalysis,
  showExaminerAnalysis = false,
  onToggleExaminerAnalysis,
  isExaminerAnalysisAvailable,
  hasHighImportanceFindings,
  hasExaminerAnalysisData = false,
  onRunExaminerAnalysis,
  isRunningExaminerAnalysis = false,
  onRerunCitationExtraction,
  isRerunningExtraction,
  citationHistory,
  onViewHistoricalRun,
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <div
      className={cn(
        'border-b p-4',
        isDarkMode ? 'border-gray-800' : 'border-gray-200'
      )}
    >
      {/* Top row with title and dropdown */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-medium">
          Citations for{' '}
          {availableSearches.find(s => s.id === selectedSearchId)?.display ||
            'Search'}
        </h2>
        <div className="flex items-center">
          {/* Enhanced Patentability Analysis Section */}
          <PatentabilitySection
            showPatentabilityDashboard={showPatentabilityDashboard}
            patentabilityScore={patentabilityScore}
            onTogglePatentability={onTogglePatentability}
            onRunPatentabilityAnalysis={onRunPatentabilityAnalysis}
            onCombinedAnalysis={onCombinedAnalysis}
            hasReferences={referenceJobStatuses.length > 0}
          />

          {/* Search selection dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center max-w-[200px] h-9 px-3 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
              {availableSearches.find(s => s.id === selectedSearchId)
                ?.display || 'Select a search'}
              <FiChevronDown className="ml-2 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-[9999]">
              {availableSearches.map((search, index) => (
                <DropdownMenuItem
                  key={search.id}
                  onClick={() => onSelectSearch(search.id)}
                >
                  {search.display}
                  {index === 0 ? ' (Latest)' : ''}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Processing Indicator */}
      {referenceJobStatuses.some(ref => ref.status === 'processing') && (
        <Alert className="mb-3">
          <FiInfo className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Citations are being processed</div>
                <div className="text-sm">
                  Results will appear automatically when ready.
                </div>
              </div>
              <LoadingState variant="minimal" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Reference badges row */}
      <ReferenceBadges
        referenceJobStatuses={referenceJobStatuses}
        selectedReference={selectedReference}
        onSelectReference={onSelectReference}
      />

      {/* Show message when no references are available */}
      {!isLoading && referenceJobStatuses.length === 0 && (
        <div
          className={cn(
            'p-4 text-center mb-3',
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          )}
        >
          <p>No citations loaded yet.</p>
        </div>
      )}

      {/* Display Metadata Section with Action Icons */}
      <div className="flex justify-between items-center mb-3 min-h-[40px]">
        {/* Metadata Box */}
        <div className="flex-grow overflow-hidden mr-2">
          <MetadataDisplay
            referenceMetadata={referenceMetadata}
            selectedReference={selectedReference}
            isLoading={isLoading}
            citationMatches={citationMatches}
          />
        </div>

        {/* Action Icons */}
        <ActionButtons
          selectedReference={selectedReference}
          isReferenceSaved={isReferenceSaved}
          isReferenceExcluded={isReferenceExcluded}
          isLoading={isLoading}
          onSaveReference={onSaveReference}
          onExcludeReference={onExcludeReference}
          isExaminerAnalysisAvailable={isExaminerAnalysisAvailable}
          showExaminerAnalysis={showExaminerAnalysis}
          hasExaminerAnalysisData={hasExaminerAnalysisData}
          hasHighImportanceFindings={hasHighImportanceFindings}
          isRunningExaminerAnalysis={isRunningExaminerAnalysis}
          onToggleExaminerAnalysis={onToggleExaminerAnalysis}
          onRerunExtraction={onRerunCitationExtraction}
          isRerunningExtraction={isRerunningExtraction}
          citationHistory={citationHistory}
          onViewHistoricalRun={onViewHistoricalRun}
        />
      </div>

      {/* Version Selector */}
      <VersionSelector
        versions={claimSetVersions}
        selectedVersionId={selectedClaimSetVersionId}
        latestVersionId={latestClaimSetVersionId}
        onChange={onClaimSetVersionChange}
        selectedReference={selectedReference}
        referenceMetadata={referenceMetadata ? { isMetadataOnly: false } : null}
        onRerunExtraction={onRerunExtraction}
      />

      {/* If no job statuses at all */}
      {referenceJobStatuses.length === 0 && (
        <div className="text-center py-10">
          <p
            className={cn(
              'text-sm',
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            )}
          >
            No reference selected. Select a search from the dropdown to see
            citations.
          </p>
        </div>
      )}
    </div>
  );
};

export default CitationTabHeader;
