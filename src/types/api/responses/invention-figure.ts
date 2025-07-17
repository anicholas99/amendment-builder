/**
 * Invention & Figure API Response Schemas
 *
 * Schemas related to invention data, figures, and patent generation
 */

import { z } from 'zod';

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

export const GetInventionResponseSchema = InventionDataSchema;
export const UpdateInventionResponseSchema = InventionDataSchema;

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

export const UploadFigureResponseSchema = z.object({
  fileName: z.string(),
  url: z.string(),
  type: z.string().optional(),
});

export const DeleteFigureResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const FigureDetailsSchema = z.object({
  id: z.string(),
  description: z.string(),
  title: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const GenerateFigureDetailsResponseSchema = z.object({
  figureDetails: FigureDetailsSchema,
});

export const UpdateFigureResponseSchema = z.object({
  figureDetails: FigureDetailsSchema,
});

export const GeneratePatentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  blobUrl: z.string().optional(),
});

// --- Inferred Types ---
export type InventionData = z.infer<typeof InventionDataSchema>;
export type GetInventionResponse = z.infer<typeof GetInventionResponseSchema>;
export type UpdateInventionResponse = z.infer<
  typeof UpdateInventionResponseSchema
>;
export type ExtractTextResponse = z.infer<typeof ExtractTextResponseSchema>;
export type UploadFigureResponse = z.infer<typeof UploadFigureResponseSchema>;
export type DeleteFigureResponse = z.infer<typeof DeleteFigureResponseSchema>;
export type FigureDetails = z.infer<typeof FigureDetailsSchema>;
export type GenerateFigureDetailsResponse = z.infer<
  typeof GenerateFigureDetailsResponseSchema
>;
export type UpdateFigureResponse = z.infer<typeof UpdateFigureResponseSchema>;
export type GeneratePatentResponse = z.infer<
  typeof GeneratePatentResponseSchema
>;
