import React, { useState } from 'react';
import {
  Box,
  Text,
  Icon,
  Button,
  Badge,
  useColorModeValue,
  VStack,
  HStack,
  Checkbox,
  Tooltip,
  IconButton,
  Collapse,
  Flex,
} from '@chakra-ui/react';
import { FiChevronDown, FiChevronUp, FiExternalLink } from 'react-icons/fi';

type SavedPriorArt = {
  id: string;
  patentNumber: string;
  title?: string | null;
  abstract?: string | null;
  authors?: string | null;
  year?: string | null;
  notes?: string | null;
  claim1?: string | null;
  summary?: string | null;
};

interface PriorArtSelectorProps {
  priorArtItems: SavedPriorArt[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

/**
 * Simple prior art selector with clean UI matching application design patterns
 */
const PriorArtSelector: React.FC<PriorArtSelectorProps> = React.memo(
  ({ priorArtItems, selectedIds, onChange }) => {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    // Use consistent color patterns from the app
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const textColor = useColorModeValue('gray.700', 'gray.200');
    const mutedTextColor = useColorModeValue('gray.500', 'gray.400');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');
    const tableBg = useColorModeValue('white', 'gray.800');

    // Pre-calculate these outside the map to avoid hook-in-loop errors
    const detailsBg = useColorModeValue('gray.50', 'gray.700');

    const toggle = (id: string) => {
      if (selectedIds.includes(id)) {
        onChange(selectedIds.filter(p => p !== id));
      } else {
        onChange([...selectedIds, id]);
      }
    };

    const toggleExpanded = (id: string) => {
      const newExpanded = new Set(expandedItems);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      setExpandedItems(newExpanded);
    };

    const selectAll = () => {
      onChange(priorArtItems.map(item => item.id));
    };

    const selectNone = () => {
      onChange([]);
    };

    // Clean HTML from text
    const cleanText = (text: string | null | undefined): string => {
      if (!text) return '';
      return text
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
    };

    const truncateText = (text: string, maxLength: number): string => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

    // Format date from YYYYMMDD to readable format
    const formatDate = (dateStr: string | null | undefined): string => {
      if (!dateStr) return '';

      // Check if it's in YYYYMMDD format (8 digits)
      if (dateStr.length === 8 && /^\d{8}$/.test(dateStr)) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);

        // Create date object and format it
        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day)
        );

        // Return formatted date (e.g., "Oct 10, 2019")
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }

      // If it's just a year (4 digits), return as is
      if (dateStr.length === 4 && /^\d{4}$/.test(dateStr)) {
        return dateStr;
      }

