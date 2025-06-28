import React from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';

interface PatentEditorFooterProps {
  wordCount: number;
  characterCount: number;
}

export const PatentEditorFooter: React.FC<PatentEditorFooterProps> = ({
  wordCount,
  characterCount,
}) => {
  return (
    <Box
      p={2}
      display="flex"
      justifyContent="flex-end"
      alignItems="center"
      bg="bg.primary"
      borderTopWidth="1px"
      borderTopColor="border.primary"
      fontSize="sm"
      color="gray.600"
      _dark={{ color: 'gray.400' }}
    >
      <HStack spacing={4}>
        <Text>
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </Text>
        <Text color="gray.400">•</Text>
        <Text>
          {characterCount} {characterCount === 1 ? 'character' : 'characters'}
        </Text>
      </HStack>
    </Box>
  );
};
