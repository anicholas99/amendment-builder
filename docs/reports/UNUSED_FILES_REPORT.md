# Unused TypeScript/JavaScript Files Report

## Summary

Found **384 potentially unused files** in the src/ directory. These files are not imported anywhere else in the codebase.

## Categories of Unused Files

### 1. **Unused React Components** (83 files)

#### Common Components
- `/src/components/common/DarkModeComponents.tsx` - Dark mode styled components (never imported)
- `/src/components/common/NavigationLink.tsx` - Navigation link component
- `/src/components/common/ProjectTransitionWrapper.tsx` - Project transition animation wrapper
- `/src/components/common/RateLimitErrorBoundary.tsx` - Rate limit error boundary component
- `/src/components/common/TenantDebugPanel.tsx` - Tenant debugging panel

#### Feature Components
- `/src/features/chat/components/ChatAssistantLauncher.tsx` - Chat assistant launcher
- `/src/features/chat/components/StreamingCursor.tsx` - Streaming cursor animation
- `/src/features/citation-extraction/components/CitationExtractionPanel.tsx`
- `/src/features/citation-extraction/components/CitationResultsTable.tsx`
- `/src/features/citation-extraction/components/ExaminerAnalysisView.tsx`
- `/src/features/claim-refinement/components/ClaimDependencyTree.tsx`
- `/src/features/claim-refinement/components/ClaimHistory.tsx`
- `/src/features/claim-refinement/components/ClaimList.tsx`
- `/src/features/claim-refinement/components/SavedPriorArtTab.tsx`
- `/src/features/modals/components/ClaimModals.tsx`
- `/src/features/modals/components/SuggestionApplyModal.tsx`
- `/src/features/patent-application/components/DecisionNode.tsx`
- `/src/features/patent-application/components/DeleteElementDialog.tsx`
- `/src/features/patent-application/components/FigureElementUpdater.tsx`
- `/src/features/patent-application/components/FigureSection.tsx`
- `/src/features/patent-application/components/PatentContent.tsx`
- `/src/features/patent-application/components/PatentLoadingPlaceholder.tsx`
- `/src/features/patent-application/components/ProcessNode.tsx`
- `/src/features/patent-application/components/ReferenceNumeral.tsx`
- `/src/features/patent-application/components/RegeneratePatentButton.tsx`
- `/src/features/patent-application/components/SaveIndicator.tsx`

### 2. **Unused Custom Hooks** (79 files)

#### Core Hooks
- `/src/hooks/useError.ts` - Error handling hook
- `/src/hooks/usePolling.ts` - Polling hook
- `/src/hooks/useStaggeredLoading.ts` - Staggered loading animation hook
- `/src/hooks/useTenant.ts` - Tenant context hook
- `/src/hooks/useThrottledQueryInvalidation.ts` - Throttled query invalidation

#### Feature-Specific Hooks
- `/src/features/citation-extraction/hooks/useCitationExtractionMutation.ts`
- `/src/features/claim-refinement/hooks/useAPIInteractions.ts`
- `/src/features/claim-refinement/hooks/useAnalysisTabLogic.ts`
- `/src/features/claim-refinement/hooks/useClaimHandlersWithHistory.ts`
- `/src/features/claim-refinement/hooks/useClaimHistory.ts`
- `/src/features/claim-refinement/hooks/useClaimManagement.ts`
- `/src/features/claim-refinement/hooks/useClaimOperations.ts`
- `/src/features/claim-refinement/hooks/useClaimSync.ts`
- `/src/features/claim-refinement/hooks/useClaimUpdate.ts`
- `/src/features/claim-refinement/hooks/useClaimViewState.ts`
- `/src/features/patent-application/hooks/useGeneratePatent.ts`
- `/src/features/patent-application/hooks/usePatentApplication.ts`
- `/src/features/patent-application/hooks/usePatentContent.ts`
- `/src/features/patent-application/hooks/usePatentDocumentManager.ts`
- `/src/features/patent-application/hooks/usePatentEditorToolbar.ts`

