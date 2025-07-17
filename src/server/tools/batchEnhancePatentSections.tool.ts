import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import {
  enhancePatentSection,
  EnhancePatentSectionResult,
} from './enhancePatentSection.tool';
import { findProjectByIdAndTenant } from '@/repositories/project/core.repository';
import { findDraftDocumentsByProject } from '@/repositories/project/draft.repository';
import { getStandardSectionName } from '@/features/patent-application/utils/patent-sections/sectionConfig';

export interface SectionEnhancement {
  sectionName: string;
  instruction: string;
}

export interface BatchEnhancementResult {
  enhancements: {
    sectionName: string;
    success: boolean;
    message: string;
    syncTrigger?: {
      projectId: string;
      sectionType: string;
      timestamp: number;
    };
  }[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

/**
 * Enhance multiple patent sections at once
 *
 * SECURITY: Always validates tenant ownership before accessing data
 *
 * This tool batch processes multiple sections through the enhancement engine,
 * allowing users to apply the same or different instructions to multiple sections efficiently.
 */
export async function batchEnhancePatentSections(
  projectId: string,
  tenantId: string,
  sectionNames: string[],
  instruction: string
): Promise<BatchEnhancementResult> {
  // Convert to normalized format
  const sectionEnhancements: SectionEnhancement[] = sectionNames.map(name => ({
    sectionName: name,
    instruction,
  }));

  logger.info('[BatchEnhancePatentSections] Starting batch enhancement', {
    projectId,
    sectionCount: sectionEnhancements.length,
    sections: sectionEnhancements.map(s => s.sectionName),
  });

  try {
    // Verify tenant ownership once upfront
    const project = await findProjectByIdAndTenant(projectId, tenantId);
    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    // Verify patent draft exists
    const draftDocuments = await findDraftDocumentsByProject(projectId);
    if (!draftDocuments || draftDocuments.length === 0) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'No patent application draft found. Please generate a patent application first.'
      );
    }

    // Validate all requested sections exist
    const availableSections = new Set<string>();
    draftDocuments.forEach(doc => {
      if (doc.type && doc.content && doc.type !== 'FULL_CONTENT') {
        const standardName = getStandardSectionName(doc.type);
        if (standardName) {
          availableSections.add(standardName.toLowerCase());
        }
      }
    });

    // Process sections in parallel for efficiency
    const enhancementPromises = sectionEnhancements.map(
      ({ sectionName, instruction }) =>
        enhancePatentSection(projectId, tenantId, sectionName, instruction)
          .then(result => ({
            sectionName,
            success: result.success,
            message: result.message,
            syncTrigger: result.syncTrigger,
          }))
          .catch(error => {
            logger.error(
              '[BatchEnhancePatentSections] Failed to enhance section',
              {
                sectionName,
                error,
              }
            );
            return {
              sectionName,
              success: false,
              message: error.message || 'Failed to enhance section',
              syncTrigger: undefined,
            };
          })
    );

    const results = await Promise.all(enhancementPromises);

    // Count successes
    const successfulCount = results.filter(r => r.success).length;

    return {
      enhancements: results,
      summary: {
        total: sectionEnhancements.length,
        successful: successfulCount,
        failed: sectionEnhancements.length - successfulCount,
      },
    };
  } catch (error) {
    logger.error(
      '[BatchEnhancePatentSections] Failed to batch enhance sections',
      {
        projectId,
        error,
      }
    );
    throw error;
  }
}
