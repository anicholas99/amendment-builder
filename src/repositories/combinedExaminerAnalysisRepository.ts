import { CombinedExaminerAnalysis, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/monitoring/logger';
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