      // Otherwise return the original string
      return dateStr;
    };

    if (priorArtItems.length === 0) {
      return (
        <Text fontSize="sm" color="gray.600" textAlign="center">
          No saved prior art references yet. You can still generate, but
          including prior art will improve quality.
        </Text>
      );
    }

    return (
      <Box mt={4} mb={4}>
        {/* Simple header with selection count */}
        <HStack justify="space-between" mb={3}>
          <Text fontSize="sm" color={mutedTextColor} fontWeight="medium">
            {selectedIds.length} of {priorArtItems.length} references selected
          </Text>
          <HStack spacing={2}>
            <Button
              size="xs"
              variant="ghost"
              onClick={selectAll}
              isDisabled={selectedIds.length === priorArtItems.length}
            >
              Select All
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={selectNone}
              isDisabled={selectedIds.length === 0}
            >
              Clear All
            </Button>
          </HStack>
        </HStack>

        {/* Prior Art Items - using ReferenceCard style */}
        <VStack
          align="stretch"
          spacing={2}
          maxH="400px"
          overflowY="auto"
          pr={2}
        >
          {priorArtItems.map(ref => {
            const isSelected = selectedIds.includes(ref.id);
            const isExpanded = expandedItems.has(ref.id);
            const hasDetails =
              ref.abstract || ref.summary || ref.claim1 || ref.notes;

            return (
              <Box
                key={ref.id}
                borderWidth="1px"
                borderRadius="md"
                p={3}
                bg={tableBg}
                borderColor={isSelected ? 'blue.300' : borderColor}
                _hover={{ bg: hoverBg }}
                transition="background-color 0.15s ease-out, border-color 0.15s ease-out"
              >
                <VStack align="stretch" spacing={2}>
                  {/* Main row with checkbox and info */}
                  <Flex justify="space-between" align="start">
                    <HStack spacing={3} flex={1} minWidth={0}>
                      <Checkbox
                        isChecked={isSelected}
                        onChange={() => toggle(ref.id)}
                        colorScheme="blue"
                      />

                      <VStack align="start" spacing={1} flex={1} minWidth={0}>
                        <HStack spacing={2} align="center">
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color={textColor}
                          >
                            {ref.patentNumber?.replace(/-/g, '') ||
                              'Unknown Patent'}
                          </Text>
                          {ref.year && (
                            <Badge
                              colorScheme="gray"
                              variant="subtle"
                              size="sm"
                            >
                              {formatDate(ref.year)}
                            </Badge>
                          )}
                        </HStack>

                        <Box title={ref.title || undefined}>
                          <Text
                            fontSize="2xs"
                            color={textColor}
                            noOfLines={2}
                            lineHeight="tight"
                          >
                            {ref.title || 'No title available'}
                          </Text>
                        </Box>

                        {ref.authors && (
                          <Box title={ref.authors}>
                            <Text
                              fontSize="2xs"
                              color={mutedTextColor}
                              noOfLines={1}
                            >
                              {truncateText(ref.authors, 40)}
                            </Text>
                          </Box>
                        )}
                      </VStack>
                    </HStack>

                    {/* Action buttons */}
                    <HStack spacing={1}>
                      {ref.patentNumber && (
                        <Tooltip label="View on Google Patents">
                          <IconButton
                            aria-label="View on Google Patents"
                            icon={
                              <Icon
                                as={FiExternalLink}
                                color="text.secondary"
                              />
                            }
                            size="xs"
                            variant="ghost"
                            onClick={() => {
                              window.open(
                                `https://patents.google.com/patent/${ref.patentNumber?.replace(/-/g, '')}/en`,
                                '_blank'
                              );
                            }}
                            _hover={{
                              color: 'text.primary',
                              bg: 'bg.hover',
                            }}
                          />
                        </Tooltip>
                      )}

                      {hasDetails && (
                        <Tooltip
                          label={isExpanded ? 'Hide details' : 'Show details'}
                        >
                          <IconButton
                            aria-label={
                              isExpanded ? 'Hide details' : 'Show details'
                            }
                            icon={
                              <Icon
                                as={isExpanded ? FiChevronUp : FiChevronDown}
                                color="text.secondary"
                              />
                            }
                            size="xs"
                            variant="ghost"
                            onClick={() => toggleExpanded(ref.id)}
                            _hover={{
                              color: 'text.primary',
                              bg: 'bg.hover',
                            }}
                          />
                        </Tooltip>
                      )}
                    </HStack>
                  </Flex>

                  {/* Expanded details section */}
                  {hasDetails && (
                    <Collapse in={isExpanded} animateOpacity>
                      <VStack
                        align="stretch"
                        spacing={2}
                        pt={2}
                        mt={2}
                        borderTop="1px solid"
                        borderTopColor={borderColor}
                      >
                        {ref.abstract && (
                          <Box>
                            <Text
                              fontSize="2xs"
                              fontWeight="semibold"
                              color={textColor}
                              mb={1}
                            >
                              Abstract
                            </Text>
                            <Box
                              fontSize="xs"
                              color={mutedTextColor}
                              lineHeight="1.4"
                              p={2}
                              bg={detailsBg}
                              borderRadius="sm"
                              borderLeft="3px solid"
                              borderLeftColor="blue.300"
                            >
                              {cleanText(ref.abstract)}
                            </Box>
                          </Box>
                        )}

                        {ref.summary && (
                          <Box>
                            <Text
                              fontSize="2xs"
                              fontWeight="semibold"
                              color={textColor}
                              mb={1}
                            >
                              Summary
                            </Text>
                            <Box
                              fontSize="xs"
                              color={mutedTextColor}
                              lineHeight="1.4"
                              p={2}
                              bg={detailsBg}
                              borderRadius="sm"
                              borderLeft="3px solid"
                              borderLeftColor="green.300"
                            >
                              {cleanText(ref.summary)}
                            </Box>
                          </Box>
                        )}

                        {ref.claim1 && (
                          <Box>
                            <Text
                              fontSize="2xs"
                              fontWeight="semibold"
                              color={textColor}
                              mb={1}
                            >
                              Main Claim
                            </Text>
                            <Box
                              fontSize="xs"
                              color={mutedTextColor}
                              lineHeight="1.4"
                              p={2}
                              bg={detailsBg}
                              borderRadius="sm"
                              borderLeft="3px solid"
                              borderLeftColor="purple.300"
                            >
                              {cleanText(ref.claim1)}
                            </Box>
                          </Box>
                        )}

                        {ref.notes && (
                          <Box>
                            <Text
                              fontSize="2xs"
                              fontWeight="semibold"
                              color={textColor}
                              mb={1}
                            >
                              Notes
                            </Text>
                            <Box
                              fontSize="xs"
                              color={mutedTextColor}
                              lineHeight="1.4"
                              p={2}
                              bg={detailsBg}
                              borderRadius="sm"
                              borderLeft="3px solid"
                              borderLeftColor="orange.300"
                            >
                              {cleanText(ref.notes)}
                            </Box>
                          </Box>
                        )}
                      </VStack>
                    </Collapse>
                  )}
                </VStack>
              </Box>
            );
          })}
        </VStack>
      </Box>
    );
  }
);

PriorArtSelector.displayName = 'PriorArtSelector';

export default PriorArtSelector;
