import { PatentSection } from './types';

// Pattern to match paragraph numbers
export const PARAGRAPH_NUMBER_REGEX = /^\[(\d{4})\]\s/;

/**
 * Extract paragraph number from text
 */
export function extractParagraphNumber(
  text: string
): { number: string; fullMatch: string } | null {
  const match = text.match(PARAGRAPH_NUMBER_REGEX);
  if (!match) return null;
  return {
    number: match[1],
    fullMatch: match[0],
  };
}

/**
 * Detect the current patent section based on heading text
 */
export function detectPatentSection(text: string): PatentSection {
  const textUpper = text.trim().toUpperCase();

  if (
    textUpper === 'CLAIMS' ||
    textUpper === 'WHAT IS CLAIMED IS:' ||
    textUpper === 'I CLAIM:' ||
    textUpper === 'WE CLAIM:'
  ) {
    return 'CLAIMS';
  }

  if (textUpper === 'ABSTRACT' || textUpper === 'ABSTRACT OF THE DISCLOSURE') {
    return 'ABSTRACT';
  }

  if (
    textUpper === 'BACKGROUND' ||
    textUpper === 'FIELD' ||
    textUpper === 'SUMMARY' ||
    textUpper === 'DETAILED DESCRIPTION' ||
    textUpper === 'BRIEF DESCRIPTION OF THE DRAWINGS'
  ) {
    return 'DESCRIPTION';
  }

  return '';
}

/**
 * Check if text looks like a header
 */
export function looksLikeHeader(text: string): boolean {
  const textContent = text.trim();
  const textUpper = textContent.toUpperCase();

  // All caps text (likely a header)
  if (textUpper === textContent && textContent.length > 0) {
    return true;
  }

  // Common section headers
  const headerKeywords = [
    'FIELD',
    'BACKGROUND',
    'BACKGROUND OF THE INVENTION',
    'SUMMARY',
    'SUMMARY OF THE INVENTION',
    'DETAILED DESCRIPTION',
    'DETAILED DESCRIPTION OF THE INVENTION',
    'BRIEF DESCRIPTION OF THE DRAWINGS',
    'BRIEF DESCRIPTION OF THE FIGURES',
    'CLAIMS',
    'WHAT IS CLAIMED IS:',
    'I CLAIM:',
    'WE CLAIM:',
    'ABSTRACT',
    'ABSTRACT OF THE DISCLOSURE',
  ];

  // Exact match
  if (headerKeywords.includes(textUpper)) {
    return true;
  }

  // Short text containing header keywords
  if (textContent.length < 100) {
    const containsKeywords = [
      'FIELD',
      'BACKGROUND',
      'SUMMARY',
      'DETAILED DESCRIPTION',
      'BRIEF DESCRIPTION',
      'CLAIMS',
      'ABSTRACT',
    ].some(keyword => textUpper.includes(keyword));

    if (containsKeywords) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a paragraph should be numbered
 */
export function shouldNumberParagraph(
  node: any,
  currentSection: PatentSection,
  checkContent: boolean = true
): boolean {
  // Must be a paragraph node
  if (node.type.name !== 'paragraph' || !node.isBlock) {
    return false;
  }

  // Skip claims and abstract sections
  if (currentSection === 'CLAIMS' || currentSection === 'ABSTRACT') {
    return false;
  }

  const text = node.textContent.trim();

  // Skip empty paragraphs if checking content
  if (checkContent && text.length === 0) {
    return false;
  }

  // Skip headers
  if (looksLikeHeader(text)) {
    return false;
  }

  // Check if already numbered
  if (PARAGRAPH_NUMBER_REGEX.test(node.textContent)) {
    return false;
  }

  return true;
}

/**
 * Check if a paragraph has a number
 */
export function hasNumber(text: string): boolean {
  return PARAGRAPH_NUMBER_REGEX.test(text);
}

/**
 * Track current section while traversing document
 */
export class SectionTracker {
  private currentSection: PatentSection = '';

  update(node: any): void {
    if (node.type.name === 'heading') {
      const newSection = detectPatentSection(node.textContent);
      if (newSection) {
        this.currentSection = newSection;
      }
    }
  }

  getSection(): PatentSection {
    return this.currentSection;
  }

  reset(): void {
    this.currentSection = '';
  }
}
