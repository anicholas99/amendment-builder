/**
 * Format a publication date string from YYYYMMDD format
 */
export function formatPublicationDate(
  dateString: string | null | undefined
): string {
  if (!dateString || dateString.length !== 8) {
    return 'N/A';
  }
  // Assuming format YYYYMMDD
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  return `${year}-${month}-${day}`;
}

/**
 * Safe date parsing that handles multiple formats
 */
export function parseAndFormatDate(
  dateString: string | null | undefined
): string {
  if (!dateString) return 'No date';

  try {
    // If it's in YYYYMMDD format (8 digits)
    if (/^\d{8}$/.test(dateString)) {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      return `${year}-${month}-${day}`;
    }

    // Try standard ISO parsing
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString();
  } catch (e) {
    // If all parsing fails, just return the original string
    return dateString;
  }
}

/**
 * Remove dashes from reference numbers
 */
export function removeDashes(referenceNumber: string): string {
  return referenceNumber.replace(/-/g, '');
}
