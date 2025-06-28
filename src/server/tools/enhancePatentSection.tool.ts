import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { OpenaiServerService } from '@/server/services/openai.server-service';
import { extractSections, rebuildHtmlContent, STANDARD_SECTION_ORDER } from '@/features/patent-application/utils/patent-sections';
import { getStandardSectionName } from '@/features/patent-application/utils/patent-sections/sectionConfig';
import { processWithOpenAI } from '@/server/ai/aiService';
import { PatentServerService } from '@/server/services/patent.server-service';
import { batchUpdateDraftDocuments, findDraftDocumentByType } from '@/repositories/project/draft.repository';
import { emitDraftDocumentEvent } from '@/features/patent-application/utils/draftDocumentEvents';

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
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client not initialized'
    );
  }

  logger.info('[EnhancePatentSection] Starting section enhancement', {
    projectId,
    tenantId,
    sectionName,
    instruction: instruction.substring(0, 100),
  });

  try {
    // First, verify tenant ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        tenantId: tenantId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    // Fetch all draft documents for the project
    // @ts-ignore - Prisma types need regeneration
    const draftDocuments = await prisma!.draftDocument.findMany({
      where: {
        projectId: projectId,
      },
      select: {
        type: true,
        content: true,
      },
    });

    if (!draftDocuments || draftDocuments.length === 0) {
      return {
        success: false,
        message: 'No patent application draft found. Please generate a patent application first.',
      };
    }

    // Rebuild content from sections
    const sectionMap: Record<string, string> = {};
    draftDocuments.forEach(doc => {
      if (doc.type && doc.content && doc.type !== 'FULL_CONTENT') {
        // Get standard section name from the document type
        const standardName = getStandardSectionName(doc.type);
        if (standardName) {
          sectionMap[standardName] = doc.content;
        }
      }
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
    const enhancedContent = await enhanceContentWithAI(
      normalizedSectionName,
      currentSectionContent,
      instruction,
      project.name
    );

    // Update the section
    sections[normalizedSectionName] = enhancedContent;

    // Save the enhanced section directly
    const sectionType = normalizedSectionName.toUpperCase().replace(/\s+/g, '_');
    
    // Update the draft document for this specific section
    // @ts-ignore - Prisma types need regeneration
    await prisma!.draftDocument.update({
      where: {
        projectId_type: {
          projectId: projectId,
          type: sectionType,
        },
      },
      data: {
        content: enhancedContent,
        updatedAt: new Date(),
      },
    });

    // Emit update event so UI refreshes
    emitDraftDocumentEvent({
      projectId,
      type: sectionType,
      action: 'section-enhanced',
    });

    logger.info('[EnhancePatentSection] Section enhanced successfully', {
      projectId,
      sectionName: normalizedSectionName,
      sectionType,
      originalLength: currentSectionContent.length,
      enhancedLength: enhancedContent.length,
    });

    // Note: React Query invalidation should happen through WebSocket/SSE events
    // The frontend listens for draft document updates and invalidates the cache automatically

    return {
      success: true,
      updatedSection: enhancedContent,
      message: `Successfully enhanced the ${normalizedSectionName} section.`,
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
    'FIELD': 'FIELD',
    'FIELD OF THE INVENTION': 'FIELD',
    'FIELD OF INVENTION': 'FIELD',
    'BACKGROUND': 'BACKGROUND',
    'BACKGROUND OF THE INVENTION': 'BACKGROUND',
    'BACKGROUND OF INVENTION': 'BACKGROUND',
    'SUMMARY': 'SUMMARY',
    'SUMMARY OF THE INVENTION': 'SUMMARY',
    'SUMMARY OF INVENTION': 'SUMMARY',
    'BRIEF DESCRIPTION': 'BRIEF DESCRIPTION OF THE DRAWINGS',
    'BRIEF DESCRIPTION OF DRAWINGS': 'BRIEF DESCRIPTION OF THE DRAWINGS',
    'DRAWINGS': 'BRIEF DESCRIPTION OF THE DRAWINGS',
    'DETAILED DESCRIPTION': 'DETAILED DESCRIPTION',
    'DETAILED DESCRIPTION OF THE INVENTION': 'DETAILED DESCRIPTION',
    'DETAILED DESCRIPTION OF INVENTION': 'DETAILED DESCRIPTION',
    'CLAIMS': 'CLAIMS',
    'CLAIM': 'CLAIMS',
    'CLAIM SET': 'CLAIMS',
    'ABSTRACT': 'ABSTRACT',
    'TITLE': 'Title',
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
 * Use AI to enhance the section content based on the instruction
 */
async function enhanceContentWithAI(
  sectionName: string,
  currentContent: string,
  instruction: string,
  projectName: string
): Promise<string> {
  const systemPrompt = `You are an expert patent attorney helping to enhance a patent application. 
You are working on the "${sectionName}" section of a patent for "${projectName}".

IMPORTANT RULES:
1. Maintain the technical accuracy and legal precision required for patent applications
2. Preserve all existing technical details and claims
3. Use standard patent language and formatting
4. Ensure consistency with USPTO requirements
5. Return ONLY the enhanced content, no explanations or metadata
6. Maintain the same general structure as the original
7. Do not add section headers - return only the content`;

  const userPrompt = `Current ${sectionName} section content:
"""
${currentContent}
"""

Enhancement instruction: ${instruction}

Please enhance this section according to the instruction while maintaining all technical details and patent formatting standards.`;

  const response = await OpenaiServerService.getChatCompletion({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 4000,
    temperature: 0.3, // Lower temperature for more consistent patent language
  });

  return response.content.trim();
} 