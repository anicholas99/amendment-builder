import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { logger } from '@/lib/monitoring/logger';
import {
  Box,
  Flex,
  Text,
  HStack,
  Badge,
  IconButton,
  Icon,
  Spinner,
  Tooltip,
  Alert,
  AlertIcon,
  Button,
  Circle,
  Switch,
  Select,
  VStack,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
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
import ReferenceRelevancySummary, {
  CitationMatchSummary,
} from './ReferenceRelevancySummary';
import VersionSelector from './VersionSelector';
import { isEnhancedCitationJob } from '@/types/ui-types';

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
  return (
    <Box borderBottomWidth="1px" borderBottomColor="border.primary" p={3}>
      {/* Top row with title and dropdown */}
      <Flex justify="space-between" align="center" mb={3}>
        <Text fontSize="lg" fontWeight="medium">
          Citations for{' '}
          {availableSearches.find(s => s.id === selectedSearchId)?.display ||
            'Search'}
        </Text>
        <Flex alignItems="center">
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
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<Icon as={FiChevronDown} />}
              size="sm"
              maxW="200px"
              variant="outline"
            >
              {availableSearches.find(s => s.id === selectedSearchId)
                ?.display || 'Select a search'}
            </MenuButton>
            <MenuList zIndex={9999}>
              {availableSearches.map((search, index) => (
                <MenuItem
                  key={search.id}
                  onClick={() => {
                    onSelectSearch(search.id);
                  }}
                >
                  {search.display}
                  {index === 0 ? ' (Latest)' : ''}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      {/* Processing Indicator */}
      {referenceJobStatuses.some(ref => ref.status === 'processing') && (
        <Alert status="info" mb={3} borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <Text fontWeight="medium">Citations are being processed</Text>
            <Text fontSize="sm">
              Results will appear automatically when ready.
            </Text>
          </Box>
          <Spinner size="sm" ml={3} />
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
        <Box p={3} textAlign="center" color="text.secondary" mb={3}>
          <Text>No citations loaded yet.</Text>
        </Box>
      )}

      {/* Display Metadata Section with Action Icons */}
      <Flex justify="space-between" align="center" mb={3} minH="40px">
        {/* Metadata Box */}
        <Box flexGrow={1} overflow="hidden" mr={2}>
          <MetadataDisplay
            referenceMetadata={referenceMetadata}
            selectedReference={selectedReference}
            isLoading={isLoading}
            citationMatches={citationMatches}
          />
        </Box>

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
      </Flex>

      {/* Version Selector */}
      <VersionSelector
        versions={claimSetVersions}
        selectedVersionId={selectedClaimSetVersionId}
        latestVersionId={latestClaimSetVersionId}
        onChange={onClaimSetVersionChange}
        selectedReference={selectedReference}
        referenceMetadata={referenceMetadata}
        onRerunExtraction={onRerunExtraction}
      />

      {/* If no job statuses at all */}
      {referenceJobStatuses.length === 0 && (
        <Box textAlign="center" py={10}>
          <Text fontSize="sm" color="text.secondary">
            No reference selected. Select a search from the dropdown to see
            citations.
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default CitationTabHeader;
