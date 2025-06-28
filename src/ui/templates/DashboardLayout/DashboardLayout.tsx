import React from 'react';
import { Box, Flex, Grid, GridItem } from '@chakra-ui/react';

/**
 * DashboardLayout template - Standard layout for dashboard-style pages
 * Provides header, sidebar, and main content area structure
 */
export interface DashboardLayoutProps {
  /** Optional header content */
  header?: React.ReactNode;
  /** Optional sidebar content */
  sidebar?: React.ReactNode;
  /** Main content area */
  main: React.ReactNode;
  /** Optional footer content */
  footer?: React.ReactNode;
  /** Whether the sidebar is collapsed */
  sidebarCollapsed?: boolean;
  /** Custom sidebar width when expanded */
  sidebarWidth?: string;
  /** Whether to show the sidebar */
  showSidebar?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  header,
  sidebar,
  main,
  footer,
  sidebarCollapsed = false,
  sidebarWidth = '280px',
  showSidebar = true,
}) => {
  return (
    <Grid
      templateAreas={`"header header"
                  "sidebar main"`}
      templateRows={'60px 1fr'}
      templateColumns={showSidebar ? `${sidebarWidth} 1fr` : '1fr'}
      h="100vh"
      gap="0"
      bg="bg.primary"
    >
      <GridItem area={'header'}>
        <Box
          w="100%"
          h="60px"
          bg="bg.header"
          borderBottom="1px solid"
          borderColor="border.primary"
        >
          {header}
        </Box>
      </GridItem>

      {showSidebar && (
        <GridItem area={'sidebar'}>
          <Box
            w={sidebarWidth}
            h="calc(100vh - 60px)"
            bg="bg.secondary"
            borderRight="1px solid"
            borderColor="border.primary"
            overflowY="auto"
          >
            {sidebar}
          </Box>
        </GridItem>
      )}

      <GridItem area={'main'}>
        <Box w="100%" h="calc(100vh - 60px)" bg="bg.primary" overflowY="auto">
          {main}
        </Box>
      </GridItem>
    </Grid>
  );
};

DashboardLayout.displayName = 'DashboardLayout';
