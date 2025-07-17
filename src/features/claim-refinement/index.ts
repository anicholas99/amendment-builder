/**
 * Claim Refinement Feature Exports
 *
 * This index file provides a clean public API for the claim refinement feature.
 * Import components, hooks, and types from here instead of reaching into subdirectories.
 */

// Main Components (Still Active)
export { default as ClaimRefinementViewClean } from './components/ClaimRefinementViewClean';
export { default as ClaimSidebar } from './components/ClaimSidebar';
export { default as PriorArtAnalysisTab } from './components/PriorArtAnalysisTab';
// AddClaimModal removed - use AddNewClaimFormShadcn instead

// ShadCN/Tailwind Components (Primary Versions)
export { default as ClaimMainPanelShadcn } from './components/ClaimMainPanelShadcn';
export { default as ClaimHeaderShadcn } from './components/ClaimHeaderShadcn';
export { default as ClaimsViewShadcn } from './components/ClaimsViewShadcn';
export { default as EditableClaimShadcn } from './components/EditableClaimShadcn';
export { default as AddNewClaimFormShadcn } from './components/AddNewClaimFormShadcn';
export { EditableClaimNumberShadcn } from './components/EditableClaimNumberShadcn';
export { SaveClaimVersionButtonShadcn } from './components/SaveClaimVersionButtonShadcn';
export { ClaimProcessingOverlayShadcn } from './components/ClaimProcessingOverlayShadcn';
export { ClaimAmendmentModalShadcn } from './components/ClaimAmendmentModalShadcn';

// Hooks - re-export from hooks index
export * from './hooks';

// Note: Utils are typically not exported at feature level
// Import them directly from ./utils/ when needed
