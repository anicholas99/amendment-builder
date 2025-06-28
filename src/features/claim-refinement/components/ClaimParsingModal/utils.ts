import { ParsedElement, InventionData } from './types';
import { logger } from '@/lib/monitoring/logger';
import { claimClientService } from '@/client/services/claim.client-service';

/**
 * Copies a query to the clipboard
 * @param text The text to copy
 * @returns Promise that resolves when copying is complete
 */
export const copyToClipboard = (text: string): Promise<void> => {
  return navigator.clipboard.writeText(text);
};

/**
 * Generate search queries based on the parsed elements and invention data
 * @param parsedElements The parsed elements with emphasis flags
 * @param inventionData The invention data for context
 * @returns Promise with the generated search queries
 */
// export const generateSearchQueries = async (
//   parsedElements: ParsedElement[],
//   inventionData: InventionData
// ): Promise<string[]> => {
//   try {
//     const apiParsedElements = parsedElements.map((el, index) => ({
//       id: String(index),
//       text: el.text,
//       type: el.label,
//     }));

//     const data = await ClaimApiService.generateQueries({
//       parsedElements: apiParsedElements,
//       inventionData,
//     });
//     return data.queries || [];
//   } catch (error) {
//     logger.error('Error generating queries', { error });
//     throw error;
//   }
// };

export const parseClaimText = async (claimText: string) => {
  if (!claimText.trim()) {
    throw new Error('Claim text cannot be empty.');
  }
  // const response = await claimClientService.parseClaim(claimText);
  // return response.parsed;
  return { placeholder: 'parsed' }; // Returning placeholder
};

/**
 * Saves the parsed elements by updating the invention data.
 */
export const saveParsedElements = async (
  projectId: string,
  parsedElements: ParsedElement[]
) => {
  if (!parsedElements || parsedElements.length === 0) {
    throw new Error('No parsed elements to save.');
  }

  // await ClaimApiService.updateInventionData(projectId, {
  //   elements: parsedElements,
  // });
};
