/**
 * Centralized API Response Types & Zod Schemas
 *
 * This file defines the canonical Zod schemas for all API responses.
 * Inferred TypeScript types are exported for use throughout the application.
 * This ensures a single source of truth for API data structures.
 */

import { z } from 'zod';

// ============================================
// Base Schemas
// ============================================

export const PaginationSchema = z.object({
  page: z.number().nonnegative(),
  limit: z.number().positive(),
  hasNextPage: z.boolean(),
  total: z.number().nonnegative().optional(),
  nextCursor: z.number().nullable().optional(),
});

// ============================================
// Project Schemas
// ============================================

export const ProjectStatusSchema = z.union([
  z.literal('draft'),
  z.literal('in_progress'),
  z.literal('completed'),
  z.literal('archived'),
]);

export const DocumentTypeSchema = z.union([
  z.literal('technology'),
  z.literal('patent'),
  z.literal('claim-refinement'),
]);

export const ProjectDocumentSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  type: DocumentTypeSchema,
  content: z.union([z.string(), z.record(z.unknown())]).nullable(),
  createdAt: z.date().or(z.string().datetime()),
  updatedAt: z.date().or(z.string().datetime()),
});

export const ProjectDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  userId: z.string(),
  tenantId: z.string(),
  status: ProjectStatusSchema,
  textInput: z.string(),
  createdAt: z.date().or(z.string().datetime()),
  updatedAt: z.date().or(z.string().datetime()).optional(),
  lastModified: z.string(),
  lastUpdated: z.number().optional(),
  documents: z.array(ProjectDocumentSchema),
  savedPriorArtItems: z.array(z.object({
    id: z.string(),
    patentNumber: z.string(),
    title: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
    savedAt: z.string().datetime()
  })),
  invention: z.object({
    title: z.string().optional(),
    summary: z.string().optional(),
    description: z.string().optional()
  }).optional()
});

export const ProjectVersionSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  createdAt: z.date().or(z.string().datetime()),
  projectId: z.string(),
  userId: z.string(),
});

export const ProjectVersionsResponseSchema = z.array(ProjectVersionSchema);

export const ProjectsListResponseSchema = z.object({
  projects: z.array(ProjectDataSchema),
  pagination: PaginationSchema,
});

export const ProjectResponseSchema = ProjectDataSchema;

// --- Inferred Types ---
export type ProjectsListResponse = z.infer<typeof ProjectsListResponseSchema>;
export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;
export type ProjectDataResponse = z.infer<typeof ProjectDataSchema>;
export type ProjectVersionsResponse = z.infer<
  typeof ProjectVersionsResponseSchema
>;

// ============================================
// Search & Citation Schemas
// ============================================

export const SearchHistoryEntrySchema = z.object({
  id: z.string(),
  parsedElementsFromVersion: z.array(z.string()).optional(),
  parsedElements: z.array(z.string()).optional(),
  projectId: z.string().optional(),
  searchQuery: z.string().optional(),
  createdAt: z.string().datetime().optional()
});

export const CitationLocationResultSchema = z.object({
  id: z.string(),
  status: z.number(),
  locations: z.array(z.object({
    page: z.number().optional(),
    section: z.string().optional(),
    context: z.string().optional()
  })).optional(),
});

export const CitationMatchSchema = z.object({
  id: z.string(),
  referenceNumber: z.string(),
  status: z.string().optional(),
  title: z.string().optional(),
  abstract: z.string().optional(),
  relevanceScore: z.number().optional(),
  location: z.string().optional(),
  locationData: z.record(z.unknown()).optional(),
  locationDataRaw: z.string().optional()
});

export const CitationMatchesListSchema = z.array(CitationMatchSchema);

// --- Inferred Types ---
export type SearchHistoryEntry = z.infer<typeof SearchHistoryEntrySchema>;
export type CitationLocationResult = z.infer<
  typeof CitationLocationResultSchema
>;
export type CitationMatch = z.infer<typeof CitationMatchSchema>;

// ============================================
// Prior Art Schemas
// ============================================

export const PriorArtAnalysisRequestSchema = z.object({
  projectId: z.string(),
  searchHistoryId: z.string(),
  selectedReferenceNumbers: z.array(z.string()),
});

