/**
 * Prior Art API Response Schemas
 *
 * Schemas related to prior art analysis, saved prior art, and management
 */

import { z } from 'zod';

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
  savedCitations: z
    .array(
      z.object({
        id: z.string(),
        savedPriorArtId: z.string(),
        elementText: z.string().optional(),
        citationText: z.string().optional(),
        location: z.string().nullable().optional(),
        reasoning: z.string().nullable().optional(),
        displayOrder: z.number().optional(),
        createdAt: z.date().or(z.string().datetime()).optional(),
        updatedAt: z.date().or(z.string().datetime()).optional(),
      })
    )
    .optional(),
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

export const CreatePriorArtResponseSchema = z.object({
  success: z.boolean(),
  savedPriorArt: z.object({
    id: z.string(),
    patentNumber: z.string(),
    title: z.string().nullable().optional(),
    createdAt: z.string().datetime(),
  }),
});

export const DeletePriorArtResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// --- Inferred Types ---
export type SavedPriorArt = z.infer<typeof SavedPriorArtSchema>;
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
export type CreatePriorArtResponse = z.infer<
  typeof CreatePriorArtResponseSchema
>;
export type DeletePriorArtResponse = z.infer<
  typeof DeletePriorArtResponseSchema
>;
