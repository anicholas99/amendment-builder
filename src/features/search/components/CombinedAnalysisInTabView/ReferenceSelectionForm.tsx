import React from 'react';
import {
  Box,
  Heading,
  VStack,
  Checkbox,
  Text,
  Flex,
  Button,
} from '@chakra-ui/react';

interface ReferenceOption {
  referenceNumber: string;
  title?: string;
}

interface ReferenceSelectionFormProps {
  selectableReferences: ReferenceOption[];
  selectedReferences: string[];
  onToggle: (refNum: string) => void;
  onRun: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const ReferenceSelectionForm: React.FC<ReferenceSelectionFormProps> = ({
  selectableReferences,
  selectedReferences,
  onToggle,
  onRun,
  onCancel,
  isLoading,
}) => {
  return (
    <Box>
      <Heading size="sm" mb={3} color="text.primary">
        Select References for Combined Analysis:
      </Heading>
      <VStack
        align="start"
        spacing={3}
        mb={6}
        p={4}
        borderWidth="1px"
        borderRadius="md"
        borderColor="border.primary"
      >
        {selectableReferences.length === 0 && (
          <Text color="text.tertiary">
            No references with deep analysis found for the current search.
          </Text>
        )}
        {selectableReferences.map(ref => (
          <Checkbox
            key={ref.referenceNumber}
            isChecked={selectedReferences.includes(ref.referenceNumber)}
            onChange={() => onToggle(ref.referenceNumber)}
            size="md"
          >
            <Text fontSize="sm" color="text.primary">
              {ref.referenceNumber} {ref.title && `- ${ref.title}`}
            </Text>
          </Checkbox>
        ))}
      </VStack>
      <Flex justifyContent="flex-end" gap={3} mt={4}>
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button
          colorScheme="blue"
          onClick={onRun}
          isDisabled={selectedReferences.length < 2 || isLoading}
          isLoading={isLoading}
          loadingText="Analyzing..."
        >
          Run Combined Analysis
        </Button>
      </Flex>
    </Box>
  );
};
