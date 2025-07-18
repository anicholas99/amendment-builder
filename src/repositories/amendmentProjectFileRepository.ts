/**
 * Amendment Project File Repository
 * 
 * Handles all database operations for amendment project file tracking
 * Follows established patterns: tenant isolation, error handling, type safety
 */

import { prisma } from '@/lib/prisma';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';
import type { 
  AmendmentProjectFile, 
  AmendmentProjectFileWithRelations,
  AmendmentFileType,
  AmendmentFileStatus 
} from '@/types/amendment';

export interface CreateAmendmentProjectFileData {
  amendmentProjectId: string;
  tenantId: string;
  fileType: AmendmentFileType;
  fileName: string;
  originalName: string;
  blobName?: string;
  storageUrl?: string;
  mimeType?: string;
  sizeBytes?: number;
  version?: number;
  status?: AmendmentFileStatus;
  tags?: string[];
  description?: string;
  extractedText?: string;
  extractedMetadata?: Record<string, any>;
  uploadedBy: string;
  linkedDraftId?: string;
  parentFileId?: string;
}

export interface UpdateAmendmentProjectFileData {
  fileName?: string;
  status?: AmendmentFileStatus;
  tags?: string[];
  description?: string;
  extractedText?: string;
  extractedMetadata?: Record<string, any>;
  exportedAt?: Date;
  filedAt?: Date;
  linkedDraftId?: string;
}

