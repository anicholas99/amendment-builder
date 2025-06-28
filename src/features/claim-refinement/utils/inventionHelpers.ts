import { InventionData } from '@/types';
import { CLAIM_NUMBERS, TOAST_MESSAGES } from '../constants';

/**
 * Creates an invention context string from structured invention data
 */
export function getInventionContext(data: InventionData | null): string {
  if (!data) return 'No invention data available.';

  const figuresText = formatFiguresText(data.figures);
  const backgroundProblems = getBackgroundProblems(data.background);
  const backgroundTechField = getBackgroundTechField(data.background);
  const preferredEmbodiment = getPreferredEmbodiment(
    data.technical_implementation
  );
  const alternativeEmbodiments = getAlternativeEmbodiments(
    data.technical_implementation
  );

  return `
    Summary: ${data.summary || 'No summary provided'}
    Technical Field: ${data.technical_field || 'No technical field provided'}
    Background - Technical Field: ${backgroundTechField}
    Background - Problems Solved: ${backgroundProblems}
    Features: ${(data.features || []).join(', ') || 'No features provided'}
    Novelty: ${data.novelty || 'No novelty provided'}
    Figures Summary:
${figuresText}
    Technical Implementation - Preferred Embodiment: ${preferredEmbodiment}
    Technical Implementation - Alternative Embodiments: ${alternativeEmbodiments}
  `.trim();
}

/**
 * Formats figures data into a readable text format
 */
function formatFiguresText(figures: any): string {
  if (!figures || Object.keys(figures).length === 0) {
    return 'No figures provided';
  }

  return Object.entries(figures)
    .map(([figNum, fig]: [string, any]) => {
      const elementsObj = fig.elements || {};
      const elementLines = Object.entries(elementsObj)
        .map(([elemNumber, elemDesc]) => `  (${elemNumber}) ${elemDesc}`)
        .join('\n');
      return `FIG. ${figNum} - ${fig.description || 'No description'}\n${elementLines}`;
    })
    .join('\n\n');
}

/**
 * Safely extracts background problems from invention data
 */
function getBackgroundProblems(background: any): string {
  if (
    typeof background === 'object' &&
    background !== null &&
    Array.isArray(background.problems_solved)
  ) {
    return background.problems_solved.join(', ');
  }
  return 'No problems solved provided';
}

/**
 * Safely extracts background technical field from invention data
 */
function getBackgroundTechField(background: any): string {
  if (
    typeof background === 'object' &&
    background !== null &&
    typeof background.technical_field === 'string'
  ) {
    return background.technical_field;
  }
  return 'No background technical field provided';
}

/**
 * Safely extracts preferred embodiment from technical implementation
 */
function getPreferredEmbodiment(technicalImplementation: any): string {
  if (
    typeof technicalImplementation === 'object' &&
    technicalImplementation !== null &&
    typeof technicalImplementation.preferred_embodiment === 'string'
  ) {
    return technicalImplementation.preferred_embodiment;
  }
  return 'No preferred embodiment provided';
}

/**
 * Safely extracts alternative embodiments from technical implementation
 */
function getAlternativeEmbodiments(technicalImplementation: any): string {
  if (
    typeof technicalImplementation === 'object' &&
    technicalImplementation !== null &&
    Array.isArray(technicalImplementation.alternative_embodiments)
  ) {
    return technicalImplementation.alternative_embodiments.join('; ');
  }
  return 'No alternative embodiments provided';
}

/**
 * Extracts claim 1 text from invention data
 */
export function extractClaim1Text(
  analyzedInvention: InventionData | null
): string | null {
  if (
    analyzedInvention &&
    analyzedInvention.claims &&
    typeof analyzedInvention.claims === 'object' &&
    !Array.isArray(analyzedInvention.claims) &&
    typeof analyzedInvention.claims[CLAIM_NUMBERS.FIRST] === 'string'
  ) {
    return analyzedInvention.claims[CLAIM_NUMBERS.FIRST];
  }
  return null;
}

/**
 * Constructs dependent claims text from invention data
 */
export function constructDependentClaimsText(
  analyzedInvention: InventionData | null
): string {
  if (
    !analyzedInvention ||
    !analyzedInvention.claims ||
    typeof analyzedInvention.claims !== 'object' ||
    Array.isArray(analyzedInvention.claims)
  ) {
    return '';
  }

  return Object.entries(analyzedInvention.claims)
    .filter(
      ([key, value]) => key !== CLAIM_NUMBERS.FIRST && typeof value === 'string'
    )
    .sort(([keyA], [keyB]) => parseInt(keyA, 10) - parseInt(keyB, 10))
    .map(([key, claimTextValue]) => `${key}. ${claimTextValue}`)
    .join('\n');
}

/**
 * Formats claims with numbers
 */
export function formatClaimsWithNumbers(
  claims: Record<string, string> | undefined
): string {
  if (!claims) return '';

  return Object.entries(claims)
    .map(([number, text]) => `${number}. ${text}`)
    .join('\n\n');
}

/**
 * Validates prior art analysis inputs
 */
export interface PriorArtAnalysisValidation {
  isValid: boolean;
  errorMessage?: string;
}

export function validatePriorArtAnalysisInputs(
  searchHistoryId: string,
  selectedReferenceNumbers: string[],
  claim1Text: string | null
): PriorArtAnalysisValidation {
  if (!searchHistoryId) {
    return {
      isValid: false,
      errorMessage: TOAST_MESSAGES.ERRORS.NO_SEARCH_HISTORY,
    };
  }

  if (!selectedReferenceNumbers || selectedReferenceNumbers.length === 0) {
    return {
      isValid: false,
      errorMessage: TOAST_MESSAGES.ERRORS.NO_REFERENCES,
    };
  }

  if (!claim1Text) {
    return {
      isValid: false,
      errorMessage: TOAST_MESSAGES.ERRORS.NO_CLAIM_1,
    };
  }

  return { isValid: true };
}

/**
 * Gets top references from search results
 */
export interface SearchResultItem {
  number?: string;
  title?: string;
  abstract?: string;
  relevance?: number;
  [key: string]: any;
}

export function getTopReferences(
  results: unknown[],
  count: number = 5
): SearchResultItem[] {
  if (!results || !Array.isArray(results)) return [];

  // Type guard to ensure each result has the expected shape
  const typedResults = results.filter(
    (result): result is SearchResultItem =>
      result !== null && typeof result === 'object'
  );

  // Sort by relevance (descending) and take top N
  return typedResults
    .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
    .slice(0, count)
    .map(result => ({
      number: result.number || '',
      title: result.title || '',
      abstract: result.abstract || '',
      relevance: result.relevance || 0,
    }));
}
