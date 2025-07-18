import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import type {
  OfficeAction,
  OfficeActionWithRelations,
  CreateOfficeActionRequest,
  ParsedOfficeActionData,
} from '@/types/amendment';

/**
 * Office Action Repository
 * Handles all database operations for Office Actions with proper tenant isolation
 * Follows existing repository patterns for consistency and security
 */

/**
 * Creates a new Office Action record
 * @param data Office Action creation data
 * @param tenantId Tenant ID for security verification
 * @param userId User ID who uploaded the OA
 * @returns Promise resolving to the created Office Action
 */
export async function createOfficeAction(
  data: CreateOfficeActionRequest & {
    blobName?: string;
    originalFileName?: string;
    mimeType?: string;
    sizeBytes?: number;
    extractedText?: string; // Add extractedText parameter
  },
  tenantId: string,
  userId: string
): Promise<OfficeAction> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    logger.debug('[OfficeActionRepository] Creating new Office Action', {
      projectId: data.projectId,
      tenantId,
      userId,
    });

    // Verify project belongs to tenant and user has access
    const project = await prisma.project.findFirst({
      where: {
        id: data.projectId,
        tenantId: tenantId,
        OR: [
          { userId: userId }, // User owns the project
          {
            collaborators: {
              some: { userId: userId }, // User is a collaborator
            },
          },
        ],
      },
      select: { id: true, tenantId: true },
    });

    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    // Create the Office Action
    const officeAction = await prisma.officeAction.create({
      data: {
        projectId: data.projectId,
        tenantId: tenantId,
        oaNumber: data.oaNumber,
        dateIssued: data.dateIssued ? new Date(data.dateIssued) : null,
        examinerId: data.examinerId,
        artUnit: data.artUnit,
        blobName: data.blobName,
        originalFileName: data.originalFileName,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        extractedText: data.extractedText, // Save the raw extracted text
        status: 'UPLOADED',
      },
    });

    logger.info('[OfficeActionRepository] Office Action created successfully', {
      id: officeAction.id,
      projectId: data.projectId,
      tenantId,
    });

    return officeAction;
  } catch (error) {
    logger.error('[OfficeActionRepository] Failed to create Office Action', {
      error,
      projectId: data.projectId,
      tenantId,
    });
    
    if (error instanceof ApplicationError) {
      throw error;
    }
    
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to create Office Action: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Finds an Office Action by ID with tenant verification
 * @param id Office Action ID
 * @param tenantId Tenant ID for security verification
 * @returns Promise resolving to the Office Action or null if not found
 */
export async function findOfficeActionById(
  id: string,
  tenantId: string
): Promise<OfficeAction | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    const officeAction = await prisma.officeAction.findFirst({
      where: {
        id: id,
        tenantId: tenantId,
        deletedAt: null,
      },
    });

    return officeAction;
  } catch (error) {
    logger.error('[OfficeActionRepository] Failed to find Office Action', {
      error,
      id,
      tenantId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find Office Action: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Finds an Office Action with full relations by ID
 * @param id Office Action ID
 * @param tenantId Tenant ID for security verification
 * @returns Promise resolving to the Office Action with relations or null
 */
export async function findOfficeActionWithRelationsById(
  id: string,
  tenantId: string
): Promise<OfficeActionWithRelations | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    const officeAction = await prisma.officeAction.findFirst({
      where: {
        id: id,
        tenantId: tenantId,
        deletedAt: null,
      },
      include: {
        project: true,
        tenant: true,
        rejections: {
          orderBy: { displayOrder: 'asc' },
        },
        amendmentProjects: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return officeAction;
  } catch (error) {
    logger.error('[OfficeActionRepository] Failed to find Office Action with relations', {
      error,
      id,
      tenantId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find Office Action with relations: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Finds all Office Actions for a project with tenant verification
 * @param projectId Project ID
 * @param tenantId Tenant ID for security verification
 * @returns Promise resolving to array of Office Actions
 */
export async function findOfficeActionsByProject(
  projectId: string,
  tenantId: string
): Promise<OfficeAction[]> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // Verify project belongs to tenant
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        tenantId: tenantId,
      },
      select: { id: true },
    });

    if (!project) {
      throw new ApplicationError(
        ErrorCode.PROJECT_ACCESS_DENIED,
        'Project not found or access denied'
      );
    }

    const officeActions = await prisma.officeAction.findMany({
      where: {
        projectId: projectId,
        tenantId: tenantId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return officeActions;
  } catch (error) {
    logger.error('[OfficeActionRepository] Failed to find Office Actions by project', {
      error,
      projectId,
      tenantId,
    });
    
    if (error instanceof ApplicationError) {
      throw error;
    }
    
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find Office Actions: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Updates an Office Action with parsing results
 * @param id Office Action ID
 * @param tenantId Tenant ID for security verification
 * @param parsedData Parsed Office Action data
 * @param status New status
 * @returns Promise resolving to updated Office Action
 */
export async function updateOfficeActionParsedData(
  id: string,
  tenantId: string,
  parsedData: ParsedOfficeActionData,
  status: 'PARSED' | 'PROCESSING' | 'COMPLETED' | 'ERROR'
): Promise<OfficeAction> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // Verify Office Action belongs to tenant
    const existingOA = await prisma.officeAction.findFirst({
      where: {
        id: id,
        tenantId: tenantId,
      },
      select: { id: true },
    });

    if (!existingOA) {
      throw new ApplicationError(
        ErrorCode.AUTH_FORBIDDEN,
        'Office Action not found or access denied'
      );
    }

    const updatedOfficeAction = await prisma.officeAction.update({
      where: { id: id },
      data: {
        parsedJson: JSON.stringify(parsedData),
        examinerRemarks: parsedData.examinerRemarks || null, // Store summary in dedicated field
        status: status,
        updatedAt: new Date(),
      },
    });

    logger.info('[OfficeActionRepository] Office Action updated with parsed data', {
      id,
      status,
      tenantId,
      hasSummary: !!parsedData.examinerRemarks,
    });

    return updatedOfficeAction;
  } catch (error) {
    logger.error('[OfficeActionRepository] Failed to update Office Action parsed data', {
      error,
      id,
      tenantId,
    });
    
    if (error instanceof ApplicationError) {
      throw error;
    }
    
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to update Office Action: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Updates Office Action status
 * @param id Office Action ID
 * @param tenantId Tenant ID for security verification
 * @param status New status
 * @returns Promise resolving to updated Office Action
 */
export async function updateOfficeActionStatus(
  id: string,
  tenantId: string,
  status: string
): Promise<OfficeAction> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // Verify Office Action belongs to tenant
    const existingOA = await prisma.officeAction.findFirst({
      where: {
        id: id,
        tenantId: tenantId,
      },
      select: { id: true },
    });

    if (!existingOA) {
      throw new ApplicationError(
        ErrorCode.AUTH_FORBIDDEN,
        'Office Action not found or access denied'
      );
    }

    const updatedOfficeAction = await prisma.officeAction.update({
      where: { id: id },
      data: {
        status: status,
        updatedAt: new Date(),
      },
    });

    logger.debug('[OfficeActionRepository] Office Action status updated', {
      id,
      status,
      tenantId,
    });

    return updatedOfficeAction;
  } catch (error) {
    logger.error('[OfficeActionRepository] Failed to update Office Action status', {
      error,
      id,
      tenantId,
    });
    
    if (error instanceof ApplicationError) {
      throw error;
    }
    
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to update Office Action status: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Soft deletes an Office Action
 * @param id Office Action ID
 * @param tenantId Tenant ID for security verification
 * @returns Promise resolving to success boolean
 */
export async function deleteOfficeAction(
  id: string,
  tenantId: string
): Promise<boolean> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // Verify Office Action belongs to tenant
    const existingOA = await prisma.officeAction.findFirst({
      where: {
        id: id,
        tenantId: tenantId,
      },
      select: { id: true },
    });

    if (!existingOA) {
      throw new ApplicationError(
        ErrorCode.AUTH_FORBIDDEN,
        'Office Action not found or access denied'
      );
    }

    await prisma.officeAction.update({
      where: { id: id },
      data: {
        deletedAt: new Date(),
      },
    });

    logger.info('[OfficeActionRepository] Office Action soft deleted', {
      id,
      tenantId,
    });

    return true;
  } catch (error) {
    logger.error('[OfficeActionRepository] Failed to delete Office Action', {
      error,
      id,
      tenantId,
    });
    
    if (error instanceof ApplicationError) {
      throw error;
    }
    
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to delete Office Action: ${error instanceof Error ? error.message : String(error)}`
    );
  }
} 

/**
 * Gets the office action context for the chat agent, including:
 * - Office Action metadata and details
 * - All rejections with parsed data
 * - Prior art references from rejections
 * - Examiner information
 *
 * This ensures the chat agent has full context about the specific office action being viewed.
 * SECURITY: Always validates tenant access before returning data.
 *
 * @param officeActionId - The office action ID to get context for
 * @param tenantId - The tenant ID for security validation
 * @returns Complete office action context or null if not found/unauthorized
 */
export async function getOfficeActionContextForChat(
  officeActionId: string,
  tenantId: string
): Promise<OfficeActionChatContext | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    const officeAction = await prisma.officeAction.findFirst({
      where: {
        id: officeActionId,
        tenantId: tenantId,
        deletedAt: null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        rejections: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!officeAction) {
      return null;
    }

    // Parse the office action data if available
    let parsedOfficeActionData = null;
    if (officeAction.parsedJson) {
      try {
        parsedOfficeActionData = JSON.parse(officeAction.parsedJson);
      } catch (error) {
        logger.warn('[OfficeActionRepository] Failed to parse office action JSON', {
          officeActionId,
          error,
        });
      }
    }

    // Process rejections and extract structured data
    const processedRejections = officeAction.rejections.map(rejection => {
      let claimNumbers: string[] = [];
      let citedPriorArt: string[] = [];

      // Parse JSON strings if they exist
      if (rejection.claimNumbers) {
        try {
          claimNumbers = typeof rejection.claimNumbers === 'string' 
            ? JSON.parse(rejection.claimNumbers) 
            : rejection.claimNumbers;
        } catch (error) {
          logger.warn('[OfficeActionRepository] Failed to parse claim numbers', {
            rejectionId: rejection.id,
            error,
          });
        }
      }

      if (rejection.citedPriorArt) {
        try {
          citedPriorArt = typeof rejection.citedPriorArt === 'string' 
            ? JSON.parse(rejection.citedPriorArt) 
            : rejection.citedPriorArt;
        } catch (error) {
          logger.warn('[OfficeActionRepository] Failed to parse cited prior art', {
            rejectionId: rejection.id,
            error,
          });
        }
      }

      return {
        id: rejection.id,
        type: rejection.type,
        claimNumbers,
        citedPriorArt,
        examinerText: rejection.examinerText,
        status: rejection.status,
        displayOrder: rejection.displayOrder,
      };
    });

    // Extract all unique prior art references
    const allPriorArtReferences = Array.from(
      new Set(
        processedRejections.flatMap(r => r.citedPriorArt)
      )
    );

    // Transform the data into a structured format for the chat agent
    const context: OfficeActionChatContext = {
      officeAction: {
        id: officeAction.id,
        fileName: officeAction.originalFileName,
        oaNumber: officeAction.oaNumber,
        dateIssued: officeAction.dateIssued,
        examinerId: officeAction.examinerId,
        artUnit: officeAction.artUnit,
        extractedText: officeAction.extractedText,
        examinerRemarks: officeAction.examinerRemarks,
        status: officeAction.status,
        createdAt: officeAction.createdAt,
        updatedAt: officeAction.updatedAt,
      },
      project: {
        id: officeAction.project.id,
        name: officeAction.project.name,
      },
      rejections: processedRejections,
      priorArtReferences: allPriorArtReferences,
      parsedData: parsedOfficeActionData,
      summary: {
        totalRejections: processedRejections.length,
        rejectionTypes: Array.from(new Set(processedRejections.map(r => r.type))),
        totalClaimsRejected: Array.from(new Set(processedRejections.flatMap(r => r.claimNumbers))).length,
        uniquePriorArtCount: allPriorArtReferences.length,
      },
    };

    logger.debug('[OfficeActionRepository] Office action context loaded for chat', {
      officeActionId,
      fileName: officeAction.originalFileName,
      rejectionCount: processedRejections.length,
      priorArtCount: allPriorArtReferences.length,
    });

    return context;
  } catch (error) {
    logger.error('[OfficeActionRepository] Failed to get office action context for chat', {
      error,
      officeActionId,
      tenantId,
    });
    
    if (error instanceof ApplicationError) {
      throw error;
    }
    
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to get office action context: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Type definition for the office action context
export interface OfficeActionChatContext {
  officeAction: {
    id: string;
    fileName: string | null;
    oaNumber: string | null;
    dateIssued: Date | null;
    examinerId: string | null;
    artUnit: string | null;
    extractedText: string | null;
    examinerRemarks: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
  project: {
    id: string;
    name: string;
  };
  rejections: Array<{
    id: string;
    type: string;
    claimNumbers: string[];
    citedPriorArt: string[];
    examinerText: string;
    status: string;
    displayOrder: number;
  }>;
  priorArtReferences: string[];
  parsedData: any;
  summary: {
    totalRejections: number;
    rejectionTypes: string[];
    totalClaimsRejected: number;
    uniquePriorArtCount: number;
  };
} 