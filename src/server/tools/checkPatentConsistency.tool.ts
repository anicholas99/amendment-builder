import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { OpenaiServerService } from '@/server/services/openai.server-service';
import { extractSections } from '@/features/patent-application/utils/patent-sections';
import { findProjectByIdAndTenant } from '@/repositories/project/core.repository';
import { findDraftDocumentsByProject } from '@/repositories/project/draft.repository';
import { rebuildHtmlContent } from '@/features/patent-application/utils/patent-sections/rebuildContent';
import { inventionRepository } from '@/repositories/inventionRepository';
import { ClaimRepository } from '@/repositories/claimRepository';

export interface PatentConsistencyIssue {
  section: string;
  type:
    | 'missing_reference'
    | 'terminology'
    | 'claim_support'
    | 'format'
    | 'contradiction';
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

export interface CheckPatentConsistencyResult {
  issues: PatentConsistencyIssue[];
  summary: string;
  overallScore: number; // 0-100
}

/**
 * Checks patent application for consistency issues
 *
 * This tool:
 * 1. Fetches the current draft document
 * 2. Analyzes all sections for consistency
 * 3. Checks claim support in detailed description
 * 4. Verifies terminology consistency
 * 5. Ensures proper cross-references
 *
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function checkPatentConsistency(
  projectId: string,
  tenantId: string
): Promise<CheckPatentConsistencyResult> {
  logger.info('[CheckPatentConsistency] Starting consistency check', {
    projectId,
    tenantId,
  });

  try {
    // First, verify tenant ownership using repository
    const project = await findProjectByIdAndTenant(projectId, tenantId);

    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    // Fetch all draft documents for the project
    const draftDocuments = await findDraftDocumentsByProject(projectId);

    if (!draftDocuments || draftDocuments.length === 0) {
      return {
        issues: [
          {
            section: 'Document',
            type: 'format',
            severity: 'error',
            message: 'No patent application draft found',
            suggestion: 'Generate a patent application first',
          },
        ],
        summary: 'No patent application found to check',
        overallScore: 0,
      };
    }

    // Rebuild content from sections (following the new architecture)
    const sectionDocs: Record<string, string> = {};
    draftDocuments.forEach((doc: any) => {
      if (doc.type && doc.content != null && doc.type !== 'FULL_CONTENT') {
        sectionDocs[doc.type] = doc.content;
      }
    });

    let fullContent = '';
    if (Object.keys(sectionDocs).length > 0) {
      try {
        fullContent = rebuildHtmlContent(sectionDocs) || '';
      } catch (error) {
        logger.error(
          '[CheckPatentConsistency] Error rebuilding content from sections',
          { error }
        );
        return {
          issues: [
            {
              section: 'Document',
              type: 'format',
              severity: 'error',
              message: 'Error rebuilding patent content from sections',
              suggestion: 'Try regenerating the patent application',
            },
          ],
          summary: 'Failed to rebuild patent content',
          overallScore: 0,
        };
      }
    }

    if (!fullContent) {
      return {
        issues: [
          {
            section: 'Document',
            type: 'format',
            severity: 'error',
            message: 'No patent content found',
            suggestion: 'Generate a patent application first',
          },
        ],
        summary: 'No patent application content to check',
        overallScore: 0,
      };
    }

    // Extract sections from the rebuilt content
    const sections = extractSections(fullContent);

    // Get invention and claims data
    let inventionClaims: any[] = [];
    if (project.invention) {
      // Get claims for the invention
      const claims = await ClaimRepository.findByInventionId(
        project.invention.id
      );
      inventionClaims = claims.map(claim => ({
        number: claim.number,
        text: claim.text,
      }));
    }

    // Perform various consistency checks
    const issues: PatentConsistencyIssue[] = [];

    // Check 1: Required sections present
    checkRequiredSections(sections, issues);

    // Check 2: Claims consistency
    checkClaimsConsistency(sections, inventionClaims, issues);

    // Check 3: Terminology consistency
    await checkTerminologyConsistency(sections, issues);

    // Check 4: Cross-references
    checkCrossReferences(sections, issues);

    // Check 5: Format compliance
    checkFormatCompliance(sections, issues);

    // Calculate overall score
    const overallScore = calculateScore(issues);

    // Generate summary
    const summary = generateSummary(issues, overallScore);

    logger.info('[CheckPatentConsistency] Consistency check completed', {
      projectId,
      issueCount: issues.length,
      overallScore,
    });

    return {
      issues,
      summary,
      overallScore,
    };
  } catch (error) {
    logger.error('[CheckPatentConsistency] Check failed', {
      projectId,
      error,
    });
    throw error;
  }
}

function checkRequiredSections(
  sections: { [key: string]: string },
  issues: PatentConsistencyIssue[]
): void {
  const requiredSections = [
    'Title',
    'FIELD',
    'BACKGROUND',
    'SUMMARY',
    'DETAILED DESCRIPTION',
    'CLAIMS',
    'ABSTRACT',
  ];

  requiredSections.forEach(sectionName => {
    if (!sections[sectionName] || sections[sectionName].trim().length < 50) {
      issues.push({
        section: sectionName,
        type: 'format',
        severity: sectionName === 'CLAIMS' ? 'error' : 'warning',
        message: `${sectionName} section is missing or too short`,
        suggestion: `Add a comprehensive ${sectionName} section`,
      });
    }
  });

  // Check abstract length (should be ~150 words)
  if (sections['ABSTRACT']) {
    const wordCount = sections['ABSTRACT'].split(/\s+/).length;
    if (wordCount > 200) {
      issues.push({
        section: 'ABSTRACT',
        type: 'format',
        severity: 'warning',
        message: `Abstract has ${wordCount} words (should be under 150)`,
        suggestion: 'Shorten the abstract to meet USPTO requirements',
      });
    }
  }
}

function checkClaimsConsistency(
  sections: { [key: string]: string },
  inventionClaims: any[],
  issues: PatentConsistencyIssue[]
): void {
  const claimsSection = sections['CLAIMS'] || '';
  const detailedDescription = sections['DETAILED DESCRIPTION'] || '';

  // Check if all invention claims are in the patent
  inventionClaims.forEach(claim => {
    if (!claimsSection.includes(claim.text)) {
      issues.push({
        section: 'CLAIMS',
        type: 'claim_support',
        severity: 'error',
        message: `Claim ${claim.number} from invention not found in patent claims section`,
        suggestion:
          'Ensure all invention claims are included in the patent application',
      });
    }
  });

  // Extract claim elements from claims section
  const claimElements = extractClaimElements(claimsSection);

  // Check if each claim element is supported in detailed description
  claimElements.forEach(element => {
    if (!detailedDescription.toLowerCase().includes(element.toLowerCase())) {
      issues.push({
        section: 'DETAILED DESCRIPTION',
        type: 'claim_support',
        severity: 'warning',
        message: `Claim element "${element}" not found in detailed description`,
        suggestion: `Add explanation of "${element}" to the detailed description`,
      });
    }
  });
}

async function checkTerminologyConsistency(
  sections: { [key: string]: string },
  issues: PatentConsistencyIssue[]
): Promise<void> {
  // Use AI to check for terminology consistency
  const sectionsText = Object.entries(sections)
    .map(([name, content]) => `${name}:\n${content}`)
    .join('\n\n');

  const systemPrompt = `You are an expert patent attorney checking for terminology consistency in a patent application.
Analyze the following patent sections and identify any inconsistent use of technical terms.
Return a JSON array of issues found. Each issue should have:
- term: the inconsistent term
- variations: array of different variations found
- suggestion: the recommended consistent term

Return ONLY valid JSON, no explanations.`;

  try {
    const response = await OpenaiServerService.getChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: sectionsText },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const aiIssues = JSON.parse(response.content);

    if (Array.isArray(aiIssues)) {
      aiIssues.forEach(issue => {
        issues.push({
          section: 'Multiple sections',
          type: 'terminology',
          severity: 'warning',
          message: `Inconsistent terminology: "${issue.term}" appears as ${issue.variations.join(', ')}`,
          suggestion: `Use "${issue.suggestion}" consistently throughout`,
        });
      });
    }
  } catch (error) {
    logger.error('[CheckPatentConsistency] AI terminology check failed', {
      error,
    });
  }
}

function checkCrossReferences(
  sections: { [key: string]: string },
  issues: PatentConsistencyIssue[]
): void {
  const allText = Object.values(sections).join('\n');

  // Check figure references
  const figureRefs = allText.match(/(?:FIG\.|Figure|Fig\.)\s*(\d+)/gi) || [];
  const uniqueFigures = new Set(
    figureRefs.map(ref => ref.match(/\d+/)?.[0]).filter(Boolean)
  );

  const drawingsSection = sections['BRIEF DESCRIPTION OF THE DRAWINGS'] || '';

  uniqueFigures.forEach(figNum => {
    if (
      !drawingsSection.includes(`FIG. ${figNum}`) &&
      !drawingsSection.includes(`Figure ${figNum}`)
    ) {
      issues.push({
        section: 'BRIEF DESCRIPTION OF THE DRAWINGS',
        type: 'missing_reference',
        severity: 'warning',
        message: `Figure ${figNum} referenced but not described in drawings section`,
        suggestion: `Add description for Figure ${figNum} to the Brief Description of the Drawings`,
      });
    }
  });
}

function checkFormatCompliance(
  sections: { [key: string]: string },
  issues: PatentConsistencyIssue[]
): void {
  // Check claims formatting
  const claimsSection = sections['CLAIMS'] || '';
  const claimLines = claimsSection.split('\n').filter(line => line.trim());

  // Check if claims are properly numbered
  let expectedClaimNumber = 1;
  claimLines.forEach(line => {
    const claimMatch = line.match(/^(\d+)\.\s+/);
    if (claimMatch) {
      const claimNumber = parseInt(claimMatch[1]);
      if (claimNumber !== expectedClaimNumber) {
        issues.push({
          section: 'CLAIMS',
          type: 'format',
          severity: 'error',
          message: `Claims numbering issue: expected claim ${expectedClaimNumber}, found claim ${claimNumber}`,
          suggestion: 'Ensure claims are numbered sequentially',
        });
      }
      expectedClaimNumber = claimNumber + 1;
    }
  });
}

function extractClaimElements(claimsText: string): string[] {
  const elements: string[] = [];

  // Extract key technical terms from claims
  const technicalPhrases =
    claimsText.match(/(?:comprising|including|having|wherein)([^;.]+)/gi) || [];

  technicalPhrases.forEach(phrase => {
    // Extract noun phrases that are likely claim elements
    const nounPhrases =
      phrase.match(/\b(?:a |an |the |said )?([a-z]+(?:\s+[a-z]+)*)\b/gi) || [];
    nounPhrases.forEach(np => {
      const cleaned = np.replace(/^(a |an |the |said )/i, '').trim();
      if (
        cleaned.length > 3 &&
        !['wherein', 'comprising', 'including', 'having'].includes(
          cleaned.toLowerCase()
        )
      ) {
        elements.push(cleaned);
      }
    });
  });

  return [...new Set(elements)]; // Remove duplicates
}

function calculateScore(issues: PatentConsistencyIssue[]): number {
  let score = 100;

  issues.forEach(issue => {
    switch (issue.severity) {
      case 'error':
        score -= 15;
        break;
      case 'warning':
        score -= 5;
        break;
      case 'info':
        score -= 2;
        break;
    }
  });

  return Math.max(0, score);
}

function generateSummary(
  issues: PatentConsistencyIssue[],
  score: number
): string {
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  if (score >= 90) {
    return `Excellent! Your patent application is highly consistent with ${issues.length} minor suggestions.`;
  } else if (score >= 70) {
    return `Good consistency overall. Found ${errorCount} errors and ${warningCount} warnings that should be addressed.`;
  } else if (score >= 50) {
    return `Moderate consistency issues found. ${errorCount} errors and ${warningCount} warnings need attention for a stronger application.`;
  } else {
    return `Significant consistency issues detected. ${errorCount} critical errors must be fixed before filing.`;
  }
}
