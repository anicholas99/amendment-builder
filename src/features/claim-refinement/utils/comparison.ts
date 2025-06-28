/**
 * Claim Comparison Utilities
 *
 * Functions for comparing patent claims with prior art and analyzing claim similarity
 */

/**
 * Interface for a prior art reference
 */
export interface PriorArtReference {
  id: string;
  title: string;
  abstract?: string;
  claims?: Record<string, string>;
  publicationDate?: string;
  patentNumber?: string;
  applicant?: string;
}

/**
 * Compares a claim with prior art to identify potential issues
 * @param claimText The text of the claim to analyze
 * @param priorArtReference The prior art reference to compare against
 * @returns Analysis results including matching elements and similarity score
 */
export const compareClaimWithPriorArt = (
  claimText: string,
  priorArtReference: PriorArtReference
): {
  matchingElements: Array<{
    claimText: string;
    priorArtText: string;
    similarity: number;
  }>;
  overallSimilarity: number;
  potentialIssues: string[];
} => {
  const matchingElements: Array<{
    claimText: string;
    priorArtText: string;
    similarity: number;
  }> = [];
  const potentialIssues: string[] = [];

  if (!priorArtReference.claims) {
    return {
      matchingElements: [],
      overallSimilarity: 0,
      potentialIssues: [
        'No claims available in prior art reference for comparison',
      ],
    };
  }

  // Simple claim element extraction
  const claimElements = extractClaimElements(claimText);
  let maxSimilarity = 0;
  let bestMatchingPriorArtClaim = '';

  // Compare claim elements with each prior art claim
  Object.entries(priorArtReference.claims).forEach(
    ([claimNumber, priorArtClaimText]) => {
      const similarity = calculateClaimSimilarity(claimText, priorArtClaimText);

      if (similarity > 0.7) {
        potentialIssues.push(
          `High similarity (${(similarity * 100).toFixed(1)}%) with prior art claim ${claimNumber}`
        );
      }

      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        bestMatchingPriorArtClaim = priorArtClaimText;
      }

      // Find matching elements between claims
      const priorArtElements = extractClaimElements(priorArtClaimText);

      claimElements.forEach(claimElement => {
        priorArtElements.forEach(priorArtElement => {
          const elementSimilarity = calculateTextSimilarity(
            claimElement.element,
            priorArtElement.element
          );

          if (elementSimilarity > 0.8) {
            matchingElements.push({
              claimText: claimElement.element,
              priorArtText: priorArtElement.element,
              similarity: elementSimilarity,
            });
          }
        });
      });
    }
  );

  // Add novelty concerns if similarity is high
  if (maxSimilarity > 0.8) {
    potentialIssues.push(
      'Potential novelty concerns due to high similarity with prior art'
    );
  }

  return {
    matchingElements,
    overallSimilarity: maxSimilarity,
    potentialIssues,
  };
};

/**
 * Calculates similarity between two claim texts
 * @param claim1 First claim text
 * @param claim2 Second claim text
 * @returns Similarity score between 0 and 1
 */
export const calculateClaimSimilarity = (
  claim1: string,
  claim2: string
): number => {
  // Convert to lowercase and remove common filler words
  const normalize = (text: string): string => {
    return text
      .toLowerCase()
      .replace(
        /\b(a|an|the|said|wherein|whereby|thereby|is|are|be|been|being|to|for|in|on|by|with)\b/g,
        ' '
      )
      .replace(/\s+/g, ' ')
      .trim();
  };

  const normalizedClaim1 = normalize(claim1);
  const normalizedClaim2 = normalize(claim2);

  // Split into words
  const words1 = normalizedClaim1.split(' ');
  const words2 = normalizedClaim2.split(' ');

  // Count matching words (simple approach)
  const uniqueWords1 = new Set(words1);
  const uniqueWords2 = new Set(words2);

  let matchingWords = 0;
  uniqueWords1.forEach(word => {
    if (uniqueWords2.has(word)) {
      matchingWords++;
    }
  });

  // Calculate Jaccard similarity
  const unionSize = uniqueWords1.size + uniqueWords2.size - matchingWords;
  return unionSize === 0 ? 0 : matchingWords / unionSize;
};

/**
 * Ranks prior art references by relevance to a given claim
 * @param claimText The text of the claim to analyze
 * @param priorArtReferences Array of prior art references
 * @returns Sorted array of prior art references by relevance
 */
