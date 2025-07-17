import { CombinedExaminerAnalysis, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';

export interface CreateCombinedAnalysisData {
  searchHistoryId: string;
  userId: string | null;
  referenceNumbers: string[];
  analysisJson: string;
  claim1Text: string;
}

export async function createCombinedAnalysis(
  data: CreateCombinedAnalysisData
): Promise<CombinedExaminerAnalysis> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized'
    );
  }

  try {
    return await prisma.combinedExaminerAnalysis.create({
      data: {
        searchHistoryId: data.searchHistoryId,
        userId: data.userId,
        referenceNumbers: JSON.stringify(data.referenceNumbers),
        analysisJson: data.analysisJson,
        claim1Text: data.claim1Text,
      },
    });
  } catch (error) {
    logger.error('Failed to create combined analysis', { error, data });
    throw error;
  }
}

export async function findBySearchHistory(
  searchHistoryId: string,
  userId?: string
): Promise<CombinedExaminerAnalysis[]> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized'
    );
  }

  try {
    return await prisma.combinedExaminerAnalysis.findMany({
      where: {
        searchHistoryId,
        ...(userId && { userId }),
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    logger.error('Failed to find combined analyses by search history', {
      error,
      searchHistoryId,
      userId,
    });
    throw error;
  }
}

export async function findById(
  id: string
): Promise<CombinedExaminerAnalysis | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized'
    );
  }

  try {
    return await prisma.combinedExaminerAnalysis.findUnique({
      where: { id },
    });
  } catch (error) {
    logger.error('Failed to find combined analysis by id', { error, id });
    throw error;
  }
}

export async function findLatestBySearchAndReferences(
  searchHistoryId: string,
  referenceNumbers: string[],
  userId?: string
): Promise<CombinedExaminerAnalysis | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized'
    );
  }

  try {
    const analyses = await prisma.combinedExaminerAnalysis.findMany({
      where: {
        searchHistoryId,
        referenceNumbers: JSON.stringify(referenceNumbers.sort()),
        ...(userId && { userId }),
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    return analyses[0] || null;
  } catch (error) {
    logger.error('Failed to find latest combined analysis', {
      error,
      searchHistoryId,
      referenceNumbers,
      userId,
    });
    throw error;
  }
}

/**
 * Get combined examiner analyses for a project with tenant validation
 * SECURITY: Always validates tenant access through project relationship
 */
export async function getProjectCombinedAnalyses(
  projectId: string,
  tenantId: string,
  limit: number = 10
) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized'
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

  // Fetch combined analyses through search history
  const analyses = await prisma.combinedExaminerAnalysis.findMany({
    where: {
      searchHistory: {
        projectId: projectId,
      },
    },
    select: {
      id: true,
      referenceNumbers: true,
      analysisJson: true,
      claim1Text: true,
      createdAt: true,
      searchHistory: {
        select: {
          id: true,
          query: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });

  return analyses;
}

/**
 * Get a specific combined analysis by ID with tenant validation
 */
export async function getCombinedAnalysisById(
  analysisId: string,
  projectId: string,
  tenantId: string
) {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized'
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

  const analysis = await prisma.combinedExaminerAnalysis.findFirst({
    where: {
      id: analysisId,
      searchHistory: {
        projectId: projectId,
      },
    },
    select: {
      id: true,
      referenceNumbers: true,
      analysisJson: true,
      claim1Text: true,
      createdAt: true,
    },
  });

  if (!analysis) {
    throw new ApplicationError(
      ErrorCode.DB_RECORD_NOT_FOUND,
      'Combined analysis not found'
    );
  }

  return analysis;
}
