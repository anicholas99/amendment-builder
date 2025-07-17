import { z } from 'zod';
import { VALIDATION_LIMITS } from '@/constants/validation';

/**
 * Invention data validation schemas
 * Ensures all invention updates are properly validated
 */

// Custom limits for invention fields
const INVENTION_LIMITS = {
  BACKGROUND: 5000, // ~1.5 pages
  SUMMARY: 3000, // ~1 page
  TECHNICAL_FIELD: 1000, // ~0.25 page
  FEATURE_ITEM: 500,
  ADVANTAGE_ITEM: 500,
  USE_CASE_ITEM: 500,
  PROCESS_STEP_ITEM: 500,
  FEATURES_COUNT: 50,
  ADVANTAGES_COUNT: 50,
  USE_CASES_COUNT: 30,
  PROCESS_STEPS_COUNT: 50,
} as const;

// Base string validation with XSS prevention
const createSafeStringSchema = (maxLength?: number) => {
  const baseSchema = z.string();

  const transformedSchema = maxLength
    ? baseSchema
        .max(maxLength, `Text must be less than ${maxLength} characters`)
        .transform(str => str.trim())
    : baseSchema.transform(str => str.trim());

  return transformedSchema.refine(
    str => !str.includes('<script') && !str.includes('javascript:'),
    'Invalid content detected'
  );
};

// Common field schemas
export const inventionTitleSchema = z.object({
  title: z
    .string()
    .min(VALIDATION_LIMITS.TITLE.MIN, 'Title is required')
    .max(
      VALIDATION_LIMITS.TITLE.MAX,
      `Title must be less than ${VALIDATION_LIMITS.TITLE.MAX} characters`
    )
    .transform(str => str.trim())
    .refine(
      str => !str.includes('<script') && !str.includes('javascript:'),
      'Invalid content detected'
    ),
});

export const inventionAbstractSchema = z.object({
  abstract: createSafeStringSchema(VALIDATION_LIMITS.ABSTRACT.MAX)
    .optional()
    .nullable(),
});

export const inventionBackgroundSchema = z.object({
  background: createSafeStringSchema(INVENTION_LIMITS.BACKGROUND)
    .optional()
    .nullable(),
});

export const inventionSummarySchema = z.object({
  summary: createSafeStringSchema(INVENTION_LIMITS.SUMMARY)
    .optional()
    .nullable(),
});

export const inventionTechnicalFieldSchema = z.object({
  technicalField: createSafeStringSchema(INVENTION_LIMITS.TECHNICAL_FIELD)
    .optional()
    .nullable(),
});

// Array field schemas
export const inventionFeaturesSchema = z.object({
  features: z
    .array(
      z
        .string()
        .min(1, 'Feature cannot be empty')
        .max(
          INVENTION_LIMITS.FEATURE_ITEM,
          `Feature must be less than ${INVENTION_LIMITS.FEATURE_ITEM} characters`
        )
        .transform(str => str.trim())
    )
    .max(
      INVENTION_LIMITS.FEATURES_COUNT,
      `Maximum ${INVENTION_LIMITS.FEATURES_COUNT} features allowed`
    )
    .optional()
    .nullable(),
});

export const inventionAdvantagesSchema = z.object({
  advantages: z
    .array(
      z
        .string()
        .min(1, 'Advantage cannot be empty')
        .max(
          INVENTION_LIMITS.ADVANTAGE_ITEM,
          `Advantage must be less than ${INVENTION_LIMITS.ADVANTAGE_ITEM} characters`
        )
        .transform(str => str.trim())
    )
    .max(
      INVENTION_LIMITS.ADVANTAGES_COUNT,
      `Maximum ${INVENTION_LIMITS.ADVANTAGES_COUNT} advantages allowed`
    )
    .optional()
    .nullable(),
});

export const inventionUseCasesSchema = z.object({
  useCases: z
    .array(
      z
        .string()
        .min(1, 'Use case cannot be empty')
        .max(
          INVENTION_LIMITS.USE_CASE_ITEM,
          `Use case must be less than ${INVENTION_LIMITS.USE_CASE_ITEM} characters`
        )
        .transform(str => str.trim())
    )
    .max(
      INVENTION_LIMITS.USE_CASES_COUNT,
      `Maximum ${INVENTION_LIMITS.USE_CASES_COUNT} use cases allowed`
    )
    .optional()
    .nullable(),
});

export const inventionProcessStepsSchema = z.object({
  processSteps: z
    .array(
      z
        .string()
        .min(1, 'Process step cannot be empty')
        .max(
          INVENTION_LIMITS.PROCESS_STEP_ITEM,
          `Process step must be less than ${INVENTION_LIMITS.PROCESS_STEP_ITEM} characters`
        )
        .transform(str => str.trim())
    )
    .max(
      INVENTION_LIMITS.PROCESS_STEPS_COUNT,
      `Maximum ${INVENTION_LIMITS.PROCESS_STEPS_COUNT} process steps allowed`
    )
    .optional()
    .nullable(),
});

// Generic field update schema for PATCH endpoints
export const inventionFieldUpdateSchema = z.object({
  field: z.enum([
    'title',
    'abstract',
    'background',
    'summary',
    'technicalField',
    'features',
    'advantages',
    'useCases',
    'processSteps',
  ]),
  value: z.union([z.string(), z.array(z.string()), z.null()]),
});

// Complete invention data schema (for full updates)
export const completeInventionSchema = z.object({
  title: inventionTitleSchema.shape.title,
  abstract: inventionAbstractSchema.shape.abstract,
  background: inventionBackgroundSchema.shape.background,
  summary: inventionSummarySchema.shape.summary,
  technicalField: inventionTechnicalFieldSchema.shape.technicalField,
  features: inventionFeaturesSchema.shape.features,
  advantages: inventionAdvantagesSchema.shape.advantages,
  useCases: inventionUseCasesSchema.shape.useCases,
  processSteps: inventionProcessStepsSchema.shape.processSteps,
});

// Partial invention update schema (for PATCH requests)
export const partialInventionSchema = completeInventionSchema.partial();

/**
 * Type exports
 */
export type InventionTitle = z.infer<typeof inventionTitleSchema>;
export type InventionAbstract = z.infer<typeof inventionAbstractSchema>;
export type InventionBackground = z.infer<typeof inventionBackgroundSchema>;
export type InventionSummary = z.infer<typeof inventionSummarySchema>;
export type InventionTechnicalField = z.infer<
  typeof inventionTechnicalFieldSchema
>;
export type InventionFeatures = z.infer<typeof inventionFeaturesSchema>;
export type InventionAdvantages = z.infer<typeof inventionAdvantagesSchema>;
export type InventionUseCases = z.infer<typeof inventionUseCasesSchema>;
export type InventionProcessSteps = z.infer<typeof inventionProcessStepsSchema>;
export type InventionFieldUpdate = z.infer<typeof inventionFieldUpdateSchema>;
export type CompleteInvention = z.infer<typeof completeInventionSchema>;
export type PartialInvention = z.infer<typeof partialInventionSchema>;
