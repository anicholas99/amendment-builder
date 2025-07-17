/**
 * Prompt templates for combined patentability analysis
 */

export const COMBINED_ANALYSIS_PROMPT_V1 = {
  version: '1.0.0',
  template: `You are an expert USPTO patent examiner.
Given the following Claim 1 text and the detailed deep analysis JSON for several prior art references:

Claim 1:
\`\`\`
{{claimText}}
\`\`\`

Deep Analyses of Selected Prior Art References:
---
{{referencesSection}}
---

TASK:
Perform a combined analysis of Claim 1 against ALL the provided references considered TOGETHER.
Determine the overall patentability, the primary basis for any rejection (e.g., §102 by one reference, §103 by a combination), key issues, strategic recommendations for amendment, a holistic narrative explaining your reasoning, and the specific contribution of each reference to your combined analysis.

If an obviousness argument (§103) is viable by combining teachings from multiple provided references, clearly state which references are being combined and explain how their teachings collectively meet the claim limitations.

IMPORTANT:
- Base your entire analysis on the provided Claim 1 text and the content of the deep analysis JSONs for the selected references.
- Ensure your 'holisticAnalysisNarrative' clearly explains the combined effect of the references.
- For 'referenceContributions', for each provided referenceId, briefly summarize what it teaches that is relevant to the combined assessment.
- When referring to each reference, use its human-readable reference number (e.g., "US20250116981A1") in the output, not the internal ID or UUID.
- When displaying reference numbers, remove all dashes/hyphens (e.g., output "US20250116981A1" instead of "US-20250116981-A1").
- Return your complete analysis STRICTLY as a single, valid JSON object matching this exact structure (do not add any introductory text, apologies, or explanations outside the JSON structure itself):

\`\`\`json
{{desiredJsonStructure}}
\`\`\``,
  variables: ['claimText', 'referencesSection', 'desiredJsonStructure'],
};

export const COMBINED_ANALYSIS_SYSTEM_MESSAGE_V1 = {
  version: '1.0.0',
  template:
    'You are a highly experienced USPTO patent examiner. Your analysis must be objective, detailed, and strictly adhere to the requested JSON output format.',
  variables: [],
};

export const COMBINED_ANALYSIS_JSON_STRUCTURE_V1 = {
  overallAssessment:
    "string (e.g., 'Claim 1 is likely unpatentable over the combined references.')",
  patentabilityDetermination:
    "'Likely Patentable' | 'Potentially Patentable with Amendments' | 'Likely Unpatentable'",
  primaryRejectionBasis:
    "string (e.g., '102 Anticipation by Ref A', '103 Obviousness over Ref B in view of Ref C')",
  keyIssues: ['string (Issue 1)', 'string (Issue 2)'],
  strategicRecommendations: [
    'string (Recommendation 1)',
    'string (Recommendation 2)',
  ],
  holisticAnalysisNarrative:
    'string (Detailed explanation of the combined effect of references, why they are being combined, and how they collectively meet or fail to meet the claim limitations.)',
  referenceContributions: [
    {
      referenceId: 'string (e.g., US20230000001A1)',
      contribution:
        "string (Summary of what this specific reference contributes to the combined analysis, e.g., 'Teaches element A and B')",
    },
  ],
};

// ========================================================================
// V2 - Enhanced prompt for deeper legal reasoning and actionable advice
// ========================================================================

