/**
 * Search Repository Index
 *
 * This file re-exports all functions from the search repository sub-modules
 * to maintain backward compatibility with existing imports.
 */

// Export all types
export * from './types';

// Export all search history operations except getSearchHistoryWithTenant
export {
  findManySearchHistory,
  createSearchHistory,
  deleteSearchHistoryByProjectId,
  findSearchHistoryById,
  updateSearchHistory,
  deleteSearchHistoryById,
  findSearchHistoryIdsByProjectId,
  validateSearchHistoryExists,
} from './searchHistory.repository';

// Export getSearchHistoryWithTenant from searchHistory.repository as the canonical version
export { getSearchHistoryWithTenant } from './searchHistory.repository';

// Export all suggestion operations
export * from './suggestions.repository';

// Export all citation operations
export * from './citations.repository';

// Export all authorization operations except getSearchHistoryWithTenant
export { findSearchHistoryWithProjectAccess } from './authorization.repository';

// Export all patentability operations
export * from './patentability.repository';
