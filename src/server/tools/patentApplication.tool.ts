import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { findProjectByIdAndTenant } from '@/repositories/project/core.repository';
import { findDraftDocumentsByProject } from '@/repositories/project/draft.repository';
import { rebuildHtmlContent } from '@/features/patent-application/utils/patent-sections';

// Define the actual return type for this function
interface PatentApplicationToolResult {
  hasApplication: boolean;
  contentLength?: number;
  sections?: string[];
  analysis: string;
  suggestions: string[];
  fullContent?: string;
  plainTextPreview?: string;
}

/**
 * Analyzes the generated patent application for a project
 * Returns the patent content and analysis of its structure
 *
 * NOTE: This tool fetches from DraftDocument (working copy) rather than
 * ApplicationVersion (saved snapshots) to ensure the chat agent always
 * sees the latest edits in real-time.
 *
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function analyzePatentApplication(
  projectId: string,
  tenantId: string
): Promise<PatentApplicationToolResult> {
  logger.debug('[PatentApplicationTool] Starting analysis', {
    projectId,
    tenantId,
  });

  try {
    // First, verify tenant ownership
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
      logger.info('[PatentApplicationTool] No draft documents found', {
        projectId,
      });
      return {
        hasApplication: false,
        analysis:
          'No patent application has been generated yet for this project.',
        suggestions: [
          'Generate a patent application from the Patent Application view',
          'Make sure you have completed the invention details and claims first',
        ],
      };
    }

    // Rebuild content from sections (following the new architecture)
    const sectionDocs: Record<string, string> = {};
    draftDocuments.forEach((doc: any) => {
      if (doc.type && doc.content != null && doc.type !== 'FULL_CONTENT') {
        sectionDocs[doc.type] = doc.content;
      }
    });

    // Check if we have any sections
    if (Object.keys(sectionDocs).length === 0) {
      logger.info(
        '[PatentApplicationTool] No patent sections found in draft documents',
        {
          projectId,
          draftDocumentTypes: draftDocuments.map(d => d.type),
        }
      );
      return {
        hasApplication: false,
        analysis: 'No patent application content found in draft documents.',
        suggestions: [
          'Generate a patent application from the Patent Application view',
          'Make sure you have completed the invention details and claims first',
        ],
      };
    }

    // Rebuild the full content from sections
    let content = '';
    try {
      content = rebuildHtmlContent(sectionDocs) || '';
    } catch (error) {
      logger.error(
        '[PatentApplicationTool] Error rebuilding content from sections',
        {
          error,
          projectId,
          sectionTypes: Object.keys(sectionDocs),
        }
      );
      throw new ApplicationError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to rebuild patent content from sections'
      );
    }

    if (!content) {
      logger.info('[PatentApplicationTool] Rebuilt content is empty', {
        projectId,
        sectionCount: Object.keys(sectionDocs).length,
      });
      return {
        hasApplication: false,
        analysis:
          'Patent application sections exist but could not be assembled.',
        suggestions: [
          'Try regenerating the patent application',
          'Contact support if the issue persists',
        ],
      };
    }

    logger.info('[PatentApplicationTool] Successfully rebuilt patent content', {
      projectId,
      contentLength: content.length,
      sectionCount: Object.keys(sectionDocs).length,
    });

    // Better section detection - first H1 is usually the title
    const firstH1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const hasTitle = !!firstH1Match;
    const title = firstH1Match ? firstH1Match[1].trim() : null;

    // Analyze the content structure (exclude the title from sections)
    const sections: string[] = [];
    const sectionRegex = /<h[2-3][^>]*>([^<]+)<\/h[2-3]>/gi; // Only H2 and H3 for sections
    let match;
    while ((match = sectionRegex.exec(content)) !== null) {
      const sectionName = match[1].trim();
      // Skip if it's the same as the title
      if (sectionName !== title) {
        sections.push(sectionName);
      }
    }

    // Strip HTML tags for text analysis and preview
    const stripHtml = (html: string): string => {
      return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const plainTextContent = stripHtml(content);
    const wordCount = plainTextContent.split(/\s+/).length;

    // Check for standard patent sections
    const sectionLower = sections.map(s => s.toLowerCase());
    const hasField = sectionLower.some(s => s.includes('field'));
    const hasBackground = sectionLower.some(s => s.includes('background'));
    const hasSummary = sectionLower.some(s => s.includes('summary'));
    const hasClaims = sectionLower.some(s => s.includes('claim'));
    const hasAbstract = sectionLower.some(s => s.includes('abstract'));
    const hasDrawings = sectionLower.some(
      s => s.includes('drawing') || s.includes('figure')
    );
    const hasDetailed = sectionLower.some(
      s => s.includes('detailed') || s.includes('description')
    );

    const missingSections: string[] = [];
    if (!hasField) missingSections.push('Field of Invention');
    if (!hasBackground) missingSections.push('Background');
    if (!hasSummary) missingSections.push('Summary');
    if (!hasClaims) missingSections.push('Claims');
    if (!hasAbstract) missingSections.push('Abstract');
    if (!hasDetailed) missingSections.push('Detailed Description');

    const suggestions: string[] = [];
    if (missingSections.length > 0) {
      suggestions.push(
        `Consider adding these standard sections: ${missingSections.join(', ')}`
      );
    }
    if (wordCount < 3000) {
      suggestions.push(
        `The application has ${wordCount} words. USPTO typically expects 3,000-10,000 words for a complete application.`
      );
    }
    if (wordCount < 2000) {
      suggestions.push(
        'Consider expanding the detailed description with more implementation details, examples, and embodiments.'
      );
    }
    if (!hasDrawings) {
      suggestions.push(
        'No figure descriptions found. Most patent applications benefit from drawings to illustrate the invention.'
      );
    }

    // Count claims if found
    const claimsMatch = content.match(
      /<h[1-3][^>]*>CLAIMS?<\/h[1-3]>([\s\S]*?)(?=<h[1-3]|$)/i
    );
    let claimCount = 0;
    if (claimsMatch) {
      const claimsText = claimsMatch[1];
      const claimNumbers = claimsText.match(/\b\d+\.\s+/g);
      claimCount = claimNumbers ? claimNumbers.length : 0;
    }

    const analysis = `Your patent application "${title || 'Untitled'}" contains ${sections.length} sections, ${claimCount} claims, and approximately ${wordCount} words.`;

    logger.info('[PatentApplicationTool] Analysis complete', {
      projectId,
      title,
      sectionCount: sections.length,
      claimCount,
      wordCount,
      missingSections: missingSections.length,
    });

    return {
      hasApplication: true,
      contentLength: content.length,
      sections,
      analysis,
      suggestions:
        suggestions.length > 0
          ? suggestions
          : ['Your patent application appears well-structured!'],
      fullContent: content,
      plainTextPreview: plainTextContent.substring(0, 1000) + '...',
    };
  } catch (error) {
    logger.error('[PatentApplicationTool] Analysis failed', {
      projectId,
      error,
    });
    throw error;
  }
}
