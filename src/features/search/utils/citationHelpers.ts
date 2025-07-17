/**
 * Utility functions for citation processing
 */

/**
 * Normalizes patent numbers by removing hyphens and converting to uppercase
 * @param patentNumber - The patent number to normalize
 * @returns The normalized patent number
 */
export const normalizePatentNumber = (patentNumber: string): string => {
  return patentNumber.replace(/-/g, '').toUpperCase();
};
