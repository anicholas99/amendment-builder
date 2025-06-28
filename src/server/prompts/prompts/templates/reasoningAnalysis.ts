/**
 * Reasoning Analysis Prompt Templates
 *
 * Structured prompts for patent claim coverage analysis and quality assessment
 */

export const CLAIM_COVERAGE_ANALYSIS_PROMPT_V1 = {
  version: '1.0.0',
  template: `Analyze the following patent data for coverage gaps:

CLAIMS:
{{claims}}

{{#if includeFeatures}}
{{#if features}}
FEATURES:
{{features}}
{{/if}}
{{/if}}

{{#if includeAdvantages}}
{{#if advantages}}
ADVANTAGES:
{{advantages}}
{{/if}}
{{/if}}

{{#if includeProblems}}
{{#if problems}}
PROBLEMS SOLVED:
{{problems}}
{{/if}}
{{/if}}

Identify:
1. Key features, advantages, or problems that are NOT covered by any claim
2. Claims that could be expanded to cover missing elements
3. Suggestions for new claims to fill gaps

Be specific and actionable. Format as a clear analysis with sections for "Unclaimed Elements", "Coverage Gaps", and "Recommendations".`,
  variables: [
    'claims',
    'includeFeatures',
    'features',
    'includeAdvantages',
    'advantages',
    'includeProblems',
    'problems',
  ],
};

export const CLAIM_COVERAGE_ANALYSIS_SYSTEM_MESSAGE_V1 = {
  version: '1.0.0',
  template:
    'You are a patent claim coverage analyst. Provide clear, actionable gap analysis.',
  variables: [],
};

export const PATENT_QUALITY_ASSESSMENT_PROMPT_V1 = {
  version: '1.0.0',
  template: `Assess the patent quality based on these metrics:

COMPLETENESS:
- Title: {{hasTitle}}
- Summary: {{hasSummary}}
- Claims: {{claimCount}}
- Features: {{featureCount}}
- Figures: {{figureCount}}
- Problems Solved: {{problemCount}}
- Detailed Description: {{hasDetailedDescription}}
- Alternative Embodiments: {{hasAlternatives}}

Provide:
1. Overall Quality Score (0-100)
2. Breakdown by category (Completeness, Technical Depth, Claim Strength, Clarity)
3. Top 3 specific improvements needed
4. USPTO readiness assessment

Be constructive and specific.`,
  variables: [
    'hasTitle',
    'hasSummary',
    'claimCount',
    'featureCount',
    'figureCount',
    'problemCount',
    'hasDetailedDescription',
    'hasAlternatives',
  ],
};

export const PATENT_QUALITY_ASSESSMENT_SYSTEM_MESSAGE_V1 = {
  version: '1.0.0',
  template:
    'You are a patent quality assessment expert. Provide detailed scoring and actionable improvement recommendations.',
  variables: [],
};