export const COMBINED_ANALYSIS_PROMPT_V2 = {
  version: '2.0.0',
  template: `You are an expert USPTO patent examiner with deep knowledge of patent law, including 35 U.S.C. § 102 and § 103.
Given the following Claim 1 text and the detailed deep analysis JSON for several prior art references:

Claim 1:
\`\`\`
{{claimText}}
\`\`\`
{{inventionContext}}
Deep Analyses of Selected Prior Art References:
---
{{referencesSection}}
---

CRITICAL INSTRUCTION: You MUST analyze ALL {{referenceCount}} references provided above. Do NOT skip any reference. Each reference's deep analysis contains important information that must be considered in your combined analysis.

REFERENCE FORMATTING: When referring to any reference in your analysis, use the format shown above (e.g., "US20250116981A1 (EBAY)"). The company names in parentheses are provided for clarity - you may further abbreviate them if needed for readability (e.g., "US20250116981A1 (EBAY)" instead of "US20250116981A1 (EBAY INCORPORATED)"). Always include some form of the company identifier when available.

TASK:
First, determine if any SINGLE reference anticipates all elements of Claim 1 under § 102.
If not, perform a combined analysis of Claim 1 against ALL the provided references to determine if the claim is obvious under § 103.
You MUST consider each and every reference provided - do not focus on just a subset.

COMPLETE DISCLOSURE ANALYSIS:
As part of your analysis, explicitly identify:
1. Which single references (if any) disclose ALL elements of Claim 1 - check EACH reference
2. Which minimal combinations of references (if no single reference suffices) together disclose ALL elements

IMPORTANT CLARIFICATION ON MINIMAL COMBINATIONS:
- First check if ANY single reference discloses ALL elements (list these in singleReferences)
- If no single reference is sufficient, identify the SMALLEST combinations (usually pairs) that together disclose ALL elements
- For example, if you have references A, B, C, D:
  - Check if any pair (A+B, A+C, A+D, B+C, B+D, C+D) together discloses ALL elements
  - Only if no pairs work, then check triples (A+B+C, etc.)
  - List ONLY the minimal combinations needed - don't just list all references together
- Each combination should be the minimum number of references needed to cover ALL claim elements

For a § 103 obviousness rejection, you MUST:
1.  **Establish Motivation to Combine**: Clearly explain why a Person of Ordinary Skill in the Art (PHOSITA) would have been motivated to combine the teachings of the references.
2.  **Map All Claim Limitations**: Explicitly show how the combination of references teaches each and every limitation of the claim.
3.  **Include Preamble Analysis**: Analyze the claim preamble as a substantive limitation when it recites structural or functional features that define the invention's scope. If the preamble contains patentable subject matter (e.g., "A system for...", "A method of...", specific technical context), include it in your element mapping.
4.  **Consider ALL References**: Your analysis must account for teachings from ALL provided references, not just the most relevant ones.

When assessing obviousness under § 103:
- Avoid generic reasoning like "AI is commonly used" or "mobile apps are standard" unless the references **explicitly teach or suggest** the combined functionality.
- Your motivation to combine must be grounded in an identifiable teaching, suggestion, or rationale (TSM), industry pressure, or known design need.

Amendment Guidelines:
- Avoid overly detailed algorithmic or system implementation language in Claim 1.
- Treat Claim 1 as an independent claim that sets the structural and functional baseline.
- Suggest detailed limitations (e.g., algorithm specifics, training methods, data types) as dependent claim candidates.
- Use legally defensible and realistic amendment language — suitable for real-world prosecution.

When suggesting claim amendments:
- Avoid placing overly specific technical or algorithmic details in Claim 1.
- Keep independent claim language general enough to maintain broad scope.
- Reserve detailed limitations (e.g., algorithmic steps, training data, thresholds, UI specifics) for dependent claims.
- Use realistic "wherein" clauses — only to clarify structure or functional behavior, not to implement methods.
- Avoid "magic words" like "proprietary," "blockchain," or "AI-enhanced" unless specifically tied to a technical effect that advances the claimed invention over the prior art.

CRITICAL FORMATTING INSTRUCTIONS FOR AMENDMENTS:
- NEVER include claim numbers (e.g., "1.", "2.") in any amendment text
- For complete Claim 1 amendments, provide the full claim text WITHOUT numbering
- For dependent claim suggestions, provide only the claim text WITHOUT numbering
- The frontend will handle any necessary numbering

Use the tone and reasoning style of a highly experienced patent attorney or USPTO primary examiner. Your justification must resemble language suitable for a formal office action or a legal opinion — persuasive, structured, and properly limited in scope.

**CRITICAL: SEASONED ATTORNEY STRATEGIC ANALYSIS REQUIRED**
When generating strategic recommendations, you MUST think like a seasoned patent attorney handling a complex multi-reference rejection:

**ATTORNEY STRATEGIC ANALYSIS FRAMEWORK:**
1. **Combined Prior Art Gap Analysis**: What exactly is disclosed vs. merely similar across ALL references in the combination?
2. **Multi-Reference Scope Preservation**: What is the minimum needed to distinguish from the ENTIRE combination while maintaining maximum scope?
3. **Prosecution Strategy Against Combinations**: What are the 2-3 strongest angles to overcome THIS SPECIFIC multi-reference rejection?
4. **Commercial Value Preservation**: Which approach maintains the broadest commercially valuable claim against combined prior art?

**STRATEGIC THINKING PROCESS FOR COMBINATIONS:**
Before generating strategic recommendations, analyze like an experienced attorney facing a complex § 103 rejection:
- Are these references really teaching the combination or just describing separate similar concepts?
- What specific technical gaps exist when ALL references are considered together?
- What would be the minimum addition to clearly distinguish from the ENTIRE combination?
- Which approach avoids over-narrowing while ensuring allowability against all references?
- What would a seasoned prosecutor choose as their best 2-3 options against this specific combination?
- How do the individual reference weaknesses create opportunities when combined?

**STRATEGIC AMENDMENT CATEGORIES FOR COMBINATIONS (choose the best applicable ones):**
1. **Cross-Reference Distinction**: Add features that distinguish from gaps present across ALL references
2. **Integration Advantage**: Specify unique ways the invention integrates concepts that the references teach separately
3. **Functional Combination Enhancement**: Add functional capabilities that go beyond what ANY reference teaches
4. **Technical Implementation Gaps**: Add specific technical approaches not taught by ANY reference in the combination
5. **Operational Context Distinction**: Add context about how/when the invention operates differently from ALL references

**QUALITY REQUIREMENTS FOR COMBINATION-BASED AMENDMENTS:**
- Each suggestion must target a specific gap in the COMBINED prior art coverage
- Consider how the references work together and where the gaps are in their combined teachings
- Avoid approaches that might work against individual references but fail against the combination
- Think about examiner response to the specific combination argument
- Ensure each suggestion is strategically positioned against the combined prior art landscape

Based on your analysis, provide a comprehensive assessment.

CRITICAL INSTRUCTIONS FOR CLAIM REVISION:
If the patentabilityDetermination is "Anticipated (§ 102)" or "Obvious (§ 103)", you MUST provide a revised Claim 1 and optionally dependent claims that address the identified rejections.

Your revised Claim 1 should:
- Maintain broad structural and functional scope to preserve enforceability
- Avoid including every technical detail or distinguishing feature directly in Claim 1
- Address the prior art rejection with **at least one key non-obvious limitation**, and reserve additional novel aspects for dependent claims
- Be written as a complete, standalone patent claim following proper drafting conventions
- NOT include any claim numbering

Where multiple distinguishing features are identified:
- Include the **most central distinguishing feature** in revised Claim 1
- Push **secondary features** (e.g., specific algorithm types, data inputs, training strategies, UI specifics, alert logic, reordering thresholds, etc.) into separate dependent claims listed in strategicRecommendations
- Use the INVENTION CONTEXT to suggest technically accurate dependent claims that align with the actual invention implementation (if dependent claims are determined to be recommendation)

Example of GOOD claim layering:
- Claim 1: "A system... wherein the processor applies temporal correlation analysis to the sensor data"
- Dependent (in strategicRecommendations): "The system of claim 1, wherein the temporal correlation analysis comprises a Kalman filter with adaptive covariance estimation"

IMPORTANT:
- Base your entire analysis on the provided Claim 1 text and the content of the deep analysis JSONs for the selected references.
- Your 'rejectionJustification' must contain a detailed, legally sound rationale.
- When mapping claim elements, always consider whether the preamble contains substantive limitations that should be analyzed. Include preamble analysis in your element mapping when it defines the technical field, system type, or functional context that distinguishes the invention.
- For 'strategicRecommendations', provide concrete claim language following these enhanced requirements:

**STRATEGIC RECOMMENDATION GENERATION RULES:**
Generate ONLY 3-5 high-quality strategic recommendations that a seasoned attorney would actually consider against this specific multi-reference combination:
- Each must address a clear gap identified in the COMBINED prior art
- Each must maintain reasonable claim scope for commercial value against all references
- Each must be technically sound and practically implementable
- Avoid over-narrowing or "kitchen sink" approaches
- Focus on the strongest distinguishing features that matter against the entire combination

For EACH strategic recommendation provide (in the recommendation field):
- Clear strategic explanation of why this overcomes the SPECIFIC multi-reference combination
- Assessment of how this affects claim breadth and commercial value
- Analysis of prosecution strength against this particular combination

Use this section to suggest dependent claims that capture secondary distinguishing features not included in the revised Claim 1. DO NOT include claim numbers - just provide the claim text.
- Your suggested amendments must reflect how experienced patent attorneys write claims — layered, broad at the top, and specific only where necessary.
- In 'combinedReferences', you MUST list ALL reference IDs that were provided for analysis, not just the ones you focused on most. This field should contain exactly {{referenceCount}} reference IDs. Use the EXACT format shown in the deep analyses section (e.g., "US20250116981A1 (EBAY)").
- Use persuasive legal reasoning in a professional tone, as found in USPTO office actions or prosecution history.
- Evaluate the reasonableness of any amendment: if it would raise § 112 concerns or narrow claim 1 unnecessarily, suggest alternate dependent claim placement instead.
- For each recommended amendment, ensure that:
  * The language is legally sound and claim-compatible.
  * It is realistic for an attorney to use in a USPTO amendment.
  * It adds meaningful patentable weight while preserving claim clarity.
- Return your complete analysis STRICTLY as a single, valid JSON object matching this exact structure:

\`\`\`json
{{desiredJsonStructure}}
\`\`\``,
  variables: [
    'claimText',
    'referencesSection',
    'desiredJsonStructure',
    'inventionContext',
    'referenceCount',
  ],
};

