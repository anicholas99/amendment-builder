/**
 * Base API Response Schemas
 *
 * Shared schemas used across multiple domains
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

// --- Inferred Types ---
export type Pagination = z.infer<typeof PaginationSchema>;
