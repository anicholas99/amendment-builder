/**
 * Claim Validation Utilities
 *
 * Functions for validating patent claims
 */

/**
 * Validates claim text for common issues
 * @param claimText The text of the claim to validate
 * @returns Object containing validation results
 */
export const validateClaimText = (
  claimText: string
): {
  valid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];

  // Check for empty claim
  if (!claimText.trim()) {
    issues.push('Claim text cannot be empty');
    return { valid: false, issues };
  }

  // Check for self-references
  if (/(the\s+present\s+invention|this\s+invention)/i.test(claimText)) {
    issues.push('Claim contains self-reference to "the invention"');
  }

  // Check for proper ending - DISABLED per user request
  // if (!claimText.trim().endsWith('.')) {
  //   issues.push('Claim should end with a period');
  // }

  // Check for multiple sentences
  const sentences = claimText.match(/[^.!?]+[.!?]+/g) || [];
  if (sentences.length > 1) {
    issues.push('Claim should be a single sentence');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
};

/**
 * Finds dependencies between claims
 * @param claims Record of claim number to claim text
 * @returns Map of claim numbers to their dependent claims
 */
export const findClaimDependencies = (
  claims: Record<string, string>
): Map<string, string[]> => {
  const dependencyMap = new Map<string, string[]>();

  // Initialize map with all claim numbers
  Object.keys(claims).forEach(claimNumber => {
    dependencyMap.set(claimNumber, []);
  });

  // Find dependencies
  Object.entries(claims).forEach(([claimNumber, text]) => {
    // Look for "as claimed in claim X" or similar patterns
    const dependencyMatch = text.match(/claim\s+(\d+)/i);

    if (dependencyMatch && dependencyMatch[1]) {
      const dependsOn = dependencyMatch[1];

      // Add to the list of claims that depend on the parent
      if (dependencyMap.has(dependsOn)) {
        const dependents = dependencyMap.get(dependsOn) || [];
        dependents.push(claimNumber);
        dependencyMap.set(dependsOn, dependents);
      }
    }
  });

  return dependencyMap;
};

/**
 * Sorts claim numbers numerically
 * @param claimNumbers Array of claim numbers as strings
 * @returns Sorted array of claim numbers
 */
export const sortClaimNumbers = (claimNumbers: string[]): string[] => {
  return claimNumbers.sort((a, b) => parseInt(a) - parseInt(b));
};

/**
 * Formats a date string into a more readable format
 * @param dateString Date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return dateString;
  }
};
