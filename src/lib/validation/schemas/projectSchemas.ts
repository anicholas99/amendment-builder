import { z } from 'zod';
import { VALIDATION_LIMITS } from '@/constants/validation';

/**
 * Project-related validation schemas
 * Ensures all project operations are properly validated
 */

// Project status enum
export const ProjectStatus = z.enum([
  'draft',
  'in_progress',
  'completed',
  'archived',
]);

// Base project schema
export const projectSchema = z.object({
  name: z
    .string()
    .min(VALIDATION_LIMITS.NAME.MIN, 'Project name is required')
    .max(
      VALIDATION_LIMITS.NAME.MAX,
      `Project name must be less than ${VALIDATION_LIMITS.NAME.MAX} characters`
    )
    .trim()
    .refine(
      name => !name.includes('<script') && !name.includes('javascript:'),
      'Invalid content detected'
    ),
  description: z
    .string()
    .max(
      VALIDATION_LIMITS.DESCRIPTION.MAX,
      `Description must be less than ${VALIDATION_LIMITS.DESCRIPTION.MAX} characters`
    )
    .optional(),
  status: ProjectStatus.optional(),
  textInput: z
    .string()
    .max(
      VALIDATION_LIMITS.INVENTION_TEXT.MAX,
      `Text input must be less than ${VALIDATION_LIMITS.INVENTION_TEXT.MAX} characters`
    )
    .optional(),
});

// Create project schema
export const createProjectSchema = projectSchema;

// Update project schema (all fields optional)
export const updateProjectSchema = projectSchema.partial();

// Project exclusions schema
export const projectExclusionSchema = z.object({
  patentNumber: z
    .string()
    .min(VALIDATION_LIMITS.PATENT_NUMBER.MIN, 'Patent number is required')
    .max(
      VALIDATION_LIMITS.PATENT_NUMBER.MAX,
      `Patent number must be less than ${VALIDATION_LIMITS.PATENT_NUMBER.MAX} characters`
    )
    .regex(/^[A-Z]{0,2}\d{4,}[A-Z]?\d*$/, 'Invalid patent number format'),
  metadata: z
    .union([
      z.string(), // JSON string
      z.record(z.unknown()), // Object with any fields
    ])
    .optional(),
});

// Batch exclusions schema
export const batchExclusionsSchema = z.object({
  patentNumbers: z
    .array(projectExclusionSchema.shape.patentNumber)
    .min(1, 'At least one patent number is required')
    .max(
      VALIDATION_LIMITS.MAX_BATCH_SIZE,
      `Maximum ${VALIDATION_LIMITS.MAX_BATCH_SIZE} patent numbers allowed`
    ),
  metadata: projectExclusionSchema.shape.metadata,
});

// Delete exclusion schema
export const deleteExclusionSchema = z
  .object({
    exclusionId: z.string().uuid('Invalid exclusion ID'),
  })
  .or(
    z.object({
      patentNumber: projectExclusionSchema.shape.patentNumber,
    })
  );

// Project field update schema
export const projectFieldUpdateSchema = z.object({
  field: z.enum(['name', 'description', 'status', 'textInput']),
  value: z.union([z.string(), ProjectStatus, z.null()]),
  operation: z.enum(['set', 'append']).optional(),
});

// Project query schemas
export const projectQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(VALIDATION_LIMITS.MAX_PAGE_SIZE)
    .optional()
    .default(VALIDATION_LIMITS.DEFAULT_PAGE_SIZE),
  search: z.string().max(VALIDATION_LIMITS.SEARCH_QUERY.MAX).optional(),
  filterBy: z
    .enum(['all', 'recent', 'complete', 'in-progress', 'draft'])
    .optional()
    .default('all'),
  sortBy: z
    .enum(['name', 'created', 'modified', 'recent'])
    .optional()
    .default('modified'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Type exports
 */
export type Project = z.infer<typeof projectSchema>;
export type CreateProject = z.infer<typeof createProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
export type ProjectExclusion = z.infer<typeof projectExclusionSchema>;
export type BatchExclusions = z.infer<typeof batchExclusionsSchema>;
export type DeleteExclusion = z.infer<typeof deleteExclusionSchema>;
export type ProjectFieldUpdate = z.infer<typeof projectFieldUpdateSchema>;
export type ProjectQuery = z.infer<typeof projectQuerySchema>;
export type ProjectStatusType = z.infer<typeof ProjectStatus>;
