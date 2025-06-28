/**
 * Claim Generation Utilities
 *
 * Simple utility functions for claim processing
 */

import { ApplicationError, ErrorCode } from '@/lib/error';

// Type definitions for claim structures
export interface ClaimObject {
  text: string;
  [key: string]: unknown;
}

/**
 * Transforms a claim structure from API response format to the application's format
 * @param apiClaims The claims from the API response
 * @returns Transformed claims structure
 */
export const transformClaimStructure = (
  apiClaims: Record<string, string> | ClaimObject[] | unknown
): Record<string, string> => {
  if (!apiClaims) return {};

  // If it's already in the correct format, return as is
  if (typeof apiClaims === 'object' && !Array.isArray(apiClaims)) {
    const formattedClaims: Record<string, string> = {};

    // Ensure claim numbers are strings
    Object.entries(apiClaims as Record<string, unknown>).forEach(
      ([number, text]) => {
        formattedClaims[number.toString()] = text as string;
      }
    );

    return formattedClaims;
  }

  // If it's an array of claim objects
  if (Array.isArray(apiClaims)) {
    const formattedClaims: Record<string, string> = {};

    apiClaims.forEach((claim, index) => {
      const claimNumber = (index + 1).toString();

      if (typeof claim === 'string') {
        formattedClaims[claimNumber] = claim;
      } else if (claim && typeof claim === 'object' && 'text' in claim) {
        formattedClaims[claimNumber] = (claim as ClaimObject).text;
      }
    });

    return formattedClaims;
  }

  return {};
};

/**
 * Extracts key features from a claim to use for further generation
 * @param claimText The text of the claim to analyze
 * @returns Array of extracted features
 */
export const extractClaimFeatures = (claimText: string): string[] => {
  const features: string[] = [];

  // Simple feature extraction - split by semicolons and commas
  const parts = claimText.split(/[;,]/g).map(part => part.trim());

  parts.forEach(part => {
    // Remove trailing period if present
    const cleanPart = part.endsWith('.') ? part.slice(0, -1).trim() : part;

    if (
      cleanPart.length > 0 &&
      !cleanPart.toLowerCase().includes('comprising') &&
      !cleanPart.toLowerCase().includes('wherein')
    ) {
      features.push(cleanPart);
    }
  });

  return features;
};