export const PriorArtAnalysisResponseSchema = z.object({
  success: z.boolean(),
  jobId: z.string().optional(),
});

const SavedPriorArtSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  patentNumber: z.string(),
  title: z.string().nullable().optional(),
  abstract: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  authors: z.string().nullable().optional(),
  publicationDate: z.string().nullable().optional(),
  savedAt: z.date().or(z.string().datetime()),
  savedCitationsData: z.string().nullable().optional(),
  claim1: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
});

export const GetPriorArtResponseSchema = z.object({
  priorArt: z.array(SavedPriorArtSchema),
});

export const AddSavedPriorArtRequestSchema = z.object({
  projectId: z.string(),
  referenceNumber: z.string(),
});

export const AddSavedPriorArtResponseSchema = z
  .object({
    id: z.string(),
  })
  .passthrough();

export const RemoveSavedPriorArtRequestSchema = z.object({
  projectId: z.string(),
  savedPriorArtId: z.string(),
});

export const RemoveSavedPriorArtResponseSchema = z.object({
  success: z.boolean(),
});

// --- Inferred Types ---
export type PriorArtAnalysisRequest = z.infer<
  typeof PriorArtAnalysisRequestSchema
>;
export type PriorArtAnalysisResponse = z.infer<
  typeof PriorArtAnalysisResponseSchema
>;
export type GetPriorArtResponse = z.infer<typeof GetPriorArtResponseSchema>;
export type AddSavedPriorArtRequest = z.infer<
  typeof AddSavedPriorArtRequestSchema
>;
export type AddSavedPriorArtResponse = z.infer<
  typeof AddSavedPriorArtResponseSchema
>;
export type RemoveSavedPriorArtRequest = z.infer<
  typeof RemoveSavedPriorArtRequestSchema
>;
export type RemoveSavedPriorArtResponse = z.infer<
  typeof RemoveSavedPriorArtResponseSchema
>;

// ============================================
// Claim Schemas
// ============================================

export const GenerateDependentClaimsRequestSchema = z.object({
  projectId: z.string(),
  claim1Text: z.string(),
  existingDependentClaimsText: z.string().optional(),
  inventionDetailsContext: z.string(),
  selectedReferenceNumbers: z.array(z.string()),
});

export const GenerateDependentClaimsResponseSchema = z.object({
  dependentClaims: z.string(),
});

// --- Inferred Types ---
export type GenerateDependentClaimsRequest = z.infer<
  typeof GenerateDependentClaimsRequestSchema
>;
export type GenerateDependentClaimsResponse = z.infer<
  typeof GenerateDependentClaimsResponseSchema
>;

export const ParseClaimRequestSchema = z.object({
  claimOneText: z.string(),
  projectId: z.string(),
});
export type ParseClaimRequest = z.infer<typeof ParseClaimRequestSchema>;

export const ParsedElementSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.string().optional(),
  position: z.number().optional(),
});
export type ParsedElement = z.infer<typeof ParsedElementSchema>;

export const ParseClaimResponseSchema = z.object({
  parsedElements: z.array(ParsedElementSchema),
});
export type ParseClaimResponse = z.infer<typeof ParseClaimResponseSchema>;

export const GenerateQueriesRequestSchema = z.object({
  parsedElements: z.array(ParsedElementSchema),
  inventionData: z.unknown().optional(),
});
export type GenerateQueriesRequest = z.infer<
  typeof GenerateQueriesRequestSchema
>;

export const GenerateQueriesResponseSchema = z.object({
  queries: z.array(z.string()),
});
export type GenerateQueriesResponse = z.infer<
  typeof GenerateQueriesResponseSchema
>;

// ============================================
// V2 Claim Schemas (Migration)
// ============================================

export const ClaimElementV2Schema = z
  .string()
  .min(1, 'Claim element cannot be empty');

export const ParseClaimRequestV2Schema = z.object({
  claimText: z.string(),
  projectId: z.string(),
});
export type ParseClaimRequestV2 = z.infer<typeof ParseClaimRequestV2Schema>;

export const ParseClaimResponseV2Schema = z.object({
  elements: z.array(ClaimElementV2Schema),
  version: z.literal('2.0.0'),
});
export type ParseClaimResponseV2 = z.infer<typeof ParseClaimResponseV2Schema>;

