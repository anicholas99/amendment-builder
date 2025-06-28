/**
 * Claim Analysis Utilities
 *
 * Functions for analyzing patent claims
 */

import { InventionData } from '../../../types';

/**
 * Analyzes a claim for potential issues
 * @param claimText The text of the claim to analyze
 * @returns An array of issues found in the claim
 */
export const analyzeClaimIssues = (
  claimText: string
): Array<{
  type: 'warning' | 'error' | 'info';
  message: string;
  position?: [number, number]; // Start and end position in the text
}> => {
  const issues: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    position?: [number, number];
  }> = [];

  // Check for empty claim
  if (!claimText.trim()) {
    issues.push({
      type: 'error',
      message: 'Claim text cannot be empty',
    });
    return issues;
  }

  // Check for preamble
  if (
    !claimText.toLowerCase().includes('comprising') &&
    !claimText.toLowerCase().includes('consisting') &&
    !claimText.toLowerCase().includes('including')
  ) {
    issues.push({
      type: 'warning',
      message:
        'Claim may be missing a transitional phrase (e.g., "comprising", "consisting of")',
    });
  }

  // Check for proper formatting
  if (!isClaimProperlyFormatted(claimText)) {
    issues.push({
      type: 'warning',
      message:
        'Claim format may not be standard. Consider reviewing structure.',
    });
  }

  // Check for antecedent basis issues
  const antecedentBasisIssues = checkAntecedentBasis(claimText);
  issues.push(...antecedentBasisIssues);

  // Check for clarity issues
  const clarityIssues = checkClarity(claimText);
  issues.push(...clarityIssues);

  // Check for length issues
  if (claimText.length > 1500) {
    issues.push({
      type: 'warning',
      message:
        'Claim is very long. Consider breaking into multiple claims or simplifying.',
    });
  }

  return issues;
};

/**
 * Checks if a claim is properly formatted
 * @param claimText The text of the claim to analyze
 * @returns Boolean indicating if the claim is properly formatted
 */
export const isClaimProperlyFormatted = (claimText: string): boolean => {
  // Basic formatting checks
  // Period check disabled per user request
  // const isPeriodAtEnd = claimText.trim().endsWith('.');
  const startsWithArticle = /^(A|An|The)\s/i.test(claimText.trim());
  const hasSingleSentence = !claimText.includes('. ');

  return startsWithArticle && hasSingleSentence;
};

/**
 * Identifies the type of claim
 * @param claimText The text of the claim to analyze
 * @returns Object containing claim type information
 */
export const identifyClaimType = (
  claimText: string
): {
  isIndependent: boolean;
  dependsOn?: number;
  category:
    | 'system'
    | 'method'
    | 'apparatus'
    | 'composition'
    | 'product'
    | 'other';
} => {
  // Check if claim is dependent
  const dependencyMatch = claimText.match(/claim\s+(\d+)/i);
  const isIndependent = !dependencyMatch;

  // Determine claim category
  let category:
    | 'system'
    | 'method'
    | 'apparatus'
    | 'composition'
    | 'product'
    | 'other' = 'other';

  if (/method|process/i.test(claimText.substring(0, 50))) {
    category = 'method';
  } else if (/system/i.test(claimText.substring(0, 50))) {
    category = 'system';
  } else if (/apparatus|device/i.test(claimText.substring(0, 50))) {
    category = 'apparatus';
  } else if (/composition/i.test(claimText.substring(0, 50))) {
    category = 'composition';
  } else if (/product/i.test(claimText.substring(0, 50))) {
    category = 'product';
  }

  return {
    isIndependent,
    dependsOn: dependencyMatch ? parseInt(dependencyMatch[1], 10) : undefined,
    category,
  };
};

/**
 * Extracts elements from a claim
 * @param claimText The text of the claim to analyze
 * @returns Array of claim elements with positions
 */
