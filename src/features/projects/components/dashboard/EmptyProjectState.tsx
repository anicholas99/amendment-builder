import React from 'react';
import { Box, Text, Center, Icon, Button, VStack } from '@chakra-ui/react';
import { FiFileText, FiPlus } from 'react-icons/fi';
import { useThemeContext } from '../../../../contexts/ThemeContext';

/**
 * Custom hook to get colors based on theme mode
 */
const useColorModeValue = (lightValue: string, darkValue: string): string => {
  const { isDarkMode } = useThemeContext();
  return isDarkMode ? darkValue : lightValue;
};

interface EmptyProjectStateProps {
  onOpenNewProjectModal: () => void;
}

export const EmptyProjectState: React.FC<EmptyProjectStateProps> = ({
  onOpenNewProjectModal,
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <Center className="p-20">
      <Box className="text-center max-w-full w-full" maxW="400px">
        <VStack spacing={6}>
          {/* Icon Circle */}
          <Center
            w="80px"
            h="80px"
            bg={isDarkMode ? 'gray.600' : 'gray.50'}
            borderRadius="50%"
            mx="auto"
          >
            <Icon
              as={FiFileText}
              fontSize="32px"
              color={isDarkMode ? 'gray.400' : 'gray.500'}
            />
          </Center>

          {/* Text Content */}
          <Box>
            <Text
              fontSize="xl"
              fontWeight="600"
              color={isDarkMode ? 'white' : 'gray.700'}
              mb={2}
            >
              No Projects Found
            </Text>
            <Text
              fontSize="md"
              color={isDarkMode ? 'gray.400' : 'gray.500'}
              lineHeight="1.5"
            >
              Create your first project to start drafting a patent application.
            </Text>
          </Box>

          {/* Create Button */}
          <Button
            leftIcon={<Icon as={FiPlus} />}
            colorScheme="blue"
            size="md"
            onClick={onOpenNewProjectModal}
            mt={4}
          >
            Create Your First Project
          </Button>
        </VStack>
      </Box>
    </Center>
  );
};
