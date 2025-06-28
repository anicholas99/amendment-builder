/**
 * This file contains shared types for the 'citation' domain.
 * It leverages the Prisma-generated types to ensure consistency
 * with the database schema.
 */
import {
  CitationJob as PrismaCitationJob,
  CitationResult,
  CitationMatch,
} from '@prisma/client';

/**
 * Represents a full Citation Job, including its results and matches.
 * This type is suitable for use in client-side services and components.
 */
export type CitationJob = PrismaCitationJob & {
  results?: CitationResult[];
  matches?: CitationMatch[];
};
