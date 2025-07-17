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
};
