/**
 * File History Repository
 * 
 * Specialized repository for building comprehensive file history context
 * Aggregates data from office actions, amendment files, claim evolution, 
 * and prior art analysis to provide AI agents with patent attorney-level context
 * 
 * Follows established patterns: tenant isolation, error handling, type safety
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import type {
  FileHistoryContext,
  FileHistoryContextOptions,
  HistoricalFileEntry,
  ClaimEvolutionHistory,
  ExaminerContext,
  ArgumentHistory,
  FileHistoryMetadata,
  ClaimVersionHistory,
  ExaminerInteraction,
  HistoricalArgument,
} from '@/types/domain/file-history-context';

// ============ MAIN CONTEXT BUILDER ============

/**
 * Build comprehensive file history context for a project
 * Aggregates all historical data needed for AI agent reasoning
 */
export async function buildFileHistoryContext(
  projectId: string,
  options: FileHistoryContextOptions
): Promise<FileHistoryContext> {
  const startTime = Date.now();

  try {
    logger.debug('[FileHistoryRepository] Building file history context', {
      projectId,
      tenantId: options.tenantId,
      options: {
        maxHistoryDepth: options.maxHistoryDepth,
        includeClaimEvolution: options.includeClaimEvolution,
        includeExaminerAnalysis: options.includeExaminerAnalysis,
      },
    });

    // Verify project access and get basic project info
    const project = await verifyProjectAccess(projectId, options.tenantId);
    
    // Run parallel queries for different data types
    const [
      fileHistory,
      claimEvolution,
      examinerContext,
      argumentHistory,
      metadata,
    ] = await Promise.all([
      buildFileHistory(projectId, options),
      options.includeClaimEvolution ? buildClaimEvolution(projectId, options) : buildEmptyClaimEvolution(),
      options.includeExaminerAnalysis ? buildExaminerContext(projectId, options) : buildEmptyExaminerContext(),
      buildArgumentHistory(projectId, options),
      buildFileHistoryMetadata(projectId, options),
    ]);

    const context: FileHistoryContext = {
      projectId,
      applicationNumber: project.applicationNumber,
      fileHistory,
      claimEvolution,
      examinerContext,
      priorArgumentHistory: argumentHistory,
      metadata,
    };

    const buildTime = Date.now() - startTime;
    logger.info('[FileHistoryRepository] File history context built successfully', {
      projectId,
      tenantId: options.tenantId,
      buildTime,
      fileCount: fileHistory.length,
      claimCount: claimEvolution.claims.length,
      examinerInteractions: examinerContext.history.length,
    });

    return context;
  } catch (error) {
    logger.error('[FileHistoryRepository] Failed to build file history context', {
      projectId,
      tenantId: options.tenantId,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new ApplicationError(
      ErrorCode.DATABASE_ERROR,
      `Failed to build file history context: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ============ PROJECT ACCESS VERIFICATION ============

async function verifyProjectAccess(
  projectId: string,
  tenantId: string
): Promise<{ id: string; applicationNumber?: string }> {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      tenantId: tenantId,
      deletedAt: null,
    },
    select: {
      id: true,
      // Extract application number from invention metadata if available
      invention: {
        select: {
          metadata: true,
        },
      },
    },
  });

  if (!project) {
    throw new ApplicationError(
      ErrorCode.PROJECT_ACCESS_DENIED,
      'Project not found or access denied'
    );
  }

  // Extract application number from invention metadata
  let applicationNumber: string | undefined;
  if (project.invention?.metadata) {
    try {
      const metadata = JSON.parse(project.invention.metadata);
      applicationNumber = metadata.applicationNumber;
    } catch (e) {
      // Ignore parsing errors for metadata
    }
  }

  return {
    id: project.id,
    applicationNumber,
  };
}

// ============ FILE HISTORY BUILDING ============

async function buildFileHistory(
  projectId: string,
  options: FileHistoryContextOptions
): Promise<HistoricalFileEntry[]> {
  try {
    // Get all office actions for the project
    const officeActions = await prisma.officeAction.findMany({
      where: {
        projectId,
        tenantId: options.tenantId,
        deletedAt: null,
      },
      include: {
        rejections: {
          orderBy: { displayOrder: 'asc' },
        },
        amendmentProjects: {
          include: {
            amendmentFiles: {
              where: {
                deletedAt: null,
                status: { in: ['ACTIVE', 'FILED'] },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: options.maxHistoryDepth ? options.maxHistoryDepth * 2 : undefined, // Account for responses
    });

    const fileEntries: HistoricalFileEntry[] = [];

    for (const oa of officeActions) {
      // Add office action entry
      const oaEntry: HistoricalFileEntry = {
        id: oa.id,
        type: 'OFFICE_ACTION',
        fileDate: oa.dateIssued || oa.createdAt,
        fileName: oa.originalFileName || `Office Action ${oa.oaNumber || 'Unknown'}`,
        extractedText: options.includeFullText ? await extractOfficeActionText(oa.id) : '',
        status: oa.status === 'COMPLETED' ? 'ANALYZED' : 'PROCESSED',
        metadata: {
          officeActionNumber: oa.oaNumber || undefined,
          examiner: {
            name: oa.examinerId ? await getExaminerName(oa.examinerId) : undefined,
            id: oa.examinerId || undefined,
            artUnit: oa.artUnit || undefined,
          },
          rejectionSummary: {
            types: oa.rejections.map(r => r.type),
            claimsAffected: oa.rejections.flatMap(r => 
              r.claimNumbers ? JSON.parse(r.claimNumbers) : []
            ),
            priorArtCited: oa.rejections.flatMap(r => 
              r.citedPriorArt ? JSON.parse(r.citedPriorArt) : []
            ),
          },
        },
      };
      fileEntries.push(oaEntry);

      // Add associated amendment files (responses)
      for (const amendmentProject of oa.amendmentProjects) {
        const responseFiles = amendmentProject.amendmentFiles.filter(
          f => f.fileType === 'filed_response' || f.fileType === 'draft_response'
        );

        for (const responseFile of responseFiles) {
          const responseEntry: HistoricalFileEntry = {
            id: responseFile.id,
            type: 'RESPONSE',
            fileDate: responseFile.filedAt || responseFile.createdAt,
            fileName: responseFile.fileName,
            extractedText: options.includeFullText ? responseFile.extractedText || '' : '',
            status: responseFile.filedAt ? 'FILED' : 'PROCESSED',
            metadata: {
              responseStrategy: amendmentProject.responseType as any,
              outcome: responseFile.status === 'FILED' ? 'FILED' : 'PENDING',
            },
          };
          fileEntries.push(responseEntry);
        }
      }
    }

    // Sort by file date chronologically
    return fileEntries.sort((a, b) => a.fileDate.getTime() - b.fileDate.getTime());
  } catch (error) {
    logger.error('[FileHistoryRepository] Failed to build file history', {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

async function extractOfficeActionText(officeActionId: string): Promise<string> {
  // Extract text from office action parsed data or file content
  // This would integrate with your existing text extraction logic
  try {
    const oa = await prisma.officeAction.findUnique({
      where: { id: officeActionId },
      select: { parsedJson: true },
    });

    if (oa?.parsedJson) {
      const parsed = JSON.parse(oa.parsedJson);
      return parsed.extractedText || '';
    }
    return '';
  } catch (e) {
    return '';
  }
}

async function getExaminerName(examinerId: string): Promise<string | undefined> {
  // This could be enhanced to maintain an examiner database
  // For now, return the examiner ID as name
  return examinerId;
}

// ============ CLAIM EVOLUTION BUILDING ============

async function buildClaimEvolution(
  projectId: string,
  options: FileHistoryContextOptions
): Promise<ClaimEvolutionHistory> {
  try {
    // Get current claims from invention
    const invention = await prisma.invention.findUnique({
      where: { projectId },
      include: {
        claims: {
          orderBy: { number: 'asc' },
        },
      },
    });

    if (!invention) {
      return buildEmptyClaimEvolution();
    }

    const claimVersionHistories: ClaimVersionHistory[] = [];

    for (const claim of invention.claims) {
      // Build version history for each claim
      // Note: This assumes you have claim versioning implemented
      // You may need to enhance this based on your actual claim history structure
      const versionHistory: ClaimVersionHistory = {
        claimNumber: claim.number,
        versions: [{
          id: claim.id,
          versionNumber: 1,
          text: claim.text,
          changedAt: claim.createdAt,
          changeReason: 'Initial filing',
          differences: [],
        }],
        currentText: claim.text,
        firstFiled: claim.createdAt,
        totalAmendments: 0,
      };

      claimVersionHistories.push(versionHistory);
    }

    return {
      claims: claimVersionHistories,
      amendmentReasons: [], // Would be populated from amendment history
      consistencyCheck: {
        potentialContradictions: [],
        argumentsToAvoid: [],
        successfulStrategies: [],
        problematicLanguage: [],
      },
    };
  } catch (error) {
    logger.error('[FileHistoryRepository] Failed to build claim evolution', {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });
    return buildEmptyClaimEvolution();
  }
}

function buildEmptyClaimEvolution(): ClaimEvolutionHistory {
  return {
    claims: [],
    amendmentReasons: [],
    consistencyCheck: {
      potentialContradictions: [],
      argumentsToAvoid: [],
      successfulStrategies: [],
      problematicLanguage: [],
    },
  };
}

// ============ EXAMINER CONTEXT BUILDING ============

async function buildExaminerContext(
  projectId: string,
  options: FileHistoryContextOptions
): Promise<ExaminerContext> {
  try {
    // Get all office actions to analyze examiner patterns
    const officeActions = await prisma.officeAction.findMany({
      where: {
        projectId,
        tenantId: options.tenantId,
        deletedAt: null,
      },
      include: {
        rejections: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Get current examiner info from most recent office action
    const latestOA = officeActions[officeActions.length - 1];
    const currentExaminer = {
      name: latestOA?.examinerId ? await getExaminerName(latestOA.examinerId) : undefined,
      id: latestOA?.examinerId || undefined,
      artUnit: latestOA?.artUnit || undefined,
    };

    // Build interaction history
    const interactions: ExaminerInteraction[] = officeActions.map(oa => ({
      officeActionId: oa.id,
      date: oa.dateIssued || oa.createdAt,
      rejectionTypes: oa.rejections.map(r => r.type),
      citedReferences: oa.rejections.flatMap(r => 
        r.citedPriorArt ? JSON.parse(r.citedPriorArt) : []
      ),
      examinerComments: oa.rejections.map(r => r.examinerText).join('\n'),
      responseStrategy: '', // Would be filled from response analysis
      outcome: oa.status,
    }));

    // Analyze patterns
    const rejectionTypeCount = new Map<string, number>();
    const priorArtCount = new Map<string, number>();
    
    interactions.forEach(interaction => {
      interaction.rejectionTypes.forEach(type => {
        rejectionTypeCount.set(type, (rejectionTypeCount.get(type) || 0) + 1);
      });
      interaction.citedReferences.forEach(ref => {
        priorArtCount.set(ref, (priorArtCount.get(ref) || 0) + 1);
      });
    });

    return {
      current: currentExaminer,
      history: interactions,
      patterns: {
        commonRejectionTypes: Array.from(rejectionTypeCount.entries()).map(([type, frequency]) => ({
          type,
          frequency,
          typicalLanguage: [], // Could be enhanced with NLP analysis
        })),
        priorArtPreferences: Array.from(priorArtCount.entries()).map(([source, frequency]) => ({
          source,
          frequency,
        })),
        argumentResponseTendencies: [], // Would be populated from response analysis
      },
      preferences: {
        preferredArgumentStyles: [],
        effectiveClaimLanguage: [],
        unsuccessfulApproaches: [],
        timelinePreferences: '',
      },
    };
  } catch (error) {
    logger.error('[FileHistoryRepository] Failed to build examiner context', {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });
    return buildEmptyExaminerContext();
  }
}

function buildEmptyExaminerContext(): ExaminerContext {
  return {
    current: {},
    history: [],
    patterns: {
      commonRejectionTypes: [],
      priorArtPreferences: [],
      argumentResponseTendencies: [],
    },
    preferences: {
      preferredArgumentStyles: [],
      effectiveClaimLanguage: [],
      unsuccessfulApproaches: [],
      timelinePreferences: '',
    },
  };
}

// ============ ARGUMENT HISTORY BUILDING ============

async function buildArgumentHistory(
  projectId: string,
  options: FileHistoryContextOptions
): Promise<ArgumentHistory> {
  try {
    // This would integrate with your amendment project files
    // to extract historical arguments from filed responses
    const amendmentProjects = await prisma.amendmentProject.findMany({
      where: {
        projectId,
        tenantId: options.tenantId,
        deletedAt: null,
      },
      include: {
        amendmentFiles: {
          where: {
            fileType: { in: ['filed_response', 'argument_section'] },
            deletedAt: null,
          },
        },
        officeAction: {
          include: {
            rejections: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const historicalArguments: HistoricalArgument[] = [];

    for (const project of amendmentProjects) {
      for (const file of project.amendmentFiles) {
        if (file.extractedText) {
          // Parse arguments from the response text
          // This would use NLP to extract argument sections
          const argument: HistoricalArgument = {
            id: file.id,
            officeActionId: project.officeActionId,
            responseId: project.id,
            date: file.filedAt || file.createdAt,
            argumentText: file.extractedText,
            claimsAddressed: [], // Would be extracted from content
            priorArtCited: [], // Would be extracted from content
            outcome: file.filedAt ? 'PENDING' : 'PENDING', // Would be determined from subsequent OAs
            lessonsLearned: [],
          };
          historicalArguments.push(argument);
        }
      }
    }

    // Categorize arguments by rejection type
    const byRejectionType = {
      section102: historicalArguments.filter(arg => 
        // Logic to determine if argument addresses §102
        arg.argumentText.toLowerCase().includes('102') || 
        arg.argumentText.toLowerCase().includes('anticipation')
      ),
      section103: historicalArguments.filter(arg => 
        arg.argumentText.toLowerCase().includes('103') || 
        arg.argumentText.toLowerCase().includes('obviousness')
      ),
      section101: historicalArguments.filter(arg => 
        arg.argumentText.toLowerCase().includes('101') || 
        arg.argumentText.toLowerCase().includes('subject matter')
      ),
      section112: historicalArguments.filter(arg => 
        arg.argumentText.toLowerCase().includes('112') || 
        arg.argumentText.toLowerCase().includes('written description')
      ),
      other: historicalArguments.filter(arg => 
        !['102', '103', '101', '112'].some(section => 
          arg.argumentText.toLowerCase().includes(section)
        )
      ),
    };

    return {
      byRejectionType,
      successfulArguments: [], // Would be populated based on outcomes
      failedArguments: [], // Would be populated based on outcomes
      priorArtAnalysis: {
        discreditedReferences: [],
        establishedDifferences: [],
        priorArtCombinations: [],
      },
    };
  } catch (error) {
    logger.error('[FileHistoryRepository] Failed to build argument history', {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      byRejectionType: {
        section102: [],
        section103: [],
        section101: [],
        section112: [],
        other: [],
      },
      successfulArguments: [],
      failedArguments: [],
      priorArtAnalysis: {
        discreditedReferences: [],
        establishedDifferences: [],
        priorArtCombinations: [],
      },
    };
  }
}

// ============ METADATA BUILDING ============

async function buildFileHistoryMetadata(
  projectId: string,
  options: FileHistoryContextOptions
): Promise<FileHistoryMetadata> {
  try {
    const [officeActionCount, amendmentProjectCount, firstOA, lastResponse] = await Promise.all([
      prisma.officeAction.count({
        where: {
          projectId,
          tenantId: options.tenantId,
          deletedAt: null,
        },
      }),
      prisma.amendmentProject.count({
        where: {
          projectId,
          tenantId: options.tenantId,
          deletedAt: null,
        },
      }),
      prisma.officeAction.findFirst({
        where: {
          projectId,
          tenantId: options.tenantId,
          deletedAt: null,
        },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      }),
      prisma.amendmentProject.findFirst({
        where: {
          projectId,
          tenantId: options.tenantId,
          deletedAt: null,
          filedDate: { not: null },
        },
        orderBy: { filedDate: 'desc' },
        select: { filedDate: true, dueDate: true },
      }),
    ]);

    const prosecutionDuration = firstOA && lastResponse?.filedDate 
      ? Math.floor((lastResponse.filedDate.getTime() - firstOA.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      totalOfficeActions: officeActionCount,
      totalResponses: amendmentProjectCount,
      currentRoundNumber: officeActionCount,
      prosecutionDuration,
      lastResponseDate: lastResponse?.filedDate || undefined,
      nextDeadline: lastResponse?.dueDate || undefined,
      statusHistory: [], // Would be populated from project activity logs
      relationshipContext: {
        parentApplications: [],
        continuationData: [],
        priorityClaims: [],
      },
    };
  } catch (error) {
    logger.error('[FileHistoryRepository] Failed to build metadata', {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      totalOfficeActions: 0,
      totalResponses: 0,
      currentRoundNumber: 0,
      prosecutionDuration: 0,
      statusHistory: [],
      relationshipContext: {
        parentApplications: [],
        continuationData: [],
        priorityClaims: [],
      },
    };
  }
}

// ============ UTILITY FUNCTIONS ============

/**
 * Get file history summary for a project (lightweight version)
 */
export async function getFileHistorySummary(
  projectId: string,
  tenantId: string
): Promise<{
  officeActionCount: number;
  responseCount: number;
  lastActivity: Date | null;
  prosecutionStatus: string;
}> {
  try {
    const [officeActionCount, responseCount, lastOA, lastResponse] = await Promise.all([
      prisma.officeAction.count({
        where: { projectId, tenantId, deletedAt: null },
      }),
      prisma.amendmentProject.count({
        where: { projectId, tenantId, deletedAt: null },
      }),
      prisma.officeAction.findFirst({
        where: { projectId, tenantId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      prisma.amendmentProject.findFirst({
        where: { projectId, tenantId, deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
    ]);

    const lastActivity = [lastOA?.createdAt, lastResponse?.updatedAt]
      .filter(Boolean)
      .sort((a, b) => b!.getTime() - a!.getTime())[0] || null;

    let prosecutionStatus = 'ACTIVE';
    if (officeActionCount === 0) prosecutionStatus = 'PRE_FILING';
    else if (responseCount < officeActionCount) prosecutionStatus = 'PENDING_RESPONSE';

    return {
      officeActionCount,
      responseCount,
      lastActivity,
      prosecutionStatus,
    };
  } catch (error) {
    logger.error('[FileHistoryRepository] Failed to get file history summary', {
      projectId,
      tenantId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Check if project has sufficient file history for AI analysis
 */
export async function validateFileHistoryCompleteness(
  projectId: string,
  tenantId: string
): Promise<{
  isComplete: boolean;
  missingComponents: string[];
  recommendations: string[];
}> {
  try {
    const summary = await getFileHistorySummary(projectId, tenantId);
    const missingComponents: string[] = [];
    const recommendations: string[] = [];

    if (summary.officeActionCount === 0) {
      missingComponents.push('office_actions');
      recommendations.push('Upload office actions to enable AI analysis');
    }

    if (summary.responseCount === 0 && summary.officeActionCount > 0) {
      missingComponents.push('responses');
      recommendations.push('Add response documents to build argument history');
    }

    // Check for claim data
    const hasClaimData = await prisma.claim.count({
      where: { invention: { projectId } },
    }) > 0;

    if (!hasClaimData) {
      missingComponents.push('claims');
      recommendations.push('Process invention disclosure to extract claims');
    }

    return {
      isComplete: missingComponents.length === 0,
      missingComponents,
      recommendations,
    };
  } catch (error) {
    logger.error('[FileHistoryRepository] Failed to validate file history completeness', {
      projectId,
      tenantId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
} 