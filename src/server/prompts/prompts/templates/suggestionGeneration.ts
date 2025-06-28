/**
 * Prompt templates for generating AI suggestions based on prior art analysis
 */

export const PREPROCESSING_PROMPT_V1 = {
  version: '1.0.0',
  template: `You are a patent analysis expert. Analyze these citation results against the claim elements.
  
  TASK:
  1. Identify which claim elements have strong prior art coverage
  2. For each relevant citation, extract the most important text snippets
  3. Rank elements by importance for patentability focus
  4. Provide reasoning about which elements need the most attention
  
  CLAIM TEXT:
  {{claimText}}
  
  CLAIM ELEMENTS:
  {{claimElements}}
  
  INVENTION CONTEXT:
  {{inventionContext}}
  
  CITATION RESULTS:
  {{citationResults}}
  
  RETURN FORMAT:
  Return a JSON with:
  1. "elementAnalysis": Array of objects with:
     - "elementText": The claim element text
     - "emphasizedInClaim": Boolean indicating original emphasis  
     - "priorArtStrength": Rating 1-10 of how strongly prior art covers this
     - "patentabilityFocus": Rating 1-10 for how important this element is to focus on
     - "reasoning": Brief explanation of this element's relevance
     - "citationEvidence": Array of objects containing:
        - "referenceNumber": The source citation reference (e.g., "US-20190244161-A1"). THIS IS MANDATORY.
        - "exactText": The exact, specific text snippet from the citation that's relevant. DO NOT SUMMARIZE. PRESERVE THIS PRECISELY. THIS IS MANDATORY.
        - "relevance": Rating 1-10 of how relevant this citation is
  2. "preprocessorSummary": Brief analysis of the overall prior art landscape`,
  variables: [
    'claimText',
    'claimElements',
    'inventionContext',
    'citationResults',
  ],
};

export const TRADITIONAL_SUGGESTION_PROMPT_V1 = {
  version: '1.0.0',
  template: `You are an expert patent examiner analyzing a patent claim in light of prior art search results and detailed citation analysis.

CLAIM TEXT:
\`\`\`
{{claimText}}
\`\`\`

PARSED ELEMENTS:
{{parsedElements}}

INVENTION CONTEXT:
- Title: {{title}}
- Technical Field: {{technicalField}}
- Summary: {{summary}}
- Novelty: {{novelty}}
- Background: {{background}}
- Advantages: {{advantages}}
- Claim 1: {{claim1}}

TOP SEARCH RESULTS (GENERAL CONTEXT ONLY):
{{topSearchResults}}
{{#if smartAnalysis}}
DETAILED CITATION ANALYSIS RESULTS:
This section contains an expert analysis of how claim elements relate to prior art references.
Use this analysis to inform your suggestions and populate the 'relevantText' field.
{{smartAnalysis}}

IMPORTANT: When creating suggestions, use the exact "exactText" values from the citation evidence
to maintain traceability to the original citations.
{{/if}}
{{#if consolidatedCitationData}}
DETAILED CITATION ANALYSIS RESULTS:
This section contains the detailed findings from comparing specific claim elements against prior art references.
Use this data heavily to justify suggestions and populate the 'relevantText' field.
{{consolidatedCitationData}}
{{/if}}
{{#if noAnalysisNote}}
NOTE: Detailed citation analysis results were not available or provided for this claim.
{{/if}}
TASK:
Generate a list of 4-6 specific suggestions to improve the patentability of this claim based on your analysis of the prior art AND the detailed citation analysis results (if provided).

For each suggestion:
1. Consider both broadening and narrowing strategies based on the prior art landscape and citation analysis.
2. Analyze potential weaknesses in the claim that could lead to 102/103 rejections, specifically referencing findings in the DETAILED CITATION ANALYSIS RESULTS.
3. Provide alternative phrasing to avoid overlap with prior art terminology identified in the citation analysis.
4. Make suggestions relevant to the emphasized elements (marked as "emphasized: true") as these are the potentially novel features.
5. FOCUS ON CLAIM 1's ACTUAL TEXT rather than just the parsed elements - use the exact relevant wording from the claim.

RETURN FORMAT:
Return a JSON array of suggestion objects, where each object has:
- id: A unique string identifier (e.g., "sug_" followed by a timestamp or unique string)
- type: One of "narrowing", "clarification", "patentability", "formatting", "prior-art"
- elementName: The specific element of the claim being addressed (extract from parsedElements)
- originalText: The EXACT TEXT from claim 1 that is being addressed (not just the parsed element name)
- suggestedText: Your proposed new text or addition that would replace the originalText in the claim
- reason: Detailed explanation why this change improves patentability (reference specific prior art document number AND findings from the DETAILED CITATION ANALYSIS RESULTS)
- strategy: One of "narrowing", "dependent_claim", or other appropriate strategy
- claimNumber: "1" (since we're working with Claim 1)
- priority: "high", "medium", or "low" based on importance
- priorArtReferences: Array of relevant prior art references. For each reference, include:
    - number: The patent number (e.g., "US1234567B2") of the MOST relevant document from TOP SEARCH RESULTS supporting the reason.
    - title: The title of the referenced patent from TOP SEARCH RESULTS.
    - relevantText: Extract the MOST relevant 1-2 sentences from the DETAILED CITATION ANALYSIS RESULTS that support your suggestion. Use the exact "exactText" values when available.

IMPORTANT: Ensure all priorArtReferences entries have valid "number" values that correspond to actual patents in the TOP SEARCH RESULTS.`,
  variables: [
    'claimText',
    'parsedElements',
    'title',
    'technicalField',
    'summary',
    'novelty',
    'background',
    'advantages',
    'claim1',
    'topSearchResults',
    'smartAnalysis',
    'consolidatedCitationData',
    'noAnalysisNote',
  ],
};

export const CITATION_BASED_SUGGESTION_PROMPT_V1 = {
  version: '1.0.0',
  template: `You are an expert patent examiner analyzing a patent claim against specific prior art citations.

CLAIM TEXT:
\`\`\`
{{claimText}}
\`\`\`

INVENTION CONTEXT:
- Title: {{title}}
- Technical Field: {{technicalField}}
- Summary: {{summary}}
- Novelty: {{novelty}}
- Background: {{background}}
- Advantages: {{advantages}}

CITATION MATCHES ({{matchCount}} matches analyzed):
{{citationMatches}}

TASK:
Generate 4-6 specific suggestions to improve the patentability of this claim based on the citation matches.

For each suggestion:
1. Reference specific citation matches that reveal prior art overlaps
2. Propose specific claim amendments to distinguish from prior art
3. Focus on elements with high reasoning scores as these indicate strong prior art coverage
4. Provide exact text replacements and additions

RETURN FORMAT:
Return a JSON array of suggestion objects with the exact same structure as the traditional format.
Each suggestion must include proper priorArtReferences that cite the specific citation matches.`,
  variables: [
    'claimText',
    'title',
    'technicalField',
    'summary',
    'novelty',
    'background',
    'advantages',
    'matchCount',
    'citationMatches',
  ],
};
