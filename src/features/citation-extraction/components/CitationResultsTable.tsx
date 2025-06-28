/**
 * CitationResultsTable - Used in the Claim Refinement Citations Tab
 * 
 * IMPORTANT: This component is ACTIVELY USED in the claim refinement view.
 * Do NOT deprecate or remove this component.
 * 
 * There are two CitationResultsTable components in the codebase:
 * 1. THIS ONE: src/features/citation-extraction/components/CitationResultsTable.tsx 
 *    - Used in claim refinement Citations tab
 *    - Handles citation display with bookmark functionality
 * 
 * 2. The other one: src/features/search/components/CitationResultsTable/
 *    - Used in the main Search tab view
 *    - Has a modular structure with sub-components
 * 
 * Both are actively maintained and serve different parts of the application.
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  IconButton,
  Tooltip,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiBookmark,
  FiMoreVertical,
} from 'react-icons/fi';
import { BsBookmarkFill } from 'react-icons/bs';
import {
  GroupedCitation,
  CitationMatch,
} from '@/features/search/hooks/useCitationMatches';
import { logger } from '@/lib/monitoring/logger';

interface CitationResultsTableProps {
  isLoading: boolean;
  error?: Error | null;
  groupedResults: GroupedCitation[];
  onSaveCitationMatch?: (match: CitationMatch) => Promise<void>;
  savedCitationIds?: Set<string>;
}

// Helper function to format location data
const formatLocationData = (locationData: any): string => {
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
      const claimRanges = location.claimLocations.map((loc: any) => {
        if (loc.startClaimNumber === loc.endClaimNumber) {
          return `Claim ${loc.startClaimNumber}`;
        }
        return `Claims ${loc.startClaimNumber}-${loc.endClaimNumber}`;
      });
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

interface CitationTableRowProps {
  group: GroupedCitation;
  showLocationColumn: boolean;
  showActionsColumn: boolean;
  canShowActions: boolean;
  onSaveCitationMatch?: (match: CitationMatch) => Promise<void>;
  savedCitationIds?: Set<string>;
  currentIndex: number;
}

const CitationTableRowComponent: React.FC<CitationTableRowProps> = ({
  group,
  showLocationColumn,
  showActionsColumn,
  canShowActions,
  onSaveCitationMatch,
  savedCitationIds,
  currentIndex: initialIndex,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentMatch = group.matches[currentIndex];

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

  const citationSaved = savedCitationIds?.has(currentMatch.id) || false;

  // Debug logging - removed useEffect to avoid issues
  if (currentIndex === 0) {
    logger.info('[CitationTableRow] Row saved state:', {
      matchId: currentMatch.id,
      citationSaved,
      hasSavedIds: !!savedCitationIds,
      savedIdsSize: savedCitationIds?.size || 0,
      elementText: currentMatch.parsedElementText?.substring(0, 50),
      citation: currentMatch.citation?.substring(0, 50),
    });
  }

  const handleSaveCitation = async () => {
    if (onSaveCitationMatch && !citationSaved) {
      await onSaveCitationMatch(currentMatch);
    }
  };

  return (
    <Tr>
      {/* Element */}
      <Td verticalAlign="top" width={showLocationColumn ? '18%' : '23%'}>
        <Text fontSize="sm" fontWeight="medium" color="text.primary">
          {group.elementText}
        </Text>
      </Td>

      {/* Citation */}
      <Td
        verticalAlign="top"
        whiteSpace="normal"
        w={showLocationColumn ? '33%' : '45%'}
      >
        <VStack align="start" spacing={2}>
          <Text fontSize="sm" color="text.primary">
            {currentMatch.citation}
          </Text>
          {group.matches.length > 1 && (
            <HStack spacing={1}>
              <IconButton
                icon={<ChevronLeftIcon />}
                size="xs"
                variant="ghost"
                aria-label="Previous citation"
                isDisabled={currentIndex === 0}
                onClick={() => setCurrentIndex(i => i - 1)}
              />
              <Text fontSize="xs" color="text.tertiary">
                {currentIndex + 1} of {group.matches.length}
              </Text>
              <IconButton
                icon={<ChevronRightIcon />}
                size="xs"
                variant="ghost"
                aria-label="Next citation"
                isDisabled={currentIndex === group.matches.length - 1}
                onClick={() => setCurrentIndex(i => i + 1)}
              />
            </HStack>
          )}
        </VStack>
      </Td>

      {/* Location - Conditional */}
      {showLocationColumn && (
        <Td verticalAlign="top" width="15%">
          {currentMatch.locationStatus === 'PROCESSING' ||
          currentMatch.locationStatus === 'PENDING' ? (
            <Text fontSize="xs" color="text.secondary">
              Locating...
            </Text>
          ) : currentMatch.locationStatus === 'FAILED' ? (
            <Tooltip
              label={currentMatch.locationError || 'Location finding failed'}
              placement="top"
              hasArrow
            >
              <HStack spacing={1} color="red.500">
                <Icon as={FiAlertCircle} boxSize={3} />
                <Text fontSize="xs">Failed</Text>
              </HStack>
            </Tooltip>
          ) : (
            <Text fontSize="xs" color="text.primary">
              {/* Check for locationDataRaw (simple string) or location (parsed JSON) */}
              {currentMatch.locationDataRaw ||
                (currentMatch.location
                  ? formatLocationData(currentMatch.location)
                  : '-')}
            </Text>
          )}
        </Td>
      )}

      {/* Relevance / Score */}
      <Td
        verticalAlign="top"
        width={canShowActions && showActionsColumn ? '20%' : '25%'}
      >
        {currentMatch.reasoningScore != null ? (
          <VStack align="start" spacing={1}>
            <Badge
              colorScheme={
                currentMatch.reasoningScore >= 0.8
                  ? 'green'
                  : currentMatch.reasoningScore >= 0.5
                    ? 'yellow'
                    : 'red'
              }
            >
              {(currentMatch.reasoningScore * 100).toFixed(0)}%
            </Badge>
            <Text fontSize="xs" color="text.secondary">
              {currentMatch.reasoningSummary}
            </Text>
          </VStack>
        ) : (
          <Badge colorScheme="gray">
            {currentMatch.reasoningStatus || 'Pending'}
          </Badge>
        )}
      </Td>

      {/* Actions - Save Citation */}
      {showActionsColumn && canShowActions && onSaveCitationMatch && (
        <Td verticalAlign="top" width="8%">
          <Tooltip
            label={
              citationSaved
                ? 'Citation saved to prior art'
                : 'Save citation to prior art'
            }
            placement="left"
            hasArrow
          >
            <IconButton
              icon={<Icon as={citationSaved ? BsBookmarkFill : FiBookmark} />}
              aria-label="Save citation"
              size="sm"
              variant="ghost"
              color={citationSaved ? 'blue.500' : 'text.secondary'}
              isDisabled={citationSaved}
              onClick={handleSaveCitation}
              _hover={{
                color: citationSaved ? 'blue.600' : 'text.primary',
                bg: citationSaved ? 'blue.50' : 'bg.hover',
              }}
            />
          </Tooltip>
        </Td>
      )}
    </Tr>
  );
};

