/* eslint-disable no-restricted-imports */
import React from 'react';
import {
  Text,
  HStack,
  Badge,
  Icon,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FiChevronDown, FiChevronUp, FiTrash2 } from 'react-icons/fi';
import { formatDate } from '../utils/searchHistoryUtils';

interface SearchHistoryRowHeaderProps {
  isExpanded: boolean;
  searchNumber: number;
  displayDate: string;
  resultsCount: number;
  hasEntryJobId: boolean;
  colors: {
    bg: string;
    hoverBg: string;
    textColor: string;
    mutedTextColor: string;
  };
  onToggleExpand: () => void;
  onDelete: (e: React.MouseEvent) => void;
  isExtractingCitations: boolean;
}

export const SearchHistoryRowHeader: React.FC<SearchHistoryRowHeaderProps> = ({
  isExpanded,
  searchNumber,
  displayDate,
  resultsCount,
  hasEntryJobId,
  colors,
  onToggleExpand,
  onDelete,
  isExtractingCitations,
}) => {
  return (
    <HStack
      spacing={3}
      justify="space-between"
      alignItems="center"
      onClick={onToggleExpand}
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
          color="text.secondary"
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
          <Text
            fontSize="xs"
            color={colors.mutedTextColor}
            whiteSpace="nowrap"
            flexShrink={0}
            title={`${resultsCount} results found`}
          >
            ({resultsCount} results)
          </Text>
        </HStack>
        {hasEntryJobId && (
          <Badge
            colorScheme="green"
            fontSize="xs"
            variant="subtle"
            ml={3}
            px={1.5}
            py={0.5}
            borderRadius="md"
            flexShrink={0}
          >
            Citations
          </Badge>
        )}
      </HStack>
      <HStack spacing={1} pl={2} flexShrink={0}>
        <Tooltip label="Delete Search">
          <IconButton
            aria-label="Delete Search"
            icon={<Icon as={FiTrash2} color="text.secondary" />}
            size="sm"
            variant="ghost"
            onClick={onDelete}
            isDisabled={isExtractingCitations}
            _hover={{
              color: 'red.500',
              bg: 'red.50',
            }}
          />
        </Tooltip>
      </HStack>
    </HStack>
  );
};