export const extractClaimElements = (
  claimText: string
): Array<{
  element: string;
  description?: string;
  position: [number, number];
}> => {
  const elements: Array<{
    element: string;
    description?: string;
    position: [number, number];
  }> = [];

  // Simple extraction based on common format patterns
  // For method claims (steps)
  const methodSteps = claimText.match(/(\w+ing\s[^;.]+)[;,]/g);

  if (methodSteps) {
    methodSteps.forEach(step => {
      const startPos = claimText.indexOf(step);
      elements.push({
        element: step.trim(),
        position: [startPos, startPos + step.length],
      });
    });
  }

  // For apparatus/system claims (components)
  const components = claimText.match(/([a-z]+\s+for\s+[^;,]+)[;,]/g);

  if (components) {
    components.forEach(component => {
      const startPos = claimText.indexOf(component);
      elements.push({
        element: component.trim(),
        position: [startPos, startPos + component.length],
      });
    });
  }

  // Look for specific labeled elements
  const labeledElements = claimText.match(/a\s+([a-z-]+)\s+configured\s+to/g);

  if (labeledElements) {
    labeledElements.forEach(element => {
      const startPos = claimText.indexOf(element);
      elements.push({
        element: element.trim(),
        position: [startPos, startPos + element.length],
      });
    });
  }

  return elements;
};

/**
 * Validates claim dependencies
 * @param claims Record of claim number to claim text
 * @returns Array of issues with claim dependencies
 */
export const validateClaimDependencies = (
  claims: Record<string, string>
): Array<{
  claimNumber: string;
  issue: string;
}> => {
  const issues: Array<{
    claimNumber: string;
    issue: string;
  }> = [];

  // Track claim types for dependency validation
  const claimTypes = new Map<string, string>();

  // First pass: identify claim types
  Object.entries(claims).forEach(([claimNumber, text]) => {
    const type = identifyClaimType(text);
    if (type.isIndependent) {
      claimTypes.set(claimNumber, 'independent');
    } else {
      claimTypes.set(claimNumber, 'dependent');
    }
  });

  // Second pass: validate dependencies
  Object.entries(claims).forEach(([claimNumber, text]) => {
    const type = identifyClaimType(text);

    // Skip independent claims
    if (type.isIndependent) {
      return;
    }

    // Check if dependent claim references a non-existent claim
    if (type.dependsOn && !claims[type.dependsOn.toString()]) {
      issues.push({
        claimNumber,
        issue: `Depends on non-existent claim ${type.dependsOn}`,
      });
      return;
    }

    // Check for cyclic dependencies
    if (type.dependsOn) {
      const dependsOnText = claims[type.dependsOn.toString()];
      const dependsOnType = identifyClaimType(dependsOnText);

      if (
        !dependsOnType.isIndependent &&
        dependsOnType.dependsOn === parseInt(claimNumber)
      ) {
        issues.push({
          claimNumber,
          issue: `Cyclic dependency with claim ${type.dependsOn}`,
        });
      }
    }

    // Check if dependent claim is before the claim it depends on
    if (type.dependsOn && parseInt(claimNumber) < type.dependsOn) {
      issues.push({
        claimNumber,
        issue: `Dependent claim appears before claim ${type.dependsOn} that it depends on`,
      });
    }
  });

  return issues;
};

/**
 * Validates a set of claims
 * @param analyzedInvention Structured data containing claim information
 * @returns Validation result for the claim set
 */
