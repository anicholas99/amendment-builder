import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/utils/clientLogger';
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

export type UpdateDraftDocumentRequest = z.infer<
  typeof UpdateDraftDocumentSchema
>;

// Batch update schema
const BatchUpdateDraftDocumentsSchema = z.object({
  updates: z.array(UpdateDraftDocumentSchema),
});

export type BatchUpdateDraftDocumentsRequest = z.infer<
  typeof BatchUpdateDraftDocumentsSchema
>;

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
  static async getDraftDocuments(
    projectId: string,
    skipInit = false,
    bustCache = false
  ): Promise<DraftDocument[]> {
    try {
      logger.debug('[DraftApiService] Getting draft documents', {
        projectId,
        skipInit,
        bustCache,
      });

      let url = skipInit
        ? `${API_ROUTES.PROJECTS.DRAFT(projectId)}?skipInit=true`
        : API_ROUTES.PROJECTS.DRAFT(projectId);

      // Add cache busting parameter if requested
      if (bustCache) {
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}t=${Date.now()}`;
      }

      const response = await apiFetch(url);

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to fetch draft documents: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Add detailed debug logging before validation
      logger.debug('[DraftApiService] Raw API response', {
        projectId,
        skipInit,
        bustCache,
        dataCount: Array.isArray(data) ? data.length : 'not-array',
        dataSample: Array.isArray(data)
          ? data.slice(0, 2).map((doc: any) => ({
              id: doc?.id,
              type: doc?.type,
              contentLength: doc?.content?.length || 0,
              hasContent: !!(doc?.content && doc.content.trim().length > 0),
              contentPreview: doc?.content?.substring(0, 50) + '...',
            }))
          : 'not-array',
        rawData: data, // Log the entire response for debugging
      });

      const validated = DraftDocumentsResponseSchema.parse(data);

      logger.info('[DraftApiService] Draft documents fetched', {
        projectId,
        count: validated.length,
        skipInit,
        bustCache,
        validatedSample: validated.slice(0, 2).map(doc => ({
          id: doc.id,
          type: doc.type,
          contentLength: doc.content?.length || 0,
          hasContent: !!(doc.content && doc.content.trim().length > 0),
          contentPreview: doc.content?.substring(0, 50) + '...',
        })),
      });

      return validated;
    } catch (error) {
      logger.error('[DraftApiService] Error fetching draft documents', {
        error,
        projectId,
      });
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
   * Delete all draft documents for a project
   */
  static async deleteDraftDocuments(
    projectId: string
  ): Promise<{ success: boolean; count: number }> {
    try {
      logger.debug('[DraftApiService] Deleting all draft documents', {
        projectId,
      });

      const response = await apiFetch(API_ROUTES.PROJECTS.DRAFT(projectId), {
        method: 'DELETE',
      });

      logger.debug('[DraftApiService] DELETE response status', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('[DraftApiService] DELETE failed', {
          status: response.status,
          statusText: response.statusText,
          errorText,
        });

        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to delete draft documents: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();

      logger.info('[DraftApiService] Draft documents deleted', {
        projectId,
        count: data.count,
        success: data.success,
      });

      return { success: data.success, count: data.count };
    } catch (error) {
      logger.error('[DraftApiService] Error deleting draft documents', {
        error,
        projectId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
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
