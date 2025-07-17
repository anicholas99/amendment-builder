import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { OpenaiServerService } from '@/server/services/openai.server-service';
import {
  extractSections,
  rebuildHtmlContent,
  STANDARD_SECTION_ORDER,
} from '@/features/patent-application/utils/patent-sections';
import { getStandardSectionName } from '@/features/patent-application/utils/patent-sections/sectionConfig';
import { processWithOpenAI } from '@/server/ai/aiService';
import { PatentServerService } from '@/server/services/patent.server-service';
import {
  batchUpdateDraftDocuments,
  findDraftDocumentByType,
  findDraftDocumentsByProject,
  upsertDraftDocument,
} from '@/repositories/project/draft.repository';
import { findProjectByIdAndTenant } from '@/repositories/project/core.repository';

export interface EnhancePatentSectionParams {
  projectId: string;
  tenantId: string;
  sectionName: string;
  instruction: string;
}

export interface EnhancePatentSectionResult {
  success: boolean;
  updatedSection?: string;
  message: string;
  syncTrigger?: {
    projectId: string;
    sectionType: string;
    timestamp: number;
  };
}

interface ContentChanges {
  type: 'substantial' | 'moderate' | 'minor';
  summary: string;
  changeDetails: string[];
  wordCountChange: {
    original: number;
    enhanced: number;
    difference: number;
  };
}

/**
 * Enhances a specific section of the patent application
 *
 * This tool:
 * 1. Fetches the current draft document
 * 2. Extracts the specific section
 * 3. Uses AI to enhance it based on the instruction
 * 4. Updates the draft document
 *
 * SECURITY: Always validates tenant ownership before accessing data
 */
export async function enhancePatentSection(
  projectId: string,
  tenantId: string,
  sectionName: string,
  instruction: string
): Promise<EnhancePatentSectionResult> {
  logger.info('[EnhancePatentSection] Starting section enhancement', {
    projectId,
    tenantId,
    sectionName,
    instruction: instruction.substring(0, 100),
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
      return {
        success: false,
        message:
          'No patent application draft found. Please generate a patent application first.',
      };
    }

    // Rebuild content from sections
    const sectionMap: Record<string, string> = {};
    draftDocuments.forEach(doc => {
      if (doc.type && doc.content && doc.type !== 'FULL_CONTENT') {
        // Get standard section name from the document type
        const standardName = getStandardSectionName(doc.type);
        logger.debug('[EnhancePatentSection] Mapping document', {
          docType: doc.type,
          standardName,
          contentLength: doc.content?.length || 0,
        });
        if (standardName) {
          sectionMap[standardName] = doc.content;
        }
      }
    });

    logger.info('[EnhancePatentSection] Built section map', {
      availableSections: Object.keys(sectionMap),
      sectionCount: Object.keys(sectionMap).length,
    });

    // Check if we have any sections
    if (Object.keys(sectionMap).length === 0) {
      return {
        success: false,
        message: 'No patent sections found in draft.',
      };
    }

    // Extract sections from the rebuilt content for compatibility
    const sections = sectionMap;

    // Normalize section name to match our standard sections
    const normalizedSectionName = normalizeSectionName(sectionName);

    if (!sections[normalizedSectionName]) {
      return {
        success: false,
        message: `Section "${sectionName}" not found in the patent application. Available sections: ${Object.keys(sections).join(', ')}`,
      };
    }

    const currentSectionContent = sections[normalizedSectionName];

    // Use AI to enhance the section
    const enhancementResult = await enhanceContentWithAI(
      normalizedSectionName,
      currentSectionContent,
      instruction,
      project.name
    );

    // Analyze the changes made
    const changes = analyzeContentChanges(currentSectionContent, enhancementResult.content);

    // Update the section
    sections[normalizedSectionName] = enhancementResult.content;

    // Save the enhanced section directly
    const sectionType = normalizedSectionName
      .toUpperCase()
      .replace(/\s+/g, '_');

    // Update the draft document for this specific section
    await upsertDraftDocument(projectId, sectionType, enhancementResult.content);

    // Note: Client-side event emission removed - updates will be picked up by polling/SSE
    // The frontend automatically refreshes when draft documents change

    logger.info('[EnhancePatentSection] Section enhanced successfully', {
      projectId,
      sectionName: normalizedSectionName,
      sectionType,
      originalLength: currentSectionContent.length,
      enhancedLength: enhancementResult.content.length,
      changeType: changes.type,
      aiSummary: enhancementResult.changeSummary.substring(0, 100),
    });

    // Generate detailed message based on changes
    const detailedMessage = generateDetailedMessage(
      normalizedSectionName,
      changes,
      enhancementResult.changeSummary
    );

    // Note: React Query invalidation should happen through WebSocket/SSE events
    // The frontend listens for draft document updates and invalidates the cache automatically

    return {
      success: true,
      updatedSection: enhancementResult.content,
      message: detailedMessage,
      syncTrigger: {
        projectId,
        sectionType,
        timestamp: Date.now(),
      },
    };
  } catch (error) {
    logger.error('[EnhancePatentSection] Enhancement failed', {
      projectId,
      sectionName,
      error,
    });
    throw error;
  }
}

