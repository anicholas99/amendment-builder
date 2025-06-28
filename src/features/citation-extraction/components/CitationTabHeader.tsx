import React from 'react';
import {
  Box,
  Flex,
  Text,
  HStack,
  Badge,
  Button,
  Select,
  IconButton,
  Spinner,
  VStack,
  Icon,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiX, FiBookmark, FiCpu } from 'react-icons/fi';
import { BsBookmarkFill } from 'react-icons/bs';
import { ActionButtons } from '@/features/search/components/citation-header/ActionButtons';

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
  } | null;
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

    const unsavedBookmarkColor = useColorModeValue(
      'gray.600',
      'text.secondary'
    );

    return (
      <Box p={3} borderBottomWidth="1px" borderColor="border.light">
        <Flex justify="space-between" align="center" mb={3}>
          <HStack spacing={4}>
            <Text fontSize="lg" fontWeight="semibold" color="text.primary">
              Citation Analysis
            </Text>
            {searchHistory.length > 0 && (
              <Select
                size="sm"
                variant="outline"
                value={currentSearchId || ''}
                onChange={e => onSearchChange(e.target.value)}
                width="150px"
              >
                {!currentSearchId && <option value="">Select a search</option>}
                {searchHistory.map((s, i) => (
                  <option key={s.id} value={s.id}>
                    Search #{searchHistory.length - i}
                  </option>
                ))}
              </Select>
            )}
          </HStack>
          <HStack>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={onCombinedAnalysis}
              isDisabled={!selectedReference || referenceStatuses.length === 0}
            >
              Combined Examiner Analysis
            </Button>

            <ActionButtons
              selectedReference={selectedReference}
              isReferenceSaved={isReferenceSaved}
              isReferenceExcluded={isReferenceExcluded}
              isLoading={isLoading}
              onSaveReference={onSaveReference}
              onExcludeReference={onExcludeReference}
              onRerunExtraction={onRerunCitationExtraction}
              isRerunningExtraction={isRerunningExtraction}
              citationHistory={citationHistory}
              onViewHistoricalRun={onViewHistoricalRun}
            />
          </HStack>
        </Flex>

        {currentSearchId && (
          <Box>
            <Text fontSize="xs" color="text.tertiary" mb={2}>
              REFERENCES
            </Text>
            {isLoading && referenceStatuses.length === 0 ? (
              <Spinner size="sm" />
            ) : (
              <HStack spacing={2} overflowX="auto" pt={1} pb={2}>
                {referenceStatuses.map(ref => {
                  const isSelected = selectedReference === ref.referenceNumber;
                  const shouldShowSpinner =
                    ref.showAsOptimistic || ref.isOptimistic;

                  return (
                    <Badge
                      key={ref.referenceNumber}
                      px={3}
                      py={1}
                      borderRadius="full"
                      cursor="pointer"
                      bg={isSelected ? 'blue.500' : 'bg.card'}
                      color={isSelected ? 'white' : 'text.primary'}
                      borderWidth="1px"
                      borderColor={isSelected ? 'blue.500' : 'border.primary'}
                      onClick={() => onSelectReference(ref.referenceNumber)}
                      position="relative"
                      opacity={shouldShowSpinner ? 0.7 : 1}
                      transition="background-color 0.15s ease-out, border-color 0.15s ease-out, transform 0.15s ease-out, box-shadow 0.15s ease-out, opacity 0.15s ease-out"
                      _hover={{
                        bg: isSelected ? 'blue.600' : 'bg.hover',
                        borderColor: isSelected ? 'blue.600' : 'border.primary',
                        transform: 'translateY(-1px)',
                        boxShadow: 'sm',
                      }}
                      _active={{
                        transform: 'translateY(0px)',
                        boxShadow: 'xs',
                      }}
                    >
                      {formatReferenceNumber(ref.referenceNumber)}
                      {shouldShowSpinner && (
                        <Box as="span" ml={1} display="inline-block">
                          <Spinner
                            size="xs"
                            color={isSelected ? 'white' : 'blue.500'}
                            thickness="2px"
                          />
                        </Box>
                      )}
                    </Badge>
                  );
                })}
              </HStack>
            )}
            {selectedReference && (
              <Box mt={2} pl={1}>
                {isLoading && !referenceMetadata ? (
                  <Spinner size="xs" />
                ) : referenceMetadata ? (
                  <VStack align="start" spacing={0}>
                    <Flex align="center" justify="space-between" width="100%">
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        noOfLines={1}
                        color="text.primary"
                        flex="1"
                      >
                        {referenceMetadata.title || 'No Title Available'}
                      </Text>
                      {selectedReference && (
                        <HStack
                          spacing={1}
                          ml={2}
                          flexShrink={0}
                          align="center"
                        >
                          {/* AI Analysis Button */}
                          {isDeepAnalysisAvailable && (
                            <Box
                              position="relative"
                              display="flex"
                              alignItems="center"
                            >
                              <Tooltip
                                label={
                                  showDeepAnalysis
                                    ? 'Hide AI Analysis'
                                    : 'Show AI Analysis'
                                }
                                placement="bottom"
                                hasArrow
                              >
                                <IconButton
                                  size="xs"
                                  variant={
                                    showDeepAnalysis ? 'solid' : 'outline'
                                  }
                                  aria-label={
                                    showDeepAnalysis
                                      ? 'Hide AI Analysis'
                                      : 'Show AI Analysis'
                                  }
                                  icon={<Icon as={FiCpu} />}
                                  colorScheme="purple"
                                  color={
                                    showDeepAnalysis ? 'white' : 'purple.500'
                                  }
                                  onClick={() =>
                                    onToggleDeepAnalysis &&
                                    onToggleDeepAnalysis(!showDeepAnalysis)
                                  }
                                  isLoading={isRunningDeepAnalysis}
                                  isDisabled={!selectedReference || isLoading}
                                  _hover={{
                                    color: showDeepAnalysis
                                      ? 'white'
                                      : 'purple.600',
                                    bg: showDeepAnalysis
                                      ? 'purple.600'
                                      : 'purple.50',
                                  }}
                                />
                              </Tooltip>

                              {/* Notification dot for new analysis */}
                              {!showDeepAnalysis &&
                                !isRunningDeepAnalysis &&
                                hasDeepAnalysisData && (
                                  <Box
                                    position="absolute"
                                    top="-2px"
                                    right="-2px"
                                    width="8px"
                                    height="8px"
                                    borderRadius="full"
                                    bg={
                                      hasHighRelevanceAnalysis
                                        ? 'red.500'
                                        : 'purple.400'
                                    }
                                    borderWidth="1px"
                                    borderColor="white"
                                  />
                                )}
                            </Box>
                          )}
                          {/* Save/Unsave Icon Button */}
                          <Tooltip
                            label={
                              isReferenceSaved
                                ? 'Reference saved to prior art'
                                : 'Save reference to prior art'
                            }
                            placement="bottom"
                            hasArrow
                          >
                            <IconButton
                              icon={
                                <Icon
                                  as={
                                    isReferenceSaved
                                      ? BsBookmarkFill
                                      : FiBookmark
                                  }
                                />
                              }
                              aria-label={
                                isReferenceSaved
                                  ? 'Unsave reference'
                                  : 'Save reference'
                              }
                              size="xs"
                              colorScheme={isReferenceSaved ? 'blue' : 'gray'}
                              variant={isReferenceSaved ? 'ghost' : 'outline'}
                              color={
                                isReferenceSaved
                                  ? 'blue.500'
                                  : unsavedBookmarkColor
                              }
                              onClick={onSaveReference}
                              isDisabled={!selectedReference || isLoading}
                              _hover={{
                                color: isReferenceSaved
                                  ? 'blue.600'
                                  : 'text.primary',
                                bg: isReferenceSaved ? 'blue.50' : 'bg.hover',
                              }}
                            />
                          </Tooltip>

                          {/* Exclude Icon Button */}
                          <Tooltip
                            label="Exclude this reference from future searches"
                            placement="bottom"
                            hasArrow
                          >
                            <IconButton
                              size="xs"
                              variant="ghost"
                              aria-label="Exclude this reference"
                              icon={<Icon as={FiX} />}
                              colorScheme="red"
                              color="red.500"
                              onClick={onExcludeReference}
                              isDisabled={
                                !onExcludeReference || isReferenceExcluded
                              }
                              _hover={{
                                color: 'red.600',
                                bg: 'red.50',
                              }}
                            />
                          </Tooltip>
                        </HStack>
                      )}
                    </Flex>
                    <HStack spacing={2} fontSize="xs" color="text.tertiary">
                      <Text>
                        {referenceMetadata.applicant || 'Unknown Applicant'}
                      </Text>
                      {referenceMetadata.publicationDate && <Text>|</Text>}
                      {referenceMetadata.publicationDate && (
                        <Text>
                          {(() => {
                            const dateStr = String(
                              referenceMetadata.publicationDate
                            );
                            if (dateStr.length === 8) {
                              return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
                            }
                            return 'Invalid Date Format';
                          })()}
                        </Text>
                      )}
                    </HStack>
                  </VStack>
                ) : (
                  <Text fontSize="sm" color="text.tertiary">
                    Metadata not available.
                  </Text>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  }
);

CitationTabHeader.displayName = 'CitationTabHeader';