export const rankPriorArtByRelevance = (
  claimText: string,
  priorArtReferences: PriorArtReference[]
): Array<{
  reference: PriorArtReference;
  relevanceScore: number;
  matchingElements: Array<{
    claimText: string;
    priorArtText: string;
    similarity: number;
  }>;
}> => {
  const results: Array<{
    reference: PriorArtReference;
    relevanceScore: number;
    matchingElements: Array<{
      claimText: string;
      priorArtText: string;
      similarity: number;
    }>;
  }> = [];

  // Process each prior art reference
  priorArtReferences.forEach(reference => {
    const comparisonResult = compareClaimWithPriorArt(claimText, reference);

    results.push({
      reference,
      relevanceScore: comparisonResult.overallSimilarity,
      matchingElements: comparisonResult.matchingElements,
    });
  });

  // Sort by relevance score (highest first)
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
};

/**
 * Generates a claim chart comparing a claim with prior art
 * @param claimText The text of the claim to analyze
 * @param priorArtReference The prior art reference to compare against
 * @returns Claim chart as an array of rows
 */
export const generateClaimChart = (
  claimText: string,
  priorArtReference: PriorArtReference
): Array<{
  claimElement: string;
  priorArtElement: string;
  notes: string;
}> => {
  const chart: Array<{
    claimElement: string;
    priorArtElement: string;
    notes: string;
  }> = [];

  if (!priorArtReference.claims) {
    return [
      {
        claimElement: claimText,
        priorArtElement: 'No claims available',
        notes: 'Unable to generate claim chart - no prior art claims',
      },
    ];
  }

  // Find best matching prior art claim
  let bestMatchingClaimNumber = '';
  let bestMatchingSimilarity = 0;

  Object.entries(priorArtReference.claims).forEach(
    ([claimNumber, priorArtClaimText]) => {
      const similarity = calculateClaimSimilarity(claimText, priorArtClaimText);

      if (similarity > bestMatchingSimilarity) {
        bestMatchingSimilarity = similarity;
        bestMatchingClaimNumber = claimNumber;
      }
    }
  );

  if (bestMatchingClaimNumber === '') {
    return [
      {
        claimElement: claimText,
        priorArtElement: 'No similar claims found',
        notes: 'No significant similarity with any prior art claim',
      },
    ];
  }

  const bestMatchingClaimText =
    priorArtReference.claims[bestMatchingClaimNumber];

  // Split claim into elements (simplified approach)
  const claimElements = claimText
    .split(/[;,]/g)
    .map(e => e.trim())
    .filter(e => e.length > 0);

  // For each claim element, find best matching prior art element
  claimElements.forEach(element => {
    let bestMatch = '';
    let bestSimilarity = 0;
    let note = '';

    const priorArtElements = bestMatchingClaimText
      .split(/[;,]/g)
      .map(e => e.trim())
      .filter(e => e.length > 0);

    priorArtElements.forEach(priorArtElement => {
      const similarity = calculateTextSimilarity(element, priorArtElement);

      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = priorArtElement;
      }
    });

    if (bestSimilarity > 0.8) {
      note = 'Potential novelty concern - very similar element';
    } else if (bestSimilarity > 0.5) {
      note = 'Similar concept but with differences';
    } else {
      note = 'Potentially novel element';
      bestMatch = 'No close match found';
    }

    chart.push({
      claimElement: element,
      priorArtElement: bestMatch,
      notes: note,
    });
  });

  return chart;
};

/**
 * Helper function to calculate text similarity
 * @param text1 First text
 * @param text2 Second text
 * @returns Similarity score between 0 and 1
 */
const calculateTextSimilarity = (text1: string, text2: string): number => {
  // Normalize texts
  const normalize = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/\b(a|an|the|said|wherein|whereby|thereby)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const normalizedText1 = normalize(text1);
  const normalizedText2 = normalize(text2);

  // Simple word-based similarity
  const words1 = normalizedText1.split(' ');
  const words2 = normalizedText2.split(' ');

  const uniqueWords1 = new Set(words1);
  const uniqueWords2 = new Set(words2);

  let matchingWords = 0;
  uniqueWords1.forEach(word => {
    if (uniqueWords2.has(word)) {
      matchingWords++;
    }
  });

  const unionSize = uniqueWords1.size + uniqueWords2.size - matchingWords;
  return unionSize === 0 ? 0 : matchingWords / unionSize;
};

/**
 * Helper function to extract claim elements
 * @param claimText The text of the claim to analyze
 * @returns Array of extracted claim elements
 */
const extractClaimElements = (
  claimText: string
): Array<{
  element: string;
  position: [number, number];
}> => {
  const elements: Array<{
    element: string;
    position: [number, number];
  }> = [];

  // Simple approach - split by semicolons and commas
  const parts = claimText.split(/[;,]/g).map(part => part.trim());
  let currentPosition = 0;

  parts.forEach(part => {
    if (part.length > 0) {
      const startPos = claimText.indexOf(part, currentPosition);
      const endPos = startPos + part.length;

      elements.push({
        element: part,
        position: [startPos, endPos],
      });

      currentPosition = endPos;
    }
  });

  return elements;
};
