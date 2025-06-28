import React from 'react';
import { Box } from '@chakra-ui/react';
import { useViewHeight } from '@/hooks/useViewHeight';

interface SimpleMainPanelProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  contentPadding?: boolean;
  contentStyles?: React.ComponentProps<typeof Box>;
}

/**
 * A simplified main panel that works like the sidebar - direct overflow control
 * Adds extra offset to be shorter and match the sidebar's appearance
 */
export const SimpleMainPanel: React.FC<SimpleMainPanelProps> = ({
  header,
  children,
  footer,
  contentPadding = true,
  contentStyles = {},
}) => {
  // Minimal offset to maximize container height (50px default + 10px = 60px total)
  // This maximizes the available space while maintaining proper layout
  const viewHeight = useViewHeight(60);

  return (
    <Box
      height={viewHeight}
      display="flex"
      flexDirection="column"
      bg="bg.card"
      borderRadius="lg"
      boxShadow="lg"
      overflow="hidden"
    >
      {/* Fixed header */}
      {header && (
        <Box
          flexShrink={0}
          bg="bg.card"
          borderBottomWidth="1px"
          borderBottomColor="border.primary"
          _dark={{
            bg: 'bg.card',
            borderBottomColor: 'border.primary',
          }}
        >
          {header}
        </Box>
      )}

      {/* Scrollable content - Using CSS class for scrollbar styling */}
      <Box
        flex="1"
        overflowY="auto"
        p={contentPadding ? 4 : 0}
        className="custom-scrollbar"
        {...contentStyles}
      >
        {children}
      </Box>

      {/* Fixed footer */}
      {footer && <Box flexShrink={0}>{footer}</Box>}
    </Box>
  );
};

export default SimpleMainPanel;
