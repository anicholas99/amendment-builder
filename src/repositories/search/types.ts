/**
 * Shared types and interfaces for search repository modules
 */

import { Prisma } from '@prisma/client/index.js';

// Type definitions for suggestions
export interface SuggestionInput {
  id?: string;
  type?: string;
  text?: string;
  priority?: string;
  [key: string]: unknown; // Allow additional fields
}

export interface CreatedSuggestion {
  id?: string;
  searchHistoryId: string;
  content: SuggestionInput; // The original suggestion object
  metadata: {
    type: string;
    priority: string;
  };
  status: string;
}

export interface SaveSuggestionsResult {
  createdSuggestions: CreatedSuggestion[];
  errors: { suggestion: SuggestionInput; error: string }[];
}

/**
 * Interface for raw suggestion data from the database
 */
export interface RawSuggestion {
  id: string;
  searchHistoryId: string;
  content: string;
  status: string;
  metadata: string | null;
  createdAt: Date;
  updatedAt: Date;
}
