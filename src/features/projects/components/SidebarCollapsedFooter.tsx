import React from 'react';
import { Box, IconButton, Icon, Tooltip } from '@chakra-ui/react';
import { FiList } from 'react-icons/fi';

interface SidebarCollapsedFooterProps {
  navigateToProjects: () => void;
  isDarkMode?: boolean;
}

/**
 * A minimal footer for the collapsed sidebar – shows a single icon that
 * navigates to the projects dashboard. We deliberately keep it subtle to
 * avoid visual noise while still offering quick access.
 */
const SidebarCollapsedFooter: React.FC<SidebarCollapsedFooterProps> = ({
  navigateToProjects,
  isDarkMode = false,
}) => {
  return (
    <Box
      p={2}
      borderTopWidth="1px"
      borderTopColor={isDarkMode ? 'gray.700' : 'gray.200'}
      bg={isDarkMode ? 'gray.900' : 'white'}
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      zIndex={1}
    >
      <Tooltip label="View Dashboard" placement="right">
        <IconButton
          aria-label="View Dashboard"
          icon={<Icon as={FiList} boxSize={4} />}
          variant="ghost"
          size="sm"
          color={isDarkMode ? 'gray.400' : 'gray.500'}
          _hover={{
            bg: isDarkMode ? 'gray.700' : 'gray.100',
            color: isDarkMode ? 'white' : 'gray.700',
          }}
          onClick={navigateToProjects}
        />
      </Tooltip>
    </Box>
  );
};

export default SidebarCollapsedFooter;
