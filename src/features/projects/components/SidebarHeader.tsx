import React from 'react';
import {
  Flex,
  Text,
  IconButton,
  Icon,
  Box,
  HStack,
  Spacer,
  Tooltip,
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft } from 'react-icons/fi';

export interface SidebarHeaderProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  toggleSidebarVisibility: () => void;
  onOpenModal: () => void;
  onManageProjects: () => void;
  projectCount: number;
  isDarkMode?: boolean;
  isPreloading: boolean;
}

/**
 * SidebarHeader component that displays controls for the sidebar
 * Shows project count and buttons for creating and managing projects
 */
const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isSidebarCollapsed,
  toggleSidebar,
  toggleSidebarVisibility,
  onOpenModal: _onOpenModal,
  onManageProjects: _onManageProjects,
  projectCount,
  isDarkMode = false,
  isPreloading: _isPreloading,
}) => {
  return (
    <Flex
      align="center"
      h="48px"
      px={isSidebarCollapsed ? 1 : 4}
      borderBottomWidth="1px"
      borderBottomColor="border.primary"
      bg="bg.card"
      position="relative"
      zIndex={1}
    >
      {!isSidebarCollapsed && (
        <Box pl={2}>
          <HStack spacing={1} alignItems="baseline">
            <Text
              fontSize="sm"
              fontWeight="semibold"
              color={isDarkMode ? 'white' : 'gray.800'}
              lineHeight="1.2"
            >
              Projects
            </Text>
            <Text
              fontSize="xs"
              color={isDarkMode ? 'gray.500' : 'gray.600'}
              lineHeight="1.2"
            >
              ({projectCount})
            </Text>
          </HStack>
        </Box>
      )}

      <Spacer />

      <HStack spacing={3} pr={3}>
        <Tooltip label="Hide sidebar">
          <IconButton
            aria-label="Hide sidebar completely"
            icon={<Icon as={FiChevronsLeft} boxSize={3} />}
            size="sm"
            variant="ghost"
            color={isDarkMode ? 'gray.400' : 'gray.500'}
            onClick={toggleSidebarVisibility}
            transition="background-color 0.15s ease-out, color 0.15s ease-out"
            _hover={{
              bg: isDarkMode ? 'gray.700' : 'gray.200',
              color: isDarkMode ? 'white' : 'gray.700',
            }}
            minW="24px"
            h="24px"
            p={0}
          />
        </Tooltip>
        <Tooltip
          label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <IconButton
            aria-label={
              isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
            }
            icon={
              <Icon
                as={isSidebarCollapsed ? FiChevronRight : FiChevronLeft}
                boxSize={3}
              />
            }
            size="sm"
            variant="ghost"
            color={isDarkMode ? 'gray.400' : 'gray.500'}
            onClick={toggleSidebar}
            transition="background-color 0.15s ease-out, color 0.15s ease-out"
            _hover={{
              bg: isDarkMode ? 'gray.700' : 'gray.200',
              color: isDarkMode ? 'white' : 'gray.700',
            }}
            minW="24px"
            h="24px"
            p={0}
          />
        </Tooltip>
      </HStack>
    </Flex>
  );
};

export default SidebarHeader;
