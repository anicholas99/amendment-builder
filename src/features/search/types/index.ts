import { SearchResult } from '../../../types/claimTypes';
import { PriorArtReference } from '@/types/domain/priorArt';

// Export the consolidated SearchHistoryEntry from domain
export type {
  SearchHistoryEntry,
  ProcessedSearchHistoryEntry,
} from '@/types/domain/searchHistory';

// Export SavedPriorArt from domain
export type {
  SavedPriorArt,
  ProcessedSavedPriorArt,
} from '@/types/domain/priorArt';

/**
 * Interface for a saved citation match associated with a prior art reference
 */
export interface SavedCitation {
  elementText: string;
  citation: string;
  location?: string; // Formatted location string
  reasoning?: string; // Reasoning summary
}
