import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { findProjectByIdAndTenant } from '@/repositories/project/core.repository';
import { ClaimRepository } from '@/repositories/claimRepository';
import { findDraftDocumentsByProject } from '@/repositories/project/draft.repository';
import { OpenaiServerService } from '@/server/services/openai.server-service';

export interface SupportIssue {
  claimNumber: number;
  term: string;
  type: 'no_support' | 'insufficient_support' | 'unclear_support';
  severity: 'error' | 'warning';
  message: string;
  suggestion?: string;
  specLocations?: string[];
}

export interface Support112Result {
  hasIssues: boolean;
  issues: SupportIssue[];
  summary: {
    totalClaims: number;
    claimsWithIssues: number;
    criticalIssues: number;
  };
  recommendations: string[];
}

/**
 * Checks if claim terms have proper written description support under 35 U.S.C. §112(b)
 * 
 * This tool:
 * 1. Extracts key technical terms from claims
 * 2. Searches for support in the specification
 * 3. Identifies terms lacking written description
 * 4. Provides actionable recommendations
 * 
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function check112Support(
  projectId: string,
  tenantId: string,
  claimIds?: string[]
): Promise<Support112Result> {
  logger.info('[Check112Support] Starting support check', {
    projectId,
    tenantId,
    claimIds,
  });

  try {
    // Verify tenant ownership
    const project = await findProjectByIdAndTenant(projectId, tenantId);
    
    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    // Get claims to check
    let claims;
    if (claimIds && claimIds.length > 0) {
      claims = await ClaimRepository.findByIds(claimIds, tenantId);
    } else if (project.invention) {
      claims = await ClaimRepository.findByInventionId(project.invention.id);
    } else {
      return {
        hasIssues: false,
        issues: [],
        summary: {
          totalClaims: 0,
          claimsWithIssues: 0,
          criticalIssues: 0,
        },
        recommendations: [],
      };
    }

    // Get specification content
    const draftDocuments = await findDraftDocumentsByProject(projectId);
    const specContent = buildSpecificationContent(draftDocuments);

    if (!specContent || specContent.length < 100) {
      return {
        hasIssues: true,
        issues: [{
          claimNumber: 0,
          term: 'specification',
          type: 'no_support',
          severity: 'error',
          message: 'No specification content found',
          suggestion: 'Generate or add specification content before checking support',
        }],
        summary: {
          totalClaims: claims.length,
          claimsWithIssues: claims.length,
          criticalIssues: 1,
        },
        recommendations: ['Add specification content to check claim support'],
      };
    }

    // Analyze each claim for support issues
    const allIssues: SupportIssue[] = [];
    const claimsWithIssues = new Set<number>();

    for (const claim of claims) {
      const issues = await analyzeClaimSupport(
        claim.number,
        claim.text,
        specContent
      );
      
      if (issues.length > 0) {
        allIssues.push(...issues);
        claimsWithIssues.add(claim.number);
      }
    }

    // Count critical issues
    const criticalIssues = allIssues.filter(i => i.severity === 'error').length;

    // Generate recommendations
    const recommendations = generateRecommendations(allIssues);

    logger.info('[Check112Support] Check completed', {
      projectId,
      totalClaims: claims.length,
      issuesFound: allIssues.length,
      criticalIssues,
    });

    return {
      hasIssues: allIssues.length > 0,
      issues: allIssues,
      summary: {
        totalClaims: claims.length,
        claimsWithIssues: claimsWithIssues.size,
        criticalIssues,
      },
      recommendations,
    };
  } catch (error) {
    logger.error('[Check112Support] Check failed', {
      projectId,
      error,
    });
    throw error;
  }
}

/**
 * Build specification content from draft documents
 */
function buildSpecificationContent(draftDocuments: any[]): string {
  const relevantSections = [
    'FIELD',
    'BACKGROUND',
    'SUMMARY',
    'DETAILED_DESCRIPTION',
    'DETAILED DESCRIPTION',
    'BRIEF_DESCRIPTION_OF_THE_DRAWINGS',
    'BRIEF DESCRIPTION OF THE DRAWINGS',
  ];

  let content = '';
  
  draftDocuments.forEach(doc => {
    if (doc.content && relevantSections.includes(doc.type)) {
      content += `\n\n${doc.content}`;
    }
  });

  return content.trim();
}

/**
 * Analyze a single claim for support issues
 */
