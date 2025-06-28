import React from 'react';
import { Box, Heading, Text, Flex } from '@chakra-ui/react';
import { SearchSelectionDropdown } from '../SearchSelectionDropdown';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';

interface CombinedAnalysisHeaderProps {
  searchHistory: ProcessedSearchHistoryEntry[];
  searchHistoryId: string | null;
  onSearchChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const CombinedAnalysisHeader: React.FC<CombinedAnalysisHeaderProps> = ({
  searchHistory,
  searchHistoryId,
  onSearchChange,
}) => {
  return (
    <Flex justify="space-between" align="center" mb={2}>
      <Box>
        <Heading size="lg" mb={1} color="text.primary">
          Combined Examiner Analysis
        </Heading>
        <Text fontSize="sm" color="text.secondary">
          View past analyses or create a new combined examiner-style analysis
          for Claim 1.
        </Text>
      </Box>

      {searchHistory.length > 0 && searchHistoryId && (
        <Box minW="200px">
          <Text fontSize="xs" color="text.secondary" mb={1}>
            Search:
          </Text>
          <SearchSelectionDropdown
            selectedSearchId={searchHistoryId}
            searchHistory={searchHistory}
            onChange={onSearchChange}
            inline={true}
          />
        </Box>
      )}
    </Flex>
  );
};
