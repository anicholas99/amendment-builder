/**
 * Citation Job Repository (Clean)
 *
 * This repository follows our architectural blueprint:
 * - Contains only simple, direct Prisma calls (find, create, update, delete)
 * - Abstracts away the database schema
 * - Accepts simple parameters (id, data objects)
 * - Is reusable across different services
 * - NO business logic, data aggregation, or security logic
 */

import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { ApplicationError, ErrorCode } from '@/lib/error';

// Type for transaction client
type TransactionClient = Prisma.TransactionClient;

/**
 * Create a new citation job (simple data creation)
 */
export async function create(data: Prisma.CitationJobUncheckedCreateInput) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  return prisma.citationJob.create({ data });
}

/**
 * Find citation job by ID
 */
export async function findById(id: string) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  return prisma.citationJob.findUnique({
    where: { id },
    include: { results: true },
  });
}

/**
 * Find citation job by external ID
 */
export async function findByExternalId(externalJobId: number) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  return prisma.citationJob.findFirst({
    where: { externalJobId },
    include: { results: true },
  });
}

/**
 * Update citation job
 */
export async function update(
  id: string,
  data: Prisma.CitationJobUpdateInput,
  includeResults: boolean = false
) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  const updateOptions: Prisma.CitationJobUpdateArgs = {
    where: { id },
    data,
  };

  if (includeResults) {
    updateOptions.include = { results: true };
  }

  return prisma.citationJob.update(updateOptions);
}

/**
 * Delete citation job
 */
export async function deleteById(id: string) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  return prisma.citationJob.delete({ where: { id } });
}

/**
 * Find many citation jobs by search history ID
 */
export async function findManyBySearchHistory(
  searchHistoryId: string,
  statusFilter?: any
) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  const where: Prisma.CitationJobWhereInput = {
    searchHistoryId,
    ...(statusFilter && { status: statusFilter }),
  };

  return prisma.citationJob.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Find citation job with full result details
 */
export async function findWithResult(jobId: string) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  return prisma.citationJob.findUnique({
    where: { id: jobId },
    include: {
      results: true,
      matches: {
        select: {
          id: true,
          citation: true,
          paragraph: true,
          score: true,
          parsedElementText: true,
          referenceNumber: true,
          locationStatus: true,
          locationData: true,
          locationJobId: true,
          locationErrorMessage: true,
          reasoningStatus: true,
          reasoningSummary: true,
          reasoningScore: true,
          reasoningJobId: true,
          reasoningErrorMessage: true,
          referenceTitle: true,
          referenceApplicant: true,
          referenceAssignee: true,
          referencePublicationDate: true,
          createdAt: true,
          updatedAt: true,
          searchHistoryId: true,
          citationJobId: true,
          analysisSource: true,
          isTopResult: true,
          elementOrder: true,
          // claimSetVersionId removed from schema
        },
      },
    },
  });
}

/**
 * Find citation job with tenant info
 */
