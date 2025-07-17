import {
  PriorArtReference,
  ProcessedSavedPriorArt,
  SavedPriorArt,
  SavedCitationUI,
} from '@/types/domain/priorArt';
import { logger } from '@/utils/clientLogger';

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
  savedArtArray: any[]
): ProcessedSavedPriorArt[] {
  if (!Array.isArray(savedArtArray)) return [];

  return savedArtArray.map(savedArt => {
    const priorArtData = processSavedPriorArt(savedArt);

    // Process savedCitations - handle both relation data and legacy JSON data
    let savedCitations: SavedCitationUI[] = [];

    if (
      Array.isArray(savedArt.savedCitations) &&
      savedArt.savedCitations.length > 0
    ) {
      // Use the relation data (new format)
      savedCitations = savedArt.savedCitations.map((citation: any) => ({
        elementText: citation.elementText || '',
        citation: citation.citationText || '', // Note: relation uses citationText, UI uses citation
        location: citation.location || null,
        reasoning: citation.reasoning || null,
      }));
    } else if (savedArt.savedCitationsData) {
      // Fallback to legacy JSON data
      try {
        const parsedCitations = JSON.parse(savedArt.savedCitationsData);
        if (Array.isArray(parsedCitations)) {
          savedCitations = parsedCitations.map((citation: any) => ({
            elementText: citation.elementText || '',
            citation: citation.citation || '',
            location: citation.location || null,
            reasoning: citation.reasoning || null,
          }));
        }
      } catch (error) {
        // Silently handle parse errors
      }
    }

    return {
      id: savedArt.id,
      projectId: savedArt.projectId,
      patentNumber: savedArt.patentNumber,
      title: savedArt.title,
      abstract: savedArt.abstract,
      url: savedArt.url,
      notes: savedArt.notes,
      authors: savedArt.authors,
      publicationDate: savedArt.publicationDate,
      savedAt: savedArt.savedAt,
      claim1: savedArt.claim1,
      summary: savedArt.summary,
      priorArtData,
      savedCitations,
    };
  });
}

// Helper to check if a prior art entry has valid data
export function isValidPriorArt(priorArt: PriorArtReference): boolean {
  return !!(priorArt.number && priorArt.title);
}
