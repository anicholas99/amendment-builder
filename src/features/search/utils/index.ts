/**
 * Search Feature Utilities
 *
 * This index provides a clear map of all search-related utilities:
 *
 * Data Transformation (searchHistory.ts):
 * - normalizeSearchResult/normalizeSearchResults - Ensure consistent result format
 * - processSearchHistory - Convert database format to application format
 * - serializeSearchHistory - Convert application format to API/database format
 *
 * UI Utilities (searchHistoryUtils.ts):
 * - formatDate - Format dates for display
 * - getRelevancyColor - Get color for relevancy badges
 * - parseSearchResults - Extract results from search history entry
 * - hasCitationJobId - Check if entry has citation extraction
 *
 * Component Utilities (searchHistoryRowUtils.ts):
 * - SearchHistoryRow component-specific helpers
 *
 * Prior Art Utilities:
 * - priorArt.ts - Prior art data handling
 * - priorArtEvents.ts - Event handling for prior art actions
 * - priorArt.converter.ts - Prior art format conversion
 *
 * Citation Utilities:
 * - citationUtils.ts - Citation extraction utilities
 * - citationFormatting.ts - Citation display formatting
 * - citationHighlighting.tsx - Citation text highlighting
 * - citationHelpers.tsx - Citation UI components
 */

// Data transformation - single source of truth
export {
  normalizeSearchResult,
  normalizeSearchResults,
  processSearchHistory,
  processSearchHistories,
  processSearchHistoriesClient,
  serializeSearchHistory,
  serializeForDatabase,
  // Backward compatibility aliases
  processSearchHistoryEntry,
  processSearchHistoryEntries,
  serializeSearchHistoryEntry,
} from './searchHistory';

// UI utilities
export {
  formatDate,
  getRelevancyColor,
  parseSearchResults,
  hasCitationJobId,
  parseParsedElements,
  // Type exports
  type EnhancedSearchHistoryEntry,
  type AnySearchHistoryEntry,
} from './searchHistoryUtils';

// Component-specific utilities
export * from './searchHistoryRowUtils';

// Prior art utilities
export * from './priorArt';
export * from './priorArtEvents';
export * from './priorArt.converter';

// Citation utilities
export * from './citationUtils';
export * from './citationFormatting';
export * from './citationHighlighting';
export * from './citationHelpers';

// Other utilities
export * from './dateFormatting';
export * from './deepAnalysisUtils';
export * from './patbase-utils';
export * from './citationPollingGlobals';
