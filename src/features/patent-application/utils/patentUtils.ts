/**
 * Utility functions for handling patent-related data and formatting.
 */

/**
 * Normalizes a patent number by removing whitespace, hyphens, and other
 * common separators, and converting it to uppercase. This ensures consistency
 * for API lookups and database storage.
 *
 * @example
 * normalizePatentNumber('US 12/345,678 B2') // => 'US12345678'
 * normalizePatentNumber('EP0123456A1') // => 'EP0123456A1'
 *
 * @param patentNumber The raw patent number string.
 * @returns A normalized patent number string.
 */
export function normalizePatentNumber(patentNumber: string): string {
  if (!patentNumber) {
    return '';
  }
  // Remove all non-alphanumeric characters and convert to uppercase.
  return patentNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}
