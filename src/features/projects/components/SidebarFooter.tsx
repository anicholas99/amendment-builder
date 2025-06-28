import React, { useCallback } from 'react';
import { Icon, Text, Box, Flex, Button } from '@chakra-ui/react';
import { FiList } from 'react-icons/fi';
import { useThemeContext } from '../../../contexts/ThemeContext';

interface SidebarFooterProps {
  navigateToProjects: () => void;
  isDarkMode?: boolean;
}

/**
 * Footer component for the sidebar with useful controls
 */
const SidebarFooter: React.FC<SidebarFooterProps> = React.memo(
  ({ navigateToProjects, isDarkMode = false }) => {
    const { isDarkMode: darkModeFromContext } = useThemeContext();
    // Use prop if provided, otherwise use context
    const isInDarkMode =
      isDarkMode !== undefined ? isDarkMode : darkModeFromContext;

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.backgroundColor = isInDarkMode
          ? 'rgba(255, 255, 255, 0.1)'
          : '#f7fafc';
        e.currentTarget.style.transform = 'translateY(-1px)';
      },
      [isInDarkMode]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.backgroundColor = isInDarkMode
          ? 'rgba(255, 255, 255, 0.05)'
          : 'white';
        e.currentTarget.style.transform = 'translateY(0)';
      },
      [isInDarkMode]
    );

    return (
      <Box
        p="3"
        borderTopWidth="1px"
        borderTopColor="border.primary"
        bg="bg.card"
        position="relative"
        zIndex={1}
        boxShadow="lg"
      >
        {/* View all projects button */}
        <Box
          onClick={navigateToProjects}
          style={{
            borderRadius: '6px',
            padding: '8px 12px',
            cursor: 'pointer',
            backgroundColor: isInDarkMode
              ? 'rgba(255, 255, 255, 0.05)'
              : 'white',
            border: '1px solid',
            borderColor: isInDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
            transition:
              'background-color 0.15s ease-out, transform 0.15s ease-out',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Flex align="center" justify="center">
            <Icon
              as={FiList}
              style={{
                marginRight: '8px',
                color: isInDarkMode ? '#90cdf4' : '#3182ce',
                transition: 'color 0.15s ease-out',
              }}
            />
            <Text
              fontSize="sm"
              color={isInDarkMode ? 'white' : 'gray.700'}
              fontWeight="normal"
              style={{ transition: 'color 0.15s ease-out' }}
            >
              View Dashboard
            </Text>
          </Flex>
        </Box>
      </Box>
    );
  }
);

SidebarFooter.displayName = 'SidebarFooter';

export default SidebarFooter;
