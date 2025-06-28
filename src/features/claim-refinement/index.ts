/**
 * Claim Refinement Feature Exports
 *
 * This index file provides a clean public API for the claim refinement feature.
 * Import components, hooks, and types from here instead of reaching into subdirectories.
 */

// Main Components
export { default as ClaimRefinementViewClean } from './components/ClaimRefinementViewClean';
export { default as ClaimMainPanel } from './components/ClaimMainPanel';
export { default as ClaimSidebar } from './components/ClaimSidebar';
export { default as PriorArtAnalysisTab } from './components/PriorArtAnalysisTab';

// Hooks - re-export from hooks index
export * from './hooks';

// Note: Utils are typically not exported at feature level
// Import them directly from ./utils/ when needed
