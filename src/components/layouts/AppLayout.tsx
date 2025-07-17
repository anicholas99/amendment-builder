import React, { useEffect, useState } from 'react';
import { Box } from '@/components/ui/box';
import { IconButton } from '@/components/ui/icon-button';
import { FiMenu } from 'react-icons/fi';

import { useRouter } from 'next/router';
import ProjectSidebar from '../../features/projects/components/ProjectSidebar';
import { useSidebar } from '../../contexts/SidebarContext';
import { useLayout } from '@/contexts/LayoutContext';
import Header from '../common/Header';
import { TenantProvider } from '../../contexts/TenantContext';
import { TenantGuard } from '../common/TenantGuard';
import { LAYOUT } from '@/constants/layout';
import { getTenantSlugFromPath } from '@/utils/tenant';

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
    const { isProductivityMode, isHeaderHidden } = useLayout();

    // Add this to prevent hydration errors - only render toggle button on client
    const [isClient, setIsClient] = useState(false);

    // Check if we're on a tenant route
    const isTenantRoute = router.isReady && getTenantSlugFromPath() !== null;

    useEffect(() => {
      // This will only run on the client after hydration
      setIsClient(true);
    }, []);

    // Hide sidebar completely in productivity mode
    const shouldShowSidebar = !isProductivityMode;

    // Determine if header should be shown
    const shouldShowHeader = !(isProductivityMode && isHeaderHidden);

    const mainMarginLeft =
      isSidebarHidden || !shouldShowSidebar
        ? '0px'
        : isSidebarCollapsed
          ? `${LAYOUT.SIDEBAR_COLLAPSED_WIDTH}px`
          : `${LAYOUT.SIDEBAR_WIDTH}px`;

    const handleSidebarToggle = () => {
      toggleSidebarVisibility();
    };

    return (
      <TenantProvider>
        <TenantGuard requireTenant={isTenantRoute}>
          <Box className="relative h-screen overflow-hidden bg-background flex flex-col">
            {shouldShowHeader && (
              <Box className="flex-shrink-0">
                <Header />
              </Box>
            )}

            {/* Sidebar styling wrapper */}
            {shouldShowSidebar && (
              <Box
                className="sidebar-wrapper fixed left-0 z-[15] transition-all duration-150 ease-out overflow-y-auto overflow-x-hidden bg-background border-r border-border transform-gpu"
                style={{
                  top: shouldShowHeader ? LAYOUT.HEADER_HEIGHT_PX : '0px',
                  height: shouldShowHeader
                    ? LAYOUT.getContentHeight()
                    : '100vh',
                  width: isSidebarHidden
                    ? '0'
                    : isSidebarCollapsed
                      ? LAYOUT.SIDEBAR_COLLAPSED_WIDTH_PX
                      : LAYOUT.SIDEBAR_WIDTH_PX,
                  maxWidth: isSidebarHidden
                    ? '0'
                    : isSidebarCollapsed
                      ? LAYOUT.SIDEBAR_COLLAPSED_WIDTH_PX
                      : LAYOUT.SIDEBAR_WIDTH_PX,
                }}
              >
                <ProjectSidebar />
              </Box>
            )}

            {/* Main Content Area */}
            <Box
              className="flex-1 flex flex-col main-content relative z-[1] transition-all duration-150 ease-out h-full min-h-0 overflow-hidden"
              style={{
                paddingTop: shouldShowHeader
                  ? LAYOUT.CONTENT_TOP_OFFSET_PX
                  : '0px',
                marginLeft: mainMarginLeft,
              }}
            >
              {/* Show sidebar toggle button only when sidebar is completely hidden AND on client-side AND not in productivity mode */}
              {isClient && isSidebarHidden && !isProductivityMode && (
                <Box
                  className="fixed left-0 z-10 hover:opacity-100"
                  style={{
                    top: shouldShowHeader
                      ? `${LAYOUT.HEADER_HEIGHT + 56}px`
                      : '56px',
                  }}
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
                    icon={<FiMenu />}
                    size="sm"
                    onClick={handleSidebarToggle}
                    className="opacity-90 rounded-tl-none rounded-bl-none pl-0.5 w-[18px] shadow-md bg-primary text-primary-foreground hover:bg-primary/90"
                  />
                </Box>
              )}

              {/* Page content */}
              {children}
            </Box>
          </Box>
        </TenantGuard>
      </TenantProvider>
    );
  }
);

AppLayout.displayName = 'AppLayout';

export default AppLayout;
