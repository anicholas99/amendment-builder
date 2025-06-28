/**
 * PatBase Utility Functions
 *
 * Centralized utilities for PatBase API integration to avoid code duplication
 * across multiple API endpoints.
 */

/**
 * Format date from YYYYMMDD to readable YYYY-MM-DD format
 * @param dateStr - Date string in YYYYMMDD format
 * @returns Formatted date string in YYYY-MM-DD format or empty string if invalid
 */
export function formatPatbaseDate(dateStr: string): string {
  if (!dateStr || dateStr.length !== 8) return '';

  try {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);

    // Return formatted date (YYYY-MM-DD)
    return `${year}-${month}-${day}`;
  } catch (error) {
    return '';
  }
}

/**
 * Strip HTML tags from text content
 * @param text - Text that may contain HTML tags
 * @returns Clean text with HTML tags removed
 */
export function stripHtmlTags(text: string): string {
  if (!text) return '';
  return text.replace(/<\/?[^>]+(>|$)/g, '').trim();
}
