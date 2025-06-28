/**
 * Claim Elements API Types - V2 Migration
 *
 * This file contains the new simplified claim element types for V2
 * while maintaining backward compatibility with V1 during migration.
 */

/**
 * V2 Claim Elements - Simplified string array format
 */
export interface ClaimElementsV2 {
  /** Simple array of claim element strings */
  elements: string[];
  /** Version identifier for API compatibility */
  version: '2.0.0';
}

/**
 * Union type alias for claim elements (now only V2)
 */
export type ClaimElements = ClaimElementsV2;

/**
 * Type guard to check if claim elements are valid V2 format
 */
export function isClaimElementsV2(
  elements: unknown
): elements is ClaimElementsV2 {
  return (
    typeof elements === 'object' &&
    elements !== null &&
    'version' in elements &&
    (elements as any).version === '2.0.0' &&
    'elements' in elements &&
    Array.isArray((elements as any).elements)
  );
}

/**
 * V2 Claim Parsing Request - simplified format
 */
export interface ClaimParsingRequestV2 {
  projectId: string;
  claimText: string;
  claimData?: Record<string, string>; // Optional additional claims for context
}

/**
 * V2 Claim Parsing Response - returns simple string array
 */
export interface ClaimParsingResponseV2 {
  elements: string[];
  timestamp: string;
  projectId: string;
}

/**
 * V2 Query Generation Request - uses string array input
 */
export interface QueryGenerationRequestV2 {
  projectId: string;
  elements: string[]; // Simple string array instead of ParsedElement[]
}

/**
 * V2 Query Generation Response
 */
export interface QueryGenerationResponseV2 {
  queries: string[];
  timestamp: string;
  projectId: string;
}

/**
 * Type guards for V2 formats
 */
export function isV2Format(elements: unknown): elements is string[] {
  return (
    Array.isArray(elements) &&
    elements.length > 0 &&
    elements.every(el => typeof el === 'string')
  );
}

/**
 * Normalize various formats to V2 (string array)
 */
export function normalizeToV2(elements: unknown): string[] {
  // If already V2 format
  if (isV2Format(elements)) {
    return elements;
  }

  // If V1 format (array of objects with text property)
  if (Array.isArray(elements) && elements.length > 0) {
    const normalized = elements
      .map(el => {
        if (typeof el === 'object' && el !== null && 'text' in el) {
          return (el as any).text;
        }
        return typeof el === 'string' ? el : null;
      })
      .filter(
        (text): text is string => text !== null && text.trim().length > 0
      );

    if (normalized.length > 0) {
      return normalized;
    }
  }

  // If single string, split by common delimiters
  if (typeof elements === 'string' && elements.trim()) {
    return elements
      .split(/[;,]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  return [];
}

/**
 * Error response for V2 endpoints
 */
export interface ClaimElementsErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
}

/**
 * Common request options for V2 endpoints
 */
export interface ClaimElementsRequestOptions {
  includeMetadata?: boolean;
  includeTimestamp?: boolean;
}

/**
 * Metadata that can be included in responses
 */
export interface ClaimElementsMetadata {
  processingTime?: number;
  model?: string;
  version?: string;
}

/**
 * Extended response with optional metadata
 */
export interface ClaimParsingResponseV2WithMetadata
  extends ClaimParsingResponseV2 {
  metadata?: ClaimElementsMetadata;
}

export interface QueryGenerationResponseV2WithMetadata
  extends QueryGenerationResponseV2 {
  metadata?: ClaimElementsMetadata;
}

/**
 * Claim sync data structure for storing parsed elements and search queries
 */
export interface ClaimSyncData {
  parsedElements: string[]; // V2 format - array of strings
  searchQueries: string[];
  lastSyncedClaim?: string;
}
