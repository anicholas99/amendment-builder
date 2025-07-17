import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';

/**
 * Rejection Repository
 * Handles all database operations for Office Action rejections
 * Follows existing repository patterns for consistency and security
 */

export interface RejectionCreateData {
  officeActionId: string;
  type: string;
  claimNumbers: string[];
  citedPriorArt?: string[];
  examinerText: string;
  parsedElements?: Record<string, any>;
  displayOrder?: number;
}

export interface RejectionUpdateData {
  type?: string;
  claimNumbers?: string[];
  citedPriorArt?: string[];
  examinerText?: string;
  parsedElements?: Record<string, any>;
  status?: string;
  displayOrder?: number;
}

/**
 * Creates a new rejection record
 */
export async function createRejection(
  data: RejectionCreateData
): Promise<any> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    logger.debug('[RejectionRepository] Creating new rejection', {
      officeActionId: data.officeActionId,
      type: data.type,
    });

    // Verify office action exists
    const officeAction = await prisma.officeAction.findUnique({
      where: { id: data.officeActionId },
      select: { id: true, projectId: true, tenantId: true },
    });

    if (!officeAction) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        `Office Action ${data.officeActionId} not found`
      );
    }

    const rejection = await prisma.rejection.create({
      data: {
        officeActionId: data.officeActionId,
        type: data.type,
        claimNumbers: JSON.stringify(data.claimNumbers),
        citedPriorArt: data.citedPriorArt ? JSON.stringify(data.citedPriorArt) : null,
        examinerText: data.examinerText,
        parsedElements: data.parsedElements ? JSON.stringify(data.parsedElements) : null,
        displayOrder: data.displayOrder || 0,
      },
    });

    logger.info('[RejectionRepository] Successfully created rejection', {
      id: rejection.id,
      officeActionId: data.officeActionId,
    });

    return rejection;
  } catch (error) {
    logger.error('[RejectionRepository] Failed to create rejection', {
      error: error instanceof Error ? error.message : String(error),
      officeActionId: data.officeActionId,
    });

    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to create rejection: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Creates multiple rejections in a transaction
 */
export async function createRejections(
  rejections: RejectionCreateData[]
): Promise<any[]> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    logger.debug('[RejectionRepository] Creating multiple rejections', {
      count: rejections.length,
    });

    const results = await prisma.$transaction(
      rejections.map((data, index) =>
        prisma.rejection.create({
          data: {
            officeActionId: data.officeActionId,
            type: data.type,
            claimNumbers: JSON.stringify(data.claimNumbers),
            citedPriorArt: data.citedPriorArt ? JSON.stringify(data.citedPriorArt) : null,
            examinerText: data.examinerText,
            parsedElements: data.parsedElements ? JSON.stringify(data.parsedElements) : null,
            displayOrder: data.displayOrder || index,
          },
        })
      )
    );

    logger.info('[RejectionRepository] Successfully created multiple rejections', {
      count: results.length,
    });

    return results;
  } catch (error) {
    logger.error('[RejectionRepository] Failed to create multiple rejections', {
      error: error instanceof Error ? error.message : String(error),
      count: rejections.length,
    });

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to create rejections: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Finds rejection by ID
 */
export async function findRejectionById(id: string): Promise<any | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    const rejection = await prisma.rejection.findUnique({
      where: { id },
      include: {
        officeAction: {
          select: {
            id: true,
            projectId: true,
            tenantId: true,
          },
        },
      },
    });

    return rejection;
  } catch (error) {
    logger.error('[RejectionRepository] Failed to find rejection by ID', {
      error: error instanceof Error ? error.message : String(error),
      id,
    });

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find rejection: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Finds all rejections for an office action
 */
export async function findRejectionsByOfficeAction(
  officeActionId: string
): Promise<any[]> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    const rejections = await prisma.rejection.findMany({
      where: { officeActionId },
      orderBy: { displayOrder: 'asc' },
    });

    return rejections;
  } catch (error) {
    logger.error('[RejectionRepository] Failed to find rejections by office action', {
      error: error instanceof Error ? error.message : String(error),
      officeActionId,
    });

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find rejections: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Updates a rejection
 */
export async function updateRejection(
  id: string,
  data: RejectionUpdateData
): Promise<any> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    logger.debug('[RejectionRepository] Updating rejection', { id });

    const updateData: any = {};

    if (data.type !== undefined) updateData.type = data.type;
    if (data.claimNumbers !== undefined) updateData.claimNumbers = JSON.stringify(data.claimNumbers);
    if (data.citedPriorArt !== undefined) updateData.citedPriorArt = data.citedPriorArt ? JSON.stringify(data.citedPriorArt) : null;
    if (data.examinerText !== undefined) updateData.examinerText = data.examinerText;
    if (data.parsedElements !== undefined) updateData.parsedElements = data.parsedElements ? JSON.stringify(data.parsedElements) : null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;

    const rejection = await prisma.rejection.update({
      where: { id },
      data: updateData,
    });

    logger.info('[RejectionRepository] Successfully updated rejection', { id });

    return rejection;
  } catch (error) {
    logger.error('[RejectionRepository] Failed to update rejection', {
      error: error instanceof Error ? error.message : String(error),
      id,
    });

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        `Rejection ${id} not found`
      );
    }

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to update rejection: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Deletes a rejection
 */
export async function deleteRejection(id: string): Promise<void> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    logger.debug('[RejectionRepository] Deleting rejection', { id });

    await prisma.rejection.delete({
      where: { id },
    });

    logger.info('[RejectionRepository] Successfully deleted rejection', { id });
  } catch (error) {
    logger.error('[RejectionRepository] Failed to delete rejection', {
      error: error instanceof Error ? error.message : String(error),
      id,
    });

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        `Rejection ${id} not found`
      );
    }

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to delete rejection: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Deletes all rejections for an office action
 */
export async function deleteRejectionsByOfficeAction(
  officeActionId: string
): Promise<number> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    logger.debug('[RejectionRepository] Deleting rejections by office action', {
      officeActionId,
    });

    const result = await prisma.rejection.deleteMany({
      where: { officeActionId },
    });

    logger.info('[RejectionRepository] Successfully deleted rejections', {
      officeActionId,
      count: result.count,
    });

    return result.count;
  } catch (error) {
    logger.error('[RejectionRepository] Failed to delete rejections by office action', {
      error: error instanceof Error ? error.message : String(error),
      officeActionId,
    });

    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to delete rejections: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
} 