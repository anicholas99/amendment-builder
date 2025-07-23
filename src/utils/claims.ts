/**
 * Utility functions for handling claim numbers and formatting
 */

/**
 * Converts an array of claim numbers/strings to abbreviated ranges
 * @param claims Array of claim numbers (as strings or numbers)
 * @returns Abbreviated string like "1-7, 9, 13-19"
 * 
 * @example
 * abbreviateClaimRanges(['1', '2', '3', '4', '5', '7', '8']) 
 * // Returns "1-5, 7-8"
 * 
 * abbreviateClaimRanges(['1', '3', '5', '7']) 
 * // Returns "1, 3, 5, 7"
 * 
 * abbreviateClaimRanges(['10', '11', '12', '13', '15', '20', '21', '22'])
 * // Returns "10-13, 15, 20-22"
 */
export function abbreviateClaimRanges(claims: (string | number)[]): string {
  if (!claims || claims.length === 0) {
    return '';
  }

  // Convert to numbers and sort
  const numbers = claims
    .map(claim => {
      const num = typeof claim === 'string' ? parseInt(claim, 10) : claim;
      return isNaN(num) ? null : num;
    })
    .filter((num): num is number => num !== null)
    .sort((a, b) => a - b);

  if (numbers.length === 0) {
    return '';
  }

  // Remove duplicates
  const uniqueNumbers = [...new Set(numbers)];

  const ranges: string[] = [];
  let start = uniqueNumbers[0];
  let end = start;

  for (let i = 1; i <= uniqueNumbers.length; i++) {
    const current = uniqueNumbers[i];
    
    // If we've reached the end or there's a gap in the sequence
    if (i === uniqueNumbers.length || current !== end + 1) {
      // Add the current range to results
      if (start === end) {
        // Single number
        ranges.push(start.toString());
      } else if (end === start + 1) {
        // Two consecutive numbers - show as "1, 2" instead of "1-2"
        ranges.push(`${start}, ${end}`);
      } else {
        // Range of 3 or more - show as "1-5"
        ranges.push(`${start}-${end}`);
      }
      
      // Start new range if we haven't reached the end
      if (i < uniqueNumbers.length) {
        start = current;
        end = current;
      }
    } else {
      // Continue the current range
      end = current;
    }
  }

  return ranges.join(', ');
}

/**
 * Parses a claim range string back into an array of numbers
 * @param rangeString String like "1-7, 9, 13-19"
 * @returns Array of claim numbers
 * 
 * @example
 * parseClaimRanges("1-5, 7-8")
 * // Returns [1, 2, 3, 4, 5, 7, 8]
 */
export function parseClaimRanges(rangeString: string): number[] {
  if (!rangeString || typeof rangeString !== 'string') {
    return [];
  }

  const claims: number[] = [];
  const parts = rangeString.split(',').map(part => part.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      // Handle range like "1-5"
      const [startStr, endStr] = part.split('-').map(s => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          claims.push(i);
        }
      }
    } else {
      // Handle single number
      const num = parseInt(part, 10);
      if (!isNaN(num)) {
        claims.push(num);
      }
    }
  }

  return [...new Set(claims)].sort((a, b) => a - b);
}

/**
 * Validates if a claim number is valid
 * @param claim Claim number to validate
 * @returns true if valid
 */
export function isValidClaimNumber(claim: string | number): boolean {
  const num = typeof claim === 'string' ? parseInt(claim, 10) : claim;
  return !isNaN(num) && num > 0 && Number.isInteger(num);
}

/**
 * Formats claim numbers for display with proper grammar
 * @param claims Array of claim numbers
 * @param abbreviate Whether to use range abbreviation
 * @returns Formatted string with proper "Claim" vs "Claims" grammar
 * 
 * @example
 * formatClaimsDisplay(['1']) // Returns "Claim 1"
 * formatClaimsDisplay(['1', '2', '3']) // Returns "Claims 1-3"
 * formatClaimsDisplay(['1', '3', '5']) // Returns "Claims 1, 3, 5"
 */
export function formatClaimsDisplay(
  claims: (string | number)[], 
  abbreviate: boolean = true
): string {
  if (!claims || claims.length === 0) {
    return '';
  }

  const claimText = claims.length === 1 ? 'Claim' : 'Claims';
  const claimNumbers = abbreviate 
    ? abbreviateClaimRanges(claims)
    : claims.join(', ');

  return `${claimText} ${claimNumbers}`;
} 