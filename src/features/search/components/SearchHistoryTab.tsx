import React, { useState, useMemo, useCallback, useRef, FC } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  IconButton,
  Icon,
  Spinner,
  Tooltip,
  Center,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiSlash } from 'react-icons/fi';
import { PriorArtReference } from '../../../types/claimTypes';
import { SearchHistoryEntry } from '@/types';
import SearchHistoryRow from './SearchHistoryRow';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import ExclusionsManager from './ExclusionsManager';
import { useSearchHistoryData } from '@/hooks/api/useSearchHistoryData';
import { useCitationJobsForExpandedSearches } from '@/hooks/api/useCitationJobs';
import { useSearchHistoryColors } from '../hooks/useSearchHistoryColors';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';
import { subscribeToPriorArtEvents } from '../utils/priorArtEvents';
import { normalizeReferenceNumber } from '../utils/searchHistoryRowUtils';

interface SearchHistoryTabProps {
  searchHistory: ProcessedSearchHistoryEntry[];
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

export const SearchHistoryTab: FC<SearchHistoryTabProps> = React.memo(
  ({
    searchHistory,
    onSavePriorArt,
    savedPriorArt,
    onExtractCitations,
    onDeleteSearch,
    onClearHistory,
    isExtractingCitations = false,
    projectId,
    onExtractCitationForReference,
    onViewCitationsForReference,
    isActive = true,
    refreshSavedArtData,
    savedArtNumbers: propsSavedArtNumbers,
    excludedPatentNumbers: propsExcludedPatentNumbers,
  }) => {
    const colors = useSearchHistoryColors();
    const [expandedSearchId, setExpandedSearchId] = useState<string | null>(
      null
    );
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);

    const [isExclusionsModalOpen, setIsExclusionsModalOpen] = useState(false);

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
        propsSavedArtNumbers || hookData?.savedArtNumbers || new Set<string>(),
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
    }, [projectId, refetchSearchHistoryData]);

    // Fetch citation jobs for the currently expanded search entry
    // This data is passed down to child components to avoid duplicate API calls
    const { data: allCitationJobs = {}, isLoading: isLoadingCitationJobs } =
      useCitationJobsForExpandedSearches(
        searchHistory,
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
              .map(job => job.referenceNumber!.replace(/-/g, '').toUpperCase())
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

    const spinnerColor = useColorModeValue('blue.500', 'blue.300');
    const iconColor = useColorModeValue('gray.700', 'blue.300');

    if (searchHistory.length === 0) return null;

    return (
      <VStack spacing={3} align="stretch" p={3} h="100%">
        <HStack justify="space-between" pb={1}>
          <Text fontSize="sm" color={colors.mutedTextColor}>
            Your recent searches and results
          </Text>
          {searchHistory.length > 0 && projectId && (
            <Tooltip label="Manage excluded patents">
              <IconButton
                aria-label="Manage excluded patents"
                icon={<Icon as={FiSlash} color={iconColor} />}
                size="xs"
                variant="ghost"
                onClick={() => setIsExclusionsModalOpen(true)}
                _hover={{
                  color: useColorModeValue('blue.700', 'blue.200'),
                  bg: 'bg.hover',
                }}
              />
            </Tooltip>
          )}
        </HStack>
        <Box
          flex="1"
          overflowY="auto"
          pr={2}
          css={
            {
              /* scrollbar styles */
            }
          }
        >
          {isLoadingHistoryData && shouldUseCentralizedHook ? (
            <Center py={20}>
              <VStack spacing={4}>
                <Spinner size="md" color={spinnerColor} />
                <Text color="text.secondary">Loading search history...</Text>
              </VStack>
            </Center>
          ) : (
            searchHistory.map((entry, idx) => (
              <SearchHistoryRow
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
                searchNumber={searchHistory.length - idx}
                colors={colors}
                toggleExpand={handleToggleExpand}
                handleExtractCitations={(id, e) => onExtractCitations?.(id)}
                setDeleteConfirmId={setDeleteConfirmId}
                isExtractingCitations={isExtractingCitations}
                onSavePriorArt={onSavePriorArt}
                _savedPriorArt={savedPriorArt}
                isReferenceSaved={isReferenceSavedWrapper}
                projectId={projectId}
                onExtractCitationForReference={onExtractCitationForReference}
                onViewCitationsForReference={onViewCitationsForReference}
                referencesWithJobs={citationJobsByEntry[entry.id] || new Set()}
                refreshSavedArtData={refreshSavedArtData}
                savedArtNumbers={savedArtNumbers}
                excludedPatentNumbers={excludedPatentNumbers}
                isLoadingCitationJobs={
                  isLoadingCitationJobs && expandedSearchId === entry.id
                }
              />
            ))
          )}
        </Box>
        <DeleteConfirmationDialog
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          onConfirm={() => {
            if (deleteConfirmId) onDeleteSearch?.(deleteConfirmId);
            setDeleteConfirmId(null);
          }}
          cancelRef={cancelRef}
        />
        {projectId && (
          <ExclusionsManager
            isOpen={isExclusionsModalOpen}
            onClose={() => setIsExclusionsModalOpen(false)}
            projectId={projectId}
            onExclusionChange={refetchSearchHistoryData}
          />
        )}
      </VStack>
    );
  }
);

SearchHistoryTab.displayName = 'SearchHistoryTab';
