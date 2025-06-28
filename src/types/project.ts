/**
 * Project Types
 *
 * This file defines the TypeScript interfaces for project-related data structures.
 * Use these types throughout the application for better type safety.
 */

import { SavedPriorArt } from '../features/search/types';
import { InventionData } from './invention';
import { ProjectDataResponse } from './api/responses';
import { ProjectBasicInfo } from '@/repositories/project/types';
import { Invention } from '@prisma/client';
import { logger } from '@/lib/monitoring/logger';

/**
 * Status of a project
 */
export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'archived';

/**
 * Document types within a project
 */
export type DocumentType = 'technology' | 'patent' | 'claim-refinement';

/**
 * Document in a project
 */
export interface ProjectDocument {
  id: string;
  projectId: string;
  type: DocumentType;
  content: string | null | Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project data structure as stored in the database
 * This closely matches the Prisma schema while also including derived fields
 * used by the frontend
 */
export interface ProjectData {
  id: string;
  name: string;
  userId: string;
  tenantId: string;
  status: ProjectStatus;
  textInput: string;

  // Database dates
  createdAt: Date | string;
  updatedAt?: Date | string;

  // Derived fields for frontend use
  lastModified: string; // ISO string from updatedAt
  lastUpdated?: number; // Timestamp in milliseconds from updatedAt

  // Related documents
  documents: ProjectDocument[];

  // Related saved prior art (mapped from API)
  savedPriorArtItems: SavedPriorArt[];

  // The new normalized invention data
  invention?: InventionData;
}

/**
 * Data needed to create a new project
 */
export interface CreateProjectData {
  name: string;
  textInput?: string;
  status?: ProjectStatus;
}

/**
 * Data needed to update a project
 */
export interface UpdateProjectData {
  name?: string;
  textInput?: string;
  status?: ProjectStatus;
  inventionData?: InventionData;
}

/**
 * Active document in the UI
 */
export interface ActiveDocument {
  projectId: string;
  documentId: string;
  documentType: DocumentType;
}

/**
 * Type guard to check if an object is a valid ProjectData
 */
export function isProjectData(obj: unknown): obj is ProjectData {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'id' in obj &&
    typeof (obj as Record<string, unknown>).id === 'string' &&
    'name' in obj &&
    typeof (obj as Record<string, unknown>).name === 'string' &&
    'userId' in obj &&
    typeof (obj as Record<string, unknown>).userId === 'string' &&
    'tenantId' in obj &&
    typeof (obj as Record<string, unknown>).tenantId === 'string' &&
    'documents' in obj &&
    Array.isArray((obj as Record<string, unknown>).documents) &&
    'lastModified' in obj &&
    typeof (obj as Record<string, unknown>).lastModified === 'string'
  );
}

/**
 * Raw project data from database/API
 */
interface RawProjectData {
  id?: string;
  name?: string;
  userId?: string;
  tenantId?: string;
  status?: string;
  textInput?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  documents?: Array<{
    id: string;
    projectId: string;
    type: string;
    content: string | null | Record<string, unknown>;
    createdAt: Date | string;
    updatedAt: Date | string;
  }>;
  savedPriorArtItems?: unknown[] | SavedPriorArt[];
}

/**
 * Transform database project to frontend ProjectData
 * This ensures all the required fields for the frontend are present
 */
export function transformProject(
  project: ProjectBasicInfo | ProjectDataResponse
): ProjectData {
  // Ensure dates are properly formatted
  const updatedAt =
    project.updatedAt instanceof Date
      ? project.updatedAt
      : new Date(project.updatedAt || Date.now());

  const createdAt =
    project.createdAt instanceof Date
      ? project.createdAt
      : new Date(project.createdAt || Date.now());

  // Helper to transform a Prisma Invention (with nulls) to a frontend InventionData (with undefineds)
  const transformInvention = (
    invention: Invention | null | undefined
  ): InventionData | undefined => {
    if (!invention) {
      return undefined;
    }
    // Create a new object and explicitly map fields, converting null to undefined
    return {
      id: invention.id,
      projectId: invention.projectId,
      title: invention.title ?? undefined,
      summary: invention.summary ?? undefined,
      abstract: invention.abstract ?? undefined,
      patentCategory: invention.patentCategory ?? undefined,
      technicalField: invention.technicalField ?? undefined,
      featuresJson: invention.featuresJson ?? undefined,
      advantagesJson: invention.advantagesJson ?? undefined,
      useCasesJson: invention.useCasesJson ?? undefined,
      processStepsJson: invention.processStepsJson ?? undefined,
      futureDirectionsJson: invention.futureDirectionsJson ?? undefined,
      // Legacy figure/element fields removed - now using normalized tables
      priorArtJson: invention.priorArtJson ?? undefined,
      definitionsJson: invention.definitionsJson ?? undefined,
      technicalImplementationJson:
        invention.technicalImplementationJson ?? undefined,
      backgroundJson: invention.backgroundJson ?? undefined,
      lastSyncedClaim: invention.lastSyncedClaim ?? undefined,
    };
  };

  // Create the transformed project
  const transformed: ProjectData = {
    id: project.id || '',
    name: project.name || 'Untitled Project',
    userId: project.userId || '',
    tenantId: project.tenantId || '',
    status: (project.status as ProjectStatus) || 'draft',
    textInput: '', // Not included in ProjectBasicInfo, default to empty

    // Handle dates
    createdAt: createdAt,
    updatedAt: updatedAt,

    // Derived fields
    lastModified: updatedAt.toISOString(),
    lastUpdated: updatedAt.getTime(),

    // Handle documents and savedPriorArtItems if provided
    documents: [],
    savedPriorArtItems: [],

    // Handle the invention data if it exists on the basic info
    invention: undefined,
  };

  // If the project has documents, include them
  if ('documents' in project && Array.isArray(project.documents)) {
    transformed.documents = project.documents.map(doc => ({
      ...doc,
      createdAt:
        doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt),
      updatedAt:
        doc.updatedAt instanceof Date ? doc.updatedAt : new Date(doc.updatedAt),
    }));
  }

  // If the project has savedPriorArtItems, include them
  if (
    'savedPriorArtItems' in project &&
    Array.isArray(project.savedPriorArtItems)
  ) {
    transformed.savedPriorArtItems =
      project.savedPriorArtItems as SavedPriorArt[];

    // Log when prior art items are found (only in development)
    if (transformed.savedPriorArtItems.length > 0) {
      logger.debug('[transformProject] Found saved prior art items', {
        projectId: project.id,
        priorArtCount: transformed.savedPriorArtItems.length,
      });
    }
  }

  if ('invention' in project) {
    transformed.invention = transformInvention(
      project.invention as Invention | null
    );
  }

  return transformed;
}
