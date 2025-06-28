import React from 'react';
import { chakra } from '@chakra-ui/react';
import { stemmer } from 'stemmer';
import { CITATION_STOP_WORDS } from '../constants/citationConstants';

/**
 * Styled span component for highlighting words
 */
export const HighlightedWord = chakra('span', {
  baseStyle: {
    fontWeight: 'bold',
    px: '1',
    mx: '0.5px',
    borderRadius: 'sm',
  },
});

/**
 * Extracts stemmed keywords from text, filtering out stop words
 * @param text - The text to extract keywords from
 * @returns Array of stemmed keywords
 */
export function getStemmedKeywords(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .split(/[^a-zA-Z0-9]+/)
    .filter(word => word.length > 2 && !CITATION_STOP_WORDS.has(word))
    .map(word => stemmer(word));
}

/**
 * Renders text with highlighted keywords
 * @param text - The text to render
 * @param stemmedKeywords - Array of stemmed keywords to highlight
 * @returns React node with highlighted text
 */
export function renderHighlightedText(
  text: string,
  stemmedKeywords: string[]
): React.ReactNode {
  if (!text || stemmedKeywords.length === 0) {
    return text;
  }

  const parts = text.split(/(\s+|[.,!?;:]+)/g).filter(Boolean);
  const stemmedKeywordSet = new Set(stemmedKeywords);

  return parts.map((part, index) => {
    const lowerPart = part.toLowerCase();
    // Stem the current part if it's potentially a word
    const stemmedPart = /[a-zA-Z]/.test(lowerPart) ? stemmer(lowerPart) : null;

    // Highlight if the stemmed part exists and is in our keyword set
    // Also, ensure the original word isn't a stop word
    const shouldHighlight =
      stemmedPart &&
      stemmedKeywordSet.has(stemmedPart) &&
      !CITATION_STOP_WORDS.has(lowerPart);

    if (shouldHighlight) {
      return <HighlightedWord key={index}>{part}</HighlightedWord>;
    } else {
      return <React.Fragment key={index}>{part}</React.Fragment>;
    }
  });
}
