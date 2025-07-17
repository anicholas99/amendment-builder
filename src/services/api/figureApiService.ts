import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/utils/clientLogger';
import { z } from 'zod';
import { validateApiResponse } from '@/lib/validation/apiValidation';

// Response schemas
export const FigureSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  status: z.string().optional(),
  fileName: z.string().nullish(),
  blobName: z.string().nullish(),
  mimeType: z.string().nullish(),
  sizeBytes: z.number().nullish(),
  figureKey: z.string().nullish(),
  description: z.string().nullish(),
  uploadedBy: z.string(),
  uploadedRecordId: z.string().optional(), // ID of UPLOADED record created during unassign operations
  createdAt: z
    .string()
    .or(z.date())
    .transform(val => (typeof val === 'string' ? new Date(val) : val)),
});

export const FigureListResponseSchema = z.object({
  figures: z.array(
    z.object({
      id: z.string(),
      status: z.string().optional(),
      figureKey: z.string().nullish(),
      fileName: z.string(),
      description: z.string().nullish(),
      url: z.string(),
      uploadedAt: z.string().or(z.date()),
      sizeBytes: z.number(),
      mimeType: z.string(),
    })
  ),
});

// New schemas for normalized data
export const FigureElementSchema = z.object({
  elementKey: z.string(),
  elementName: z.string(),
  calloutDescription: z.string().nullish(),
});

export const FigureWithElementsSchema = z.object({
  id: z.string(),
  projectId: z.string().optional(),
  status: z.string().optional(),
  figureKey: z.string().nullish(), // Can be null for unassigned uploads
  title: z.string().nullish(),
  description: z.string().nullish(),
  displayOrder: z.number(),
  fileName: z.string().optional(),
  blobName: z.string().optional(),
  mimeType: z.string().optional(),
  sizeBytes: z.number().optional(),
  elements: z.array(FigureElementSchema),
  createdAt: z.string().or(z.date()).optional(),
});

export const FiguresWithElementsResponseSchema = z.object({
  figures: z.array(FigureWithElementsSchema),
});

