import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Spacer,
  Stack,
  Checkbox,
} from '@chakra-ui/react';
import { PriorArtReference } from '../../../types/claimTypes';
import { ProcessedSearchHistoryEntry } from '@/types/domain/searchHistory';
import ReferenceCard from '../../search/components/ReferenceCard';
import { useSearchHistoryColors } from '../../search/hooks/useSearchHistoryColors';

interface ReferenceListPanelProps {
  showSavedPriorArt: boolean;
  selectedSearchId: string | null;
  searchHistory: ProcessedSearchHistoryEntry[];
  displayedReferences: PriorArtReference[];
  savedPriorArtReferences: PriorArtReference[];
  selectedReferenceNumbers: string[];
  onToggleReference: (referenceNumber: string) => void;
  onSelectAllReferences: () => void;
  onDeselectAllReferences: () => void;
  onSaveReference: (ref: PriorArtReference) => void;
  onExcludeReference: (ref: PriorArtReference) => void;
  getCitationIcon: (refNum: string) => React.ReactNode | null;
}

/**
 * Component for displaying and managing reference selection
 */
export const ReferenceListPanel: React.FC<ReferenceListPanelProps> = ({
  showSavedPriorArt,
  selectedSearchId,
  searchHistory,
  displayedReferences,
  savedPriorArtReferences,
  selectedReferenceNumbers,
  onToggleReference,
  onSelectAllReferences,
  onDeselectAllReferences,
  onSaveReference,
  onExcludeReference,
  getCitationIcon,
}) => {
  const colors = useSearchHistoryColors();

  // Find the selected search entry for display
  const selectedSearch = selectedSearchId
    ? searchHistory.find(entry => entry.id === selectedSearchId)
    : null;

  const selectedSearchIndex = selectedSearch
    ? searchHistory.findIndex(entry => entry.id === selectedSearchId)
    : -1;

  const isLatestSearch = selectedSearchIndex === 0;

  // Determine which references to display based on the toggle
  const referencesToDisplay = showSavedPriorArt
    ? savedPriorArtReferences
    : displayedReferences;

  return (
    <Box>
      <Flex align="center" mb={2} justify="space-between">
        <Heading size="sm">
          {showSavedPriorArt ? 'Saved References' : 'Search Results'}
          {!showSavedPriorArt && selectedSearch && (
            <Text
              as="span"
              fontSize="sm"
              fontWeight="normal"
              ml={2}
              color="gray.500"
            >
              {`(Search #${searchHistory.length - selectedSearchIndex}${isLatestSearch ? ' - Latest' : ''})`}
            </Text>
          )}
        </Heading>
        <Spacer />
        {referencesToDisplay.length > 0 && !showSavedPriorArt && (
          <Flex gap={4}>
            <Flex gap={2}>
              <Button
                size="xs"
                onClick={onSelectAllReferences}
                isDisabled={showSavedPriorArt}
              >
                Select All
              </Button>
              <Button
                size="xs"
                onClick={onDeselectAllReferences}
                isDisabled={showSavedPriorArt}
              >
                Deselect All
              </Button>
            </Flex>
          </Flex>
        )}
      </Flex>

      {referencesToDisplay.length > 0 ? (
        <Box
          height="300px"
          overflowY="scroll"
          borderWidth="1px"
          borderRadius="md"
          borderColor="gray.200"
          boxShadow="sm"
          p={2}
          className="custom-scrollbar"
        >
          <Stack spacing={2} align="stretch" pb={1}>
            {referencesToDisplay.map((ref, index) => {
              return (
                <Flex
                  key={`${showSavedPriorArt ? 'saved' : selectedSearchId}-available-${ref.number}-${index}`}
                  align="center"
                >
                  {!showSavedPriorArt && (
                    <Checkbox
                      isChecked={selectedReferenceNumbers.includes(ref.number)}
                      onChange={() => onToggleReference(ref.number)}
                      mr={2}
                      colorScheme="blue"
                    />
                  )}
                  <Box flex="1">
                    <ReferenceCard
                      reference={ref}
                      colors={colors}
                      isSaved={showSavedPriorArt}
                      isExcluded={false}
                      getCitationIcon={getCitationIcon}
                      onSave={onSaveReference}
                      onExclude={onExcludeReference}
                      resultIndex={index}
                    />
                  </Box>
                </Flex>
              );
            })}
          </Stack>
        </Box>
      ) : showSavedPriorArt ? (
        <Text>No saved references to display.</Text>
      ) : selectedSearchId ? (
        <Text>No references found in this search entry or all are hidden.</Text>
      ) : (
        <Text>Please select a search to view references.</Text>
      )}
    </Box>
  );
};
