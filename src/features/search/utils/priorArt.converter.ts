/**
 * @fileoverview Provides utility functions for converting various prior art
 * types into the canonical UnifiedPriorArt type. This is a critical part
 * of the type harmonization effort, ensuring data consistency across the app.
 */

import {
  PriorArtReference,
  SavedPriorArt,
  ProcessedSavedPriorArt,
  SavedCitationUI,
} from '@/types/domain/priorArt';
import { UnifiedPriorArt } from '@/types/domain/priorArt.unified';
import { v4 as uuidv4 } from 'uuid';
import { safeJsonParse } from '@/utils/jsonUtils';
import { logger } from '@/utils/clientLogger';

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
export function fromSavedPriorArt(saved: any): UnifiedPriorArt {
  // Process savedCitations - handle both relation data and legacy JSON data
  let savedCitations: SavedCitationUI[] = [];

  if (Array.isArray(saved.savedCitations) && saved.savedCitations.length > 0) {
    // Use the relation data (new format)
    savedCitations = saved.savedCitations.map((citation: any) => ({
      elementText: citation.elementText || '',
      citation: citation.citationText || '', // Note: relation uses citationText, UI uses citation
      location: citation.location || null,
      reasoning: citation.reasoning || null,
    }));
  } else if (saved.savedCitationsData) {
    // Fallback to legacy JSON data
    try {
      const parsedCitations = JSON.parse(saved.savedCitationsData);
      if (Array.isArray(parsedCitations)) {
        savedCitations = parsedCitations.map((citation: any) => ({
          elementText: citation.elementText || '',
          citation: citation.citation || '',
          location: citation.location || null,
          reasoning: citation.reasoning || null,
        }));
      }
    } catch (error) {
      logger.error('Failed to parse savedCitationsData:', error);
    }
  }

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
    savedCitations,
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
  return savedArt.map((art: any) => {
    // Process savedCitations - handle both relation data and legacy JSON data
    let savedCitations: SavedCitationUI[] = [];

    if (Array.isArray(art.savedCitations) && art.savedCitations.length > 0) {
      // Use the relation data (new format)
      savedCitations = art.savedCitations.map((citation: any) => ({
        elementText: citation.elementText || '',
        citation: citation.citationText || '', // Note: relation uses citationText, UI uses citation
        location: citation.location || null,
        reasoning: citation.reasoning || null,
      }));
    } else if (art.savedCitationsData) {
      // Fallback to legacy JSON data
      try {
        const parsedCitations = JSON.parse(art.savedCitationsData);
        if (Array.isArray(parsedCitations)) {
          savedCitations = parsedCitations.map((citation: any) => ({
            elementText: citation.elementText || '',
            citation: citation.citation || '',
            location: citation.location || null,
            reasoning: citation.reasoning || null,
          }));
        }
      } catch (error) {
        logger.error('Failed to parse savedCitationsData:', error);
      }
    }

    return {
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
      // Use the processed savedCitations array
      savedCitations,
    };
  });
}