export const COMBINED_ANALYSIS_SYSTEM_MESSAGE_V2 = {
  version: '2.0.0',
  template:
    'You are a highly experienced USPTO patent examiner. Your analysis must be objective, detailed, and strictly adhere to the requested JSON output format. Your reasoning for combining references under § 103 must be legally sound.',
  variables: [],
};

export const COMBINED_ANALYSIS_JSON_STRUCTURE_V2 = {
  patentabilityDetermination:
    "'Anticipated (§ 102)' | 'Obvious (§ 103)' | 'Likely Patentable'",
  primaryReference:
    'string | null (The single anticipating reference for a § 102 rejection, formatted as "US20230001A1 (COMPANY NAME)" if applicant is known, otherwise null)',
  combinedReferences:
    'string[] (List of ALL reference IDs analyzed - must include every reference provided, formatted as "US20230001A1 (COMPANY NAME)" when applicant/assignee is known)',
  completeDisclosureAnalysis: {
    singleReferences:
      'string[] (List of single references that disclose ALL elements of claim 1 - formatted with applicant names - may be empty if none)',
    minimalCombinations:
      'string[][] (List of MINIMAL combinations - e.g., [["US20230001A1 (ACME)", "US20230002B1 (TECH CO)"]] means A+B together disclose all elements. Use applicant names when known)',
  },
  rejectionJustification: {
    motivationToCombine:
      'string (Detailed explanation of why a PHOSITA would combine these references. Use full reference format with applicant names. Null if § 102 rejection)',
    claimElementMapping: [
      {
        element: 'string (The specific text of a claim element)',
        taughtBy:
          'string (Which reference(s) teach this element and how - use full format like "US20230001A1 (COMPANY)" when referring to references)',
      },
    ],
    fullNarrative:
      'string (A holistic narrative explaining the rejection, integrating the motivation and mapping. Always use full reference format with applicant names)',
  },
  strategicRecommendations: [
    {
      recommendation:
        'string (Strategy to overcome the rejection - e.g., "Add dependent claim for secondary distinguishing feature")',
      suggestedAmendmentLanguage:
        'string (Complete claim language - for dependent claims, write as "The [system/method] of claim 1, wherein..." format WITHOUT claim numbering)',
    },
  ],
  originalClaim: 'string (The original Claim 1 text as provided)',
  revisedClaim:
    'string (The revised Claim 1 text with the CORE distinguishing feature that overcomes the primary rejection. Keep it broad - do NOT stuff all distinguishing features here. If patentabilityDetermination is "Anticipated (§ 102)" or "Obvious (§ 103)", this MUST be different from originalClaim. Only if "Likely Patentable" should it be identical to originalClaim)',
  completeAmendmentRationale:
    'string (Clear explanation of why the specific amendment to Claim 1 was chosen and how it overcomes the prior art rejection. Reference specific prior art using full format with applicant names)',
  alternativeAmendmentOptions:
    'string[] | null (If applicable, 1-2 alternative amendment approaches that could also overcome the rejection. Include brief explanations. Return null if no reasonable alternatives exist)',
};

