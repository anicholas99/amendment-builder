import React, { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  VStack,
  Box,
} from '@chakra-ui/react';

/**
 * TechInput - Domain-specific component for technology input
 * Uses framework-agnostic design system components to maintain consistency
 * and enable easy framework migrations in the future.
 */
export interface TechInputProps {
  /** Initial value for the technology description */
  initialValue?: string;
  /** Callback when technology is submitted */
  onSubmit?: (value: string) => void;
  /** Whether the input is in loading state */
  loading?: boolean;
}

export const TechInput: React.FC<TechInputProps> = ({
  initialValue = '',
  onSubmit,
  loading = false,
}) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string>();

  const handleSubmit = () => {
    if (!value.trim()) {
      setError('Technology description is required');
      return;
    }

    setError(undefined);
    onSubmit?.(value);
  };

  const canSubmit = value.trim() && !error;

  return (
    <Box p={4} borderWidth="1px" borderRadius="md" boxShadow="sm" bg="bg.card">
      <VStack spacing={4}>
        <Text fontSize="lg" fontWeight="bold">
          Technology Description
        </Text>
        <FormControl>
          <FormLabel>Describe your technology</FormLabel>
          <Input
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Enter technology description..."
          />
        </FormControl>
        <Button
          colorScheme="blue"
          isLoading={loading}
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
        >
          Analyze Technology
        </Button>
      </VStack>
    </Box>
  );
};

TechInput.displayName = 'TechInput';
