import { z } from 'zod';

/**
 * Schema for citation extraction queue request
 */
export const citationExtractionQueueSchema = z.object({
  searchHistoryId: z.string().uuid(),
  parsedElements: z
    .array(
      z.object({
        id: z.string(),
        type: z.string(),
        text: z.string(),
        isOptional: z.boolean().optional(),
      })
    )
    .optional(),
});

/**
 * Schema for citation job update
 */
export const updateCitationJobSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED']).optional(),
  error: z.string().optional(),
  results: z.record(z.unknown()).optional(),
});

/**
 * Schema for citation match creation
 */
export const createCitationMatchSchema = z.object({
  searchHistoryId: z.string().uuid(),
  citationJobId: z.string().uuid(),
  referenceNumber: z.string(),
  citation: z.string(),
  paragraph: z.string().optional(),
  score: z.number().min(0).max(1).optional(),
});

/**
 * Schema for citation reasoning request
 */
export const citationReasoningSchema = z.object({
  citationMatchId: z.string().uuid(),
  forceReanalyze: z.boolean().optional().default(false),
});

/**
 * Schema for save citation results
 */
export const saveCitationResultsSchema = z.object({
  searchHistoryId: z.string().uuid(),
  citationJobId: z.string().uuid(),
  results: z.array(
    z.object({
      referenceNumber: z.string(),
      citation: z.string(),
      paragraph: z.string().optional(),
      score: z.number().optional(),
    })
  ),
});

export type CitationExtractionQueueInput = z.infer<
  typeof citationExtractionQueueSchema
>;
export type UpdateCitationJobInput = z.infer<typeof updateCitationJobSchema>;
export type CreateCitationMatchInput = z.infer<
  typeof createCitationMatchSchema
>;
export type CitationReasoningInput = z.infer<typeof citationReasoningSchema>;
export type SaveCitationResultsInput = z.infer<
  typeof saveCitationResultsSchema
>;