async function analyzeClaimSupport(
  claimNumber: number,
  claimText: string,
  specContent: string
): Promise<SupportIssue[]> {
  // Create a structured prompt for analysis
  const systemPrompt = `You are a patent attorney checking if claim terms have proper written description support under 35 U.S.C. §112(b).

For each technical term or limitation in the claim:
1. Check if it appears in the specification
2. Check if it's adequately described (not just mentioned)
3. Identify any terms that lack support or enablement

Focus on:
- Technical terms not found in spec
- Functional language without corresponding structure
- Terms used differently in claims vs spec
- Missing enablement details

Respond ONLY with valid JSON:
{
  "supportedTerms": ["term1", "term2"],
  "issues": [
    {
      "term": "problematic term",
      "type": "no_support" | "insufficient_support" | "unclear_support",
      "severity": "error" | "warning",
      "message": "specific issue",
      "suggestion": "how to fix",
      "specLocations": ["paragraph or section if partially found"]
    }
  ]
}`;

  const userPrompt = `Claim ${claimNumber}:
"${claimText}"

Specification Content:
${specContent.substring(0, 8000)}

Check for written description support issues.`;

  try {
    const response = await OpenaiServerService.getChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    });

    const result = JSON.parse(response.content);
    
    // Add claim number to each issue
    return (result.issues || []).map((issue: any) => ({
      claimNumber,
      ...issue,
    }));
  } catch (error) {
    logger.error('[Check112Support] AI analysis failed', {
      claimNumber,
      error,
    });
    
    // Fallback to basic term matching
    return performBasicSupportCheck(claimNumber, claimText, specContent);
  }
}

/**
 * Basic fallback support check using term matching
 */
function performBasicSupportCheck(
  claimNumber: number,
  claimText: string,
  specContent: string
): SupportIssue[] {
  const issues: SupportIssue[] = [];
  const specLower = specContent.toLowerCase();
  
  // Extract technical terms (simplified)
  const technicalTerms = extractTechnicalTerms(claimText);
  
  technicalTerms.forEach(term => {
    const termLower = term.toLowerCase();
    
    // Check if term appears in spec
    if (!specLower.includes(termLower)) {
      issues.push({
        claimNumber,
        term,
        type: 'no_support',
        severity: 'error',
        message: `Term "${term}" not found in specification`,
        suggestion: `Add description of "${term}" to the detailed description`,
      });
    }
  });

  return issues;
}

/**
 * Extract technical terms from claim text
 */
function extractTechnicalTerms(claimText: string): string[] {
  const terms: string[] = [];
  
  // Common patterns for technical terms
  const patterns = [
    /\b(?:module|unit|component|element|member|portion|section)\s+(?:for|that|which)\s+(\w+(?:\s+\w+)*)/gi,
    /\b(\w+(?:\s+\w+)*)\s+(?:module|unit|component|element|member|device|system|apparatus)\b/gi,
    /\b(?:means\s+for|configured\s+to|adapted\s+to)\s+(\w+(?:\s+\w+)*)/gi,
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(claimText)) !== null) {
      if (match[1] && match[1].length > 3) {
        terms.push(match[1].trim());
      }
    }
  });

  // Remove common words
  const commonWords = new Set(['the', 'and', 'for', 'with', 'said', 'wherein', 'comprising']);
  
  return [...new Set(terms)].filter(term => 
    !commonWords.has(term.toLowerCase()) && 
    term.split(/\s+/).length <= 4
  );
}

/**
 * Generate recommendations based on issues found
 */
function generateRecommendations(issues: SupportIssue[]): string[] {
  const recommendations: string[] = [];
  
  // Group issues by type
  const noSupportCount = issues.filter(i => i.type === 'no_support').length;
  const insufficientCount = issues.filter(i => i.type === 'insufficient_support').length;
  const unclearCount = issues.filter(i => i.type === 'unclear_support').length;
  
  if (noSupportCount > 0) {
    recommendations.push(
      `Add written description for ${noSupportCount} unsupported term${noSupportCount > 1 ? 's' : ''} in the detailed description`
    );
  }
  
  if (insufficientCount > 0) {
    recommendations.push(
      `Expand description for ${insufficientCount} term${insufficientCount > 1 ? 's' : ''} with insufficient support`
    );
  }
  
  if (unclearCount > 0) {
    recommendations.push(
      `Clarify ${unclearCount} term${unclearCount > 1 ? 's' : ''} that may have unclear support`
    );
  }

  // Add general recommendations
  if (issues.length > 5) {
    recommendations.push(
      'Consider adding a glossary or definitions section to clarify technical terms'
    );
  }

  const meansPlus = issues.filter(i => i.term.includes('means for')).length;
  if (meansPlus > 0) {
    recommendations.push(
      'Add corresponding structure for means-plus-function limitations to avoid §112(f) interpretation'
    );
  }

  return recommendations;
} 