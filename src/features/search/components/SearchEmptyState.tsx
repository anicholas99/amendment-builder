import React from 'react';
import { VStack, Icon, Text } from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';

export const SearchEmptyState: React.FC = () => {
  return (
    <VStack h="100%" justify="center" align="center" p={8}>
      <Icon as={FiSearch} boxSize="64px" color="text.tertiary" mb={4} />
      <Text fontSize="lg" fontWeight="semibold" color="text.primary">
        No search history yet
      </Text>
      <Text
        fontSize="sm"
        color="text.secondary"
        textAlign="center"
        maxW="300px"
      >
        Run a search to find patents related to your invention claims
      </Text>
    </VStack>
  );
};
