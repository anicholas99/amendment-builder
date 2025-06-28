/**
 * Claim Parsing Prompt Templates
 *
 * Structured prompts for parsing patent claims into structured elements
 */

import { PromptTemplate } from '../utils';

/**
 * V2 System Message - Focuses on simple string array output
 */
export const CLAIM_PARSING_SYSTEM_PROMPT_V2 = {
  template: `You are an expert patent attorney specializing in claim analysis. Your task is to decompose patent claims into their essential technical elements.

For each claim, extract the key components, features, and relationships that define the invention. Focus on:
- The main device/system/method being claimed
- Key structural components or process steps
- Important functional relationships or configurations
- Distinctive technical features

Output a JSON object with an "elements" property containing an array of strings, where each string represents a distinct element or feature.`,
  variables: [],
};

/**
 * V2 Claim Decomposition Prompt - Simplified format
 */
export const CLAIM_DECOMPOSITION_PROMPT_V2: PromptTemplate = {
  version: '2.0.0',
  template: `Analyze the following patent claim and extract its key technical elements.

CLAIM TEXT:
{{claimText}}

{{#if claimData}}
ADDITIONAL CLAIMS FOR CONTEXT:
{{claimData}}
{{/if}}

Extract the essential technical elements from the claim. Include:
1. The main invention type (device, system, method, etc.)
2. Key structural components or process steps
3. Important functional features or relationships
4. Any distinctive technical characteristics

Return a JSON object with an "elements" property containing an array of strings. Each string should be a concise description of one element.
Keep descriptions clear and technically accurate. Avoid legal jargon.

Example output format:
{
  "elements": [
    "autonomous vehicle navigation system",
    "LiDAR sensor array",
    "real-time path planning processor",
    "obstacle detection algorithm",
    "GPS integration module"
  ]
}`,
  variables: ['claimText', 'claimData'],
};

export const ELEMENT_VARIANT_GENERATION_PROMPT_V1 = {
  version: '1.0.0',
  template: `Generate 3-5 alternative terms or phrases for the following patent claim element. Focus on technical synonyms, alternative implementations, or broader/narrower terminology that could be found in prior art.

Element: "{{elementText}}"

Return a JSON object with this structure:
{
  "variants": ["synonym1", "alternative2", "broader_term3", "narrower_term4"]
}

Guidelines:
- Include both technical synonyms and functionally equivalent terms
- Consider how the element might be described in prior art
- Include variations in specificity (broader and narrower terms)
- Focus on terms that would be useful for prior art searching
- Keep variants concise and technically accurate`,
  variables: ['elementText'],
};
