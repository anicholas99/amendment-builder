export const KNOWN_TECH_DOMAINS = [
  'Mechanical_Electrical',
  'Software_Computer',
  'Chemical_Biological',
  'Medical_Device',
  'Renewable_Energy',
  'Agricultural',
  'Default',
] as const;

/**
 * Build the system prompt for the `analyze-invention` endpoint.
 * Separating the prompt into its own module keeps the API route concise
 * and makes future prompt tuning or unit-testing easier.
 */
export function analyzeInventionPrompt(disclosureText: string): string {
  return `
Analyze the following invention disclosure. Return structured JSON with the exact schema below. 
Your output MUST include a "technicalField" key whose value is ONE EXACT string from the following list:
[${KNOWN_TECH_DOMAINS.map(d => `"${d}"`).join(', ')}]

DO NOT make up features, use cases, claims, or any content that is not directly supported in the disclosure. Only extract what is clearly described. Be comprehensive but truthful.

STRUCTURE:
{
  "title": "Concise title",
  "summary": "A comprehensive multi-paragraph overview of the invention that details its purpose, technical implementation, advantages, and various embodiments.",
  "patentCategory": "Category (e.g., Agricultural Drone Technology)",
  "technicalField": "MUST be one of: ${KNOWN_TECH_DOMAINS.join(', ')}",
  "background": {
    "technicalField": "Detailed background description",
    "problemsSolved": ["Problem 1", "Problem 2", "..."],
    "existingSolutions": ["Existing solution 1 with limitations", "..."]
  },
  "priorArt": [
    {
      "patentNumber": "Properly formatted patent number (e.g., US10289027, US20160150661, EP1234567)",
      "reference": "Full reference as mentioned in disclosure (e.g., U.S. Patent No. 10,289,027)",
      "context": "How this reference was mentioned in the disclosure",
      "relevance": "Why this is relevant to the invention"
    }
  ],
  "novelty": "What makes it novel with specific technical advantages",
  "features": ["Feature with technical details", "... more if supported by the disclosure"],
  "advantages": ["Advantage with outcome or benefit", "... if supported"],
  "useCases": ["Use case based on real context", "... more if mentioned"],
  "technicalImplementation": {
    "preferredEmbodiment": "Detailed description including ALL measurements, materials, and operating parameters",
    "alternativeEmbodiments": ["Variation 1", "Variation 2", "... if stated"],
    "manufacturingMethods": ["Method 1", "..."]
  },
  "processSteps": ["Step 1", "Step 2", "..."],
  "structuredFigures": [
    {
      "figureKey": "FIG. 1",
      "title": "Brief title for this figure",
      "description": "What this figure shows and its purpose",
      "displayOrder": 1,
      "elements": [
        {
          "elementKey": "5",
          "elementName": "Component name as described by user",
          "calloutDescription": "Context-specific description of element 5 in this figure"
        },
        {
          "elementKey": "motor_1",
          "elementName": "Motor component name from disclosure",
          "calloutDescription": "How motor_1 appears or functions in this specific view"
        }
      ]
    },
    {
      "figureKey": "FIG. 2",
      "title": "Brief title for figure 2",
      "description": "What figure 2 shows",
      "displayOrder": 2,
      "elements": [
        {
          "elementKey": "23",
          "elementName": "User's component description",
          "calloutDescription": "How element 23 appears in this figure context"
        }
      ]
    }
  ],
  "figures": {
    "FIG. 1": {
      "title": "Brief title for this figure",
      "description": "What this figure shows and its purpose",
      "elements": ["5", "motor_1", "A"],
      "callouts": [
        { "element": "5", "description": "Context-specific description of element 5 in this figure" },
        { "element": "motor_1", "description": "How motor_1 appears or functions in this specific view" }
      ],
      "view": "perspective/cross-section/top-view/etc"
    },
    "FIG. 2": {
      "title": "Brief title for figure 2",
      "description": "What figure 2 shows",
      "elements": ["5", "23", "B"],
      "callouts": [
        { "element": "23", "description": "How element 23 appears in this figure context" }
      ],
      "view": "cross-section"
    }
  },
  "elements": {
    "5": "Component name as described by user",
    "motor_1": "Motor component name from disclosure",
    "A": "System component as labeled by user",
    "23": "User's component description",
    "B": "Another component as labeled"
  },
  "claims": { "1": "Claim text 1", "2": "Claim text 2", "..." : "..." },
  "definitions": {
    "term1": "Definition with technical context",
    "...": "..."
  },
  "abstract": "A concise single paragraph (50-150 words) that provides a technical overview of the core invention concept.",
  "futureDirections": ["Future idea if described", "..."]
}

CRITICAL STRUCTURED FIGURES RULES (NEW FORMAT):
1. STRUCTURED FIGURES ARRAY: Each figure should be an object in the "structuredFigures" array with:
   - "figureKey": The figure identifier (e.g., "FIG. 1", "FIG. 2A")
   - "title": Brief descriptive title
   - "description": What this figure shows and its purpose
   - "displayOrder": Numeric order for display (1, 2, 3, etc.)
   - "elements": Array of element objects that appear in this figure

2. ELEMENT STRUCTURE IN FIGURES:
   - Each element in the "elements" array has:
     - "elementKey": The exact ID/number from the disclosure (e.g., "101", "5", "motor_1")
     - "elementName": The general name/description of the element
     - "calloutDescription": How this element appears/functions in this specific figure

3. ELEMENT EXTRACTION:
   - PRESERVE the user's numbering system exactly
   - Extract the element name from wherever it's first defined in the disclosure
   - The calloutDescription should be specific to how the element appears in that particular figure

4. EXAMPLES OF PROPER EXTRACTION:
   - Text: "FIG. 1 shows a refrigerator body 100 with cameras 101"
     → structuredFigures[0].elements:
       [
         {
           "elementKey": "100",
           "elementName": "refrigerator body",
           "calloutDescription": "Main housing structure shown in perspective view"
         },
         {
           "elementKey": "101", 
           "elementName": "cameras",
           "calloutDescription": "Multiple cameras positioned on the body"
         }
       ]

IMPORTANT: Keep the existing "figures" and "elements" sections unchanged for backward compatibility. The new "structuredFigures" array is in addition to, not a replacement for, the existing format.

CRITICAL ELEMENT EXTRACTION RULES:
1. The "elements" section MUST contain ALL numbered/labeled elements mentioned anywhere in the disclosure
2. This includes elements that are:
   - Mentioned in the detailed description but not assigned to any figure
   - Part of the overall system architecture
   - Referenced in process steps or technical implementation
   - Used in claims or advantages sections
3. DO NOT limit elements to only those shown in figures
4. Extract EVERY element with a number or label (e.g., "100", "101", "motor_1", "A", etc.)
5. The elements section is a comprehensive inventory of ALL components mentioned

CRITICAL FIGURE AND ELEMENT RULES (EXISTING FORMAT - KEEP UNCHANGED):
1. FIGURES SECTION: Each figure should have:
   - "title": Brief descriptive title (extract from disclosure or create based on description)
   - "description": What this figure shows and its purpose (extract exactly as described)
   - "elements": Array of element IDs that appear in this figure - USE THE EXACT NUMBERS/LABELS FROM THE DISCLOSURE
   - "callouts": Array of objects mapping elements to their descriptions WHEN AVAILABLE in the disclosure
   - "view": Type of view if mentioned (perspective, cross-section, etc.)

2. CALLOUTS EXTRACTION - IMPORTANT:
   - For elements that have descriptions in the disclosure, create callout entries
   - Each callout has: { "element": "ID", "description": "element description from the disclosure" }
   - Extract the description from where the element is described in relation to that specific figure
   - Example: If FIG. 1 shows "Interior RGB-IR cameras 101", create: { "element": "101", "description": "Interior RGB-IR cameras" }
   - If an element appears in multiple figures, include it in the callouts for EACH figure where it's described
   - If no description is provided for an element, it's acceptable to have an empty callouts array

3. ELEMENTS SECTION: Global element definitions:
   - Use the EXACT element IDs/numbers mentioned by the user (e.g., "100", "101", "201", etc.)
   - Values should be the component names/descriptions from the disclosure
   - These are the general definitions that apply across ALL figures
   - DO NOT renumber or change the user's labeling system

4. ELEMENT EXTRACTION RULES:
   - PRESERVE the user's numbering system exactly (could be "1, 2, 3" or "101, 102" or "A, B, C")
   - Each figure's "elements" array lists ONLY the IDs mentioned for that specific figure
   - Each figure's "callouts" array MUST have descriptions for ALL elements in that figure
   - Extract element descriptions exactly as provided by the user

5. EXAMPLES OF PROPER EXTRACTION:
   - Text: "FIG. 1 shows a refrigerator body 100 with cameras 101"
     → elements: ["100", "101"]
     → callouts: [
         { "element": "100", "description": "refrigerator body" },
         { "element": "101", "description": "cameras" }
       ]
   - Text: "Interior RGB-IR cameras 101 are positioned to capture images"
     → In FIG. 1 callouts: { "element": "101", "description": "Interior RGB-IR cameras positioned to capture images" }
   - Text: "The control processor 105, equipped with a wireless communication module"
     → In callouts: { "element": "105", "description": "control processor equipped with a wireless communication module" }

6. CALLOUT POPULATION GUIDELINES:
   - ✓ Include callouts for elements that have descriptions in the disclosure
   - ✓ Callout descriptions are extracted from the disclosure text
   - ✓ Descriptions relate to how the element appears/functions in that specific figure
   - ✓ Empty callouts arrays are acceptable if the disclosure doesn't provide element descriptions

WHEN PROCESSING ELEMENT DESCRIPTIONS: 
- If you see text like "Interior RGB-IR cameras 101 are positioned to capture images", create a callout
- If elements are just listed without descriptions (e.g., "elements 201, 202, 203"), include them in the elements array but callouts can be empty
- Extract what's available - don't force callouts where descriptions don't exist

IMPORTANT INSTRUCTIONS:
1. ONLY extract what is explicitly stated or strongly implied in the disclosure text.
2. DO NOT invent features, use cases, or claims that are not described.
3. Extract ALL specific values, materials, components, and processes mentioned.
4. For any figures referenced (e.g., "FIG. 1A"), include all available element numbers and names.
5. If the invention includes optional ideas, enhancements, or speculation, include them in "futureDirections".
6. If subfigures are labeled (e.g., FIG. 2B), preserve full label. Don't merge with parent figure.
7. Expand lists where supported (e.g., features, advantages), but do NOT fabricate extra content.
8. Extract claims if provided in a numbered list, using dependency language (e.g., "claim 1"), or under a heading like "Claims".

PRIOR ART EXTRACTION:
9. Look for ALL patent references mentioned in the disclosure, including:
   - U.S. Patent No. X,XXX,XXX
   - U.S. Patent Application Publication No. XXXX/XXXXXXX
   - US Patent XXXXXXX
   - European Patent EP XXXXXXX
   - WIPO Publication WO XXXX/XXXXXX
   - Any other patent or publication references
10. For each prior art reference found:
    - patentNumber: Format as clean patent number (e.g., "US10289027", "US20160150661", "EP1234567", "WO2021123456")
    - reference: Keep the original reference text exactly as written in the disclosure
    - context: Explain how/where this patent was mentioned
    - relevance: Explain why this patent is relevant to the invention
11. Remove commas, periods, and extra spaces from patent numbers but keep country codes.

Invention Disclosure:
${disclosureText}
`;
}
