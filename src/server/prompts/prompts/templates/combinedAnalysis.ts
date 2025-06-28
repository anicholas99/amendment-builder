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

TASK:
First, determine if any SINGLE reference anticipates all elements of Claim 1 under § 102.
If not, perform a combined analysis of Claim 1 against ALL the provided references to determine if the claim is obvious under § 103.

For a § 103 obviousness rejection, you MUST:
1.  **Establish Motivation to Combine**: Clearly explain why a Person of Ordinary Skill in the Art (PHOSITA) would have been motivated to combine the teachings of the references.
2.  **Map All Claim Limitations**: Explicitly show how the combination of references teaches each and every limitation of the claim.
3.  **Include Preamble Analysis**: Analyze the claim preamble as a substantive limitation when it recites structural or functional features that define the invention's scope. If the preamble contains patentable subject matter (e.g., "A system for...", "A method of...", specific technical context), include it in your element mapping.

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

Use the tone and reasoning style of a highly experienced patent attorney or USPTO primary examiner. Your justification must resemble language suitable for a formal office action or a legal opinion — persuasive, structured, and properly limited in scope.

Based on your analysis, provide a comprehensive assessment.

CRITICAL INSTRUCTIONS FOR CLAIM REVISION:
If the patentabilityDetermination is "Anticipated (§ 102)" or "Obvious (§ 103)", you MUST provide a revised Claim 1 and optionally dependent claims that address the identified rejections.

Your revised Claim 1 should:
- Maintain broad structural and functional scope to preserve enforceability
- Avoid including every technical detail or distinguishing feature directly in Claim 1
- Address the prior art rejection with **at least one key non-obvious limitation**, and reserve additional novel aspects for dependent claims
- Be written as a complete, standalone patent claim following proper drafting conventions

Where multiple distinguishing features are identified:
- Include the **most central distinguishing feature** in revised Claim 1
- Push **secondary features** (e.g., specific algorithm types, data inputs, training strategies, UI specifics, alert logic, reordering thresholds, etc.) into separate dependent claims listed in strategicRecommendations
- Use the INVENTION CONTEXT to suggest technically accurate dependent claims that align with the actual invention implementation

Example of GOOD claim layering:
- Claim 1: "A system... wherein the processor applies temporal correlation analysis to the sensor data"
- Dependent (in strategicRecommendations): "The system of claim 1, wherein the temporal correlation analysis comprises a Kalman filter with adaptive covariance estimation"

IMPORTANT:
- Base your entire analysis on the provided Claim 1 text and the content of the deep analysis JSONs for the selected references.
- Your 'rejectionJustification' must contain a detailed, legally sound rationale.
- When mapping claim elements, always consider whether the preamble contains substantive limitations that should be analyzed. Include preamble analysis in your element mapping when it defines the technical field, system type, or functional context that distinguishes the invention.
- For 'strategicRecommendations', provide concrete claim language. Use this section to suggest dependent claims that capture secondary distinguishing features not included in the revised Claim 1. Format dependent claims properly (e.g., "2. The system of claim 1, wherein...").
- Your suggested amendments must reflect how experienced patent attorneys write claims — layered, broad at the top, and specific only where necessary.
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
    'string | null (The single anticipating reference for a § 102 rejection, otherwise null)',
  combinedReferences:
    'string[] (List of reference IDs used for a § 103 obviousness rejection)',
  rejectionJustification: {
    motivationToCombine:
      'string (Detailed explanation of why a PHOSITA would combine these references. Null if § 102 rejection)',
    claimElementMapping: [
      {
        element: 'string (The specific text of a claim element)',
        taughtBy: 'string (Which reference(s) teach this element and how)',
      },
    ],
    fullNarrative:
      'string (A holistic narrative explaining the rejection, integrating the motivation and mapping)',
  },
  strategicRecommendations: [
    {
      recommendation:
        'string (Strategy to overcome the rejection - e.g., "Add dependent claim for secondary distinguishing feature")',
      suggestedAmendmentLanguage:
        'string (Complete claim language - for dependent claims, write as "2. The [system/method] of claim 1, wherein..." format)',
    },
  ],
  originalClaim: 'string (The original Claim 1 text as provided)',
  revisedClaim:
    'string (The revised Claim 1 text with the CORE distinguishing feature that overcomes the primary rejection. Keep it broad - do NOT stuff all distinguishing features here. If patentabilityDetermination is "Anticipated (§ 102)" or "Obvious (§ 103)", this MUST be different from originalClaim. Only if "Likely Patentable" should it be identical to originalClaim)',
};