const CitationTableRow = React.memo(
  CitationTableRowComponent,
  (prevProps, nextProps) => {
    if (
      prevProps.group !== nextProps.group ||
      prevProps.showLocationColumn !== nextProps.showLocationColumn ||
      prevProps.showActionsColumn !== nextProps.showActionsColumn ||
      prevProps.canShowActions !== nextProps.canShowActions ||
      prevProps.currentIndex !== nextProps.currentIndex
    ) {
      return false;
    }

    // Check if saved state changed for current match
    const prevMatch = prevProps.group.matches[prevProps.currentIndex];
    const nextMatch = nextProps.group.matches[nextProps.currentIndex];
    
    if (prevMatch && nextMatch) {
      const prevSaved = prevProps.savedCitationIds?.has(prevMatch.id) || false;
      const nextSaved = nextProps.savedCitationIds?.has(nextMatch.id) || false;
      if (prevSaved !== nextSaved) {
        return false;
      }
    }

    return true;
  }
);

const CitationResultsTable: React.FC<CitationResultsTableProps> = ({
  isLoading,
  error,
  groupedResults,
  onSaveCitationMatch,
  savedCitationIds,
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

  if (isLoading) {
    return (
      <VStack justify="center" align="center" h="200px">
        <Spinner size="lg" />
        <Text color="text.primary">Loading citations...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Error loading citation matches: {error.message}
      </Alert>
    );
  }

  if (!groupedResults || groupedResults.length === 0) {
    return (
      <VStack justify="center" align="center" h="200px">
        <Text color="text.tertiary">
          No citation matches found for this reference.
        </Text>
      </VStack>
    );
  }

  return (
    <Box overflowY="auto" height="100%">
      <Table variant="simple" size="sm">
        <Thead position="sticky" top={0} bg="bg.secondary" zIndex={1}>
          <Tr>
            <Th width={showLocationColumn ? '18%' : '23%'} color="text.primary">
              Element
            </Th>
            <Th w={showLocationColumn ? '33%' : '45%'} color="text.primary">
              <Flex align="center">
                <Text as="span" mr={2}>
                  Citation
                </Text>
                <Menu isLazy>
                  <MenuButton
                    as={IconButton}
                    icon={<Icon as={FiMoreVertical} />}
                    size="sm"
                    variant="ghost"
                    aria-label="Citation table options"
                    color="text.secondary"
                    mr={1}
                    _hover={{
                      bg: 'bg.hover',
                      color: 'text.primary',
                    }}
                    _active={{
                      bg: 'bg.focus',
                    }}
                  />
                  <MenuList zIndex={5}>
                    <MenuItem
                      icon={<Icon as={showLocationColumn ? FiEyeOff : FiEye} />}
                      onClick={toggleLocationColumn}
                    >
                      {showLocationColumn
                        ? 'Hide Location column'
                        : 'Show Location column'}
                    </MenuItem>
                    {canShowActions && (
                      <MenuItem
                        icon={
                          <Icon as={showActionsColumn ? FiEyeOff : FiEye} />
                        }
                        onClick={toggleActionsColumn}
                      >
                        {showActionsColumn
                          ? 'Hide Actions column'
                          : 'Show Actions column'}
                      </MenuItem>
                    )}
                  </MenuList>
                </Menu>
              </Flex>
            </Th>
            {showLocationColumn && (
              <Th width="15%" color="text.primary">
                Location
              </Th>
            )}
            <Th
              width={canShowActions && showActionsColumn ? '20%' : '25%'}
              color="text.primary"
            >
              Relevance
            </Th>
            {canShowActions && showActionsColumn && (
              <Th width="8%" color="text.primary">
                Actions
              </Th>
            )}
          </Tr>
        </Thead>
        <Tbody>
          {groupedResults.map((group, groupIndex) => (
            <CitationTableRow
              key={`${group.elementText}-${group.matches[0]?.referenceNumber || groupIndex}`}
              group={group}
              showLocationColumn={showLocationColumn}
              showActionsColumn={showActionsColumn}
              canShowActions={canShowActions}
              onSaveCitationMatch={onSaveCitationMatch}
              savedCitationIds={savedCitationIds}
              currentIndex={0}
            />
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default CitationResultsTable;
