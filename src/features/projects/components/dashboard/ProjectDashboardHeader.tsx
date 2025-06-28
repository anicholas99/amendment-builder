import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  Text,
  Stack,
  Icon,
} from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';

interface ProjectDashboardHeaderProps {
  projectCount: number;
  onOpenNewProjectModal: () => void;
  tenantName?: string;
}

export const ProjectDashboardHeader: React.FC<ProjectDashboardHeaderProps> = ({
  projectCount,
  onOpenNewProjectModal,
  tenantName,
}) => {
  const { isDarkMode } = useTheme();

  // Dark mode aware colors
  const statNumberColor = isDarkMode ? '#F7FAFC' : '#2D3748';
  const headingColor = isDarkMode ? '#FFFFFF' : '#2D3748';
  const statLabelColor = isDarkMode ? '#A0AEC0' : '#718096';
  const descriptionColor = isDarkMode ? '#CBD5E0' : '#718096';

  return (
    <Box width="100%" className="max-w-full mb-6">
      <Flex
        direction="row"
        justify="space-between"
        align="center"
        className="mb-6"
      >
        <Box>
          <Heading
            size="lg"
            className="mb-1"
            fontWeight="700"
            color={isDarkMode ? 'white' : 'gray.700'}
          >
            Projects Dashboard{tenantName ? ` (${tenantName})` : ''}
          </Heading>
          <Text fontSize="md" color={isDarkMode ? 'gray.300' : 'gray.500'}>
            Manage your invention projects and generate patent documents
          </Text>
        </Box>
        <Box className="mt-4">
          <Stack direction="row" spacing={6}>
            <Box>
              <Text fontSize="sm" color={isDarkMode ? 'gray.400' : 'gray.500'}>
                Total Projects
              </Text>
              <Text
                fontSize="xl"
                fontWeight="600"
                color={isDarkMode ? 'gray.50' : 'gray.700'}
              >
                {projectCount}
              </Text>
            </Box>
            <Button
              leftIcon={<Icon as={FiPlus} />}
              variant="primary"
              onClick={onOpenNewProjectModal}
              size="md"
            >
              New Project
            </Button>
          </Stack>
        </Box>
      </Flex>
    </Box>
  );
};
