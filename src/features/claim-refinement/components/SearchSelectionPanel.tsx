import React from 'react';
import { Box, Flex, FormLabel, Switch, Select, Text } from '@chakra-ui/react';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';

interface SearchSelectionPanelProps {
  showSavedPriorArt: boolean;
  onToggleMode: () => void;
  selectedSearchId: string | null;
  onSelectedSearchIdChange: (id: string | null) => void;
  searchHistory: ProcessedSearchHistoryEntry[];
}

/**
 * Component for selecting between saved prior art and search references,
 * and choosing which search to display
 */
export const SearchSelectionPanel: React.FC<SearchSelectionPanelProps> = ({
  showSavedPriorArt,
  onToggleMode,
  selectedSearchId,
  onSelectedSearchIdChange,
  searchHistory,
}) => {
  return (
    <Flex align="center" justify="space-between" mb={4} wrap="wrap" gap={2}>
      <Flex align="center" gap={4}>
        <FormLabel htmlFor="saved-toggle" mb="0" fontSize="sm" cursor="pointer">
          {showSavedPriorArt ? 'Saved Prior Art' : 'Search References'}
        </FormLabel>
        <Switch
          id="saved-toggle"
          size="sm"
          colorScheme="blue"
          isChecked={showSavedPriorArt}
          onChange={onToggleMode}
        />

        {!showSavedPriorArt && (
          <Select
            value={selectedSearchId || ''}
            onChange={e => onSelectedSearchIdChange(e.target.value || null)}
            size="sm"
            width="auto"
            minWidth="180px"
            placeholder="Select a search"
            disabled={searchHistory.length === 0}
          >
            {Array.isArray(searchHistory) &&
              searchHistory.map((entry, index) => {
                const isLatest = index === 0;
                return (
                  <option key={entry.id} value={entry.id}>
                    Search #{searchHistory.length - index}
                    {isLatest ? ' (Latest)' : ''}
                  </option>
                );
              })}
          </Select>
        )}
      </Flex>
    </Flex>
  );
};
