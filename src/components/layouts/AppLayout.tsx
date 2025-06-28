import React, { useEffect, useState, useMemo } from 'react';
import {
  useColorMode,
  useDisclosure,
  useColorModeValue,
  Box,
  Icon,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';

import { useRouter } from 'next/router';
import Head from 'next/head';
import ProjectSidebar from '../../features/projects/components/ProjectSidebar';
import { useSidebar } from '../../contexts/SidebarContext';
import { useThemeContext } from '../../contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import Header from '../common/Header';
import { TenantSwitcher } from '../common/TenantSwitcher';
import { TenantProvider } from '../../contexts/TenantContext';
import { LAYOUT } from '@/constants/layout';

// Import CSS for transitions and performance
// CSS moved to _app.tsx - removed import

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = React.memo(
  ({ children }) => {
    const router = useRouter();
    const { isSidebarCollapsed, isSidebarHidden, toggleSidebarVisibility } =
      useSidebar();
    const { isDarkMode } = useThemeContext();
    const { user, isLoading } = useAuth();
    const { colorMode } = useColorMode();

    // Add this to prevent hydration errors - only render toggle button on client
    const [isClient, setIsClient] = useState(false);

    // Move all color values outside of callbacks/conditional renders
    const bgColor = useColorModeValue('bg.primary', 'bg.primary');
    const contentBgColor = useColorModeValue('bg.card', 'bg.card');
    const borderColor = useColorModeValue('border.primary', 'border.primary');
    const textColor = useColorModeValue('text.primary', 'text.primary');
    const mutedTextColor = useColorModeValue('text.tertiary', 'text.tertiary');
    const sidebarBgColor = useColorModeValue('bg.secondary', 'bg.secondary');
    const buttonBgColor = useColorModeValue('blue.500', 'blue.500');
    const buttonTextColor = useColorModeValue('white', 'white');

    useEffect(() => {
      // This will only run on the client after hydration
      setIsClient(true);
    }, []);

    const mainMarginLeft = isSidebarHidden
      ? '0px'
      : isSidebarCollapsed
        ? `${LAYOUT.SIDEBAR_COLLAPSED_WIDTH}px`
        : `${LAYOUT.SIDEBAR_WIDTH}px`;

    const handleSidebarToggle = () => {
      toggleSidebarVisibility();
    };

    return (
      <TenantProvider>
        <Box
          position="relative"
          height="100vh"
          overflow="hidden"
          bg={bgColor}
          display="flex"
          flexDirection="column"
        >
          <Box flexShrink={0}>
            <Header />
          </Box>

          {/* Sidebar styling wrapper */}
          <Box
            className="sidebar-wrapper"
            position="fixed"
            top={LAYOUT.HEADER_HEIGHT_PX}
            left={0}
            height={LAYOUT.getContentHeight()}
            width={
              isSidebarHidden
                ? '0'
                : isSidebarCollapsed
                  ? LAYOUT.SIDEBAR_COLLAPSED_WIDTH_PX
                  : LAYOUT.SIDEBAR_WIDTH_PX
            }
            maxWidth={
              isSidebarHidden
                ? '0'
                : isSidebarCollapsed
                  ? LAYOUT.SIDEBAR_COLLAPSED_WIDTH_PX
                  : LAYOUT.SIDEBAR_WIDTH_PX
            }
            zIndex={15}
            transition="width 0.15s ease-out"
            overflowY="auto"
            overflowX="hidden"
            transform="translateZ(0)"
            willChange="width"
            __css={{ backfaceVisibility: 'hidden' }}
            bg={sidebarBgColor}
            borderRight={`1px solid ${borderColor}`}
          >
            <ProjectSidebar />
          </Box>

          {/* Main Content Area */}
          <Box
            pt={LAYOUT.CONTENT_TOP_OFFSET_PX} // Space for header
            flex="1"
            display="flex"
            flexDirection="column"
            className="main-content"
            position="relative"
            zIndex={1}
            ml={mainMarginLeft}
            transition="margin-left 0.15s ease-out"
            height="100%"
          >
            {/* Show sidebar toggle button only when sidebar is completely hidden AND on client-side */}
            {isClient && isSidebarHidden && (
              <Box
                position="fixed"
                left="0px"
                top={`${LAYOUT.HEADER_HEIGHT + 56}px`}
                zIndex={10}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  const button = e.currentTarget.querySelector('button');
                  if (button) button.style.opacity = '1';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  const button = e.currentTarget.querySelector('button');
                  if (button) button.style.opacity = '0.9';
                }}
              >
                <IconButton
                  aria-label="Show sidebar"
                  icon={<Icon as={FiMenu} />}
                  size="sm"
                  onClick={handleSidebarToggle}
                  bg={buttonBgColor}
                  color={buttonTextColor}
                  opacity={0.9}
                  borderTopLeftRadius="0"
                  borderBottomLeftRadius="0"
                  pl="2px"
                  w="18px"
                  boxShadow="2px 2px 4px rgba(0, 0, 0, 0.1)"
                />
              </Box>
            )}

            {/* Page content */}
            {children}
          </Box>
        </Box>
      </TenantProvider>
    );
  }
);

AppLayout.displayName = 'AppLayout';

export default AppLayout;