export const GenerateQueriesRequestV2Schema = z.object({
  elements: z.array(ClaimElementV2Schema),
  inventionData: z.record(z.unknown()).optional() // Accept any invention data shape
});
export type GenerateQueriesRequestV2 = z.infer<
  typeof GenerateQueriesRequestV2Schema
>;

export const GenerateQueriesResponseV2Schema = z.object({
  searchQueries: z.array(z.string()),
  timestamp: z.string().optional(),
  projectId: z.string().optional(),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
      estimated_cost: z.number(),
      used_fallback: z.boolean().optional(),
    })
    .optional(),
});
export type GenerateQueriesResponseV2 = z.infer<
  typeof GenerateQueriesResponseV2Schema
>;

// ============================================
// Invention & Figure Schemas
// ============================================

export const InventionDataSchema = z
  .object({
    title: z.string().optional(),
    summary: z.string().optional(),
    // Add other fields from the old file as needed, keeping them optional
  })
  .passthrough();
export type InventionData = z.infer<typeof InventionDataSchema>;

export const GetInventionResponseSchema = InventionDataSchema;
export type GetInventionResponse = z.infer<typeof GetInventionResponseSchema>;
export const UpdateInventionResponseSchema = InventionDataSchema;
export type UpdateInventionResponse = z.infer<
  typeof UpdateInventionResponseSchema
>;

export const ExtractTextResponseSchema = z.object({
  text: z.string(),
  metadata: z
    .object({
      pageCount: z.number().optional(),
      wordCount: z.number().optional(),
      extractionMethod: z.string().optional(),
    })
    .optional(),
});
export type ExtractTextResponse = z.infer<typeof ExtractTextResponseSchema>;

export const UploadFigureResponseSchema = z.object({
  fileName: z.string(),
  url: z.string(),
  type: z.string().optional(),
});
export type UploadFigureResponse = z.infer<typeof UploadFigureResponseSchema>;

export const DeleteFigureResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type DeleteFigureResponse = z.infer<typeof DeleteFigureResponseSchema>;

export const FigureDetailsSchema = z.object({
  id: z.string(),
  description: z.string(),
  title: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type FigureDetails = z.infer<typeof FigureDetailsSchema>;

export const GenerateFigureDetailsResponseSchema = z.object({
  figureDetails: FigureDetailsSchema,
});
export type GenerateFigureDetailsResponse = z.infer<
  typeof GenerateFigureDetailsResponseSchema
>;

export const UpdateFigureResponseSchema = z.object({
  figureDetails: FigureDetailsSchema,
});
export type UpdateFigureResponse = z.infer<typeof UpdateFigureResponseSchema>;

// ============================================
// Citation Extraction Schemas
// ============================================

export const CitationQueueRequestSchema = z.object({
  searchInputs: z.array(z.string()),
  filterReferenceNumber: z.string(),
  threshold: z.number().optional(),
  searchHistoryId: z.string(),
});
export type CitationQueueRequest = z.infer<typeof CitationQueueRequestSchema>;

export const ActualCitationQueueApiResponseSchema = z.object({
  success: z.boolean(),
  jobId: z.string(),
  externalJobId: z.number(),
  errorMessage: z.string().optional(),
});
export type ActualCitationQueueApiResponse = z.infer<
  typeof ActualCitationQueueApiResponseSchema
>;

// ============================================
// AI & Analysis Schemas
// ============================================
export const CombinedAnalysisParamsSchema = z.object({
  claim1Text: z.string(),
  referenceIds: z.array(z.string()),
  referenceNumbers: z.array(z.string()).optional(),
  searchHistoryId: z.string(),
  projectId: z.string().optional(), // Keep for backward compatibility
});
export type CombinedAnalysisParams = z.infer<
  typeof CombinedAnalysisParamsSchema
>;

export const CombinedAnalysisResultSchema = z.object({
  analysis: z.object({
    patentabilityDetermination: z.union([
      z.literal('Anticipated (§ 102)'),
      z.literal('Obvious (§ 103)'),
      z.literal('Likely Patentable'),
    ]),
    primaryReference: z.string().nullable(),
    combinedReferences: z.array(z.string()),
    rejectionJustification: z.object({
      motivationToCombine: z.string().nullable(),
      claimElementMapping: z.array(
        z.object({
          element: z.string(),
          taughtBy: z.string(),
        })
      ),
      fullNarrative: z.string(),
    }),
    strategicRecommendations: z.array(
      z.object({
        recommendation: z.string(),
        suggestedAmendmentLanguage: z.string(),
      })
    ),
    originalClaim: z.string().optional(),
    revisedClaim: z.string().optional(),
  }),
});
export type CombinedAnalysisResult = z.infer<
  typeof CombinedAnalysisResultSchema
>;

export const GenerateSuggestionsParamsSchema = z.object({
  parsedElements: z.array(z.string()),
  searchResults: z.array(z.object({
    referenceNumber: z.string(),
    title: z.string().optional(),
    relevanceScore: z.number().optional()
  })),
  claimText: z.string(),
  inventionData: InventionDataSchema,
  searchId: z.string().nullable(),
});
export type GenerateSuggestionsParams = z.infer<
  typeof GenerateSuggestionsParamsSchema
>;

export const GenerateSuggestionsResultSchema = z.object({
  suggestions: z.array(z.object({
    type: z.string(),
    content: z.string(),
    priority: z.enum(['high', 'medium', 'low']).optional()
  })),
});
export type GenerateSuggestionsResult = z.infer<
  typeof GenerateSuggestionsResultSchema
>;

export const GeneratePatentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  blobUrl: z.string().optional(),
});
export type GeneratePatentResponse = z.infer<
  typeof GeneratePatentResponseSchema
