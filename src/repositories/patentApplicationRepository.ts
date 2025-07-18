/**
 * Patent Application Repository
 * 
 * Handles all database operations for patent applications
 * Follows existing repository patterns for consistency and security
 */

import { prisma } from '@/lib/prisma';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';

// ============ TYPES ============

export interface PatentApplicationCreateData {
  projectId: string;
  applicationNumber?: string;
  filingDate?: Date;
  title?: string;
  inventors?: string[];
  assignee?: string;
  artUnit?: string;
  examinerName?: string;
  examinerId?: string;
  status?: string;
  metadata?: Record<string, any>;
}

export interface PatentApplicationUpdateData {
  applicationNumber?: string;
  filingDate?: Date;
  title?: string;
  inventors?: string[];
  assignee?: string;
  artUnit?: string;
  examinerName?: string;
  examinerId?: string;
  status?: string;
  metadata?: Record<string, any>;
}

// ============ CREATE OPERATIONS ============

/**
 * Creates a new patent application
 */
export async function createPatentApplication(
  data: PatentApplicationCreateData
): Promise<any> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    logger.debug('[PatentApplicationRepository] Creating patent application', {
      projectId: data.projectId,
      applicationNumber: data.applicationNumber,
    });

    const patentApplication = await prisma.patentApplication.create({
      data: {
        projectId: data.projectId,
        applicationNumber: data.applicationNumber,
        filingDate: data.filingDate,
        title: data.title,
        inventors: data.inventors ? JSON.stringify(data.inventors) : null,
        assignee: data.assignee,
        artUnit: data.artUnit,
        examinerName: data.examinerName,
        examinerId: data.examinerId,
        status: data.status || 'PENDING',
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });

    logger.info('[PatentApplicationRepository] Patent application created', {
      id: patentApplication.id,
      projectId: data.projectId,
    });

    return patentApplication;
  } catch (error) {
    logger.error('[PatentApplicationRepository] Failed to create patent application', {
      error,
      data,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to create patent application: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// ============ READ OPERATIONS ============

/**
 * Finds a patent application by project ID
 */
export async function findPatentApplicationByProjectId(
  projectId: string
): Promise<any | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    const patentApplication = await prisma.patentApplication.findUnique({
      where: { projectId },
      include: {
        project: true,
        claimVersions: {
          orderBy: { versionNumber: 'desc' },
          take: 5, // Get last 5 versions
        },
        strategyRecommendations: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get latest strategy
        },
      },
    });

    return patentApplication;
  } catch (error) {
    logger.error('[PatentApplicationRepository] Failed to find patent application', {
      error,
      projectId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find patent application: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Finds a patent application by application number
 */
export async function findPatentApplicationByNumber(
  applicationNumber: string
): Promise<any | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    const patentApplication = await prisma.patentApplication.findFirst({
      where: { applicationNumber },
    });

    return patentApplication;
  } catch (error) {
    logger.error('[PatentApplicationRepository] Failed to find patent application by number', {
      error,
      applicationNumber,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find patent application: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// ============ UPDATE OPERATIONS ============

/**
 * Updates a patent application
 */
export async function updatePatentApplication(
  id: string,
  data: PatentApplicationUpdateData
): Promise<any> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    const updateData: any = {
      ...data,
    };

    // Convert arrays to JSON strings
    if (data.inventors) {
      updateData.inventors = JSON.stringify(data.inventors);
    }
    if (data.metadata) {
      updateData.metadata = JSON.stringify(data.metadata);
    }

    const patentApplication = await prisma.patentApplication.update({
      where: { id },
      data: updateData,
    });

    logger.info('[PatentApplicationRepository] Patent application updated', {
      id,
      fieldsUpdated: Object.keys(data),
    });

    return patentApplication;
  } catch (error) {
    logger.error('[PatentApplicationRepository] Failed to update patent application', {
      error,
      id,
      data,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to update patent application: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Ensures a patent application exists for a project
 */
export async function ensurePatentApplication(
  projectId: string,
  initialData?: Partial<PatentApplicationCreateData>
): Promise<any> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  try {
    // Check if already exists
    let patentApplication = await findPatentApplicationByProjectId(projectId);
    
    if (!patentApplication) {
      // Get project data for initial values
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { invention: true },
      });

      if (!project) {
        throw new ApplicationError(
          ErrorCode.PROJECT_NOT_FOUND,
          'Project not found'
        );
      }

      // Create new patent application
      patentApplication = await createPatentApplication({
        projectId,
        title: initialData?.title || project.invention?.title || project.name,
        status: initialData?.status || 'PENDING',
        ...initialData,
      });
    }

    return patentApplication;
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw error;
    }
    
    logger.error('[PatentApplicationRepository] Failed to ensure patent application', {
      error,
      projectId,
    });
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to ensure patent application: ${error instanceof Error ? error.message : String(error)}`
    );
  }
} 