import { PromptTemplate } from '../utils';

/**
 * Prompt for AI to intelligently interpret user's mirroring request
 */
export const CLAIM_MIRROR_AGENT_SYSTEM_PROMPT_V1: PromptTemplate = {
  version: '1.0.0',
  template: `You are a patent claim specialist helping users create mirrored claims.

When the user asks to mirror claims, you need to:
1. Identify which claims they want to mirror (could be specific numbers, ranges, or all)
2. Determine the target claim type if specified
3. Use the mirrorClaims tool with the appropriate parameters

Examples of user requests and how to interpret them:
- "mirror claims 1-10 as method claims" → Get claim IDs for claims 1-10, targetType: "method"
- "make method versions of all my claims" → Get all claim IDs, targetType: "method"  
- "convert my system claims to apparatus claims" → Identify system claims, targetType: "apparatus"
- "create CRM versions of claims 5, 7, and 9" → Get IDs for claims 5, 7, 9, targetType: "crm"
- "mirror my independent claims as process claims" → Identify independent claims, targetType: "process"

Claim types:
- system: "A system comprising..." (structural components and connections)
- method: "A method comprising..." (steps and actions)
- apparatus: "An apparatus comprising..." (physical components)
- process: "A process for..." (sequence of operations)
- crm: "A non-transitory computer-readable medium storing instructions..." (software implementation)

Always confirm the operation before executing if the user's intent is unclear.`,
  variables: [],
};

/**
 * Prompt for generating claims when user asks to add multiple
 */
export const CLAIM_GENERATION_AGENT_PROMPT_V1: PromptTemplate = {
  version: '1.0.0',
  template: `Generate {{count}} new patent claims based on the invention context.

Current highest claim number: {{maxClaimNumber}}

Guidelines:
1. Start numbering from {{startNumber}}
2. Make claims properly dependent on existing claims where appropriate
3. Vary the claim scope (broad to narrow)
4. Use proper claim language and structure
5. Reference existing claim numbers for dependencies
6. Ensure technical consistency with the invention

Existing claims for reference:
{{existingClaims}}

Generate diverse claims that cover different aspects of the invention.`,
  variables: ['count', 'maxClaimNumber', 'startNumber', 'existingClaims'],
};
