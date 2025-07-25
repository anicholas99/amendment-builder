/**
 * Simple approximation: characters / 4 roughly equals tokens.
 * @param text The input string.
 * @returns The estimated number of tokens.
 */
export const estimateTokens = (text: string): number =>
  Math.ceil((text || '').length / 4);

/**
 * Splits text into paragraphs based on double newlines or basic HTML paragraph tags.
 * Also removes HTML tags and trims whitespace.
 * @param text The input string.
 * @returns An array of paragraphs.
 */
export const splitIntoParagraphs = (text: string | undefined): string[] => {
  if (!text) return [];
  // Split by double newlines OR <p> tags (case-insensitive), remove HTML tags, trim, filter empty
  return text
    .split(/\n\s*\n|<p>|<\/p>/i)
    .map(p => p.replace(/<[^>]*>/g, '').trim())
    .filter(p => p.length > 0);
};

/**
 * Extracts the first independent claim from a claims text string.
 * Assumes claims are numbered and removes HTML tags.
 * @param claimsText The claims text, possibly containing HTML.
 * @returns An array containing only the first independent claim, or an empty array if none is found.
 */
export const extractIndependentClaims = (
  claimsText: string | undefined
): string[] => {
  if (!claimsText) return [];

  // 1. Strip all HTML tags
  const plainTextClaims = claimsText.replace(/<[^>]*>/g, '');

  // 2. Split into lines
  const lines = plainTextClaims.split(/\r?\n/);

  // 3. Find the FIRST line that matches the independent claim pattern
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (/^\s*\d+\.\s+/.test(trimmedLine)) {
      // Found the first independent claim, return it as a single-element array
      return [trimmedLine];
    }
  }

  // 4. If no matching line is found after checking all lines, return empty array
  return [];
};

/**
 * Cleans OCR text by removing common OCR artifacts before storing in database
 * - Removes strikethrough text marked with [[word]] format
 * - Removes unwanted quotation marks around common OCR errors
 * @param text The raw OCR text to clean
 * @returns Cleaned text ready for storage and AI processing
 */
export const cleanOCRText = (text: string | undefined): string => {
  if (!text) return '';

  let cleanedText = text;

  // Remove strikethrough text marked with [[word]] format
  cleanedText = cleanedText.replace(/\[\[([^\]]*)\]\]/g, '');

  // Remove unwanted quotation marks that are clearly OCR artifacts
  // Pattern 1: Remove multiple consecutive quotes (like " " " or " " )
  cleanedText = cleanedText.replace(/"\s*"\s*"/g, '');
  cleanedText = cleanedText.replace(/"\s*"/g, '');
  
  // Pattern 2: Remove quotes that appear isolated with spaces around them
  cleanedText = cleanedText.replace(/\s+"\s+/g, ' ');
  
  // Pattern 3: Remove quotes at the beginning of words (common OCR error)
  cleanedText = cleanedText.replace(/\s+"\s*(\w)/g, ' $1');
  
  // Pattern 4: Remove quotes at the end of words followed by space
  cleanedText = cleanedText.replace(/(\w)\s*"\s+/g, '$1 ');
  
  // Pattern 5: Remove isolated quotes between words
  cleanedText = cleanedText.replace(/(\w)\s*"\s*(\w)/g, '$1 $2');
  
  // Pattern 6: Remove any remaining stray quotes at word boundaries
  cleanedText = cleanedText.replace(/(\w)\s*"\s*/g, '$1 ');
  cleanedText = cleanedText.replace(/\s*"\s*(\w)/g, ' $1');

  // Clean up multiple spaces but preserve line structure
  cleanedText = cleanedText.replace(/[ \t]+/g, ' ');
  
  // Trim whitespace from each line but preserve line breaks
  cleanedText = cleanedText.split('\n').map(line => line.trim()).join('\n');

  // Remove excessive blank lines (more than 2 consecutive)
  cleanedText = cleanedText.replace(/\n\s*\n\s*\n+/g, '\n\n');

  return cleanedText.trim();
};
