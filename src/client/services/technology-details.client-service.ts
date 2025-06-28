import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/lib/monitoring/logger';
import { InventionData } from '@/types/invention';

export class TechnologyDetailsService {
  static async processInvention(params: {
    projectId: string;
    textInput: string;
  }): Promise<any> {
    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.PROCESS_INVENTION(params.projectId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ textInput: params.textInput }),
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to process invention: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('[TechnologyDetailsService] Error processing invention', {
        projectId: params.projectId,
        error,
      });
      throw error;
    }
  }

  static async getTechnologyDetails(
    projectId: string
  ): Promise<InventionData | null> {
    try {
      const response = await apiFetch(API_ROUTES.PROJECTS.INVENTION(projectId));

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to fetch technology details: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error(
        '[TechnologyDetailsService] Error fetching technology details',
        {
          projectId,
          error,
        }
      );
      throw error;
    }
  }

  static async updateInvention(
    projectId: string,
    updates: Partial<InventionData>
  ): Promise<InventionData> {
    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.INVENTION(projectId),
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to update invention: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('[TechnologyDetailsService] Error updating invention', {
        projectId,
        updates,
        error,
      });
      throw error;
    }
  }

  static async extractText(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiFetch(API_ROUTES.UTILS.EXTRACT_TEXT, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to extract text: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('[TechnologyDetailsService] Error extracting text', {
        fileName: file.name,
        error,
      });
      throw error;
    }
  }

  static async uploadFigure(projectId: string, file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiFetch(
        API_ROUTES.PROJECTS.FIGURES.UPLOAD(projectId),
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to upload figure: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('[TechnologyDetailsService] Error uploading figure', {
        projectId,
        fileName: file.name,
        error,
      });
      throw error;
    }
  }

  static async deleteFigure(url: string): Promise<any> {
    try {
      // Extract figure ID from URL if needed
      const figureId = url; // This might need adjustment based on actual URL format

      // Note: This needs projectId context which isn't available from just the URL
      // This is a design issue that should be addressed
      const response = await apiFetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to delete figure: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('[TechnologyDetailsService] Error deleting figure', {
        url,
        error,
      });
      throw error;
    }
  }
}
