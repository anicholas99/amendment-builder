/**
 * Project Types
 *
 * This file defines the TypeScript interfaces for project-related data structures.
 * Use these types throughout the application for better type safety.
 */

import { SavedPriorArt } from '../features/search/types';
import { InventionData } from './invention';
import { ProjectDataResponse } from './api/responses';
import { logger } from '@/utils/clientLogger';

// Define types locally instead of importing from repository
interface ProjectBasicInfo {
  id: string;
  name: string;
  status: string;
  userId: string;
  tenantId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  invention?: InventionData | Invention | null;
  hasPatentContent?: boolean;
  hasProcessedInvention?: boolean;
  textInput?: string | null;
  savedPriorArtItems?: SavedPriorArt[];
}

interface Invention {
  id: string;
  projectId: string;
  title: string | null;
  abstract: string | null;
  technicalField: string | null;
  createdAt: Date;
  updatedAt: Date;
  advantagesJson: string | null;
  claimsJson: string | null;
  priorArtJson: string | null;
  noveltyStatement: string | null;
  backgroundJson: string | null;
  definitionsJson: string | null;
  featuresJson: string | null;
  futureDirectionsJson: string | null;
  patentCategory: string | null;
  processStepsJson: string | null;
  summary: string | null;
  technicalImplementationJson: string | null;
  useCasesJson: string | null;
  claimSyncedAt: Date | null;
  lastSyncedClaim: string | null;
  parsedClaimElementsJson: string | null;
  searchQueriesJson: string | null;
  applicationType: string | null;
  parentApplicationsJson: string | null;
  linkedFileIdsJson: string | null;
}

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
  hasPatentContent: boolean;
  hasProcessedInvention: boolean;

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
// Removed - was defined but never used
/*
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
*/

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

    // Helper to safely parse JSON strings
    const parseJsonField = <T>(field: string | null): T | undefined => {
      if (!field) return undefined;
      try {
        return JSON.parse(field) as T;
      } catch (e) {
        return undefined;
      }
    };

    // Create a new object and explicitly map fields, converting null to undefined
    // and parsing JSON fields
    return {
      id: invention.id,
      projectId: invention.projectId,
      title: invention.title ?? undefined,
      summary: invention.summary ?? undefined,
      abstract: invention.abstract ?? undefined,
      patentCategory: invention.patentCategory ?? undefined,
      patent_category: invention.patentCategory ?? undefined,
      technicalField: invention.technicalField ?? undefined,
      technical_field: invention.technicalField ?? undefined,
      features: parseJsonField<string[]>(invention.featuresJson),
      advantages: parseJsonField<string[]>(invention.advantagesJson),
      use_cases: parseJsonField<string[]>(invention.useCasesJson),
      useCases: parseJsonField<string[]>(invention.useCasesJson),
      process_steps: parseJsonField<string[]>(invention.processStepsJson),
      processSteps: parseJsonField<string[]>(invention.processStepsJson),
      future_directions: parseJsonField<string[]>(
        invention.futureDirectionsJson
      ),
      futureDirections: parseJsonField<string[]>(
        invention.futureDirectionsJson
      ),
      prior_art: parseJsonField<unknown[]>(invention.priorArtJson),
      priorArt: parseJsonField<unknown[]>(invention.priorArtJson),
      definitions: parseJsonField<Record<string, unknown>>(
        invention.definitionsJson
      ),
      technical_implementation: parseJsonField<Record<string, unknown>>(
        invention.technicalImplementationJson
      ),
      technicalImplementation: parseJsonField<Record<string, unknown>>(
        invention.technicalImplementationJson
      ),
      background: parseJsonField<Record<string, unknown>>(
        invention.backgroundJson
      ),
      noveltyStatement: invention.noveltyStatement ?? undefined,
      claims: parseJsonField<Record<string, unknown>>(invention.claimsJson),

      // Keep the raw JSON fields for backward compatibility if needed
      featuresJson: invention.featuresJson ?? undefined,
      advantagesJson: invention.advantagesJson ?? undefined,
      useCasesJson: invention.useCasesJson ?? undefined,
      processStepsJson: invention.processStepsJson ?? undefined,
      futureDirectionsJson: invention.futureDirectionsJson ?? undefined,
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
    hasPatentContent: project.hasPatentContent ?? false,
    hasProcessedInvention: project.hasProcessedInvention ?? false,

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
