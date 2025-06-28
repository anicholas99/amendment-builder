import React, { ReactNode } from 'react';

// Framework-agnostic UI components
import { Flex, Text, Tooltip } from '@chakra-ui/react';

import { useSidebar } from '../../contexts/SidebarContext';
import { useThemeContext } from '../../contexts/ThemeContext';

interface ViewHeaderProps {
  /**
   * The title to display in the header
   */
  title: string;

  /**
   * Action buttons to display in the header
   */
  actions: ReactNode;
}

/**
 * A standardized header component for all main views
 * Displays a title on the left and action buttons on the right
 * Adjusts its position based on the sidebar collapsed state
 */
const ViewHeader: React.FC<ViewHeaderProps> = React.memo(
  ({ title, actions }) => {
    const { isSidebarCollapsed, isSidebarHidden } = useSidebar();
    const { isDarkMode } = useThemeContext();

    const textColor = isDarkMode ? 'white' : '#2d3748'; // gray.700 equivalent

    // Determine if title needs a tooltip (over 25 chars)
    const shouldShowTooltip = title.length > 25;

    return (
      <Flex
        justify="space-between"
        align="center"
        py={4}
        px={8}
        position="fixed"
        top="37px"
        left={isSidebarHidden ? '0' : isSidebarCollapsed ? '60px' : '220px'}
        right={0}
        zIndex={20}
        style={{
          marginBottom: '16px',
          transition: 'left 0.15s ease-out',
          backgroundColor: 'transparent',
        }}
        className="view-header"
      >
        <Tooltip
          label={title}
          placement="bottom"
          isDisabled={!shouldShowTooltip}
          openDelay={500}
        >
          <Text
            fontSize="20px"
            fontWeight="bold"
            color={textColor}
            style={{
              letterSpacing: '-0.025em',
              maxWidth: '600px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </Text>
        </Tooltip>
        <Flex gap={2} align="center">
          {actions}
        </Flex>
      </Flex>
    );
  }
);

ViewHeader.displayName = 'ViewHeader';

export default ViewHeader;
