/**
 * Prompt templates for generating search variants and paraphrases
 */

export const PARAPHRASE_GENERATION_V1 = {
  version: '1.0.0',
  template: `Give 1-2 alternative phrasings a patent might use for this claim element: "{{elementText}}"
Respond with ONLY the alternative phrasings, one per line, with NO numbering, prefixes, or additional text.
Focus on terminology variations while keeping the same meaning.`,
  variables: ['elementText'],
};

export const PARAPHRASE_SYSTEM_MESSAGE_V1 = {
  version: '1.0.0',
  template:
    'You are an expert patent paraphraser. Generate only alternative phrasings with no extra text.',
  variables: [],
};