export async function findWithTenantInfo(jobId: string) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  return prisma.citationJob.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      searchHistory: {
        select: {
          project: {
            select: {
              tenantId: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Find citation job with full details for examiner analysis
 */
export async function findWithFullDetailsForExaminerAnalysis(jobId: string) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  return prisma.citationJob.findUnique({
    where: { id: jobId },
    include: {
      searchHistory: {
        include: {
          project: {
            include: {
              invention: true,
            },
          },
        },
      },
      matches: {
        where: {
          reasoningStatus: 'COMPLETED',
        },
      },
    },
  });
}

/**
 * Find citation jobs by reference number and search history
 */
export async function findByReferenceAndSearch(
  referenceNumber: string,
  searchHistoryId: string
) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  const where: Prisma.CitationJobWhereInput = {
    referenceNumber,
    searchHistoryId,
  };

  return prisma.citationJob.findMany({
    where,
    select: {
      id: true,
      status: true,
      examinerAnalysisJson: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Find citation job with examiner analysis
 */
export async function findWithExaminerAnalysis(
  referenceNumber: string,
  searchHistoryId: string
) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  return prisma.citationJob.findFirst({
    where: {
      referenceNumber,
      searchHistoryId,
    },
    select: {
      id: true,
      examinerAnalysisJson: true,
      status: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Find citation jobs with deep analysis
 */
export async function findWithDeepAnalysis(limit: number = 10) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  return prisma.citationJob.findMany({
    where: {
      status: 'COMPLETED',
      deepAnalysisJson: { not: null },
    },
    select: {
      id: true,
      referenceNumber: true,
      deepAnalysisJson: true,
    },
    take: limit,
    orderBy: {
      completedAt: 'desc',
    },
  });
}

/**
 * Find deep analysis for multiple citation jobs
 */
export async function findDeepAnalysisByIds(jobIds: string[]) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  return prisma.citationJob.findMany({
    where: {
      id: { in: jobIds },
      deepAnalysisJson: { not: null },
    },
    select: {
      id: true,
      referenceNumber: true,
      deepAnalysisJson: true,
    },
  });
}

/**
 * Get deep analysis data for a project with tenant validation
 * This fetches all completed citation jobs with deep analysis for a project
 * SECURITY: Always validates tenant access through project relationship
 */
export async function getProjectDeepAnalyses(
  projectId: string,
  tenantId: string,
  limit: number = 20
) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  // First validate tenant access
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      tenantId: tenantId,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!project) {
    throw new ApplicationError(
      ErrorCode.PROJECT_NOT_FOUND,
      'Project not found or access denied'
    );
  }

  // Fetch deep analyses through search history
  const deepAnalyses = await prisma.citationJob.findMany({
    where: {
      searchHistory: {
        projectId: projectId,
      },
      status: 'COMPLETED',
      deepAnalysisJson: { not: null },
    },
    select: {
      id: true,
      referenceNumber: true,
      deepAnalysisJson: true,
      examinerAnalysisJson: true,
      createdAt: true,
      completedAt: true,
      searchHistory: {
        select: {
          id: true,
          query: true,
        },
      },
    },
    orderBy: {
      completedAt: 'desc',
    },
    take: limit,
  });

  return deepAnalyses;
}

/**
 * Get specific deep analysis by reference number
 */
export async function getDeepAnalysisByReference(
  projectId: string,
  tenantId: string,
  referenceNumber: string
) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  // Validate tenant access
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      tenantId: tenantId,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!project) {
    throw new ApplicationError(
      ErrorCode.PROJECT_NOT_FOUND,
      'Project not found or access denied'
    );
  }

  const deepAnalysis = await prisma.citationJob.findFirst({
    where: {
      searchHistory: {
        projectId: projectId,
      },
      referenceNumber: referenceNumber,
      status: 'COMPLETED',
      deepAnalysisJson: { not: null },
    },
    select: {
      id: true,
      referenceNumber: true,
      deepAnalysisJson: true,
      examinerAnalysisJson: true,
      createdAt: true,
      completedAt: true,
    },
  });

  return deepAnalysis;
}

/**
 * Find citation jobs with verified access
 */
export async function findWithVerifiedAccess(
  jobIds: string[],
  tenantId: string,
  userId: string
) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  return prisma.citationJob.findMany({
    where: {
      id: { in: jobIds },
      searchHistory: {
        project: {
          tenantId,
          userId,
        },
      },
    },
    select: {
      id: true,
      searchHistoryId: true,
      deepAnalysisJson: true,
      externalJobId: true,
      referenceNumber: true,
      status: true,
    },
  });
}

/**
 * Count citation jobs by search histories
 */
export async function countBySearchHistories(searchHistoryIds: string[]) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  return prisma.citationJob.count({
    where: { searchHistoryId: { in: searchHistoryIds } },
  });
}

/**
 * Count citation jobs by search histories and status
 */
export async function countBySearchHistoriesAndStatus(
  searchHistoryIds: string[],
  statuses: string[]
) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  return prisma.citationJob.count({
    where: {
      searchHistoryId: { in: searchHistoryIds },
      status: { in: statuses },
    },
  });
}

/**
 * Get citation job statistics (group by status)
 */
export async function getStatistics() {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  return prisma.citationJob.groupBy({
    by: ['status'],
    _count: true,
  });
}

/**
 * Save citation result in a transaction
 */
export async function saveCitationResult(
  tx: TransactionClient,
  citationJobId: string,
  resultsData: string | null
) {
  return tx.citationResult.create({
    data: {
      citationJobId,
      resultsData: resultsData ?? '',
    },
  });
}
