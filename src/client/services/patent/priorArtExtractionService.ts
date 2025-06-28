import { logger } from '@/lib/monitoring/logger';
import { InventionData } from '@/types';

/**
 * Prior art reference extracted from invention disclosure
 */
interface ExtractedPriorArt {
  patentNumber?: string;
  reference: string;
  context?: string;
  relevance?: string;
}

/**
 * Extracts prior art references from analyzed invention data
 */
export function extractPriorArtFromInventionData(
  inventionData: InventionData
): ExtractedPriorArt[] {
  const extractedReferences: ExtractedPriorArt[] = [];

  const priorArtList = inventionData.priorArt || inventionData.prior_art;

  // Check if prior_art exists and is an array
  if (Array.isArray(priorArtList)) {
    priorArtList.forEach((art: any) => {
      if (art && typeof art === 'object') {
        extractedReferences.push({
          patentNumber: art.patentNumber,
          reference: art.reference || art.patentNumber || 'Unknown',
          context: art.context,
          relevance: art.relevance,
        });
      }
    });
  }

  return extractedReferences;
}
