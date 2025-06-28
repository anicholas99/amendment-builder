// Constants for patent section handling
import { getOrderedSectionNames } from './sectionConfig';

/**
 * Standard order of sections in a patent document
 * Now derived from the section configuration
 */
export const STANDARD_SECTION_ORDER = getOrderedSectionNames();

/**
 * Section patterns used for extracting sections from patent text
 */
export const SECTION_PATTERNS = [
  {
    name: 'FIELD',
    pattern:
      /FIELD(?:[\s\n]+OF[\s\n]+THE[\s\n]+INVENTION)?\s*\r?\n\r?\n([\s\S]*?)(?=\r?\n\r?\n(?:[A-Z][A-Z\s\d]{2,}\b)|$)/i,
  },
  {
    name: 'BACKGROUND',
    pattern:
      /BACKGROUND(?:[\s\n]+OF[\s\n]+THE[\s\n]+INVENTION)?\s*\r?\n\r?\n([\s\S]*?)(?=\r?\n\r?\n(?:[A-Z][A-Z\s\d]{2,}\b)|$)/i,
  },
  {
    name: 'SUMMARY',
    pattern:
      /SUMMARY(?:[\s\n]+OF[\s\n]+THE[\s\n]+INVENTION)?\s*\r?\n\r?\n([\s\S]*?)(?=\r?\n\r?\n(?:[A-Z][A-Z\s\d]{2,}\b)|$)/i,
  },
  {
    name: 'BRIEF DESCRIPTION OF THE DRAWINGS',
    pattern:
      /BRIEF[\s\n]+DESCRIPTION[\s\n]+OF[\s\n]+(?:THE[\s\n]+)?DRAWINGS\s*\r?\n\r?\n([\s\S]*?)(?=\r?\n\r?\n(?:[A-Z][A-Z\s\d]{2,}\b)|$)/i,
  },
  {
    name: 'DETAILED DESCRIPTION',
    pattern:
      /DETAILED[\s\n]+DESCRIPTION(?:[\s\n]+OF[\s\n]+(?:THE[\s\n]+)?INVENTION)?\s*\r?\n\r?\n([\s\S]*?)(?=\r?\n\r?\n(?:[A-Z][A-Z\s\d]{2,}\b)|$)/i,
  },
  {
    name: 'CLAIMS',
    pattern:
      /CLAIMS\s*\r?\n\r?\n([\s\S]*?)(?=\r?\n\r?\n(?:[A-Z][A-Z\s\d]{2,}\b)|$)/i,
  },
  {
    name: 'ABSTRACT',
    pattern:
      /ABSTRACT\s*\r?\n\r?\n([\s\S]*?)(?=\r?\n\r?\n(?:[A-Z][A-Z\s\d]{2,}\b)|$)/i,
  },
];
