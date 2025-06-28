/**
 * Claim Elements V2 Validation Schemas
 *
 * Zod schemas for validating the simplified V2 claim element format
 */

import { z } from 'zod';

/**
 * Schema for a single claim element in V2 format
 * Must be a non-empty string
 */
export const claimElementV2Schema = z
  .string()
  .min(1, 'Claim element cannot be empty')
  .describe('A single claim element text');

/**
 * Schema for an array of claim elements in V2 format
 */
export const claimElementsV2ArraySchema = z
  .array(claimElementV2Schema)
  .min(1, 'At least one claim element is required')
  .describe('Array of claim element strings');

/**
 * Schema for invention data context
 */
export const inventionDataSchema = z.object({
  title: z.string().optional(),
  technical_field: z.string().optional(),
  summary: z.string().optional(),
  novelty: z.string().optional(),
  background: z.string().optional(),
  advantages: z.string().optional(),
});

/**
 * Schema for V2 claim elements with version
 */
export const claimElementsV2Schema = z.object({
  elements: claimElementsV2ArraySchema,
  version: z.literal('2.0.0'),
});

/**
 * Schema for generate queries request V2
 */
export const generateQueriesRequestV2Schema = z.object({
  elements: claimElementsV2ArraySchema,
  inventionData: inventionDataSchema.optional(),
});

/**
 * Schema for parse claim response V2
 */
export const parseClaimResponseV2Schema = z.object({
  elements: claimElementsV2ArraySchema,
  version: z.literal('2.0.0'),
});

/**
 * Schema for generate queries response
 */
export const generateQueriesResponseV2Schema = z.object({
  searchQueries: z
    .array(z.string())
    .length(3, 'Exactly 3 search queries required'),
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

/**
 * Type exports for use in TypeScript
 */
export type ClaimElementV2 = z.infer<typeof claimElementV2Schema>;
export type ClaimElementsV2Array = z.infer<typeof claimElementsV2ArraySchema>;
export type InventionData = z.infer<typeof inventionDataSchema>;
export type ClaimElementsV2 = z.infer<typeof claimElementsV2Schema>;
export type GenerateQueriesRequestV2 = z.infer<
  typeof generateQueriesRequestV2Schema
>;
export type ParseClaimResponseV2 = z.infer<typeof parseClaimResponseV2Schema>;
export type GenerateQueriesResponseV2 = z.infer<
  typeof generateQueriesResponseV2Schema
>;