// Add a proper example structure for V2
export const COMBINED_ANALYSIS_JSON_EXAMPLE_V2 = {
  patentabilityDetermination: 'Obvious (§ 103)',
  primaryReference: null,
  combinedReferences: [
    'US20230001A1 (ACME)',
    'US20230002B1 (TECH INN)',
    'US20230003C1 (GLOBAL SYS)',
    'US20230004D1 (SMART SOL)',
  ],
  completeDisclosureAnalysis: {
    singleReferences: [],
    minimalCombinations: [
      ['US20230001A1 (ACME)', 'US20230002B1 (TECH INN)'],
      ['US20230001A1 (ACME)', 'US20230003C1 (GLOBAL SYS)'],
    ],
  },
  rejectionJustification: {
    motivationToCombine:
      'A PHOSITA would be motivated to combine the teachings of US20230001A1 (ACME) with US20230002B1 (TECH INN) because...',
    claimElementMapping: [
      {
        element: 'a refrigerator body',
        taughtBy:
          'US20230001A1 (ACME) teaches a refrigerator body in paragraph [0015]',
      },
    ],
    fullNarrative:
      'The combination of US20230001A1 (ACME) and US20230002B1 (TECH INN) renders the claim obvious...',
  },
  strategicRecommendations: [
    {
      recommendation:
        'Add dependent claim for the specific sensor configuration',
      suggestedAmendmentLanguage:
        'The system of claim 1, wherein the sensors comprise temperature and humidity sensors positioned in each compartment',
    },
  ],
  originalClaim: 'A smart refrigerator system comprising...',
  revisedClaim: 'A smart refrigerator system comprising...',
  completeAmendmentRationale:
    "The amendment adds the limitation of 'fused sensor data' which distinguishes over the prior art because neither US20230001A1 (ACME) nor US20230002B1 (TECH INN) discloses...",
  alternativeAmendmentOptions: [
    "Alternative 1: Focus on the neural network training aspect by specifying 'wherein the neural network is trained on multimodal sensor data'",
    "Alternative 2: Emphasize the local processing by adding 'wherein the local control unit performs real-time inference without cloud connectivity'",
  ],
};
