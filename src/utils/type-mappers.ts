import { PriorArtReference } from '@/types/domain/priorArt';
import { UnifiedPriorArt } from '@/types/domain/priorArt.unified';
import { v4 as uuidv4 } from 'uuid';

/**
 * Maps a PriorArtReference object to the canonical UnifiedPriorArt type.
 * Ensures that a unique ID exists.
 *
 * @param ref - The PriorArtReference object to map.
 * @returns A valid UnifiedPriorArt object.
 */
export function mapToUnifiedPriorArt(ref: PriorArtReference): UnifiedPriorArt {
  return {
    ...ref,
    id: ref.id || uuidv4(), // Ensure an ID exists
    patentNumber: ref.patentNumber || ref.number, // Handle both 'number' and 'patentNumber'
    relevance: ref.relevance,
  };
}

/**
 * Maps a UnifiedPriorArt object back to a PriorArtReference object.
 *
 * @param unified - The UnifiedPriorArt object to map.
 * @returns A PriorArtReference object.
 */
export function mapToPriorArtReference(
  unified: UnifiedPriorArt
): PriorArtReference {
  // Handle the source field - if it's 'Database', default to 'Manual'
  const source = unified.source === 'Database' ? 'Manual' : unified.source;

  // Explicitly construct the object to avoid type issues
  const result: PriorArtReference = {
    number: unified.patentNumber,
    patentNumber: unified.patentNumber,
    title: unified.title,
    source: source as 'GooglePatents' | 'PatBase' | 'Manual',
    relevance: unified.relevance || 0,
  };

  // Add optional fields only if they exist and are not null
  if (unified.id) result.id = unified.id;
  if (unified.abstract) result.abstract = unified.abstract;
  if (unified.url) result.url = unified.url;
  if (unified.year) result.year = unified.year;
  if (unified.authors) result.authors = unified.authors;
  if (unified.publicationDate && unified.publicationDate !== null) {
    result.publicationDate = unified.publicationDate;
  }
  if (unified.relevantText) result.relevantText = unified.relevantText;
  if (unified.claimOverlapScore !== undefined)
    result.claimOverlapScore = unified.claimOverlapScore;
  if (unified.CPCs) result.CPCs = unified.CPCs;
  if (unified.IPCs) result.IPCs = unified.IPCs;
  if (unified.otherFamilyMembers)
    result.otherFamilyMembers = unified.otherFamilyMembers;
  if (unified.isExcluded !== undefined) result.isExcluded = unified.isExcluded;
  if (unified.citationStatus && unified.citationStatus !== null) {
    result.citationStatus = unified.citationStatus;
  }
  if (unified.searchAppearanceCount !== undefined) {
    result.searchAppearanceCount = unified.searchAppearanceCount;
  }
  if (unified.isMock !== undefined) result.isMock = unified.isMock;

  return result;
}