export const ElementSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  elementKey: z.string(),
  name: z.string(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

// Types
export type Figure = z.infer<typeof FigureSchema>;
export type FigureListResponse = z.infer<typeof FigureListResponseSchema>;
export type FigureElement = z.infer<typeof FigureElementSchema>;
export type FigureWithElements = z.infer<typeof FigureWithElementsSchema>;
export type FiguresWithElementsResponse = z.infer<
  typeof FiguresWithElementsResponseSchema
>;
export type Element = z.infer<typeof ElementSchema>;

export interface FigureUpdatePayload {
  figureKey?: string | null;
  description?: string;
  unassign?: boolean;
}

export interface FigureMetadataUpdatePayload {
  title?: string;
  description?: string;
  displayOrder?: number;
}

export interface ElementUpdatePayload {
  elementKey: string;
  elementName: string;
  calloutDescription?: string;
}

export interface ElementCalloutUpdatePayload {
  elementKey: string;
  calloutDescription: string;
}

/**
 * Figure API Service
 * Handles all figure-related API operations
 */
export class FigureApiService {
  /**
   * List all figures for a project
   */
  static async listFigures(projectId: string): Promise<FigureListResponse> {
    logger.debug('[FigureApiService] Listing figures', { projectId });

    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.FIGURES.LIST(projectId)
      );
      const result = await response.json();

      // Handle standardized API response format
      const data = result.data || result;
      const validated = validateApiResponse(data, FigureListResponseSchema);

      logger.info('[FigureApiService] Figures listed successfully', {
        projectId,
        count: validated.figures.length,
      });

      return validated;
    } catch (error) {
      logger.error('[FigureApiService] Failed to list figures', {
        projectId,
        error,
      });
      throw error;
    }
  }

  /**
   * List all figures with their elements for a project
   */
  static async listFiguresWithElements(
    projectId: string
  ): Promise<FiguresWithElementsResponse> {
    try {
      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = Date.now();
      const response = await apiFetch(
        `${API_ROUTES.PROJECTS.FIGURES.LIST(projectId)}?includeElements=true&_t=${cacheBuster}`
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to fetch figures: ${response.statusText}`
        );
      }

      const result = await response.json();

      // Handle standardized API response format
      const data = result.data || result;

      return validateApiResponse(data, FiguresWithElementsResponseSchema);
    } catch (error) {
      logger.error('[FigureApiService] Failed to list figures with elements', {
        projectId,
        error,
      });
      throw error;
    }
  }

  /**
   * Upload a figure for a project
   */
  static async uploadFigure(
    projectId: string,
    file: File,
    figureKey?: string
  ): Promise<{ url: string; fileName: string; type: string | null }> {
    logger.debug('[FigureApiService] Uploading figure', {
      projectId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      figureKey,
    });

    if (!projectId) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Project ID is required'
      );
    }

    if (!file) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'File is required'
      );
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);

    if (figureKey) {
      formData.append('figureKey', figureKey);
    }

    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.FIGURES.UPLOAD(projectId),
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.STORAGE_UPLOAD_FAILED,
          `Upload failed with status ${response.status}`
        );
      }

      const result = await response.json();

      logger.info('[FigureApiService] Figure uploaded successfully', {
        projectId,
        fileName: file.name,
        url: result.url,
        figureKey,
      });

      return result;
    } catch (error) {
      logger.error('[FigureApiService] Upload failed', {
        projectId,
        fileName: file.name,
        figureKey,
        error,
      });
      throw error;
    }
  }

  /**
   * Update a figure's metadata
   */
  static async updateFigure(
    projectId: string,
    figureId: string,
    updates: FigureUpdatePayload
  ): Promise<Figure> {
    logger.debug('[FigureApiService] Updating figure', {
      projectId,
      figureId,
      updates,
    });

    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.FIGURES.UPDATE(projectId, figureId),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to update figure: ${response.status}`
        );
      }

      const result = await response.json();

      // Handle standardized API response format
      const data = result.data || result;
      const validated = validateApiResponse(data, FigureSchema);

      logger.info('[FigureApiService] Figure updated successfully', {
        projectId,
        figureId,
        figureKey: validated.figureKey,
      });

      return validated;
    } catch (error) {
      logger.error('[FigureApiService] Failed to update figure', {
        projectId,
        figureId,
        error,
      });
      throw error;
    }
  }

  /**
   * Update a figure's metadata (title, description, displayOrder)
   */
  static async updateFigureMetadata(
    projectId: string,
    figureId: string,
    updates: FigureMetadataUpdatePayload
  ): Promise<Figure> {
    logger.debug('[FigureApiService] Updating figure metadata', {
      projectId,
      figureId,
      updates,
    });

    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.FIGURES.METADATA(projectId, figureId),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      const result = await response.json();

      // Handle standardized API response format
      const data = result.data || result;
      const validated = validateApiResponse(data.figure, FigureSchema);

      logger.info('[FigureApiService] Figure metadata updated successfully', {
        projectId,
        figureId,
      });

      return validated;
    } catch (error) {
      logger.error('[FigureApiService] Failed to update figure metadata', {
        projectId,
        figureId,
        error,
      });
      throw error;
    }
  }

  /**
   * Add an element to a figure
   */
  static async addElementToFigure(
    projectId: string,
    figureId: string,
    element: ElementUpdatePayload
  ): Promise<void> {
    logger.debug('[FigureApiService] Adding element to figure', {
      projectId,
      figureId,
      element,
    });

    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.FIGURES.ELEMENTS(projectId, figureId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(element),
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to add element to figure: ${response.status}`
        );
      }

      logger.info('[FigureApiService] Element added to figure successfully', {
        projectId,
        figureId,
        elementKey: element.elementKey,
      });
    } catch (error) {
      logger.error('[FigureApiService] Failed to add element to figure', {
        projectId,
        figureId,
        error,
      });
      throw error;
    }
  }

  /**
   * Remove an element from a figure
   */
  static async removeElementFromFigure(
    projectId: string,
    figureId: string,
    elementKey: string
  ): Promise<void> {
    logger.debug('[FigureApiService] Removing element from figure', {
      projectId,
      figureId,
      elementKey,
    });

    try {
      const response = await apiFetch(
        `${API_ROUTES.PROJECTS.FIGURES.ELEMENTS(projectId, figureId)}?elementKey=${encodeURIComponent(elementKey)}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to remove element from figure: ${response.status}`
        );
      }

      logger.info(
        '[FigureApiService] Element removed from figure successfully',
        {
          projectId,
          figureId,
          elementKey,
        }
      );
    } catch (error) {
      logger.error('[FigureApiService] Failed to remove element from figure', {
        projectId,
        figureId,
        elementKey,
        error,
      });
      throw error;
    }
  }

  /**
   * Update an element's callout description for a specific figure
   */
  static async updateElementCallout(
    projectId: string,
    figureId: string,
    update: ElementCalloutUpdatePayload
  ): Promise<void> {
    logger.debug('[FigureApiService] Updating element callout', {
      projectId,
      figureId,
      update,
    });

    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.FIGURES.ELEMENTS(projectId, figureId),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(update),
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to update element callout: ${response.status}`
        );
      }

      logger.info('[FigureApiService] Element callout updated successfully', {
        projectId,
        figureId,
        elementKey: update.elementKey,
      });
    } catch (error) {
      logger.error('[FigureApiService] Failed to update element callout', {
        projectId,
        figureId,
        error,
      });
      throw error;
    }
  }

  /**
   * Update an element's name globally across all figures
   */
  static async updateElementName(
    projectId: string,
    elementKey: string,
    name: string
  ): Promise<Element> {
    logger.debug('[FigureApiService] Updating element name', {
      projectId,
      elementKey,
      name,
    });

    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.ELEMENTS.BY_KEY(projectId, elementKey),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name }),
        }
      );

      const result = await response.json();

      // Handle standardized API response format
      const data = result.data || result;
      const validated = validateApiResponse(data.element, ElementSchema);

      logger.info('[FigureApiService] Element name updated successfully', {
        projectId,
        elementKey,
      });

      return validated;
    } catch (error) {
      logger.error('[FigureApiService] Failed to update element name', {
        projectId,
        elementKey,
        error,
      });
      throw error;
    }
  }

  /**
   * Delete a figure
   */
  static async deleteFigure(
    projectId: string,
    figureId: string
  ): Promise<void> {
    logger.debug('[FigureApiService] Deleting figure', {
      projectId,
      figureId,
    });

    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.FIGURES.DELETE(projectId, figureId),
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to delete figure: ${response.status}`
        );
      }

      logger.info('[FigureApiService] Figure deleted successfully', {
        projectId,
        figureId,
      });
    } catch (error) {
      logger.error('[FigureApiService] Failed to delete figure', {
        projectId,
        figureId,
        error,
      });
      throw error;
    }
  }

  /**
   * Create a pending figure slot
   */
  static async createPendingFigure(
    projectId: string,
    figureKey: string,
    description?: string,
    title?: string
  ): Promise<FigureWithElements> {
    logger.debug('[FigureApiService] Creating pending figure', {
      projectId,
      figureKey,
      description,
      title,
    });

    try {
      const response = await apiFetch(
        API_ROUTES.PROJECTS.FIGURES.CREATE_PENDING(projectId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            figureKey,
            description,
            title,
          }),
        }
      );

      const result = await response.json();

      // Handle standardized API response format
      const data = result.data || result;

      // Validate the response as a FigureWithElements
      const validated = validateApiResponse(data, FigureWithElementsSchema);

      logger.info('[FigureApiService] Pending figure created successfully', {
        projectId,
        figureKey,
        figureId: validated.id,
      });

      return validated;
    } catch (error) {
      logger.error('[FigureApiService] Failed to create pending figure', {
        projectId,
        figureKey,
        error,
      });
      throw error;
    }
  }
}
