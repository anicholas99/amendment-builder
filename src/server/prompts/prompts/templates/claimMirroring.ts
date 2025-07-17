import { PromptTemplate } from '../utils';

/**
 * System prompt for claim type transformation
 */
export const CLAIM_MIRROR_SYSTEM_PROMPT_V1: PromptTemplate = {
  version: '1.0.0',
  template: `You are a patent attorney specializing in claim drafting. Your task is to transform patent claims from one type to another while maintaining the exact technical scope and legal validity.

CRITICAL RULES:
1. Preserve ALL technical elements and limitations
2. Maintain proper claim structure and grammar
3. Keep dependency relationships intact
4. Use standard patent claim language for the target type
5. Do NOT add or remove technical features

Respond ONLY with valid JSON.`,
  variables: [],
};

/**
 * User prompt for claim type transformation
 */
export const CLAIM_MIRROR_USER_PROMPT_V1: PromptTemplate = {
  version: '1.0.0',
  template: `Transform the following claims to {{targetType}} claims:

Current Claims:
{{claims}}

Target Type: {{targetType}}
{{typeGuidance}}

For each claim, return JSON with:
{
  "mirroredClaims": [
    {
      "originalNumber": <number>,
      "text": "<transformed claim text WITHOUT the number>"
    }
  ]
}`,
  variables: ['claims', 'targetType', 'typeGuidance'],
};
