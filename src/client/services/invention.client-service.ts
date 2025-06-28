/**
 * Client-side API service for invention data operations
 *
 * This service provides a clean interface for invention-related API calls,
 * following the established client/server architecture pattern.
 */
import { environment } from '@/config/environment';
import { API_ROUTES } from '@/constants/apiRoutes';
import { apiFetch } from '@/lib/api/apiClient';
import { logger } from '@/lib/monitoring/logger';
import { ProjectApiService } from '@/client/services/project.client-service';
import { InventionData } from '@/types/invention';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { FigureApiService } from '@/services/api/figureApiService';

class InventionClientService {
  /**
   * Get invention data for a project.
   */
  async getInvention(projectId: string): Promise<InventionData | null> {
    if (!projectId) {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        'Project ID is required.'
      );
    }
    try {
      const response = await apiFetch(`/api/projects/${projectId}/invention`);
      return await response.json();
    } catch (error) {
      if (error instanceof ApplicationError && error.statusCode === 404) {
        logger.debug(
          '[InventionClientService] No invention data found for project (404)',
          { projectId }
        );
        return null;
      }
      logger.error('[InventionClientService] Error fetching invention data', {
        projectId,
        error,
      });
      throw error;
    }
  }

  /**
   * Update invention data for a project.
   */
  async updateInvention(
    projectId: string,
    updates: Partial<InventionData>
  ): Promise<InventionData> {
    if (!projectId) {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        'Project ID is required.'
      );
    }
    try {
      const response = await apiFetch(`/api/projects/${projectId}/invention`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to update invention data: ${response.status}`
        );
      }
      return await response.json();
    } catch (error) {
      logger.error('[InventionClientService] Error updating invention data', {
        projectId,
        error,
      });
      throw error;
    }
  }

  /**
   * Updates just the title of an invention.
   * @param projectId - The ID of the project.
   * @param title - The new title for the invention.
   * @returns A success message.
   */
  async updateTitle(
    projectId: string,
    title: string
  ): Promise<{ message: string }> {
    if (!projectId) {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        'Project ID is required.'
      );
    }
    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.INVENTION_TITLE(projectId),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        }
      );
      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to update invention title: ${response.status}`
        );
      }
      return response.json();
    } catch (error) {
      logger.error('[InventionClientService] Error updating invention title', {
        projectId,
        error,
      });
      throw error;
    }
  }

  /**
   * Updates just the summary of an invention.
   * @param projectId - The ID of the project.
   * @param summary - The new summary for the invention.
   * @returns A success message.
   */
  async updateSummary(
    projectId: string,
    summary: string
  ): Promise<{ message: string }> {
    if (!projectId) {
      throw new ApplicationError(
        ErrorCode.INVALID_INPUT,
        'Project ID is required.'
      );
    }
    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.INVENTION_SUMMARY(projectId),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ summary }),
        }
      );
      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to update invention summary: ${response.status}`
        );
      }
      return response.json();
    } catch (error) {
      logger.error(
        '[InventionClientService] Error updating invention summary',
        { projectId, error }
      );
      throw error;
    }
  }

  /**
   * Extract text from a file
   */
  static async extractText(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiFetch(API_ROUTES.UTILS.EXTRACT_TEXT, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      return data.text;
    } catch (error) {
      logger.error('Error extracting text from file', { error });
      throw error;
    }
  }

  /**
   * Upload a document
   */
  static async uploadDocument(file: File): Promise<{ id: string; filename: string; url: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiFetch(API_ROUTES.DOCUMENTS.UPLOAD, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.FILE_PROCESSING_ERROR,
          `Failed to upload document: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('[InventionClientService] Error uploading document', {
        error,
      });
      throw error;
    }
  }

  /**
   * Process a document file (extract and structure)
   */
  static async processDocumentFile(file: File): Promise<{ id: string; filename: string; url: string }> {
    try {
      // For now, delegate to uploadDocument - can be extended later
      return await this.uploadDocument(file);
    } catch (error) {
      logger.error('[InventionClientService] Error processing document', {
        error,
      });
      throw error;
    }
  }

  /**
   * Upload a figure for a project
   * Delegates to the FigureApiService for consistency.
   */
  static async uploadFigure(projectId: string, file: File): Promise<{ id: string; url: string; filename: string; description?: string }> {
    return FigureApiService.uploadFigure(projectId, file);
  }

  /**
   * Delete a figure
   * Delegates to the FigureApiService for consistency.
   */
  static async deleteFigure(
    projectId: string,
    figureId: string
  ): Promise<void> {
    return FigureApiService.deleteFigure(projectId, figureId);
  }

  /**
   * Generate figure details using AI
   */
  static async generateFigureDetails(payload: {
    description: string;
    inventionContext?: string;
  }): Promise<{ details: string; elements?: string[]; description?: string }> {
    try {
      const response = await apiFetch('/api/ai/generate-figure-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.AI_GENERATION_FAILED,
          `Failed to generate figure details: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('[InventionClientService] Error generating figure details', {
        payload,
        error,
      });
      throw error;
    }
  }

  /**
   * Update a figure
   */
  static async updateFigure(figureId: string, updates: Record<string, unknown>): Promise<{ id: string; success: boolean }> {
    try {
      const response = await apiFetch(`/api/figures/${figureId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to update figure: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('[InventionClientService] Error updating figure', {
        figureId,
        updates,
        error,
      });
      throw error;
    }
  }
}

export const inventionClientService = new InventionClientService();
export { InventionClientService };
