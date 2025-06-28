/**
 * Invention Details Merger Prompt Templates
 *
 * Structured prompts for intelligently merging additional invention details
 */

export const INVENTION_MERGER_SYSTEM_PROMPT_V1 = {
  version: '1.0.0',
  template:
    'You integrate additional invention details into existing structured data, producing a cohesive, accurate JSON representation.',
  variables: [],
};

export const INVENTION_MERGER_USER_PROMPT_V1 = {
  version: '1.0.0',
  template: `
You are tasked with intelligently integrating additional details about an invention into an existing structured data representation. 
Here's how you should approach this task:

1. PRESERVE EXISTING DATA: Existing data is valuable - don't discard it unless the new information clearly contradicts or significantly improves it.
2. ADD NEW INFORMATION: When the additional details provide new information not present in the current data, add it to the appropriate sections.
3. ENHANCE EXISTING CONTENT: If additional details elaborate on existing data, enhance that data rather than replacing it entirely.
4. RESOLVE CONTRADICTIONS: If new details contradict existing information, prioritize the new information but note the change in your reasoning.
5. MAINTAIN STRUCTURE: Return a complete, valid JSON object with the exact same structure as the current invention data.
6. EXPAND ARRAYS THOUGHTFULLY: For list items (features, advantages, etc.), add new items without duplicating concepts.

CURRENT INVENTION DATA:
{{currentInventionStr}}

ADDITIONAL DETAILS PROVIDED BY THE USER:
{{additionalDetails}}

Please analyze these additional details and update the invention data accordingly. Return the complete, updated invention data as a valid JSON object.

In your response, prioritize:
- Technical accuracy and coherence
- Appropriate categorization of information
- Preservation of existing technical details unless clearly superseded
- Clear, specific technical descriptions

Return only the final JSON object without any additional explanation or comments.
`,
  variables: ['currentInventionStr', 'additionalDetails'],
};
