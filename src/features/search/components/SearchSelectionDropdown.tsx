import React from 'react';
import { Box, Select, Text } from '@chakra-ui/react';
import { useColorModeValue } from '@/hooks/useColorModeValue';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';

interface SearchSelectionDropdownProps {
  selectedSearchId: string; // Value comes from the hook state
  searchHistory: ProcessedSearchHistoryEntry[]; // Properly typed search history
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; // Hook's setSelectedSearchId passed down
  inline?: boolean; // Optional prop to render inline without absolute positioning
}

export const SearchSelectionDropdown: React.FC<
  SearchSelectionDropdownProps
> = ({ selectedSearchId, searchHistory, onChange, inline = false }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // The value prop of Select must exactly match one of the option values
  const currentValue = selectedSearchId;

  return (
    <Box
      position={inline ? 'relative' : 'absolute'}
      top={inline ? '0' : '4'}
      right={inline ? '0' : '4'}
      maxWidth="220px"
      zIndex={2}
    >
      <Select
        size="xs"
        value={currentValue} // Use the state variable directly
        onChange={onChange} // Call the state setter on change
        bg={bgColor}
        borderColor={borderColor}
        fontSize="sm"
        maxWidth="200px"
      >
        {searchHistory.map((entry, index) => {
          // Ensure option value matches what setSelectedSearchId expects (DB ID or index string)
          const optionValue = entry.id || index.toString();
          return (
            <option key={optionValue} value={optionValue}>
              Search #{searchHistory.length - index}
            </option>
          );
        })}
      </Select>
    </Box>
  );
};
