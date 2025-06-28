/**
 * Layout constants for consistent spacing and dimensions across the application
 *
 * Using these constants ensures:
 * - Easy maintenance and updates
 * - Consistent values across components
 * - Single source of truth for layout dimensions
 */

export const LAYOUT = {
  // Header dimensions
  HEADER_HEIGHT: 50,
  HEADER_HEIGHT_PX: '50px',

  // Sidebar dimensions
  SIDEBAR_WIDTH: 220,
  SIDEBAR_WIDTH_PX: '220px',
  SIDEBAR_COLLAPSED_WIDTH: 60,
  SIDEBAR_COLLAPSED_WIDTH_PX: '60px',

  // Content spacing
  CONTENT_BOTTOM_PADDING: 0, // Removed bottom padding
  CONTENT_BOTTOM_PADDING_PX: '0px',

  // Computed values for convenience
  CONTENT_TOP_OFFSET: 50, // Same as header height
  CONTENT_TOP_OFFSET_PX: '50px',

  // Default total offset for content areas (header only)
  DEFAULT_CONTENT_OFFSET: 50, // Just header height

  // Helper function to calculate viewport-based heights
  getContentHeight: (additionalOffset: number = 0) =>
    `calc(100vh - ${LAYOUT.HEADER_HEIGHT + LAYOUT.CONTENT_BOTTOM_PADDING + additionalOffset}px)`,
} as const;

// Export individual constants for convenience
export const {
  HEADER_HEIGHT,
  HEADER_HEIGHT_PX,
  CONTENT_TOP_OFFSET_PX,
  CONTENT_BOTTOM_PADDING_PX,
  DEFAULT_CONTENT_OFFSET,
} = LAYOUT;

/**
 * ViewLayout configuration for consistent view layouts across the application
 * All views should use these settings for consistency
 */
export const VIEW_LAYOUT_CONFIG = {
  // Default layout mode - all views use island mode now
  DEFAULT_MODE: 'island' as const,

  // Panel sizing
  MAIN_PANEL: {
    DEFAULT_WIDTH_PERCENTAGE: 50,
    MIN_WIDTH: 500,
    MAX_WIDTH_PERCENTAGE: '75%',
    GRID_RATIO: '1fr', // Even ratio for equal spacing (50%)
  },

  SIDEBAR_PANEL: {
    MIN_WIDTH: 280,
    GRID_RATIO: '1fr', // Even ratio to match main panel for 50/50 spacing
  },

  // Spacing
  PANEL_GAP: 2, // Gap between panels in pixels (adjusted for slightly larger spacing)

  // Island mode specific settings
  ISLAND_MODE: {
    CONTAINER_HEIGHT: 'calc(100vh - 120px)', // Ensure space for header + guaranteed bottom gap
    BOTTOM_PADDING: 200, // Bottom padding to create floating effect
    BOTTOM_PADDING_VH: '5vh', // Viewport-relative bottom padding for minimal gap at bottom
    CONTAINER_PADDING: {
      TOP: 16,
      RIGHT: 32,
      BOTTOM: 200,
      BOTTOM_VH: '5vh', // Viewport-relative bottom padding (minimal gap)
      LEFT: 32,
    },
  },

  // Standard mode settings
  STANDARD_MODE: {
    CONTAINER_PADDING: {
      TOP: 16,
      RIGHT: 32,
      BOTTOM: 16,
      LEFT: 32,
    },
  },

  // Shadow configurations for different states
  SHADOWS: {
    LIGHT: {
      DEFAULT:
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 8px 16px -4px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.15)',
      HOVER:
        '0 6px 12px -2px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.08), 0 12px 24px -6px rgba(0, 0, 0, 0.12), 0 16px 28px -8px rgba(0, 0, 0, 0.16)',
    },
    DARK: {
      DEFAULT:
        '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.36), 0 8px 16px -4px rgba(0, 0, 0, 0.4), 0 10px 20px -5px rgba(0, 0, 0, 0.5)',
      HOVER:
        '0 6px 12px -2px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4), 0 12px 24px -6px rgba(0, 0, 0, 0.5), 0 16px 28px -8px rgba(0, 0, 0, 0.6)',
    },
  },

  // Default props for ViewLayout component
  DEFAULT_PROPS: {
    isResizable: true,
    islandMode: true,
    defaultMainPanelWidth: '50%',
    minMainPanelWidth: 500,
    maxMainPanelWidth: '75%',
  },
} as const;
