/**
 * Pattern Detector - Detects common tool chain patterns in user queries
 *
 * This module helps optimize tool selection by recognizing
 * common patterns in user requests
 */

export class PatternDetector {
  /**
   * Common tool chains for optimization
   */
  private static readonly COMMON_TOOL_CHAINS: Record<string, string[]> = {
    'review-claims': ['getClaims', 'batchProposeRevisions'],
    'mirror-all': ['getClaims', 'mirrorClaims'],
    'full-analysis': ['analyzePatentApplication', 'checkPatentConsistency'],
    'proofread-all': ['getClaims', 'batchProposeRevisions'],
    'add-dependent': ['getClaims', 'addClaims'],
    'multiple-sections': ['batchEnhancePatentSections'],
  };

  /**
   * Check if a user query matches a common tool chain pattern
   */
  static detectToolChainPattern(userMessage: string): string | null {
    const lowerMessage = userMessage.toLowerCase();

    if (
      lowerMessage.includes('proofread') ||
      (lowerMessage.includes('check') && lowerMessage.includes('claims'))
    ) {
      return 'proofread-all';
    }
    if (
      lowerMessage.includes('mirror') &&
      (lowerMessage.includes('all') || lowerMessage.includes('claims'))
    ) {
      return 'mirror-all';
    }
    if (
      lowerMessage.includes('analyze') &&
      lowerMessage.includes('consistency')
    ) {
      return 'full-analysis';
    }

    // Detect multiple patent sections
    const sectionKeywords = [
      'field',
      'background',
      'summary',
      'abstract',
      'description',
      'detailed description',
    ];
    let sectionCount = 0;
    for (const section of sectionKeywords) {
      if (lowerMessage.includes(section)) {
        sectionCount++;
        if (sectionCount >= 2) {
          return 'multiple-sections';
        }
      }
    }

    return null;
  }

  /**
   * Get the tool chain for a detected pattern
   */
  static getToolChain(pattern: string): string[] | null {
    return this.COMMON_TOOL_CHAINS[pattern] || null;
  }

  /**
   * Get all available patterns
   */
  static getAvailablePatterns(): string[] {
    return Object.keys(this.COMMON_TOOL_CHAINS);
  }

  /**
   * Add a new pattern (for extensibility)
   */
  static addPattern(name: string, tools: string[]): void {
    this.COMMON_TOOL_CHAINS[name] = tools;
  }
}
