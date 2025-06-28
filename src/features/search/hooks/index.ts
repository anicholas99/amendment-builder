// Export all hooks from the search module
export * from './useDeepAnalysis';
export * from './usePriorArtManagement';
export * from './useCitationJobDetails';
export * from './useExaminerAnalysis';
export * from './useCitationMatches';
export * from './useCitationLocationPolling';
export * from './useSearchHistoryPolling';
export * from './useCitationDisplay';
export * from './useSearchHistoryColors';
export * from './useReferenceSelection';
export * from './useSavedArtAndExclusions';
export * from './useCitationJobs';
export * from './useExtractionState';
export * from './useRowHeightManager';
export * from './useReferenceStatuses';
export * from './useReasoningStatusPolling';

// New modular hooks for CitationExtractionTab
export { useSearchIdManagement } from './useSearchIdManagement';
export { useClaimExtraction } from './useClaimExtraction';
export { useMetadataCache } from './useMetadataCache';
export { useDisplayDataCache } from './useDisplayDataCache';
export { useVersionInfo } from './useVersionInfo';
export { useDefensiveReferenceSelection } from './useDefensiveReferenceSelection';
export { useSearchDerivedData } from './useSearchDerivedData';

// Search container hooks
export * from './useOptimisticSearch';
export * from './useSearchExecution';
