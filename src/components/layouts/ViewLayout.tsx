import React, {
  ReactNode,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';

// Framework-agnostic UI components
import { Grid, Box } from '@chakra-ui/react';

// Context hooks
import { useLayout } from '../../contexts/LayoutContext';
import { useTheme } from '../../contexts/ThemeContext';

// Layout components
import { ContentPanel } from './containers/ContentPanel';
import { ResizablePanel } from './containers/ResizablePanel';

// Configuration
import { VIEW_LAYOUT_CONFIG } from '@/constants/layout';

// Types
import { ResizeCallback } from 're-resizable';

interface ViewLayoutProps {
  header: ReactNode;
  mainContent: ReactNode;
  sidebarContent: ReactNode;
  bottomContent?: ReactNode;
  isResizable?: boolean;
  defaultMainPanelWidth?: string | number;
  minMainPanelWidth?: number;
  maxMainPanelWidth?: string | number;
  /**
   * When true, renders the content panels as "islands" with padding around them,
   * creating a floating effect on the background.
   */
  islandMode?: boolean;
  [key: string]: unknown; // Allow any additional props
}

/**
 * ViewLayout component provides a consistent layout structure across all views
 *
 * Features:
 * - Consistent spacing and alignment across all views
 * - Optional resizable panels with persisted width
 * - Island mode for floating panel effect
 * - Dark mode support
 *
 * @example
 * ```tsx
 * <ViewLayout
 *   header={<MyHeader />}
 *   mainContent={<MyMainContent />}
 *   sidebarContent={<MySidebar />}
 *   {...VIEW_LAYOUT_CONFIG.DEFAULT_PROPS}
 * />
 * ```
 */
const ViewLayout: React.FC<ViewLayoutProps> = ({
  header,
  mainContent,
  sidebarContent,
  bottomContent,
  isResizable = VIEW_LAYOUT_CONFIG.DEFAULT_PROPS.isResizable,
  defaultMainPanelWidth = VIEW_LAYOUT_CONFIG.DEFAULT_PROPS
    .defaultMainPanelWidth,
  minMainPanelWidth = VIEW_LAYOUT_CONFIG.DEFAULT_PROPS.minMainPanelWidth,
  maxMainPanelWidth = VIEW_LAYOUT_CONFIG.DEFAULT_PROPS.maxMainPanelWidth,
  islandMode = VIEW_LAYOUT_CONFIG.DEFAULT_PROPS.islandMode,
  ...rest
}) => {
  // Context values
  const { mainPanelWidth, setMainPanelWidth } = useLayout();
  const { isDarkMode } = useTheme();

  // Local state
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoize color values based on theme
  const colors = useMemo(
    () => ({
      bg: isDarkMode ? '#1A202C' : '#f3f4f6',
      borderColor: isDarkMode ? '#2D3748' : '#E5E7EB',
    }),
    [isDarkMode]
  );

  // Get layout configuration based on mode
  const layoutConfig = islandMode
    ? VIEW_LAYOUT_CONFIG.ISLAND_MODE
    : VIEW_LAYOUT_CONFIG.STANDARD_MODE;

  // Calculate container height for island mode
  const containerHeight = islandMode
    ? VIEW_LAYOUT_CONFIG.ISLAND_MODE.CONTAINER_HEIGHT
    : '100%';

  // Initialize main panel width for resizable layout
  useEffect(() => {
    if (isResizable && containerRef.current && !mainPanelWidth) {
      const containerWidth = containerRef.current.clientWidth - 2 * 32;
      const calculatedMainWidth =
        (containerWidth - VIEW_LAYOUT_CONFIG.PANEL_GAP) *
        (VIEW_LAYOUT_CONFIG.MAIN_PANEL.DEFAULT_WIDTH_PERCENTAGE / 100);
      setMainPanelWidth(calculatedMainWidth);
    }
  }, [isResizable, mainPanelWidth, setMainPanelWidth]);

  // Handle resize stop event
  const handleResizeStop: ResizeCallback = useCallback(
    (e, direction, ref) => {
      const newWidth = ref.offsetWidth;
      setMainPanelWidth(newWidth);
    },
    [setMainPanelWidth]
  );

  // Determine grid columns based on sidebar presence
  const gridTemplateColumns = sidebarContent
    ? `${VIEW_LAYOUT_CONFIG.MAIN_PANEL.GRID_RATIO} ${VIEW_LAYOUT_CONFIG.SIDEBAR_PANEL.GRID_RATIO}`
    : '1fr';

  // Build padding string from config
  const containerPadding = `${layoutConfig.CONTAINER_PADDING.TOP}px ${layoutConfig.CONTAINER_PADDING.RIGHT}px ${layoutConfig.CONTAINER_PADDING.BOTTOM}px ${layoutConfig.CONTAINER_PADDING.LEFT}px`;

  // Use viewport-relative bottom padding in island mode for consistent zoom behavior
  const containerPaddingWithVH = islandMode
    ? `${VIEW_LAYOUT_CONFIG.ISLAND_MODE.CONTAINER_PADDING.TOP}px ${VIEW_LAYOUT_CONFIG.ISLAND_MODE.CONTAINER_PADDING.RIGHT}px ${VIEW_LAYOUT_CONFIG.ISLAND_MODE.CONTAINER_PADDING.BOTTOM_VH} ${VIEW_LAYOUT_CONFIG.ISLAND_MODE.CONTAINER_PADDING.LEFT}px`
    : containerPadding;

  // Responsive padding for better space utilization
  const responsivePadding = {
    base: islandMode ? '16px 16px 5vh 16px' : '16px 16px',
    md: islandMode ? '16px 20px 5vh 20px' : '16px 20px',
    lg: islandMode
      ? `${VIEW_LAYOUT_CONFIG.ISLAND_MODE.CONTAINER_PADDING.TOP}px 24px ${VIEW_LAYOUT_CONFIG.ISLAND_MODE.CONTAINER_PADDING.BOTTOM_VH} 24px`
      : `${layoutConfig.CONTAINER_PADDING.TOP}px 24px ${layoutConfig.CONTAINER_PADDING.BOTTOM}px 24px`,
  };

  return (
    <Box
      position="relative"
      className="view-layout-wrapper"
      overflow="hidden"
      bg={colors.bg}
      borderWidth={islandMode ? '0' : '1px'}
      borderStyle={islandMode ? 'none' : 'solid'}
      borderColor={islandMode ? 'transparent' : colors.borderColor}
      borderRadius={islandMode ? '0' : 'lg'}
      ref={containerRef}
      zIndex="1"
      display="block"
      height="100%"
      {...rest}
    >
      {/* Header Section */}
      <Box position="relative" mb={2} zIndex="10" flexShrink={0}>
        {header}
      </Box>

      {/* Main Content Area */}
      <Box
        style={{
          width: '100%',
          position: 'relative',
          zIndex: 11,
        }}
      >
        {isResizable ? (
          /* Resizable Layout */
          <Box
            display="flex"
            p={responsivePadding}
            mt={{ base: '12px', md: '16px', lg: '24px' }}
            position="relative"
          >
            {/* Resizable Main Panel */}
            <ResizablePanel
              width={mainPanelWidth || defaultMainPanelWidth}
              height={containerHeight}
              onResizeStop={handleResizeStop}
              minWidth={minMainPanelWidth}
              maxWidth={maxMainPanelWidth}
            >
              <ContentPanel
                isDarkMode={isDarkMode}
                islandMode={islandMode}
                height="100%"
              >
                {mainContent}
              </ContentPanel>
            </ResizablePanel>

            {/* Sidebar Panel */}
            {sidebarContent && (
              <Box
                flex="1"
                minWidth={VIEW_LAYOUT_CONFIG.SIDEBAR_PANEL.MIN_WIDTH}
                position="relative"
                zIndex="1"
                height={containerHeight}
                ml={{ base: 4, md: 5, lg: 6 }}
              >
                <ContentPanel
                  isDarkMode={isDarkMode}
                  islandMode={islandMode}
                  height="100%"
                >
                  {sidebarContent}
                </ContentPanel>
              </Box>
            )}
          </Box>
        ) : (
          /* Fixed Layout using Grid */
          <Grid
            templateColumns={gridTemplateColumns}
            gap={{ base: 4, md: 5, lg: 6 }}
            p={responsivePadding}
            mt={{ base: '12px', md: '16px', lg: '24px' }}
            position="relative"
            height={islandMode ? containerHeight : 'auto'}
          >
            {/* Main Content Panel */}
            <ContentPanel
              isDarkMode={isDarkMode}
              islandMode={islandMode}
              height={islandMode ? '100%' : 'auto'}
            >
              {mainContent}
            </ContentPanel>

            {/* Sidebar Content Panel */}
            {sidebarContent && (
              <ContentPanel
                isDarkMode={isDarkMode}
                islandMode={islandMode}
                height={islandMode ? '100%' : 'auto'}
              >
                {sidebarContent}
              </ContentPanel>
            )}
          </Grid>
        )}

        {/* Optional Bottom Content */}
        {bottomContent && (
          <Box mt={3} px={8} position="relative" zIndex="2" flexShrink={0}>
            {bottomContent}
          </Box>
        )}

        {/* Resize handle styles are now in resizeHandle.css */}
      </Box>
    </Box>
  );
};

export default ViewLayout;
