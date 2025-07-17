/**
 * Search & Citation API Response Schemas
 *
 * Schemas related to search history, citation matching, and location results
 */

import { z } from 'zod';

// ============================================
// Search & Citation Schemas
// ============================================

export const SearchHistoryEntrySchema = z.object({
  id: z.string(),
  parsedElementsFromVersion: z.array(z.string()).optional(),
  parsedElements: z.array(z.string()).optional(),
  projectId: z.string().optional(),
  searchQuery: z.string().optional(),
  createdAt: z.string().datetime().optional(),
});

export const CitationLocationResultSchema = z.object({
  id: z.string(),
  status: z.number(),
  locations: z
    .array(
      z.object({
        page: z.number().optional(),
        section: z.string().optional(),
        context: z.string().optional(),
      })
    )
    .optional(),
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
  locationDataRaw: z.string().optional(),
});

export const CitationMatchesListSchema = z.array(CitationMatchSchema);

// --- Inferred Types ---
export type SearchHistoryEntry = z.infer<typeof SearchHistoryEntrySchema>;
export type CitationLocationResult = z.infer<
  typeof CitationLocationResultSchema
>;
export type CitationMatch = z.infer<typeof CitationMatchSchema>;
export type CitationMatchesList = z.infer<typeof CitationMatchesListSchema>;
