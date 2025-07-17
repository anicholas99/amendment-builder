import React from 'react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VStack, HStack } from '@/components/ui/stack';
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
      <Box className="text-center py-10 px-6 min-h-[300px] flex flex-col justify-center items-center">
        <VStack spacing={4} className="max-w-[400px]">
          <FiFileText className="h-12 w-12 text-muted-foreground" />
          <VStack spacing={2}>
            <Text size="lg" weight="semibold">
              No Citations Found
            </Text>
            <Text size="md" className="text-muted-foreground">
              No citation matches were found for the selected search and claim
              set version.
            </Text>
            <Text size="sm" className="text-muted-foreground">
              Try selecting a different search or check if citation extraction
              has completed for this search.
            </Text>
          </VStack>
        </VStack>
      </Box>
    );
  }

  return (
    <Box className="text-center py-10 px-6 min-h-[300px] flex flex-col justify-center items-center">
      <VStack spacing={4} className="max-w-[400px]">
        <FiFilter className="h-12 w-12 text-muted-foreground" />
        <VStack spacing={2}>
          <Text size="lg" weight="semibold">
            Select a Search
          </Text>
          <Text size="md" className="text-muted-foreground">
            Choose a search from the dropdown to view its citation analysis.
          </Text>
        </VStack>

        {availableSearches.length > 0 && (
          <VStack spacing={2} align="stretch" className="min-w-[250px]">
            <HStack spacing={2} justify="center" align="center">
              <FiSearch className="h-3 w-3 text-muted-foreground" />
              <Text size="xs" className="text-muted-foreground">
                Recent searches available
              </Text>
            </HStack>
            <Select value={selectedSearchId} onValueChange={onSelectSearch}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Choose a search..." />
              </SelectTrigger>
              <SelectContent>
                {availableSearches.map((search, index) => (
                  <SelectItem key={search.id} value={search.id}>
                    {search.display}
                    {index === 0 ? ' (Latest)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default CitationEmptyState;
