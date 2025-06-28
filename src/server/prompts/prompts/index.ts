/**
 * Centralized Patent AI Prompts
 *
 * This file contains all AI prompts used throughout the patent drafting system.
 * Each prompt is versioned to allow for A/B testing and gradual rollouts.
 */

export const PROMPTS = {
  PATENT_ANALYSIS: {
    v1: 'You are a patent analysis expert. Analyze these citation results against the claim elements.',
    v2: 'You are a patent analysis expert that provides precise, detailed analysis of patent claims against citation data.',
  },

  CLAIM_COVERAGE: {
    v1: 'You are a patent claim coverage analyst. Provide clear, actionable gap analysis.',
  },

  PATENT_DRAFTING: {
    v1: 'You are a patent drafting assistant that helps ensure data consistency.',
    v2: 'You are a patent drafting assistant specialized in precise, section-specific edits.',
  },

  CITATION_REASONING: {
    v1: 'You are a patent analysis assistant that evaluates the relevance of citations to patent claims.',
  },

  SNIPPET_EXTRACTION: {
    v1: 'You are a patent analysis assistant specialized in extracting textual evidence.',
  },

  CROSS_REFERENCE_VALIDATION: {
    v1: 'You are a patent cross-reference validator. Identify all consistency issues between sections.',
  },

  TASK_PLANNING: {
    v1: 'You are a patent task planner. Create clear, actionable plans for complex modifications.',
  },

  QUALITY_ASSESSMENT: {
    v1: 'You are a patent quality assessor. Provide actionable quality metrics and improvements.',
  },
} as const;

/**
 * Helper function to get the latest version of a prompt
 */
export function getLatestPrompt(category: keyof typeof PROMPTS): string {
  const versions = PROMPTS[category];
  const versionKeys = Object.keys(versions).sort((a, b) => {
    const aNum = parseInt(a.slice(1));
    const bNum = parseInt(b.slice(1));
    return bNum - aNum; // Sort descending to get latest first
  });

  return versions[versionKeys[0] as keyof typeof versions];
}

/**
 * Helper function to get a specific version of a prompt
 */
export function getPromptVersion(
  category: keyof typeof PROMPTS,
  version: string
): string {
  const versions = PROMPTS[category];
  return (
    versions[version as keyof typeof versions] || getLatestPrompt(category)
  );
}

/**
 * Type-safe prompt categories
 */
export type PromptCategory = keyof typeof PROMPTS;
export type PromptVersion<T extends PromptCategory> = keyof (typeof PROMPTS)[T];
