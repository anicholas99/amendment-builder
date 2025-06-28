import React, { ReactNode, useCallback } from 'react';
import { Box } from '@chakra-ui/react';
import { VIEW_LAYOUT_CONFIG } from '@/constants/layout';

interface ContentPanelProps {
  children: ReactNode;
  isDarkMode: boolean;
  islandMode?: boolean;
  height?: string | number;
  className?: string;
}

/**
 * ContentPanel component wraps content with consistent styling
 * Used for both main content and sidebar content containers
 */
export const ContentPanel: React.FC<ContentPanelProps> = React.memo(
  ({
    children,
    isDarkMode,
    islandMode = false,
    height = '100%',
    className,
  }) => {
    const shadows = isDarkMode
      ? VIEW_LAYOUT_CONFIG.SHADOWS.DARK
      : VIEW_LAYOUT_CONFIG.SHADOWS.LIGHT;

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.boxShadow = shadows.HOVER;
      },
      [shadows.HOVER]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.boxShadow = shadows.DEFAULT;
      },
      [shadows.DEFAULT]
    );

    return (
      <Box
        height={height}
        width="100%"
        borderRadius="lg"
        className={className}
        boxShadow={shadows.DEFAULT}
        transition="box-shadow 0.15s ease-out"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Box
          height="100%"
          bg={isDarkMode ? '#1A202C' : 'white'}
          borderRadius="lg"
          display="flex"
          flexDirection="column"
          position="relative"
          zIndex="15"
          transition="background-color 0.15s ease-out"
        >
          {children}
        </Box>
      </Box>
    );
  }
);

ContentPanel.displayName = 'ContentPanel';
