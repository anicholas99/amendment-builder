/**
 * UI Preference Keys - Shared between client and server
 * 
 * This file contains the constants for UI preferences that are stored
 * in the database. These constants are used by both the client-side
 * service and the API endpoint.
 */

// Define all UI preference keys as constants
export const UI_PREFERENCE_KEYS = {
  // View preferences
  CLAIM_VIEW_MODE: 'ui.claimViewMode',
  SIDEBAR_SHOW_ALL_PROJECTS: 'ui.sidebarShowAllProjects',

  // Panel sizes
  MAIN_PANEL_WIDTH: 'ui.mainPanelWidth',
  SIDEBAR_WIDTH: 'ui.sidebarWidth',

  // Editor preferences
  EDITOR_FONT_FAMILY: 'ui.editorFontFamily',
  EDITOR_FONT_SIZE: 'ui.editorFontSize',
  EDITOR_FONT_SCALE: 'ui.editorFontScale',
  EDITOR_ZOOM_LEVEL: 'ui.editorZoomLevel',

  // Technology details preferences
  TECH_ZOOM_LEVEL: 'ui.techZoomLevel',

  // Other view preferences
  THEME: 'ui.theme',
  COMPACT_MODE: 'ui.compactMode',
} as const;

// Type for preference keys
export type UIPreferenceKey = typeof UI_PREFERENCE_KEYS[keyof typeof UI_PREFERENCE_KEYS];