>;

// ============================================
// Other Schemas from Error Log
// ============================================

export const VersionResponseSchema = z.object({
  success: z.boolean(),
  parsedElements: z.array(ParsedElementSchema).optional(),
  error: z.string().optional(),
});
export type VersionResponse = z.infer<typeof VersionResponseSchema>;

export const GetExclusionsResponseSchema = z.object({
  exclusions: z.array(
    z.object({
      id: z.string(),
      patentNumber: z.string(),
      createdAt: z.string(),
    })
  ),
});
export type GetExclusionsResponse = z.infer<typeof GetExclusionsResponseSchema>;

export const ClaimRefinementAnalysisParamsSchema = z.object({
  projectId: z.string(),
  searchHistoryId: z.string(),
  claim1Text: z.string(),
  selectedReferenceNumbers: z.array(z.string()),
  forceRefresh: z.boolean(),
  existingDependentClaimsText: z.string(),
  inventionDetailsContext: z.string(),
});
export type ClaimRefinementAnalysisParams = z.infer<
  typeof ClaimRefinementAnalysisParamsSchema
>;

export const ClaimRefinementAnalysisResultSchema = z
  .object({
    coverageMatrix: z.record(z.array(z.string())).optional(),
    analyses: z.array(z.object({
      referenceNumber: z.string(),
      analysis: z.string(),
      relevanceScore: z.number().optional()
    })).optional(),
    priorityActions: z.array(z.string()).optional(),
    structuringAdvice: z.array(z.string()).optional(),
    referencesAnalyzedCount: z.number().optional(),
    referencesRequestedCount: z.number().optional(),
  })
  .passthrough();
export type ClaimRefinementAnalysisResult = z.infer<
  typeof ClaimRefinementAnalysisResultSchema
>;

export const GetChatHistoryResponseSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    })
  ),
});
export type GetChatHistoryResponse = z.infer<
  typeof GetChatHistoryResponseSchema
>;

export const ClearChatHistoryResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type ClearChatHistoryResponse = z.infer<
  typeof ClearChatHistoryResponseSchema
>;

export const CreatePriorArtResponseSchema = z.object({
  success: z.boolean(),
  savedPriorArt: z.object({
    id: z.string(),
    patentNumber: z.string(),
    title: z.string().nullable().optional(),
    createdAt: z.string().datetime()
  })
});
export type CreatePriorArtResponse = z.infer<typeof CreatePriorArtResponseSchema>;

export const DeletePriorArtResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type DeletePriorArtResponse = z.infer<typeof DeletePriorArtResponseSchema>;
