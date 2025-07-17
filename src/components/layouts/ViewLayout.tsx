import React, {
  ReactNode,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';

// Import shadcn/ui utilities
import { cn } from '@/lib/utils';

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
 * - Responsive panel sizing that adapts to screen changes
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
  const [isLayoutReady, setIsLayoutReady] = useState(false);

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
    if (isResizable && !mainPanelWidth) {
      // Set initial width as percentage
      setMainPanelWidth('50%');
    }
  }, [isResizable, mainPanelWidth, setMainPanelWidth]);

  // Mark layout as ready after initial render to enable transitions
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLayoutReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle resize stop event
  const handleResizeStop: ResizeCallback = useCallback(
    (e, direction, ref) => {
      if (!containerRef.current) return;

      const newPixelWidth = ref.offsetWidth;
      const containerWidth = containerRef.current.clientWidth;
      const padding = islandMode ? layoutConfig.CONTAINER_PADDING.RIGHT * 2 : 0;
      const availableWidth = containerWidth - padding;

      // Convert to percentage for responsive storage
      const percentage = (newPixelWidth / availableWidth) * 100;
      const clampedPercentage = Math.min(75, Math.max(25, percentage));
      const percentageString = `${clampedPercentage.toFixed(1)}%`;

      setMainPanelWidth(percentageString);
    },
    [setMainPanelWidth, islandMode, layoutConfig]
  );

  // Determine grid columns based on sidebar presence
  const gridTemplateColumns = sidebarContent
    ? `${VIEW_LAYOUT_CONFIG.MAIN_PANEL.GRID_RATIO} ${VIEW_LAYOUT_CONFIG.SIDEBAR_PANEL.GRID_RATIO}`
    : '1fr';

  // Responsive padding for better space utilization
  const responsivePadding = useMemo(() => {
    if (islandMode) {
      return {
        base: '16px 16px 5vh 16px',
        md: '16px 20px 5vh 20px',
        lg: `${VIEW_LAYOUT_CONFIG.ISLAND_MODE.CONTAINER_PADDING.TOP}px 24px ${VIEW_LAYOUT_CONFIG.ISLAND_MODE.CONTAINER_PADDING.BOTTOM_VH} 24px`,
      };
    }
    return {
      base: '16px 16px',
      md: '16px 20px',
      lg: `${layoutConfig.CONTAINER_PADDING.TOP}px 24px ${layoutConfig.CONTAINER_PADDING.BOTTOM}px 24px`,
    };
  }, [islandMode, layoutConfig]);

  // Use the percentage value directly from context/default
  const currentPanelWidth = mainPanelWidth || defaultMainPanelWidth;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative view-layout-wrapper overflow-hidden flex flex-col h-full min-h-0 z-[1]',
        isDarkMode ? 'bg-gray-900' : 'bg-muted',
        islandMode
          ? 'rounded-none border-0'
          : 'rounded-lg border border-border',
        isLayoutReady ? 'layout-ready' : ''
      )}
      {...rest}
    >
      {/* Header Section */}
      <div className="relative mb-2 z-[25] flex-shrink-0">{header}</div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden w-full relative z-[5]">
        {isResizable ? (
          /* Resizable Layout */
          <div
            className="flex relative mt-3 md:mt-4 lg:mt-6"
            style={{
              padding: islandMode ? '16px 16px 5vh 16px' : '16px',
            }}
          >
            {/* Resizable Main Panel */}
            <ResizablePanel
              width={currentPanelWidth}
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
              <div
                className="flex-1 relative z-[5]"
                style={{
                  minWidth: VIEW_LAYOUT_CONFIG.SIDEBAR_PANEL.MIN_WIDTH,
                  height: containerHeight,
                  marginLeft: `${VIEW_LAYOUT_CONFIG.PANEL_GAP}px`,
                }}
              >
                <ContentPanel
                  isDarkMode={isDarkMode}
                  islandMode={islandMode}
                  height="100%"
                >
                  {sidebarContent}
                </ContentPanel>
              </div>
            )}
          </div>
        ) : (
          /* Fixed Layout using Grid */
          <div
            className="grid relative mt-3 md:mt-4 lg:mt-6"
            style={{
              gridTemplateColumns,
              gap: `${VIEW_LAYOUT_CONFIG.PANEL_GAP}px`,
              padding: islandMode ? '16px 16px 5vh 16px' : '16px',
              height: islandMode ? containerHeight : 'auto',
            }}
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
          </div>
        )}

        {/* Optional Bottom Content */}
        {bottomContent && (
          <div className="mt-3 px-8 relative z-[2] flex-shrink-0">
            {bottomContent}
          </div>
        )}

        {/* Resize handle styles are now in resizeHandle.css */}
      </div>
    </div>
  );
};

export default ViewLayout;
