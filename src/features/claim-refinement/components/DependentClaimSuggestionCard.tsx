import React from 'react';
import { Box, Text, Button } from '@chakra-ui/react';
import {
  IconButton,
  useColorModeValue,
  Tooltip,
  HStack,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiX } from 'react-icons/fi';

interface DependentClaimSuggestionCardProps {
  suggestionText: string; // The full suggested claim text (e.g., "2. ...")
  onInsert: (claimText: string) => void;
  onEdit: (claimText: string) => void; // Trigger modal open
  onDismiss: () => void;
}

/**
 * Card component for displaying a dependent claim suggestion
 * with options to insert directly, edit, or dismiss
 */
const DependentClaimSuggestionCard: React.FC<
  DependentClaimSuggestionCardProps
> = ({ suggestionText, onInsert, onEdit, onDismiss }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Parse out the claim number if present (for display purposes)
  const match = suggestionText.match(/^(\d+)\.\s*(.*)/);
  const displayNumber = match ? match[1] : '';
  const displayText = match ? match[2] : suggestionText;

  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      borderColor={borderColor}
      p={3}
      bg={bgColor}
      boxShadow="sm"
      position="relative"
    >
      <Text fontSize="sm" mb={2}>
        {displayNumber && (
          <Text as="span" fontWeight="bold" mr={1}>
            {displayNumber}.
          </Text>
        )}
        {displayText}
      </Text>

      <HStack spacing={2} justifyContent="flex-end" mt={2}>
        <Tooltip label="Dismiss suggestion">
          <IconButton
            icon={<FiX />}
            aria-label="Dismiss suggestion"
            size="sm"
            variant="ghost"
            colorScheme="gray"
            onClick={onDismiss}
          />
        </Tooltip>

        <Tooltip label="Edit before inserting">
          <IconButton
            icon={<FiEdit />}
            aria-label="Edit suggestion"
            size="sm"
            variant="ghost"
            colorScheme="blue"
            onClick={() => onEdit(suggestionText)}
          />
        </Tooltip>

        <Tooltip label="Insert directly">
          <Button
            leftIcon={<FiPlus />}
            size="sm"
            colorScheme="blue"
            onClick={() => onInsert(suggestionText)}
          >
            Insert
          </Button>
        </Tooltip>
      </HStack>
    </Box>
  );
};

export default DependentClaimSuggestionCard;
