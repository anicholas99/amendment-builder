import React, { useCallback } from 'react';
import {
  Box,
  HStack,
  Text,
  Badge,
  Tooltip,
  Spinner,
  IconButton,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { SearchHistoryRowHeaderProps } from '../../types/searchHistoryRow';
import { formatDisplayDate } from '../../utils/searchHistoryRowUtils';
import { formatDate } from '../../utils/searchHistoryUtils';

/**
 * SearchHistoryRowHeader - Focused component for rendering the collapsible header
 * of a search history row including expand/collapse, search info, and actions
 */
export const SearchHistoryRowHeader: React.FC<SearchHistoryRowHeaderProps> =
  React.memo(
    ({
      entry,
      isExpanded,
      searchNumber,
      colors,
      toggleExpand,
      setDeleteConfirmId,
      isExtractingCitations = false,
      hasEntryJobId,
      results,
    }) => {
      // Memoize the toggle handler
      const handleToggleExpand = useCallback(() => {
        toggleExpand(entry.id);
      }, [entry.id, toggleExpand]);

      // Get display date
      const timestampString =
        entry.timestamp instanceof Date
          ? entry.timestamp.toISOString()
          : entry.timestamp;
      const displayDate = formatDisplayDate(timestampString, entry.date);

      // Check if search is still processing
      // Primary check: explicit processing status
      const isSearchProcessing =
        entry.citationExtractionStatus === 'processing' ||
        // Secondary check: no results yet and not completed/failed
        ((!results || results.length === 0) &&
          entry.citationExtractionStatus !== 'failed' &&
          entry.citationExtractionStatus !== 'completed');

      return (
        <HStack
          spacing={3}
          justify="space-between"
          alignItems="center"
          onClick={handleToggleExpand}
          cursor="pointer"
          w="100%"
          p={3}
          bg={colors.bg}
          _hover={{ bg: colors.hoverBg }}
          sx={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
          }}
        >
          <HStack
            spacing={3}
            alignItems="center"
            flexGrow={1}
            overflow="hidden"
            minWidth={0}
          >
            <Icon
              as={isExpanded ? FiChevronUp : FiChevronDown}
              color={useColorModeValue('gray.700', 'white')}
              boxSize={4}
            />
            <Badge
              colorScheme="blue"
              fontSize="xs"
              px={2}
              py={0.5}
              borderRadius="md"
              flexShrink={0}
            >
              SEARCH #{searchNumber}
            </Badge>
            <HStack spacing={2} alignItems="baseline">
              <Text
                fontSize="sm"
                color={colors.textColor}
                whiteSpace="nowrap"
                flexShrink={0}
              >
                {formatDate(displayDate)}
              </Text>
              {isSearchProcessing ? (
                <HStack spacing={1} flexShrink={0}>
                  <Spinner size="xs" color="blue.500" />
                  <Text fontSize="xs" color="blue.600" whiteSpace="nowrap">
                    Searching...
                  </Text>
                </HStack>
              ) : entry.citationExtractionStatus === 'failed' ? (
                <Text
                  fontSize="xs"
                  color="red.500"
                  whiteSpace="nowrap"
                  flexShrink={0}
                >
                  (Search failed)
                </Text>
              ) : (
                <Text
                  fontSize="xs"
                  color={colors.mutedTextColor}
                  whiteSpace="nowrap"
                  flexShrink={0}
                  title={`${results?.length || 0} results found`}
                >
                  ({results && Array.isArray(results) ? results.length : 0}{' '}
                  results)
                </Text>
              )}
            </HStack>
          </HStack>
        </HStack>
      );
    }
  );

SearchHistoryRowHeader.displayName = 'SearchHistoryRowHeader';
