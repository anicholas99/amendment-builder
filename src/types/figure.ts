import type { ProjectFigure } from '@prisma/client';

/**
 * Data structure for uploading a new figure
 */
export interface FigureUploadData {
  projectId: string;
  fileName: string;
  originalName: string;
  blobName: string;
  mimeType: string;
  sizeBytes: number;
  figureKey?: string;
  description?: string;
  uploadedBy: string;
}

/**
 * Figure information with access control data
 */
export interface FigureAccessInfo {
  id: string;
  projectId: string;
  status?: string;
  fileName: string;
  blobName: string;
  mimeType: string;
  sizeBytes: number;
  figureKey?: string;
  description?: string;
  uploadedBy: string;
  createdAt: Date;
}

/**
 * Figure metadata update payload
 */
export interface FigureMetadataUpdate {
  title?: string;
  description?: string;
  displayOrder?: number;
}

/**
 * Figure update payload
 */
export interface FigureUpdateData {
  figureKey?: string | null;
  description?: string;
  status?: string;
  fileName?: string;
  originalName?: string;
  blobName?: string;
  mimeType?: string;
  sizeBytes?: number;
}

/**
 * Element data for adding to a figure
 */
export interface FigureElementData {
  elementKey: string;
  elementName: string;
  calloutDescription?: string;
}

/**
 * Assignment data for bulk operations
 */
export interface FigureAssignment {
  uploadedFigureId: string;
  targetFigureKey: string;
}

/**
 * Figure with elements for display
 */
export interface FigureWithElements {
  id: string;
  status: string;
  figureKey: string | null;
  title: string | null;
  description: string | null;
  displayOrder: number | null;
  fileName: string;
  blobName: string;
  mimeType: string;
  elements: Array<{
    elementKey: string;
    elementName: string;
    calloutDescription: string | null;
  }>;
}

/**
 * Element information
 */
export interface ElementInfo {
  elementKey: string;
  elementName: string;
  calloutDescription: string | null;
}
