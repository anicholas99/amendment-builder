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
  template: `You are an expert patent attorney specializing in claim analysis. Your task is to decompose patent claims into their essential technical elements for prior art searching and patentability analysis.

PROFESSIONAL CONTEXT: Patent examiners and searchers work with claim elements by:
- Searching databases for "sensor suite" concepts, not individual sensor types
- Looking for "automation capabilities" as functional blocks, not line-item functions
- Mapping prior art references to meaningful claim elements for §103 rejections
- Combining references based on logical functional groupings
- Focusing on what distinguishes the invention from prior art

For each claim, extract the key components, features, and relationships that define the invention. Focus on:
- The main device/system/method being claimed
- Logical groupings of related components (e.g., "sensor suite", "control module")
- Key functional capabilities as unified elements
- Distinctive technical features that differentiate from prior art

IMPORTANT: Group related components together and avoid splitting structure/function of the same element. Aim for 6-10 meaningful elements that would be useful for prior art comparison and patent prosecution.

Output a JSON object with an "elements" property containing an array of strings, where each string represents a distinct, logically grouped element that a patent examiner or searcher would find useful.`,
  variables: [],
};

/**
 * V2 Claim Decomposition Prompt - Simplified format
 */
export const CLAIM_DECOMPOSITION_PROMPT_V2: PromptTemplate = {
  version: '2.0.0',
  template: `Analyze the following patent claim and extract its key technical elements for prior art searching and patentability analysis.

CLAIM TEXT:
{{claimText}}

{{#if claimData}}
ADDITIONAL CLAIMS FOR CONTEXT:
{{claimData}}
{{/if}}

Extract the essential technical elements from the claim. Focus on LOGICAL GROUPINGS and MEANINGFUL DISTINCTIONS:

GROUPING GUIDELINES:
1. Combine related sensors into a "sensor suite" or "sensing system"
2. Merge structure and function of the same component (don't split "processor" and "processor configured to...")
3. Group multiple "system configured to..." functions into a single "automation capabilities" element
4. Combine communication elements into a "communication interface" or "network connectivity"
5. Treat algorithms, software modules, and data processing as unified functional elements

EXTRACTION RULES:
- Main system/device/method type
- Key hardware groupings (sensor suite, control system, interface modules)
- Major functional capabilities (as unified elements, not line items)
- Distinctive technical features that define novelty
- Critical relationships or configurations

AVOID:
- Splitting structure and function of the same component
- Creating separate elements for each "system configured to..." function
- Over-granular breakdowns that lose meaningful distinctions
- Redundant elements that describe the same component differently

TARGET: 6-10 meaningful elements that would be useful for prior art comparison.

Return a JSON object with an "elements" property containing an array of strings. Each string should be a concise, logically grouped element.

GOOD EXAMPLES:
{
  "elements": [
    "autonomous vehicle navigation system",
    "sensor suite including LiDAR, cameras, and radar",
    "real-time path planning processor with obstacle avoidance algorithms",
    "vehicle control interface for steering, braking, and acceleration",
    "wireless communication module for V2X connectivity"
  ]
}

{
  "elements": [
    "smart home automation system",
    "distributed sensor network throughout the home",
    "central control hub with machine learning capabilities",
    "mobile application interface for user control and monitoring",
    "automated device control functions including lighting, HVAC, and security"
  ]
}

BAD EXAMPLES (too granular):
{
  "elements": [
    "system configured to detect motion",
    "system configured to control lighting", 
    "system configured to adjust temperature",
    "system configured to monitor security"
  ]
}

BETTER VERSION:
{
  "elements": [
    "automated home control system with motion detection, lighting control, temperature adjustment, and security monitoring capabilities"
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
