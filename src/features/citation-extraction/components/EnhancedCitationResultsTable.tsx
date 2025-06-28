import React, { useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Tooltip,
  HStack,
  Icon,
  IconButton,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiMoreVertical,
} from 'react-icons/fi';
import { useTopCitationMatches } from '@/hooks/api/useTopCitationMatches';
import { logger } from '@/lib/monitoring/logger';

interface EnhancedCitationResultsTableProps {
  searchHistoryId: string | null;
  selectedReference?: string;
}

// Helper function to format location data
const formatLocationData = (locationData: string | { foundInAbstract?: boolean; claimLocations?: Array<{ startClaimNumber: number; endClaimNumber: number }>; patentDescriptionLocations?: Array<unknown> } | null): string | JSX.Element => {
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
      const claimRanges = location.claimLocations.map((loc: { startClaimNumber: number; endClaimNumber: number }) => {
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

// Wrap in React.memo with custom comparison function
export const EnhancedCitationResultsTable = React.memo<
  EnhancedCitationResultsTableProps
>(
  ({ searchHistoryId, selectedReference }) => {
    const [showLocationColumn, setShowLocationColumn] = useState(false);

    const { data, isLoading, error } = useTopCitationMatches({
      searchHistoryId,
      referenceNumber: selectedReference,
    });

    if (isLoading) {
      return (
        <VStack justify="center" align="center" h="200px">
          <Spinner size="lg" />
          <Text color="text.primary">Loading enhanced citation analysis...</Text>
        </VStack>
      );
    }

    if (error) {
      return (
        <Alert status="error">
          <AlertIcon />
          Error loading enhanced citation matches: {(error as Error).message}
        </Alert>
      );
    }

    if (!data || !data.groupedResults || data.groupedResults.length === 0) {
      return (
        <VStack justify="center" align="center" h="200px" spacing={4}>
          <Text color="text.tertiary">
            No deep analysis results available for this reference.
          </Text>
          <Text fontSize="sm" color="text.secondary">
            Run deep analysis to see AI-identified relevant citations.
          </Text>
        </VStack>
      );
    }

    const { groupedResults, deepAnalysisSummary } = data;

    return (
      <Box>
        {/* Deep Analysis Summary if available */}
        {deepAnalysisSummary && (
          <Box
            mb={4}
            p={4}
            bg="bg.secondary"
            borderRadius="md"
            borderWidth="1px"
            borderColor="border.primary"
          >
            <VStack align="start" spacing={2}>
              <HStack>
                <Icon as={FiCheckCircle} color="green.500" />
                <Text fontWeight="semibold" color="text.primary">
                  AI Analysis Summary
                </Text>
              </HStack>
              <Text fontSize="sm" color="text.secondary">
                {deepAnalysisSummary.holisticAnalysis}
              </Text>
              {deepAnalysisSummary.overallAssessment?.patentabilityScore !=
                null && (
                <Badge
                  colorScheme={
                    deepAnalysisSummary.overallAssessment.patentabilityScore >=
                    0.7
                      ? 'red'
                      : deepAnalysisSummary.overallAssessment
                            .patentabilityScore >= 0.4
                        ? 'yellow'
                        : 'green'
                  }
                >
                  Overall Relevance:{' '}
                  {(
                    deepAnalysisSummary.overallAssessment.patentabilityScore * 100
                  ).toFixed(0)}
                  %
                </Badge>
              )}
            </VStack>
          </Box>
        )}

        {/* Citation Table */}
        <Box overflowY="auto" maxHeight="600px">
          <Table variant="simple" size="sm">
            <Thead position="sticky" top={0} bg="bg.secondary" zIndex={1}>
              <Tr>
                <Th
                  width={showLocationColumn ? '20%' : '25%'}
                  color="text.primary"
                >
                  Claim Element
                </Th>
                <Th
                  width={showLocationColumn ? '30%' : '40%'}
                  color="text.primary"
                >
                  <Flex align="center">
                    <Text as="span" mr={2}>
                      Top Citation
                    </Text>
                    <Menu isLazy>
                      <MenuButton
                        as={IconButton}
                        icon={<Icon as={FiMoreVertical} />}
                        size="sm"
                        variant="ghost"
                        aria-label="Citation table options"
                        color="text.secondary"
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
                          icon={
                            <Icon as={showLocationColumn ? FiEyeOff : FiEye} />
                          }
                          onClick={() =>
                            setShowLocationColumn(!showLocationColumn)
                          }
                        >
                          {showLocationColumn
                            ? 'Hide Location column'
                            : 'Show Location column'}
                        </MenuItem>
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
                  width={showLocationColumn ? '20%' : '25%'}
                  color="text.primary"
                >
                  AI Reasoning
                </Th>
                <Th
                  width={showLocationColumn ? '10%' : '10%'}
                  color="text.primary"
                >
                  Relevance
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {groupedResults.map((group: { elementText: string; matches: Array<{ id: string; citation: string; paragraph?: string; reasoningSummary?: string; reasoningScore?: number; locationStatus?: string; locationError?: string; location?: string; locationData?: string }> }) => (
                <React.Fragment key={group.elementText}>
                  {group.matches.map((match: { id: string; citation: string; paragraph?: string; reasoningSummary?: string; reasoningScore?: number; locationStatus?: string; locationError?: string; location?: string; locationData?: string }, index: number) => (
                    <Tr
                      key={match.id}
                      borderTopWidth={index === 0 ? '2px' : '1px'}
                      borderTopColor={
                        index === 0 ? 'border.secondary' : 'border.primary'
                      }
                    >
                      {/* Element - only show for first match in group */}
                      <Td
                        verticalAlign="top"
                        width={showLocationColumn ? '20%' : '25%'}
                      >
                        {index === 0 && (
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="text.primary"
                          >
                            {group.elementText}
                          </Text>
                        )}
                      </Td>

                      {/* Citation */}
                      <Td
                        verticalAlign="top"
                        whiteSpace="normal"
                        width={showLocationColumn ? '30%' : '40%'}
                      >
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color="text.primary" noOfLines={3}>
                            {match.citation}
                          </Text>
                          {match.paragraph && (
                            <Text
                              fontSize="xs"
                              color="text.secondary"
                              noOfLines={2}
                            >
                              {match.paragraph}
                            </Text>
                          )}
                        </VStack>
                      </Td>

                      {/* Location - Conditional */}
                      {showLocationColumn && (
                        <Td verticalAlign="top" width="15%">
                          {match.locationStatus === 'PROCESSING' ||
                          match.locationStatus === 'PENDING' ? (
                            <Text fontSize="xs" color="text.secondary">
                              Locating...
                            </Text>
                          ) : match.locationStatus === 'FAILED' ? (
                            <Tooltip
                              label={
                                match.locationError || 'Location finding failed'
                              }
                              placement="top"
                              hasArrow
                            >
                              <HStack spacing={1} color="red.500">
                                <Icon as={FiAlertCircle} boxSize={3} />
                                <Text fontSize="xs">Failed</Text>
                              </HStack>
                            </Tooltip>
                          ) : (
                            <Text fontSize="xs" color="text.secondary">
                              {formatLocationData(
                                match.location || match.locationData
                              )}
                            </Text>
                          )}
                        </Td>
                      )}

                      {/* AI Reasoning */}
                      <Td
                        verticalAlign="top"
                        width={showLocationColumn ? '20%' : '25%'}
                      >
                        <Tooltip label={match.reasoningSummary} placement="top">
                          <Text
                            fontSize="xs"
                            color="text.secondary"
                          >
                            {match.reasoningSummary || 'No reasoning available'}
                          </Text>
                        </Tooltip>
                      </Td>

                      {/* Relevance Score */}
                      <Td verticalAlign="top" width="10%">
                        {match.reasoningScore != null ? (
                          <VStack align="start" spacing={1}>
                            <Badge
                              colorScheme={
                                match.reasoningScore >= 0.8
                                  ? 'red'
                                  : match.reasoningScore >= 0.5
                                    ? 'yellow'
                                    : 'green'
                              }
                            >
                              {(match.reasoningScore * 100).toFixed(0)}%
                            </Badge>
                            <HStack spacing={1}>
                              <Icon
                                as={
                                  match.reasoningScore >= 0.8
                                    ? FiAlertCircle
                                    : FiCheckCircle
                                }
                                color={
                                  match.reasoningScore >= 0.8
                                    ? 'red.500'
                                    : 'green.500'
                                }
                                boxSize={3}
                              />
                              <Text fontSize="xs" color="text.tertiary">
                                AI Score
                              </Text>
                            </HStack>
                          </VStack>
                        ) : (
                          <Badge colorScheme="gray">Pending</Badge>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </React.Fragment>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Footer with match count */}
        <Box mt={4} pt={4} borderTopWidth="1px" borderTopColor="border.primary">
          <Text fontSize="sm" color="text.secondary">
            Showing {data?.totalMatches || 0} AI-identified top citations across{' '}
            {groupedResults.length} claim elements
          </Text>
        </Box>
      </Box>
    );
  },
  // Custom comparison function - only re-render if props actually changed
  (prevProps, nextProps) =>
    prevProps.searchHistoryId === nextProps.searchHistoryId &&
    prevProps.selectedReference === nextProps.selectedReference
);

export default EnhancedCitationResultsTable;
