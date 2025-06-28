// Main type exports - selective exports to avoid conflicts
export type { CustomApiRequest, ProjectData } from './api';

// Export specific API response types that don't conflict
export type {
  // Response types that don't exist in api.ts
  ParseClaimResponse,
  GenerateQueriesResponse,
  SearchHistoryResponse,
  AsyncSearchStartResponse,
  SearchStatusResponse,
  GenerateDependentClaimsResponse,
  FigureDetails,
  GenerateFigureDetailsResponse,
  UpdateFigureResponse,
  DeleteFigureResponse,
  PriorArtAnalysisResponse,
  SavedPriorArt,
  CreateProjectResponse,
  UpdateProjectResponse,
  ExtractTextResponse,
  MutationResponse,
  BatchOperationResponse,
  PaginationMeta,
  PaginatedResponse,
  // Re-export shared types
  SearchResult as SearchResultType,
  PriorArtReference as PriorArtReferenceType,
} from './api/index';

// Export PriorArtReference from domain types
export type { PriorArtReference } from './domain/priorArt';
export * from './middleware';

// Common replacement types for any migration - selective export to avoid AsyncFunction conflict
export type {
  UnknownObject,
  UnknownArray,
  AsyncFunction as AsyncFunctionGeneric, // Renamed to avoid conflict with utility.ts
  SyncFunction,
  ErrorWithCode,
  CommonApiHandler,
  TestMockRequest,
  TestMockResponse,
} from './common-replacements';

// Auto-generated type exports - these have more specific types
export * from './api-responses';
export * from './search';
// Note: Not exporting from './citations' to avoid CitationMatch duplicate
// Import directly from './citations' when needed
export * from './project-enhancements';
export * from './components';
export * from './hooks';
export * from './utility';

// Re-export inventory/structured data types for backward compatibility
import type { InventionData } from './invention';
export type { InventionData };

// Legacy type exports - SHOULD be removed once migration is complete
// TODO: Remove these exports once all references are updated
