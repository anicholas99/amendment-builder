/**
 * Miscellaneous API Response Schemas
 *
 * Schemas for chat, exclusions, versions, and other endpoints
 */

import { z } from 'zod';
import { ParsedElementSchema } from './claim';

// ============================================
// Other Schemas
// ============================================

export const VersionResponseSchema = z.object({
  success: z.boolean(),
  parsedElements: z.array(ParsedElementSchema).optional(),
  error: z.string().optional(),
});

export const GetExclusionsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    exclusions: z.array(
      z.object({
        id: z.string(),
        projectId: z.string(),
        patentNumber: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        metadata: z.record(z.unknown()).optional(),
      })
    ),
    projectId: z.string(),
  }),
});

// ============================================
// Chat Schemas
// ============================================

export const SaveChatMessageResponseSchema = z.object({
  success: z.boolean(),
  messageId: z.string(),
});

export const GetChatHistoryResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    messages: z.array(
      z.object({
        id: z.string(),
        role: z.enum(['user', 'assistant']),
        content: z.string(),
        timestamp: z.string(),
      })
    ),
  }),
});

// ============================================
// Types
// ============================================

export type VersionResponse = z.infer<typeof VersionResponseSchema>;
export type GetExclusionsResponse = z.infer<typeof GetExclusionsResponseSchema>;
export type SaveChatMessageResponse = z.infer<
  typeof SaveChatMessageResponseSchema
>;
export type GetChatHistoryResponse = z.infer<
  typeof GetChatHistoryResponseSchema
>;
