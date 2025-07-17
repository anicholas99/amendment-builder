import { logger } from '@/server/logger';
import { safeJsonParse } from '@/utils/jsonUtils';

// These types would be defined here or imported from a shared types file
// For now, defining them here to make the prompt self-contained.
interface CitationSummary {
  text: string;
  relevance: number;
  location: string;
}

interface ExaminerAnalysisInput {
  referenceMetadata: {
    title?: string | null;
    applicant?: string | null;
    assignee?: string | null;
    publicationDate?: string | null;
    abstract?: string | null;
  };
}

/**
 * Extract location reference from paragraph HTML
 */
function extractLocation(paragraph: string | null): string {
  if (!paragraph) return 'Unspecified location';
  const paraMatch = paragraph.match(/num="(\d+)"/);
  if (paraMatch) {
    return `Para [${paraMatch[1].padStart(4, '0')}]`;
  }
  const colMatch = paragraph.match(/Col\.?\s*(\d+),?\s*[Ll]ines?\s*([\d-]+)/);
  if (colMatch) {
    return `Col ${colMatch[1]}, Lines ${colMatch[2]}`;
  }
  return 'See document';
}

/**
 * Construct the examiner analysis prompt
 */
export function constructExaminerPrompt(
  claimText: string,
  referenceNumber: string,
  referenceMetadata: ExaminerAnalysisInput['referenceMetadata'],
  elementCitations: Map<string, CitationSummary[]>
): string {
  let prompt = `You are an experienced USPTO patent examiner reviewing a patent application. Your task is to analyze how reference ${referenceNumber} reads on the claimed invention and provide an examiner-style assessment.

REFERENCE DETAILS:
- Number: ${referenceNumber}
- Title: ${referenceMetadata.title || 'Not provided'}
- Applicant/Assignee: ${referenceMetadata.applicant || referenceMetadata.assignee || 'Not provided'}
- Publication Date: ${referenceMetadata.publicationDate || 'Not provided'}

ABSTRACT:
${referenceMetadata.abstract || 'Abstract not available'}

CLAIM 1 (Applicant's Claim):
${claimText}

TOP CITATIONS BY CLAIM ELEMENT:
`;

  elementCitations.forEach((citations, element) => {
    prompt += `\nElement: "${element}"\n`;
    citations.forEach((citation, idx) => {
      prompt += `  ${idx + 1}. [${citation.location}] (${citation.relevance.toFixed(1)}% match): "${citation.text}"\n`;
    });
  });

  prompt += `
TASK: As a USPTO examiner, provide:

1. EXAMINER SUMMARY (3-5 paragraphs):
   - Overall assessment of how this reference reads on Claim 1
   - Specific discussion of which elements are disclosed
   - Clear statement on whether this supports a 102 or 103 rejection
   - Professional examiner tone and terminology

2. KEY REJECTION ANALYSIS:
   - Identify if this reference supports 102 (anticipation) or 103 (obviousness)
   - List specific claim elements that are clearly disclosed
   - Explain the rationale using MPEP guidelines

3. RESPONSE STRATEGY (as if advising the applicant):
   - Primary argument to distinguish over this reference
   - Specific claim amendments that would overcome the reference
   - Key technical distinctions to emphasize

4. ELEMENT-BY-ELEMENT VIEW:
   - For each element, provide examiner's perspective on how well it's disclosed

Return your analysis as a JSON object following this exact structure:
{
  "examinerSummary": "Your 3-5 paragraph examiner assessment...",
  "keyRejectionPoints": [
    {
      "type": "102 Anticipation" | "103 Obviousness" | "No Rejection",
      "elements": ["element1", "element2"],
      "rationale": "Examiner rationale..."
    }
  ],
  "responseStrategy": {
    "primaryArgument": "Main distinguishing argument...",
    "amendmentSuggestions": ["Amendment 1...", "Amendment 2..."],
    "distinctionPoints": ["Key distinction 1...", "Key distinction 2..."]
  },
  "elementComparisons": [
    {
      "element": "element text",
      "topCitations": [
        {
          "text": "citation text",
          "relevance": 85.5,
          "location": "Para [0045]"
        }
      ],
      "examinerView": "Examiner's view on this element..."
    }
  ],
  "referenceNumber": "${referenceNumber}",
  "referenceTitle": "${referenceMetadata.title || 'Unknown'}",
  "analysisDate": "${new Date().toISOString()}"
}

IMPORTANT: Write from an examiner's perspective using proper USPTO terminology. Be specific about which claim elements are disclosed and why.`;

  return prompt;
}
