/**
 * @fileoverview Provides utility functions for converting various prior art
 * types into the canonical UnifiedPriorArt type. This is a critical part
 * of the type harmonization effort, ensuring data consistency across the app.
 */

import {
  PriorArtReference,
  SavedPriorArt,
  ProcessedSavedPriorArt,
} from '@/types/domain/priorArt';
import { UnifiedPriorArt } from '@/types/domain/priorArt.unified';
import { v4 as uuidv4 } from 'uuid';
import { safeJsonParse } from '@/utils/json-utils';

/**
 * Converts a raw PriorArtReference (from a search API) to the canonical UnifiedPriorArt type.
 */
export function fromPriorArtReference(ref: PriorArtReference): UnifiedPriorArt {
  // The 'as any' is a temporary workaround for the index signature issue
  const refAsAny = ref as any;

  return {
    id: refAsAny.id || uuidv4(),
    patentNumber: ref.patentNumber || ref.number,
    source: ref.source,
    title: ref.title,
    abstract: ref.abstract,
    url: ref.url || ref.sourceUrl,
    publicationDate:
      refAsAny.publicationDate || (ref.year ? `${ref.year}-01-01` : null),
    year: ref.year,
    authors: Array.isArray(ref.authors)
      ? ref.authors
      : ref.authors
        ? [ref.authors]
        : [],
    relevance: ref.relevance,
    claimOverlapScore: ref.claimOverlapScore,
    relevantText: ref.relevantText,
    CPCs: ref.CPCs,
    IPCs: ref.IPCs,
    otherFamilyMembers: ref.otherFamilyMembers,
    citationStatus: ref.citationStatus,
    searchAppearanceCount: ref.searchAppearanceCount,
    isExcluded: ref.isExcluded,
    isMock: ref.isMock,
  };
}

/**
 * Converts a SavedPriorArt record (from the database) to the canonical UnifiedPriorArt type.
 */
export function fromSavedPriorArt(saved: SavedPriorArt): UnifiedPriorArt {
  return {
    id: saved.id,
    patentNumber: saved.patentNumber,
    source: 'Database',
    title: saved.title || 'No Title Provided',
    abstract: saved.abstract || undefined,
    url: saved.url || undefined,
    publicationDate: saved.publicationDate,
    year: saved.publicationDate
      ? new Date(saved.publicationDate).getFullYear().toString()
      : undefined,
    authors: saved.authors ? saved.authors.split(', ') : undefined,
    relevance: 1.0, // Saved art is considered highly relevant
    notes: saved.notes,
    savedAt: saved.savedAt,
    savedCitations: saved.savedCitationsData
      ? JSON.parse(saved.savedCitationsData)
      : [],
    claim1: saved.claim1,
    summary: saved.summary,
  };
}

/**
 * Converts a ProcessedSavedPriorArt object (UI-ready) to the canonical UnifiedPriorArt type.
 * This is the most comprehensive conversion, combining DB data and search data.
 */
export function fromProcessedSavedPriorArt(
  processed: ProcessedSavedPriorArt
): UnifiedPriorArt {
  const fromDb = fromSavedPriorArt(processed);
  const fromApi = fromPriorArtReference(processed.priorArtData);

  // Combine them, giving preference to the database record for core metadata
  // but enriching with API data.
  return {
    ...fromApi,
    ...fromDb,
    id: processed.id, // Ensure DB id is preserved
    patentNumber: processed.patentNumber, // Ensure DB patent number is preserved
  };
}

export function toProcessedSavedPriorArt(
  savedArt: SavedPriorArt[]
): ProcessedSavedPriorArt[] {
  if (!Array.isArray(savedArt)) {
    return [];
  }
  return savedArt.map(art => ({
    ...art,
    priorArtData: {
      number: art.patentNumber,
      patentNumber: art.patentNumber,
      title: art.title || 'No title available',
      abstract: art.abstract || '',
      source: 'PatBase', // Assume PatBase for saved art, can be changed
      relevance: 1, // Assume high relevance for saved art
      url: art.url || '',
      publicationDate: art.publicationDate || undefined,
      authors: art.authors ? art.authors.split(', ') : [],
    },
    savedCitations: safeJsonParse(art.savedCitationsData || '[]') || [],
  }));
}
