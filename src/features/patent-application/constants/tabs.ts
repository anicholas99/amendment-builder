/**
 * Tab constants for Patent Application view
 */

export const PATENT_TABS = {
  FIGURES: 0,
  CHAT: 1,
} as const;

// URL-friendly tab names for query parameters
export const PATENT_TAB_NAME_TO_INDEX = {
  figures: PATENT_TABS.FIGURES,
  chat: PATENT_TABS.CHAT,
} as const;

// Reverse mapping for converting numeric index to URL name
export const PATENT_TAB_INDEX_TO_NAME = {
  [PATENT_TABS.FIGURES]: 'figures',
  [PATENT_TABS.CHAT]: 'chat',
} as const;

export const PATENT_TAB_TITLES = ['Figures', 'Chat'] as const;
