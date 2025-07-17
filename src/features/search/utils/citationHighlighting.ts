import { stemmer } from 'stemmer';
import { CITATION_STOP_WORDS } from '../constants/citationConstants';

/**
 * Extracts stemmed keywords from text, filtering out stop words
 * @param text - The text to extract keywords from
 * @returns Array of stemmed keywords
 */
export function getStemmedKeywords(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .split(/[^a-zA-Z0-9]+/)
    .filter(word => word.length > 2 && !CITATION_STOP_WORDS.has(word))
    .map(word => stemmer(word));
}