/**
 * Normalize section names to match our standard section names
 */
function normalizeSectionName(sectionName: string): string {
  const upperName = sectionName.toUpperCase().trim();

  // Direct mappings for common variations
  const mappings: Record<string, string> = {
    // Standard variations
    FIELD: 'FIELD',
    'FIELD OF THE INVENTION': 'FIELD',
    'FIELD OF INVENTION': 'FIELD',
    BACKGROUND: 'BACKGROUND',
    'BACKGROUND OF THE INVENTION': 'BACKGROUND',
    'BACKGROUND OF INVENTION': 'BACKGROUND',
    SUMMARY: 'SUMMARY',
    'SUMMARY OF THE INVENTION': 'SUMMARY',
    'SUMMARY OF INVENTION': 'SUMMARY',
    'BRIEF DESCRIPTION': 'BRIEF DESCRIPTION OF THE DRAWINGS',
    'BRIEF DESCRIPTION OF DRAWINGS': 'BRIEF DESCRIPTION OF THE DRAWINGS',
    BRIEF_DESCRIPTION_OF_DRAWINGS: 'BRIEF DESCRIPTION OF THE DRAWINGS',
    DRAWINGS: 'BRIEF DESCRIPTION OF THE DRAWINGS',
    'DETAILED DESCRIPTION': 'DETAILED DESCRIPTION',
    DETAILED_DESCRIPTION: 'DETAILED DESCRIPTION',
    'DETAILED DESCRIPTION OF THE INVENTION': 'DETAILED DESCRIPTION',
    'DETAILED DESCRIPTION OF INVENTION': 'DETAILED DESCRIPTION',
    CLAIMS: 'CLAIMS',
    CLAIM: 'CLAIMS',
    'CLAIM SET': 'CLAIMS',
    ABSTRACT: 'ABSTRACT',
    TITLE: 'Title',
  };

  // Check for exact match
  if (mappings[upperName]) {
    return mappings[upperName];
  }

  // Check if input contains a standard section name
  for (const standardSection of STANDARD_SECTION_ORDER) {
    if (upperName.includes(standardSection.toUpperCase())) {
      return standardSection;
    }
  }

  // Return original if no match
  return sectionName;
}

/**
 * Analyze changes between original and enhanced content
 */