export interface AmendmentProjectFileFilters {
  amendmentProjectId?: string;
  fileType?: AmendmentFileType;
  status?: AmendmentFileStatus;
  uploadedBy?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

/**
 * Create a new amendment project file record
 */
export async function createAmendmentProjectFile(
  data: CreateAmendmentProjectFileData
): Promise<AmendmentProjectFile> {
  try {
    logger.debug('[AmendmentProjectFileRepository] Creating file record', {
      amendmentProjectId: data.amendmentProjectId,
      fileType: data.fileType,
      fileName: data.fileName,
      tenantId: data.tenantId,
    });

    // Determine next version number if this is a new version of an existing file
    let version = data.version || 1;
    if (data.parentFileId) {
      const parentFile = await prisma.amendmentProjectFile.findUnique({
        where: { id: data.parentFileId },
        select: { version: true },
      });
      if (parentFile) {
        version = parentFile.version + 1;
      }
    }

    const amendmentProjectFile = await prisma.amendmentProjectFile.create({
      data: {
        amendmentProjectId: data.amendmentProjectId,
        tenantId: data.tenantId,
        fileType: data.fileType,
        fileName: data.fileName,
        originalName: data.originalName,
        blobName: data.blobName,
        storageUrl: data.storageUrl,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        version,
        status: data.status || AmendmentFileStatus.ACTIVE,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        description: data.description,
        extractedText: data.extractedText,
        extractedMetadata: data.extractedMetadata ? JSON.stringify(data.extractedMetadata) : null,
        uploadedBy: data.uploadedBy,
        linkedDraftId: data.linkedDraftId,
        parentFileId: data.parentFileId,
      },
    });

    // If this is a new version, mark the parent as superseded
    if (data.parentFileId) {
      await prisma.amendmentProjectFile.update({
        where: { id: data.parentFileId },
        data: { status: AmendmentFileStatus.SUPERSEDED },
      });
    }

    logger.info('[AmendmentProjectFileRepository] File record created', {
      id: amendmentProjectFile.id,
      amendmentProjectId: data.amendmentProjectId,
      fileType: data.fileType,
      version,
    });

    return amendmentProjectFile as AmendmentProjectFile;
  } catch (error) {
    logger.error('[AmendmentProjectFileRepository] Failed to create file record', {
      amendmentProjectId: data.amendmentProjectId,
      fileType: data.fileType,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new ApplicationError(
      ErrorCode.DATABASE_ERROR,
      `Failed to create amendment project file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Find amendment project file by ID
 */
export async function findAmendmentProjectFileById(
  id: string,
  includeRelations: boolean = false
): Promise<AmendmentProjectFileWithRelations | AmendmentProjectFile | null> {
  try {
    const amendmentProjectFile = await prisma.amendmentProjectFile.findUnique({
      where: { id },
      include: includeRelations ? {
        amendmentProject: true,
        tenant: true,
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        linkedDraft: true,
        parentFile: true,
        childFiles: {
          orderBy: { version: 'asc' },
        },
      } : undefined,
    });

    return amendmentProjectFile as AmendmentProjectFileWithRelations | AmendmentProjectFile | null;
  } catch (error) {
    logger.error('[AmendmentProjectFileRepository] Failed to find file by ID', {
      id,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new ApplicationError(
      ErrorCode.DATABASE_ERROR,
      `Failed to find amendment project file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Find all files for an amendment project with filtering and pagination
 */
export async function findAmendmentProjectFiles(
  filters: AmendmentProjectFileFilters,
  options?: {
    skip?: number;
    take?: number;
    orderBy?: 'createdAt' | 'updatedAt' | 'version' | 'fileName';
    orderDirection?: 'asc' | 'desc';
    includeRelations?: boolean;
  }
): Promise<{
  files: (AmendmentProjectFile | AmendmentProjectFileWithRelations)[];
  total: number;
}> {
  try {
    const {
      skip = 0,
      take = 50,
      orderBy = 'createdAt',
      orderDirection = 'desc',
      includeRelations = false,
    } = options || {};

    // Build where clause
    const where: any = {
      deletedAt: null,
    };

    if (filters.amendmentProjectId) {
      where.amendmentProjectId = filters.amendmentProjectId;
    }

    if (filters.fileType) {
      where.fileType = filters.fileType;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.uploadedBy) {
      where.uploadedBy = filters.uploadedBy;
    }

    if (filters.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end,
      };
    }

    if (filters.search) {
      where.OR = [
        { fileName: { contains: filters.search, mode: 'insensitive' } },
        { originalName: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { extractedText: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [files, total] = await Promise.all([
      prisma.amendmentProjectFile.findMany({
        where,
        skip,
        take,
        orderBy: { [orderBy]: orderDirection },
        include: includeRelations ? {
          amendmentProject: true,
          tenant: true,
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          linkedDraft: true,
          parentFile: true,
          childFiles: {
            orderBy: { version: 'asc' },
          },
        } : undefined,
      }),
      prisma.amendmentProjectFile.count({ where }),
    ]);

    return { files: files as any[], total };
  } catch (error) {
    logger.error('[AmendmentProjectFileRepository] Failed to find files', {
      filters,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new ApplicationError(
      ErrorCode.DATABASE_ERROR,
      `Failed to find amendment project files: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Update amendment project file
 */
export async function updateAmendmentProjectFile(
  id: string,
  data: UpdateAmendmentProjectFileData
): Promise<AmendmentProjectFile> {
  try {
    logger.debug('[AmendmentProjectFileRepository] Updating file', { id, updates: Object.keys(data) });

    const updateData: any = { ...data };
    
    // Serialize JSON fields
    if (data.tags) {
      updateData.tags = JSON.stringify(data.tags);
    }
    
    if (data.extractedMetadata) {
      updateData.extractedMetadata = JSON.stringify(data.extractedMetadata);
    }

    const amendmentProjectFile = await prisma.amendmentProjectFile.update({
      where: { id },
      data: updateData,
    });

    logger.info('[AmendmentProjectFileRepository] File updated', { id });

    return amendmentProjectFile as AmendmentProjectFile;
  } catch (error) {
    logger.error('[AmendmentProjectFileRepository] Failed to update file', {
      id,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new ApplicationError(
      ErrorCode.DATABASE_ERROR,
      `Failed to update amendment project file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Create a new version of an existing file
 */
export async function createFileVersion(
  parentFileId: string,
  newVersionData: Omit<CreateAmendmentProjectFileData, 'parentFileId'>
): Promise<AmendmentProjectFile> {
  try {
    logger.debug('[AmendmentProjectFileRepository] Creating file version', { parentFileId });

    const parentFile = await prisma.amendmentProjectFile.findUnique({
      where: { id: parentFileId },
      select: {
        amendmentProjectId: true,
        tenantId: true,
        fileType: true,
        version: true,
      },
    });

    if (!parentFile) {
      throw new ApplicationError(
        ErrorCode.NOT_FOUND,
        'Parent file not found'
      );
    }

    return createAmendmentProjectFile({
      ...newVersionData,
      amendmentProjectId: parentFile.amendmentProjectId,
      tenantId: parentFile.tenantId,
      fileType: newVersionData.fileType || parentFile.fileType as AmendmentFileType,
      parentFileId,
    });
  } catch (error) {
    if (error instanceof ApplicationError) throw error;

    logger.error('[AmendmentProjectFileRepository] Failed to create file version', {
      parentFileId,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new ApplicationError(
      ErrorCode.DATABASE_ERROR,
      `Failed to create file version: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get file version history for a file chain
 */
export async function getFileVersionHistory(
  fileId: string
): Promise<AmendmentProjectFile[]> {
  try {
    // Find the root file in the chain
    let currentFile = await prisma.amendmentProjectFile.findUnique({
      where: { id: fileId },
      select: { id: true, parentFileId: true },
    });

    if (!currentFile) {
      throw new ApplicationError(ErrorCode.NOT_FOUND, 'File not found');
    }

    // Walk up to find the root
    let rootFileId = currentFile.id;
    while (currentFile?.parentFileId) {
      currentFile = await prisma.amendmentProjectFile.findUnique({
        where: { id: currentFile.parentFileId },
        select: { id: true, parentFileId: true },
      });
      if (currentFile) {
        rootFileId = currentFile.id;
      }
    }

    // Get all files in the version chain
    const versionHistory = await prisma.amendmentProjectFile.findMany({
      where: {
        OR: [
          { id: rootFileId },
          { parentFileId: rootFileId },
          // Handle longer chains by recursively finding all children
        ],
      },
      orderBy: { version: 'asc' },
    });

    return versionHistory as AmendmentProjectFile[];
  } catch (error) {
    if (error instanceof ApplicationError) throw error;

    logger.error('[AmendmentProjectFileRepository] Failed to get version history', {
      fileId,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new ApplicationError(
      ErrorCode.DATABASE_ERROR,
      `Failed to get file version history: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Soft delete amendment project file
 */
export async function deleteAmendmentProjectFile(id: string): Promise<void> {
  try {
    logger.debug('[AmendmentProjectFileRepository] Soft deleting file', { id });

    await prisma.amendmentProjectFile.update({
      where: { id },
      data: { 
        deletedAt: new Date(),
        status: AmendmentFileStatus.ARCHIVED,
      },
    });

    logger.info('[AmendmentProjectFileRepository] File soft deleted', { id });
  } catch (error) {
    logger.error('[AmendmentProjectFileRepository] Failed to delete file', {
      id,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new ApplicationError(
      ErrorCode.DATABASE_ERROR,
      `Failed to delete amendment project file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get file statistics for an amendment project
 */
export async function getAmendmentProjectFileStats(
  amendmentProjectId: string
): Promise<{
  totalFiles: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  latestFiles: AmendmentProjectFile[];
  totalSize: number;
}> {
  try {
    const [files, totalSize] = await Promise.all([
      prisma.amendmentProjectFile.findMany({
        where: {
          amendmentProjectId,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.amendmentProjectFile.aggregate({
        where: {
          amendmentProjectId,
          deletedAt: null,
        },
        _sum: { sizeBytes: true },
      }),
    ]);

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    files.forEach(file => {
      byType[file.fileType] = (byType[file.fileType] || 0) + 1;
      byStatus[file.status] = (byStatus[file.status] || 0) + 1;
    });

    return {
      totalFiles: files.length,
      byType,
      byStatus,
      latestFiles: files.slice(0, 10) as AmendmentProjectFile[],
      totalSize: totalSize._sum.sizeBytes || 0,
    };
  } catch (error) {
    logger.error('[AmendmentProjectFileRepository] Failed to get file stats', {
      amendmentProjectId,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new ApplicationError(
      ErrorCode.DATABASE_ERROR,
      `Failed to get file statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
} 