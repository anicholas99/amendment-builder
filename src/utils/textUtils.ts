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