export const validateClaimSet = (
  analyzedInvention: InventionData | null
): {
  isValid: boolean;
  hasIndependentClaim: boolean;
  hasDependentClaims: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  let hasIndependentClaim = false;
  let hasDependentClaims = false;

  if (!analyzedInvention || !analyzedInvention.claims) {
    return {
      isValid: false,
      hasIndependentClaim: false,
      hasDependentClaims: false,
      issues: ['No claims found'],
    };
  }

  // Handle either array or record format for claims
  const claims: Record<string, string> = Array.isArray(analyzedInvention.claims)
    ? analyzedInvention.claims.reduce(
        (acc, claim, index) => {
          acc[(index + 1).toString()] = claim;
          return acc;
        },
        {} as Record<string, string>
      )
    : (analyzedInvention.claims as unknown as Record<string, string>);

  const claimNumbers = Object.keys(claims);

  // Check if there are any claims
  if (claimNumbers.length === 0) {
    return {
      isValid: false,
      hasIndependentClaim: false,
      hasDependentClaims: false,
      issues: ['No claims found'],
    };
  }

  // Check for at least one independent claim
  for (const number of claimNumbers) {
    const claimText = claims[number];
    const type = identifyClaimType(claimText);

    if (type.isIndependent) {
      hasIndependentClaim = true;
    } else {
      hasDependentClaims = true;
    }
  }

  if (!hasIndependentClaim) {
    issues.push('No independent claims found');
  }

  // Validate dependencies
  const dependencyIssues = validateClaimDependencies(claims);
  if (dependencyIssues.length > 0) {
    issues.push(
      ...dependencyIssues.map(
        issue => `Claim ${issue.claimNumber}: ${issue.issue}`
      )
    );
  }

  // Validate individual claims
  for (const [number, text] of Object.entries(claims)) {
    const claimIssues = analyzeClaimIssues(text);
    if (claimIssues.length > 0) {
      issues.push(
        ...claimIssues.map(issue => `Claim ${number}: ${issue.message}`)
      );
    }
  }

  return {
    isValid: issues.length === 0,
    hasIndependentClaim,
    hasDependentClaims,
    issues,
  };
};

/**
 * Helper function to check antecedent basis issues
 */
const checkAntecedentBasis = (
  claimText: string
): Array<{
  type: 'warning' | 'error' | 'info';
  message: string;
  position?: [number, number];
}> => {
  const issues: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    position?: [number, number];
  }> = [];

  // Look for "the" + noun without previous introduction
  const theMatches = Array.from(claimText.matchAll(/the\s+([a-z-]+)/gi));
  const aMatches = Array.from(claimText.matchAll(/a\s+([a-z-]+)/gi));
  const anMatches = Array.from(claimText.matchAll(/an\s+([a-z-]+)/gi));

  const introducedNouns = new Set<string>();

  // Track introduced nouns
  [...aMatches, ...anMatches].forEach(match => {
    if (match[1]) {
      introducedNouns.add(match[1].toLowerCase());
    }
  });

  // Check for "the" + noun without introduction
  theMatches.forEach(match => {
    if (match[1] && !introducedNouns.has(match[1].toLowerCase())) {
      const position: [number, number] = [
        match.index || 0,
        (match.index || 0) + match[0].length,
      ];
      issues.push({
        type: 'warning',
        message: `"${match[0]}" may lack antecedent basis`,
        position,
      });
    }
  });

  return issues;
};

/**
 * Helper function to check clarity issues
 */
const checkClarity = (
  claimText: string
): Array<{
  type: 'warning' | 'error' | 'info';
  message: string;
  position?: [number, number];
}> => {
  const issues: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    position?: [number, number];
  }> = [];

  // Check for relative terms
  const relativeTerms = [
    'substantially',
    'relatively',
    'about',
    'approximately',
    'almost',
    'essentially',
    'effectively',
    'optionally',
    'preferably',
  ];

  relativeTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    const matches = Array.from(claimText.matchAll(regex));

    matches.forEach(match => {
      const position: [number, number] = [
        match.index || 0,
        (match.index || 0) + match[0].length,
      ];
      issues.push({
        type: 'warning',
        message: `"${match[0]}" is a relative term that may cause indefiniteness`,
        position,
      });
    });
  });

  // Check for potentially vague phrases
  const vagueRegex = /configured to|adapted to|capable of|means for/gi;
  const vagueMatches = Array.from(claimText.matchAll(vagueRegex));

  vagueMatches.forEach(match => {
    const position: [number, number] = [
      match.index || 0,
      (match.index || 0) + match[0].length,
    ];
    issues.push({
      type: 'info',
      message: `"${match[0]}" may need more specific functional language`,
      position,
    });
  });

  return issues;
};