### 3. **Unused Utility Functions** (32 files)

- `/src/utils/apiHandlerTypes.ts` - API handler type utilities
- `/src/utils/apiVersioning.ts` - API versioning utilities
- `/src/utils/costTracker.ts` - Cost tracking utilities
- `/src/utils/error-handling/error-handler.ts` - Error handling utilities
- `/src/utils/queryCache.debug.ts` - Query cache debugging utilities
- `/src/utils/response-utils.ts` - Response formatting utilities
- `/src/utils/server-logging.ts` - Server logging utilities
- `/src/utils/type-guards.ts` - TypeScript type guard functions
- `/src/utils/typeUtils.ts` - Type utility functions
- `/src/utils/unsavedChanges.ts` - Unsaved changes tracking

### 4. **Unused Type Definitions** (14 files)

These are TypeScript type definition files that aren't imported:
- `/src/types/api-helpers.ts`
- `/src/types/api-responses.ts`
- `/src/types/citations.ts`
- `/src/types/common-replacements.ts`
- `/src/types/components.ts`
- `/src/types/hooks.ts`
- `/src/types/project-enhancements.ts`
- `/src/types/suggestionTypes.ts`
- `/src/types/tools.ts`
- `/src/types/utility.ts`

### 5. **Unused Service Files** (9 files)

- `/src/client/services/storage/blob-storage.client-service.ts` - Blob storage client service
- `/src/server/services/cached-semantic-search.server-service.ts` - Cached semantic search service
- `/src/server/services/external-ai-api.server-service.ts` - External AI API service
- `/src/server/services/prior-art-analysis-cache.server-service.ts` - Prior art analysis cache
- `/src/server/services/search-history.server-service.ts` - Search history service
- `/src/server/services/snippet-extraction.server-service.ts` - Snippet extraction service

### 6. **Unused API Routes** (98 files)

Note: API routes in Next.js are not imported but accessed via URL routing. These might still be used:
- `/src/pages/api/auth/[...auth0].ts` - Auth0 handler (likely used for authentication)
- `/src/pages/api/admin/export-data.ts`
- `/src/pages/api/admin/soc2-compliance.ts`
- `/src/pages/api/ai/combined-analysis.ts`
- `/src/pages/api/ai/generate-figure-details.ts`
- Many more API routes...

### 7. **Other Unused Files** (69 files)

Including configuration files, constants, contexts, and pages:
- `/src/config/analysisConstants.ts`
- `/src/config/appConfig.ts`
- `/src/config/featureFlags.ts`
- `/src/constants/status.ts`
- `/src/constants/techDomains.ts`
- `/src/data/constants.ts`
- `/src/contexts/ProjectProviders.tsx`
- `/src/pages/login.tsx`
- `/src/pages/register.tsx`
- `/src/pages/patent-lookup.tsx`

## Recommendations

1. **Verify Before Deletion**: Some files might be:
   - Used dynamically (loaded at runtime)
   - Entry points (like API routes)
   - Referenced in configuration files
   - Used by external tools or scripts

2. **Files with Special Notes**:
   - Files containing TODO/FIXME/WIP comments might be work in progress
   - Test-related files might be used by test runners
   - Type definition files might be used implicitly
   - Index files often serve as barrel exports

3. **Safe to Remove** (High Confidence):
   - `DarkModeComponents.tsx` - Unused UI components
   - `NavigationLink.tsx` - Replaced by other navigation
   - `RateLimitErrorBoundary.tsx` - Unused error boundary
   - `TenantDebugPanel.tsx` - Debug component not used
   - Various unused hooks and utilities

4. **Needs Investigation**:
   - API routes - verify they're not called by frontend
   - Service files - check if used by queue processors
   - Type files - might be referenced in tsconfig paths

## Next Steps

1. Back up the codebase before deletion
2. Remove files in small batches
3. Run tests after each batch removal
4. Check for runtime errors
5. Consider archiving instead of deleting for historical reference