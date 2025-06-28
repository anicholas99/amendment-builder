import { z } from 'zod';

/**
 * Schema for project update field request
 */
export const updateProjectFieldSchema = z.object({
  field: z.string().min(1, 'Field name is required'),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(z.unknown()),
    z.record(z.unknown()), // For object updates
  ]),
  operation: z.enum(['set', 'append', 'remove']).optional().default('set'),
});

/**
 * Schema for project create request
 */
export const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  textInput: z.string().optional(),
});

/**
 * Schema for project update request
 */
export const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  textInput: z.string().optional(),
  inventionData: z.record(z.unknown()).optional(),
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

/**
 * Schema for project exclusion
 */
export const projectExclusionSchema = z.object({
  excludedPatentNumber: z.string().min(1),
  metadata: z.union([z.string(), z.record(z.unknown())]).optional(),
});

/**
 * Schema for batch exclusions
 */
export const batchExclusionsSchema = z.object({
  exclusions: z.array(
    z.object({
      patentNumber: z.string().min(1),
      metadata: z.record(z.unknown()).optional(),
    })
  ),
});

export type UpdateProjectFieldInput = z.infer<typeof updateProjectFieldSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectExclusionInput = z.infer<typeof projectExclusionSchema>;
export type BatchExclusionsInput = z.infer<typeof batchExclusionsSchema>;
