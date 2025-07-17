import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { FullAnalysisResponse } from '@/types/priorArtAnalysisTypes';

async function findUnique(where: {
  projectId_searchHistoryId_claim1TextHash: {
    projectId: string;
    searchHistoryId: string;
    claim1TextHash: string;
  };
}) {
  if (!prisma) {
    logger.error('[PriorArtAnalysisCacheRepo] Prisma client not available.');
    return null;
  }
  try {
    return await prisma.priorArtAnalysisCache.findUnique({ where });
  } catch (error) {
    logger.error('[PriorArtAnalysisCacheRepo - Find Error]', { error, where });
    return null;
  }
}

async function upsert(
  projectId: string,
  searchHistoryId: string,
  claim1TextHash: string,
  results: FullAnalysisResponse
) {
  if (!prisma) {
    logger.error('[PriorArtAnalysisCacheRepo] Prisma client not available.');
    return;
  }
  try {
    const resultsJson = JSON.stringify(results);
    await prisma.priorArtAnalysisCache.upsert({
      where: {
        projectId_searchHistoryId_claim1TextHash: {
          projectId,
          searchHistoryId,
          claim1TextHash,
        },
      },
      update: {
        resultsJson,
        updatedAt: new Date(),
      },
      create: {
        projectId,
        searchHistoryId,
        claim1TextHash,
        resultsJson,
      },
    });
  } catch (error) {
    logger.error('[PriorArtAnalysisCacheRepo - Upsert Error]', { error });
  }
}

export const priorArtAnalysisCacheRepository = {
  findUnique,
  upsert,
};
