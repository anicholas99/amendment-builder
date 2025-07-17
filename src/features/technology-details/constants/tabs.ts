/**
 * Tab constants for Technology Details view
 */

export const TECHNOLOGY_TABS = {
  FIGURES: 0,
  PROJECT_FILES: 1,
  CHAT: 2,
} as const;

export type TechnologyTabType =
  (typeof TECHNOLOGY_TABS)[keyof typeof TECHNOLOGY_TABS];

/**
 * Tab titles for Technology Details view
 */
export const TECHNOLOGY_TAB_TITLES = [
  'Figures',
  'Project Files',
  'Chat',
] as const;

export type TechnologyTabTitle = (typeof TECHNOLOGY_TAB_TITLES)[number];

/**
 * Default active tab for Technology Details view
 */
export const DEFAULT_TECHNOLOGY_TAB = TECHNOLOGY_TABS.FIGURES;

// URL-friendly tab names for query parameters
export const TECHNOLOGY_TAB_NAME_TO_INDEX = {
  figures: TECHNOLOGY_TABS.FIGURES,
  saved: TECHNOLOGY_TABS.PROJECT_FILES,
  chat: TECHNOLOGY_TABS.CHAT,
} as const;

// Reverse mapping for converting numeric index to URL name
export const TECHNOLOGY_TAB_INDEX_TO_NAME = {
  [TECHNOLOGY_TABS.FIGURES]: 'figures',
  [TECHNOLOGY_TABS.PROJECT_FILES]: 'saved',
  [TECHNOLOGY_TABS.CHAT]: 'chat',
} as const;
