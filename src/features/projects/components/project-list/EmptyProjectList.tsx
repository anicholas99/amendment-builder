import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useThemeContext } from '../../../../contexts/ThemeContext';

export const EmptyProjectList: React.FC = () => {
  const { isDarkMode } = useThemeContext();

  return (
    <Box
      p="4"
      className="text-center"
      color={isDarkMode ? 'white' : 'gray.500'}
    >
      <Text>No projects found.</Text>
      <Text fontSize="sm" className="mt-2">
        Create a new project using the + button above.
      </Text>
    </Box>
  );
};
