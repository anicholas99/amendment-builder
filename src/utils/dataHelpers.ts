/**
 * Data Helper Utilities
 *
 * Functions to help normalize and access data consistently throughout the application
 */

import { InventionData } from '@/types';

/**
 * Normalizes claims data to a consistent format
 *
 * @param claims Claims in either array or record format
 * @returns Claims in a consistent Record<string, string> format
 */
export function normalizeClaims(
  claims: string[] | Record<string, string> | undefined
): Record<string, string> {
  if (!claims) return {};

  // If claims is already an object, return it
  if (!Array.isArray(claims)) {
    return claims;
  }

  // Convert array to object with numbered keys
  return claims.reduce(
    (acc, claim, index) => {
      acc[(index + 1).toString()] = claim;
      return acc;
    },
    {} as Record<string, string>
  );
}

/**
 * Gets elements for a specific figure
 *
 * @param invention The structured invention data
 * @param figureKey The figure key/ID
 * @returns Elements for the specified figure as Record<string, string>
 */
export function getFigureElements(
  invention: InventionData | null,
  figureKey: string
): Record<string, string> {
  if (
    !invention?.figures ||
    !figureKey ||
    typeof invention.figures !== 'object'
  ) {
    return {};
  }

  const figure = invention.figures[figureKey];
  if (!figure || typeof figure !== 'object') {
    return {};
  }

  return (figure.elements as Record<string, string>) || {};
}

/**
 * Gets all figures in a normalized format
 *
 * @param invention The structured invention data
 * @returns Record of all figures with consistent properties
 */
export function getNormalizedFigures(invention: InventionData | null): Record<
  string,
  {
    description?: string;
    elements?: Record<string, string>;
    image?: string;
    type?: string;
    content?: unknown;
  }
> {
  if (!invention?.figures) {
    return {};
  }

  const normalized: Record<string, any> = {};

  Object.entries(invention.figures).forEach(([key, figure]) => {
    normalized[key] = {
      description: figure.description || '',
      elements: figure.elements || {},
      type: figure.type || 'image',
      content: figure.content,
    };
  });

  return normalized;
}

/**
 * Updates figure elements while preserving other figure properties
 *
 * @param invention The structured invention data
 * @param figureKey The figure key/ID
 * @param elements The updated elements
 * @returns New StructuredInventionData with updated elements
 */
export function updateFigureElements(
  invention: InventionData | null,
  figureKey: string,
  elements: Record<string, string>
): InventionData | null {
  if (!invention) {
    return null;
  }

  const updatedFigures = { ...invention.figures };

  if (updatedFigures[figureKey]) {
    updatedFigures[figureKey] = {
      ...updatedFigures[figureKey],
      elements,
    };
  }

  return {
    ...invention,
    figures: updatedFigures,
  };
}

/**
 * Extracts key metrics and statistics from invention data
 * @param invention - The invention data to analyze
 * @returns Object containing key metrics
 */
export function getInventionMetrics(invention: InventionData | null) {
  if (!invention) {
    return {
      hasTitle: false,
      hasAbstract: false,
      hasClaims: false,
      hasFigures: false,
      hasElements: false,
      claimCount: 0,
      figureCount: 0,
      elementCount: 0,
      completeness: 0,
    };
  }

  const hasTitle = !!invention.title;
  const hasAbstract = !!invention.abstract;
  const hasClaims = !!(
    invention.claims && Object.keys(invention.claims).length > 0
  );
  const hasFigures = !!(
    invention.figures && Object.keys(invention.figures).length > 0
  );
  const hasElements = !!(
    invention.elements && Object.keys(invention.elements).length > 0
  );

  const claimCount = invention.claims
    ? Object.keys(invention.claims).length
    : 0;
  const figureCount = invention.figures
    ? Object.keys(invention.figures).length
    : 0;
  const elementCount = invention.elements
    ? Object.keys(invention.elements).length
    : 0;

  // Calculate completeness percentage
  const completenessFactors = [
    hasTitle,
    hasAbstract,
    hasClaims,
    hasFigures,
    hasElements,
  ];
  const completeness =
    (completenessFactors.filter(Boolean).length / completenessFactors.length) *
    100;

  return {
    hasTitle,
    hasAbstract,
    hasClaims,
    hasFigures,
    hasElements,
    claimCount,
    figureCount,
    elementCount,
    completeness: Math.round(completeness),
  };
}

/**
 * Safely extracts claims from invention data
 * @param invention - The invention data
 * @returns Claims as Record<string, string>
 */
export function getNormalizedClaims(
  invention: InventionData | null
): Record<string, string> {
  if (!invention?.claims) {
    return {};
  }

  // Handle both array and object formats
  if (Array.isArray(invention.claims)) {
    const claims: Record<string, string> = {};
    invention.claims.forEach((claim, index) => {
      claims[String(index + 1)] = claim;
    });
    return claims;
  }

  return invention.claims as Record<string, string>;
}

/**
 * Validates that invention data has minimum required fields
 * @param invention - The invention data to validate
 * @returns Boolean indicating if data is valid
 */
export function isValidInventionData(invention: InventionData | null): boolean {
  if (!invention) {
    return false;
  }

  // Minimum requirements: title and either abstract or summary
  return !!(invention.title && (invention.abstract || invention.summary));
}

/**
 * Extracts searchable text from invention data
 * @param invention - The invention data
 * @returns Concatenated searchable text
 */
export function getSearchableText(invention: InventionData | null): string {
  if (!invention) {
    return '';
  }

  const textParts: string[] = [];

  if (invention.title) textParts.push(invention.title);
  if (invention.abstract) textParts.push(invention.abstract);
  if (invention.summary) textParts.push(invention.summary);

  // Add features and advantages
  if (invention.features && Array.isArray(invention.features)) {
    textParts.push(...invention.features);
  }
  if (invention.advantages && Array.isArray(invention.advantages)) {
    textParts.push(...invention.advantages);
  }

  // Add claims text
  if (invention.claims) {
    const claims = getNormalizedClaims(invention);
    textParts.push(...Object.values(claims));
  }

  return textParts.join(' ').toLowerCase();
}