function analyzeContentChanges(original: string, enhanced: string): ContentChanges {
  const originalWords = original.trim().split(/\s+/).length;
  const enhancedWords = enhanced.trim().split(/\s+/).length;
  const wordDifference = enhancedWords - originalWords;
  const percentChange = Math.abs(wordDifference) / originalWords;

  // Determine change type based on word count difference and content similarity
  let changeType: 'substantial' | 'moderate' | 'minor';
  if (percentChange > 0.3 || Math.abs(wordDifference) > 100) {
    changeType = 'substantial';
  } else if (percentChange > 0.15 || Math.abs(wordDifference) > 50) {
    changeType = 'moderate';
  } else {
    changeType = 'minor';
  }

  // Generate change details
  const changeDetails: string[] = [];

  if (wordDifference > 50) {
    changeDetails.push(`Expanded content by ${wordDifference} words`);
  } else if (wordDifference < -50) {
    changeDetails.push(`Condensed content by ${Math.abs(wordDifference)} words`);
  } else if (Math.abs(wordDifference) > 10) {
    changeDetails.push(
      `Adjusted length by ${wordDifference > 0 ? '+' : ''}${wordDifference} words`
    );
  }

  // Check for structural changes (basic heuristics)
  const originalParagraphs = original.split('\n\n').length;
  const enhancedParagraphs = enhanced.split('\n\n').length;
  if (enhancedParagraphs > originalParagraphs + 1) {
    changeDetails.push('Added new paragraphs');
  } else if (enhancedParagraphs < originalParagraphs - 1) {
    changeDetails.push('Consolidated paragraphs');
  }

  // Check for common enhancements
  if (enhanced.includes('embodiment') && !original.includes('embodiment')) {
    changeDetails.push('Added embodiment descriptions');
  }
  if (enhanced.includes('specifically') && !original.includes('specifically')) {
    changeDetails.push('Added specific details');
  }
  if (
    enhanced.includes('furthermore') ||
    enhanced.includes('additionally')
  ) {
    changeDetails.push('Added connecting language');
  }

  let summary = '';
  switch (changeType) {
    case 'substantial':
      summary =
        wordDifference > 0
          ? 'Significantly expanded with new content'
          : 'Substantially restructured and condensed';
      break;
    case 'moderate':
      summary = 'Enhanced with improvements and clarifications';
      break;
    case 'minor':
      summary = 'Refined with targeted improvements';
      break;
  }

  return {
    type: changeType,
    summary,
    changeDetails,
    wordCountChange: {
      original: originalWords,
      enhanced: enhancedWords,
      difference: wordDifference,
    },
  };
}

/**
 * Generate a detailed message about the enhancement
 */
function generateDetailedMessage(
  sectionName: string,
  changes: ContentChanges,
  aiSummary: string
): string {
  const sectionDisplayName = sectionName.toLowerCase().replace(/_/g, ' ');

  let message = `Enhanced the ${sectionDisplayName} section: ${changes.summary}`;

  if (changes.changeDetails.length > 0) {
    message += `. ${changes.changeDetails.join(', ')}.`;
  }

  // Add AI-generated summary if it provides additional insight
  if (aiSummary && aiSummary.length > 10) {
    message += ` ${aiSummary}`;
  }

  // Add word count context for substantial changes
  if (changes.type === 'substantial') {
    message += ` (${changes.wordCountChange.original} → ${changes.wordCountChange.enhanced} words)`;
  }

  return message;
}

/**
 * Use AI to enhance the section content based on the instruction
 */
async function enhanceContentWithAI(
  sectionName: string,
  currentContent: string,
  instruction: string,
  projectName: string
): Promise<{ content: string; changeSummary: string }> {
  const systemPrompt = `You are an expert patent attorney helping to enhance a patent application. 
You are working on the "${sectionName}" section of a patent for "${projectName}".

IMPORTANT RULES:
1. Maintain the technical accuracy and legal precision required for patent applications
2. Preserve all existing technical details and claims
3. Use standard patent language and formatting
4. Ensure consistency with USPTO requirements
5. Return a JSON response with both the enhanced content and a brief summary of changes made
6. Maintain the same general structure as the original
7. Do not add section headers - return only the content

Your response must be valid JSON in this format:
{
  "content": "The enhanced section content here...",
  "changeSummary": "Brief description of what was changed, added, or improved"
}`;

  const userPrompt = `Current ${sectionName} section content:
"""
${currentContent}
"""

Enhancement instruction: ${instruction}

Please enhance this section according to the instruction while maintaining all technical details and patent formatting standards. Provide both the enhanced content and a brief summary of the changes you made.`;

  const response = await OpenaiServerService.getChatCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 4000,
    temperature: 0.3, // Lower temperature for more consistent patent language
    response_format: { type: 'json_object' },
  });

  try {
    const result = JSON.parse(response.content) as {
      content?: string;
      changeSummary?: string;
    };
    return {
      content: result.content?.trim() || currentContent,
      changeSummary:
        result.changeSummary || 'Content enhanced according to instructions',
    };
  } catch (error) {
    logger.warn(
      '[EnhanceContentWithAI] Failed to parse JSON response, falling back to text',
      {
        error: error instanceof Error ? error.message : String(error),
      }
    );

    // Fallback: treat the entire response as content
    return {
      content: response.content.trim(),
      changeSummary: 'Content enhanced according to instructions',
    };
  }
}
