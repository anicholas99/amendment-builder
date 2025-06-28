import {
  PriorArtReference,
  ProcessedSavedPriorArt,
  SavedPriorArt,
  SavedCitationUI,
} from '@/types/domain/priorArt';
import { logger } from '@/lib/monitoring/logger';

export function processSavedPriorArt(
  savedArt: SavedPriorArt
): PriorArtReference {
  const priorArtReference: PriorArtReference = {
    number: savedArt.patentNumber,
    patentNumber: savedArt.patentNumber,
    title: savedArt.title || 'No Title Provided',
    abstract: savedArt.abstract || undefined,
    url: savedArt.url || undefined,
    authors: savedArt.authors ? savedArt.authors.split(', ') : [],
    year: savedArt.publicationDate
      ? new Date(savedArt.publicationDate).getFullYear().toString()
      : undefined,
    publicationDate: savedArt.publicationDate || undefined,
    source: 'Manual',
    relevance: 1.0, // Manually saved art is always considered relevant
    notes: savedArt.notes || undefined,
  };
  return priorArtReference;
}

export function serializePriorArtData(priorArt: PriorArtReference): string {
  return JSON.stringify(priorArt);
}

// Helper to process an array of saved prior art entries
export function processSavedPriorArtArray(
  savedArtArray: SavedPriorArt[]
): ProcessedSavedPriorArt[] {
  if (!Array.isArray(savedArtArray)) return [];
  return savedArtArray.map(savedArt => {
    const priorArtData = processSavedPriorArt(savedArt);
    const { savedCitationsData, ...rest } = savedArt;

    let savedCitations: SavedCitationUI[] = [];
    if (savedCitationsData) {
      try {
        savedCitations = JSON.parse(savedCitationsData);
        logger.info('[processSavedPriorArtArray] Parsed saved citations:', {
          patentNumber: savedArt.patentNumber,
          citationsCount: savedCitations.length,
          firstCitation: savedCitations[0],
        });
      } catch (error) {
        logger.error('[processSavedPriorArtArray] Failed to parse savedCitationsData:', {
          patentNumber: savedArt.patentNumber,
          error,
          savedCitationsData,
        });
      }
    }

    return {
      ...rest,
      priorArtData,
      savedCitations,
    };
  });
}

// Helper to check if a prior art entry has valid data
export function isValidPriorArt(priorArt: PriorArtReference): boolean {
  return !!(priorArt.number && priorArt.title);
}
