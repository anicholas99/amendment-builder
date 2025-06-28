import { z } from 'zod';
import { safeJsonParse } from '@/utils/json-utils';

/**
 * Schema for structured data in invention uploads
 */
export const inventionDataSchema = z.object({
  title: z.string(),
  sections: z.array(
    z.object({
      type: z.string(),
      content: z.string(),
    })
  ),
  text: z.string(),
  figures: z
    .array(
      z.object({
        fileName: z.string(),
        fileType: z.string(),
        data: z.string(), // base64 encoded data
        size: z.number(),
      })
    )
    .optional(),
});

/**
 * Schema for upload-invention form fields
 */
export const uploadInventionFieldsSchema = z.object({
  inventionData: z
    .string()
    .optional()
    .transform(val => {
      if (!val) return undefined;
      try {
        const parsed = safeJsonParse<unknown>(val);
        if (parsed === undefined) {
          // If parsing fails, return undefined to let the API handle it
          return undefined;
        }
        return inventionDataSchema.parse(parsed);
      } catch {
        // If parsing fails, return undefined to let the API handle it
        return undefined;
      }
    }),
});

/**
 * Schema for analyze-invention request body
 */
export const analyzeInventionSchema = z.object({
  text: z.string().min(1, 'Invention text is required'),
  projectId: z.string().uuid().optional(),
});

export type AnalyzeInventionInput = z.infer<typeof analyzeInventionSchema>;
