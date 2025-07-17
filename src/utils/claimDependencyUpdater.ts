import { logger } from '@/utils/clientLogger';

/**
 * Mapping of old claim numbers to new claim numbers
 */
export interface ClaimNumberMapping {
  [oldNumber: string]: number;
}

/**
 * Updates claim dependency references in claim text based on renumbering
 *
 * @param claimText - The original claim text
 * @param numberMapping - Map of old claim numbers to new claim numbers
 * @returns Updated claim text with corrected dependencies
 */
export function updateClaimDependencies(
  claimText: string,
  numberMapping: ClaimNumberMapping
): string {
  // We need to be careful to match claim references but not change the actual numbers elsewhere
  // This pattern matches "claim" or "claims" followed by numbers
  let updatedText = claimText;

  // Sort mappings by old number in descending order to avoid replacing "10" when we meant "1"
  const sortedMappings = Object.entries(numberMapping).sort(
    ([a], [b]) => parseInt(b) - parseInt(a)
  );

  sortedMappings.forEach(([oldNum, newNum]) => {
    // Create specific patterns for each context
    const patterns = [
      // "claim X" or "Claim X" (with word boundary after number)
      new RegExp(`\\b(claims?\\s+)${oldNum}\\b`, 'gi'),
      // Numbers in ranges like "claims 2-4" (match the number after dash)
      new RegExp(`(claims?\\s+\\d+\\s*-\\s*)${oldNum}\\b`, 'gi'),
      // Numbers after "and" in lists like "claims 2, 3, and 4"
      new RegExp(`(\\band\\s+)${oldNum}\\b`, 'gi'),
      // Numbers after commas in lists like "claims 2, 3, 4"
      new RegExp(`(,\\s*)${oldNum}\\b`, 'gi'),
    ];

    patterns.forEach(pattern => {
      updatedText = updatedText.replace(pattern, (match, prefix) => {
        logger.debug('[ClaimDependencyUpdater] Updating claim reference', {
          oldNumber: oldNum,
          newNumber: newNum,
          match,
        });
        return prefix + newNum;
      });
    });
  });

  return updatedText;
}

/**
 * Creates a claim number mapping based on renumbering operations
 *
 * @param originalNumbers - Array of original claim numbers in order
 * @param updates - Array of {claimId, oldNumber, newNumber} updates
 * @returns Mapping of old numbers to new numbers
 */
export function createClaimNumberMapping(
  updates: Array<{ claimId: string; oldNumber: number; newNumber: number }>
): ClaimNumberMapping {
  const mapping: ClaimNumberMapping = {};

  // Build the mapping from updates
  updates.forEach(update => {
    mapping[update.oldNumber.toString()] = update.newNumber;
  });

  return mapping;
}

/**
 * Validates that claim dependencies are valid after renumbering
 *
 * @param claims - Array of claims with updated text
 * @returns Array of validation errors, empty if all valid
 */
export function validateClaimDependencies(
  claims: Array<{ number: number; text: string }>
): string[] {
  const errors: string[] = [];
  const existingNumbers = new Set(claims.map(c => c.number));

  claims.forEach(claim => {
    // Extract all claim number references
    const referencedNumbers: number[] = [];
    const pattern = /\bclaims?\s+(\d+)/gi;
    let match;

    while ((match = pattern.exec(claim.text)) !== null) {
      referencedNumbers.push(parseInt(match[1]));
    }

    // Check each referenced number
    referencedNumbers.forEach(refNum => {
      if (!existingNumbers.has(refNum)) {
        errors.push(
          `Claim ${claim.number} references non-existent claim ${refNum}`
        );
      }

      if (refNum >= claim.number) {
        errors.push(
          `Claim ${claim.number} has forward reference to claim ${refNum}`
        );
      }
    });
  });

  return errors;
}

/**
 * Batch update claim dependencies for multiple claims
 *
 * @param claims - Array of claims to update
 * @param numberMapping - Mapping of old to new claim numbers
 * @returns Updated claims with corrected dependencies
 */
export function batchUpdateClaimDependencies(
  claims: Array<{ id: string; number: number; text: string }>,
  numberMapping: ClaimNumberMapping
): Array<{ id: string; number: number; text: string; textUpdated: boolean }> {
  return claims.map(claim => {
    const updatedText = updateClaimDependencies(claim.text, numberMapping);
    const textUpdated = updatedText !== claim.text;

    if (textUpdated) {
      logger.info('[ClaimDependencyUpdater] Updated dependencies in claim', {
        claimNumber: claim.number,
        claimId: claim.id,
        changes: {
          before: claim.text.substring(0, 100),
          after: updatedText.substring(0, 100),
        },
      });
    }

    return {
      ...claim,
      text: updatedText,
      textUpdated,
    };
  });
}

/**
 * Detects self-references in a claim text
 *
 * @param claimNumber - The claim number
 * @param claimText - The claim text to check
 * @returns Object indicating if self-reference exists and what was found
 */
export function detectSelfReference(
  claimNumber: number,
  claimText: string
): { hasSelfReference: boolean; matches: string[] } {
  const matches: string[] = [];
  const pattern = new RegExp(`\\bclaims?\\s+${claimNumber}\\b`, 'gi');
  let match;

  while ((match = pattern.exec(claimText)) !== null) {
    matches.push(match[0]);
  }

  return {
    hasSelfReference: matches.length > 0,
    matches,
  };
}

/**
 * Removes self-references from a claim text
 *
 * @param claimNumber - The claim number
 * @param claimText - The claim text to fix
 * @returns Fixed claim text with self-references changed to "this claim"
 */
export function fixSelfReference(
  claimNumber: number,
  claimText: string
): string {
  // Replace "claim X" with "this claim" when X is the claim's own number
  const pattern = new RegExp(`\\b(claims?)\\s+${claimNumber}\\b`, 'gi');

  return claimText.replace(pattern, (match, claimWord) => {
    logger.info('[ClaimDependencyUpdater] Fixing self-reference', {
      claimNumber,
      original: match,
      replacement: 'this claim',
    });
    // Preserve the case of the original "claim" or "Claim"
    const thisClaimText =
      claimWord.charAt(0) === claimWord.charAt(0).toUpperCase()
        ? 'This claim'
        : 'this claim';
    return thisClaimText;
  });
}
