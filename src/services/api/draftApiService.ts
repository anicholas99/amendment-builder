import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/lib/monitoring/logger';
import { z } from 'zod';

// Draft document schema
const DraftDocumentSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  type: z.string(),
  content: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type DraftDocument = z.infer<typeof DraftDocumentSchema>;

// Update request schema
const UpdateDraftDocumentSchema = z.object({
  type: z.string(),
  content: z.string(),
});

export type UpdateDraftDocumentRequest = z.infer<typeof UpdateDraftDocumentSchema>;

// Batch update schema
const BatchUpdateDraftDocumentsSchema = z.object({
  updates: z.array(UpdateDraftDocumentSchema),
});

export type BatchUpdateDraftDocumentsRequest = z.infer<typeof BatchUpdateDraftDocumentsSchema>;

// Response validation
const DraftDocumentsResponseSchema = z.array(DraftDocumentSchema);
const BatchUpdateResponseSchema = z.object({
  success: z.boolean(),
  count: z.number(),
});

/**
 * Service for managing draft documents
 */
export class DraftApiService {
  /**
   * Get all draft documents for a project
   */
  static async getDraftDocuments(projectId: string): Promise<DraftDocument[]> {
    try {
      logger.debug('[DraftApiService] Getting draft documents', { projectId });

      const response = await apiFetch(API_ROUTES.PROJECTS.DRAFT(projectId));
      
      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to fetch draft documents: ${response.statusText}`
        );
      }

      const data = await response.json();
      const validated = DraftDocumentsResponseSchema.parse(data);

      logger.info('[DraftApiService] Draft documents fetched', {
        projectId,
        count: validated.length,
      });

      return validated;
    } catch (error) {
      logger.error('[DraftApiService] Error fetching draft documents', { error, projectId });
      throw error;
    }
  }

  /**
   * Update a single draft document
   */
  static async updateDraftDocument(
    projectId: string,
    type: string,
    content: string
  ): Promise<DraftDocument> {
    try {
      logger.debug('[DraftApiService] Updating draft document', {
        projectId,
        type,
        contentLength: content.length,
      });

      const response = await apiFetch(API_ROUTES.PROJECTS.DRAFT(projectId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content }),
      });

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to update draft document: ${response.statusText}`
        );
      }

      const data = await response.json();
      const validated = DraftDocumentSchema.parse(data);

      logger.info('[DraftApiService] Draft document updated', {
        projectId,
        documentId: validated.id,
        type: validated.type,
      });

      return validated;
    } catch (error) {
      logger.error('[DraftApiService] Error updating draft document', {
        error,
        projectId,
        type,
      });
      throw error;
    }
  }

  /**
   * Batch update multiple draft documents
   */
  static async batchUpdateDraftDocuments(
    projectId: string,
    updates: UpdateDraftDocumentRequest[]
  ): Promise<{ success: boolean; count: number }> {
    try {
      logger.debug('[DraftApiService] Batch updating draft documents', {
        projectId,
        updateCount: updates.length,
      });

      const response = await apiFetch(API_ROUTES.PROJECTS.DRAFT(projectId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to batch update draft documents: ${response.statusText}`
        );
      }

      const data = await response.json();
      const validated = BatchUpdateResponseSchema.parse(data);

      logger.info('[DraftApiService] Draft documents batch updated', {
        projectId,
        count: validated.count,
      });

      return validated;
    } catch (error) {
      logger.error('[DraftApiService] Error batch updating draft documents', {
        error,
        projectId,
        updateCount: updates.length,
      });
      throw error;
    }
  }

  /**
   * Get a specific draft document by type
   */
  static async getDraftDocumentByType(
    projectId: string,
    type: string
  ): Promise<DraftDocument | null> {
    try {
      const documents = await this.getDraftDocuments(projectId);
      return documents.find(doc => doc.type === type) || null;
    } catch (error) {
      logger.error('[DraftApiService] Error getting draft document by type', {
        error,
        projectId,
        type,
      });
      throw error;
    }
  }

  /**
   * Check if project has draft documents
   */
  static async hasDraftDocuments(projectId: string): Promise<boolean> {
    try {
      const documents = await this.getDraftDocuments(projectId);
      return documents.length > 0;
    } catch (error) {
      logger.error('[DraftApiService] Error checking draft documents', {
        error,
        projectId,
      });
      return false;
    }
  }
} 