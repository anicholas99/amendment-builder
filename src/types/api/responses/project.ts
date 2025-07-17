/**
 * Project API Response Schemas
 *
 * Schemas related to projects, documents, and versions
 */

import { z } from 'zod';
import { PaginationSchema } from './base';

// ============================================
// Project Schemas
// ============================================

export const ProjectStatusSchema = z.union([
  z.literal('draft'),
  z.literal('in_progress'),
  z.literal('completed'),
  z.literal('archived'),
]);

export const DocumentTypeSchema = z.union([
  z.literal('technology'),
  z.literal('patent'),
  z.literal('claim-refinement'),
]);

export const ProjectDocumentSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  type: DocumentTypeSchema,
  content: z.union([z.string(), z.record(z.unknown())]).nullable(),
  createdAt: z.date().or(z.string().datetime()),
  updatedAt: z.date().or(z.string().datetime()),
});

export const ProjectDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  userId: z.string(),
  tenantId: z.string(),
  status: ProjectStatusSchema,
  textInput: z.string(),
  // Flags indicating availability of processed invention and generated patent content
  hasPatentContent: z.boolean().optional(),
  hasProcessedInvention: z.boolean().optional(),
  createdAt: z.date().or(z.string().datetime()),
  updatedAt: z.date().or(z.string().datetime()).optional(),
  lastModified: z.string(),
  lastUpdated: z.number().optional(),
  documents: z.array(ProjectDocumentSchema),
  savedPriorArtItems: z.array(
    z.object({
      id: z.string(),
      patentNumber: z.string(),
      title: z.string().nullable().optional(),
      url: z.string().nullable().optional(),
      savedAt: z.string().datetime(),
    })
  ),
  invention: z
    .object({
      title: z.string().optional(),
      summary: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
});

export const ProjectVersionSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  createdAt: z.date().or(z.string().datetime()),
  projectId: z.string(),
  userId: z.string(),
});

export const ProjectVersionsResponseSchema = z.array(ProjectVersionSchema);

export const ProjectsListResponseSchema = z.object({
  projects: z.array(ProjectDataSchema),
  pagination: PaginationSchema,
});

export const ProjectResponseSchema = ProjectDataSchema;

// --- Inferred Types ---
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;
export type DocumentType = z.infer<typeof DocumentTypeSchema>;
export type ProjectDocument = z.infer<typeof ProjectDocumentSchema>;
export type ProjectData = z.infer<typeof ProjectDataSchema>;
export type ProjectVersion = z.infer<typeof ProjectVersionSchema>;
export type ProjectsListResponse = z.infer<typeof ProjectsListResponseSchema>;
export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;
export type ProjectDataResponse = z.infer<typeof ProjectDataSchema>;
export type ProjectVersionsResponse = z.infer<
  typeof ProjectVersionsResponseSchema
>;
