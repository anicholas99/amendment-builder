import React from 'react';
import { Box, Text, Select, Icon, VStack, HStack } from '@chakra-ui/react';
import { FiFileText, FiFilter, FiSearch } from 'react-icons/fi';

interface CitationEmptyStateProps {
  selectedSearchId: string;
  onSelectSearch: (id: string) => void;
  availableSearches: Array<{ id: string; display: string }>;
  noMatchesFound?: boolean;
}

/**
 * Empty state component for the Citation Extraction tab.
 * Displays different messages based on whether data was fetched but no matches were found for the filter.
 */
export const CitationEmptyState: React.FC<CitationEmptyStateProps> = ({
  selectedSearchId,
  onSelectSearch,
  availableSearches,
  noMatchesFound = false,
}) => {
  const hasAvailableSearches = availableSearches.length > 0;

  if (noMatchesFound) {
    return (
      <Box
        textAlign="center"
        py={10}
        px={6}
        minHeight="300px"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <VStack spacing={4} maxW="400px">
          <Icon as={FiFileText} boxSize={12} color="text.tertiary" />
          <VStack spacing={2}>
            <Text fontSize="lg" fontWeight="semibold" color="text.primary">
              No Citations Found
            </Text>
            <Text fontSize="md" color="text.secondary">
              No citation matches were found for the selected search and claim
              set version.
            </Text>
            <Text fontSize="sm" color="text.tertiary">
              Try selecting a different search or check if citation extraction
              has completed for this search.
            </Text>
          </VStack>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      textAlign="center"
      py={10}
      px={6}
      minHeight="300px"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <VStack spacing={4} maxW="400px">
        <Icon as={FiFilter} boxSize={12} color="text.tertiary" />
        <VStack spacing={2}>
          <Text fontSize="lg" fontWeight="semibold" color="text.primary">
            Select a Search
          </Text>
          <Text fontSize="md" color="text.secondary">
            Choose a search from the dropdown to view its citation analysis.
          </Text>
        </VStack>

        {availableSearches.length > 0 && (
          <VStack spacing={2} align="stretch" minW="250px">
            <HStack spacing={2} justify="center" align="center">
              <Icon as={FiSearch} size={3} color="text.secondary" />
              <Text fontSize="xs" color="text.tertiary">
                Recent searches available
              </Text>
            </HStack>
            <Select
              placeholder="Choose a search..."
              value={selectedSearchId}
              onChange={e => onSelectSearch(e.target.value)}
              size="sm"
            >
              {availableSearches.map((search, index) => (
                <option key={search.id} value={search.id}>
                  {search.display}
                  {index === 0 ? ' (Latest)' : ''}
                </option>
              ))}
            </Select>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default CitationEmptyState;
