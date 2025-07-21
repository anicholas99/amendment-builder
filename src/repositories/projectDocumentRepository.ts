import { prisma } from '@/lib/prisma';
import { ProjectDocument, Prisma } from '@prisma/client';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';

/**
 * Repository for managing project documents
 * Handles all database operations for user-uploaded documents
 */
export const projectDocumentRepository = {
  /**
   * Create a new project document
   */
  async create(
    data: Prisma.ProjectDocumentCreateInput
  ): Promise<ProjectDocument> {
    try {
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client not initialized'
        );
      }

      return await prisma.projectDocument.create({
        data,
      });
    } catch (error) {
      logger.error('[ProjectDocumentRepo] Failed to create document', {
        error,
        projectId: data.project.connect?.id,
      });
      throw error;
    }
  },

  /**
   * Find all documents for a project
   */
  async findByProjectId(projectId: string): Promise<ProjectDocument[]> {
    try {
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client not initialized'
        );
      }

      return await prisma.projectDocument.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('[ProjectDocumentRepo] Failed to find documents', {
        error,
        projectId,
      });
      throw error;
    }
  },

  /**
   * Find a specific document by ID
   */
  async findById(id: string): Promise<ProjectDocument | null> {
    try {
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client not initialized'
        );
      }

      return await prisma.projectDocument.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error('[ProjectDocumentRepo] Failed to find document', {
        error,
        documentId: id,
      });
      throw error;
    }
  },

  /**
   * Delete a project document
   */
  async delete(id: string): Promise<ProjectDocument> {
    try {
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client not initialized'
        );
      }

      return await prisma.projectDocument.delete({
        where: { id },
      });
    } catch (error) {
      logger.error('[ProjectDocumentRepo] Failed to delete document', {
        error,
        documentId: id,
      });
      throw error;
    }
  },

  /**
   * Check if a document belongs to a specific project
   */
  async belongsToProject(
    documentId: string,
    projectId: string
  ): Promise<boolean> {
    try {
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client not initialized'
        );
      }

      const document = await prisma.projectDocument.findFirst({
        where: {
          id: documentId,
          projectId,
        },
      });

      return !!document;
    } catch (error) {
      logger.error('[ProjectDocumentRepo] Failed to check document ownership', {
        error,
        documentId,
        projectId,
      });
      throw error;
    }
  },

  /**
   * Update document metadata
   */
  async update(
    id: string,
    data: Prisma.ProjectDocumentUpdateInput
  ): Promise<ProjectDocument> {
    try {
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client not initialized'
        );
      }

      return await prisma.projectDocument.update({
        where: { id },
        data,
      });
    } catch (error) {
      logger.error('[ProjectDocumentRepo] Failed to update document', {
        error,
        documentId: id,
      });
      throw error;
    }
  },

  /**
   * Find a document by USPTO document identifier
   * Uses extractedMetadata to check for existing USPTO downloads
   */
  async findByUSPTOIdentifier(
    projectId: string,
    usptoDocumentId: string
  ): Promise<ProjectDocument | null> {
    try {
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client not initialized'
        );
      }

      const documents = await prisma.projectDocument.findMany({
        where: {
          projectId,
          fileType: 'office-action',
        },
      });

      // Check extractedMetadata for USPTO document ID
      for (const doc of documents) {
        if (doc.extractedMetadata) {
          try {
            const metadata = JSON.parse(doc.extractedMetadata);
            if (metadata.usptoDocumentId === usptoDocumentId) {
              return doc;
            }
          } catch (e) {
            // Skip if metadata parsing fails
            continue;
          }
        }
      }

      return null;
    } catch (error) {
      logger.error('[ProjectDocumentRepo] Failed to find document by USPTO ID', {
        error,
        projectId,
        usptoDocumentId,
      });
      throw error;
    }
  },

  /**
   * Find a document by ID with tenant verification for security
   */
  async findByIdWithTenantVerification(
    documentId: string,
    tenantId: string
  ): Promise<ProjectDocument | null> {
    try {
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client not initialized'
        );
      }

      return await prisma.projectDocument.findFirst({
        where: {
          id: documentId,
          project: {
            tenantId: tenantId,
          },
        },
      });
    } catch (error) {
      logger.error('[ProjectDocumentRepo] Failed to find document with tenant verification', {
        error,
        documentId,
        tenantId,
      });
      throw error;
    }
  },

  /**
   * Update OCR status for a document
   */
  async updateOCRStatus(
    documentId: string,
    status: 'pending' | 'completed' | 'failed',
    error?: string
  ): Promise<ProjectDocument> {
    try {
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client not initialized'
        );
      }

      const updateData: any = {
        ocrStatus: status,
        ocrProcessedAt: new Date(),
        updatedAt: new Date(),
      };

      if (error) {
        updateData.ocrError = error;
      }

      return await prisma.projectDocument.update({
        where: { id: documentId },
        data: updateData,
      });
    } catch (error) {
      logger.error('[ProjectDocumentRepo] Failed to update OCR status', {
        error,
        documentId,
        status,
      });
      throw error;
    }
  },

  /**
   * Update document with OCR results
   */
  async updateOCRResult(
    documentId: string,
    ocrText: string
  ): Promise<ProjectDocument> {
    try {
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client not initialized'
        );
      }

      return await prisma.projectDocument.update({
        where: { id: documentId },
        data: {
          ocrText,
          ocrStatus: 'completed',
          ocrProcessedAt: new Date(),
          ocrError: null, // Clear any previous errors
          updatedAt: new Date(),
        } as any, // Type assertion until schema migration is applied
      });
    } catch (error) {
      logger.error('[ProjectDocumentRepo] Failed to update OCR result', {
        error,
        documentId,
        textLength: ocrText.length,
      });
      throw error;
    }
  },

  /**
   * Find documents by OCR status for a project
   */
  async findByOCRStatus(
    projectId: string,
    status: 'pending' | 'completed' | 'failed'
  ): Promise<ProjectDocument[]> {
    try {
      if (!prisma) {
        throw new ApplicationError(
          ErrorCode.DB_CONNECTION_ERROR,
          'Database client not initialized'
        );
      }

      return await prisma.projectDocument.findMany({
        where: {
          projectId,
          ocrStatus: status,
        } as any, // Type assertion until schema migration is applied
        orderBy: { ocrProcessedAt: 'desc' } as any, // Type assertion until schema migration is applied
      });
    } catch (error) {
      logger.error('[ProjectDocumentRepo] Failed to find documents by OCR status', {
        error,
        projectId,
        status,
      });
      throw error;
    }
  },
};
