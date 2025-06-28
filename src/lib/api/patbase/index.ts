/**
 * PatBase API
 *
 * This is the main entry point for all PatBase-related functionality.
 * It provides exports for backward compatibility while organizing
 * the code into logical modules.
 */

// Export all types
export * from './types';

// Export client functions
export { authenticatePatbase, callPatbaseApi, isSessionValid } from './client';

// Export family service functions
export {
  filterAndDeduplicateByFamily,
  clearFamilyCache,
  generateReferenceFormats,
} from './services/familyService';

// Export search service functions
export { searchPatents } from './services/searchService';

// Note: enrichPatentMetadata is in lib/clients/patbase/patbaseClient.ts
// and should stay there for now to avoid breaking changes
