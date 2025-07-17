/**
 * Client-side API service for figure operations.
 */
import { apiFetch } from '@/lib/api/apiClient';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/utils/clientLogger';
import { API_ROUTES } from '@/constants/apiRoutes';
import { FigureApiService } from '@/services/api/figureApiService';

interface DatabaseFigure {
  id: string;
  figureKey?: string;
  fileName: string;
  description?: string;
  url: string;
  uploadedAt: string;
  sizeBytes: number;
  mimeType: string;
}

interface FiguresResponse {
  figures: DatabaseFigure[];
}

class FigureClientService {
  /**
   * Get list of figures for a project.
   */
  async getFigures(projectId: string): Promise<FiguresResponse> {
    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.FIGURES.LIST(projectId)
      );
      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          'Failed to fetch figures'
        );
      }
      return await response.json();
    } catch (error) {
      logger.error('[FigureClientService] Failed to fetch figures', {
        projectId,
        error,
      });
      throw error;
    }
  }

  /**
   * Upload a figure for a project.
   * Delegates to the FigureApiService for consistency.
   */
  async uploadFigure(
    projectId: string,
    file: File,
    figureKey?: string
  ): Promise<any> {
    return FigureApiService.uploadFigure(projectId, file, figureKey);
  }

  /**
   * Delete a figure.
   * Delegates to the FigureApiService for consistency.
   * @param url - The figure URL or projectId and figureId
   * @param figureId - Optional figureId if projectId is passed as first param
   */
  async deleteFigure(url: string, figureId?: string): Promise<void> {
    // If figureId is provided, treat first param as projectId
    if (figureId) {
      return FigureApiService.deleteFigure(url, figureId);
    }

    // Otherwise, extract from URL pattern: /api/projects/{projectId}/figures/{figureId}/download
    const match = url.match(/\/api\/projects\/([^\/]+)\/figures\/([^\/]+)/);
    if (!match) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_INVALID_FORMAT,
        'Invalid figure URL format'
      );
    }

    const [, extractedProjectId, extractedFigureId] = match;
    return FigureApiService.deleteFigure(extractedProjectId, extractedFigureId);
  }

  /**
   * Generate figure details using AI.
   */
  async generateFigureDetails(payload: {
    description: string;
    inventionContext?: string;
  }): Promise<any> {
    try {
      const response = await apiFetch('/api/ai/generate-figure-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.AI_GENERATION_FAILED,
          'Failed to generate figure details.'
        );
      }
      return await response.json();
    } catch (error) {
      logger.error('[FigureClientService] Figure details generation failed', {
        payload,
        error,
      });
      throw error;
    }
  }

  /**
   * Create a pending figure slot.
   * Delegates to the FigureApiService for consistency.
   */
  async createPendingFigure(
    projectId: string,
    figureKey: string,
    description?: string,
    title?: string
  ): Promise<{ id: string; figureKey: string; status: string }> {
    const result = await FigureApiService.createPendingFigure(
      projectId,
      figureKey,
      description,
      title
    );

    // createPendingFigure always returns a figureKey since it's validated as required
    // but the type allows null for other endpoints, so we assert it here
    if (!result.figureKey) {
      throw new ApplicationError(
        ErrorCode.API_INVALID_RESPONSE,
        'Invalid response: figureKey is required'
      );
    }

    return {
      id: result.id,
      figureKey: result.figureKey,
      status: result.status || 'PENDING',
    };
  }
}

// Export the class for context-based instantiation
export { FigureClientService };

// REMOVED: Singleton export that could cause session isolation issues