/**
 * Extracts just the basic claim type from a claim text (e.g., "The computer-implemented method", "The system")
 * This is simpler than extractClaimPreamble and provides clean references for dependent claims
 * @param claimText The text of the claim to analyze
 * @returns The basic claim type (e.g., "The computer-implemented method", "The apparatus")
 */
export const extractClaimType = (claimText: string): string => {
  if (!claimText.trim()) {
    return 'The method';
  }

  // Clean up the claim text
  const cleanText = claimText.trim();

  // Look for common claim type patterns at the beginning
  const typePatterns = [
    // Method claims
    /^((?:A|An|The)\s+(?:computer-implemented\s+)?method)/i,
    /^((?:A|An|The)\s+method)/i,

    // System claims
    /^((?:A|An|The)\s+system)/i,
    /^((?:A|An|The)\s+computer\s+system)/i,

    // Apparatus claims
    /^((?:A|An|The)\s+apparatus)/i,
    /^((?:A|An|The)\s+device)/i,

    // Product claims
    /^((?:A|An|The)\s+product)/i,
    /^((?:A|An|The)\s+composition)/i,

    // Generic patterns
    /^((?:A|An|The)\s+[a-zA-Z\-]+(?:\s+[a-zA-Z\-]+)*?)(?:\s+(?:comprising|having|including|containing|for|configured|adapted))/i,
  ];

  // Try each pattern to extract the claim type
  for (const pattern of typePatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      const claimType = match[1].trim();
      // Convert from "A method" to "The method" for dependent claims
      return claimType.replace(/^(A|An)\s+/i, 'The ');
    }
  }

  // Fallback: try to extract the first few words that look like a claim type
  const firstWordsMatch = cleanText.match(
    /^((?:A|An|The)\s+[a-zA-Z\-]+(?:\s+[a-zA-Z\-]+){0,2})/i
  );
  if (firstWordsMatch && firstWordsMatch[1]) {
    const claimType = firstWordsMatch[1].trim();
    return claimType.replace(/^(A|An)\s+/i, 'The ');
  }

  // Final fallback
  return 'The method';
};

/**
 * Extracts the preamble from a claim text to determine the device/system type
 * @param claimText The text of the claim to analyze
 * @returns The preamble text (e.g., "The refrigerator system", "The apparatus")
 */
export const extractClaimPreamble = (claimText: string): string => {
  if (!claimText.trim()) {
    return 'The apparatus';
  }

  // Clean up the claim text
  const cleanText = claimText.trim();

  // For dependent claims, extract the preamble from the beginning
  // Look for patterns like "The refrigerator system of claim X" or "A refrigerator system"
  const dependentMatch = cleanText.match(
    /^(The\s+[^,]+?)(?:\s+of\s+claim\s+\d+)/i
  );
  if (dependentMatch) {
    return dependentMatch[1].trim();
  }

  // For independent claims, extract the preamble before "comprising"
  const independentMatch = cleanText.match(
    /^((?:A|An|The)\s+[^,]+?)(?:\s+(?:comprising|having|including|containing))/i
  );
  if (independentMatch) {
    const preamble = independentMatch[1].trim();
    // Convert from "A system" to "The system" for dependent claims
    return preamble.replace(/^(A|An)\s+/i, 'The ');
  }

  // Fallback: try to extract the first noun phrase
  const nounPhraseMatch = cleanText.match(
    /^((?:A|An|The)\s+[a-zA-Z\s\-]+?)(?:\s|,|;|\.)/i
  );
  if (nounPhraseMatch) {
    const preamble = nounPhraseMatch[1].trim();
    return preamble.replace(/^(A|An)\s+/i, 'The ');
  }

  // Final fallback
  return 'The apparatus';
};
