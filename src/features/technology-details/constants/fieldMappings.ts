/**
 * CRITICAL: Field mapping configuration for Tech Details
 *
 * This file is the SINGLE SOURCE OF TRUTH for how UI fields map to database fields.
 *
 *
 * @maintainer Your life depends on keeping this updated
 */

import { InventionData } from '@/types/invention';
import { logger } from '@/utils/clientLogger';

export type FieldType = 'text' | 'array' | 'object';
export type SaveBehavior = 'on-blur' | 'debounced' | 'immediate';

export interface FieldConfig {
  // The actual database field name (what gets sent to the API)
  dbField: keyof InventionData;

  // The UI field name (what the component uses) - defaults to the key
  uiField?: keyof InventionData;

  // The display name shown in the UI
  displayName: string;

  // Field data type
  type: FieldType;

  // When to save the field
  saveBehavior: SaveBehavior;

  // Debounce delay in ms (only for 'debounced' save behavior)
  debounceMs?: number;

  // Validation function (optional)
  validate?: (value: any) => boolean;

  // Transform function before saving (optional)
  transform?: (value: any) => any;

  // Help text for future developers
  devNote?: string;
}

/**
 * THE SACRED FIELD MAPPINGS
 *
 * Each key here corresponds to a field used in the UI components.
 * The config tells us EXACTLY how to handle that field.
 *
 * DO NOT GUESS. LOOK HERE FIRST.
 */
export const FIELD_MAPPINGS: Record<string, FieldConfig> = {
  // Basic Text Fields - Save on blur for better UX
  title: {
    dbField: 'title',
    displayName: 'Invention Title',
    type: 'text',
    saveBehavior: 'on-blur',
    validate: value => value.trim().length > 0,
    devNote: 'Main invention title - required field',
  },

  abstract: {
    dbField: 'abstract',
    displayName: 'Abstract',
    type: 'text',
    saveBehavior: 'on-blur',
    devNote: 'Brief summary of the invention',
  },

  summary: {
    dbField: 'summary',
    displayName: 'Summary',
    type: 'text',
    saveBehavior: 'on-blur',
  },

  // CRITICAL: This was broken - UI uses 'novelty' but DB uses 'noveltyStatement'
  novelty: {
    dbField: 'noveltyStatement', // <- THIS IS THE FIX
    displayName: 'Novelty',
    type: 'text',
    saveBehavior: 'on-blur',
    devNote: 'What makes this invention novel/unique',
  },

  // Category Fields
  patentCategory: {
    dbField: 'patentCategory',
    displayName: 'Patent Category',
    type: 'text',
    saveBehavior: 'on-blur',
  },

  technicalField: {
    dbField: 'technicalField',
    displayName: 'Technical Field',
    type: 'text',
    saveBehavior: 'on-blur',
  },

  // Background can be string OR object - handle carefully
  background: {
    dbField: 'background',
    displayName: 'Background',
    type: 'text',
    saveBehavior: 'on-blur',
    devNote: 'Can be string or object - service handles conversion',
  },

  // Problem & Solution
  problemStatement: {
    dbField: 'problemStatement',
    displayName: 'Problems Solved',
    type: 'array',
    saveBehavior: 'immediate',
    devNote: 'Array of problems the invention solves',
  },

  solutionSummary: {
    dbField: 'solutionSummary',
    displayName: 'Existing Solutions',
    type: 'array',
    saveBehavior: 'immediate',
  },

  // Array Fields - Debounced to prevent spam
  features: {
    dbField: 'features', // Service converts to featuresJson
    displayName: 'Key Features',
    type: 'array',
    saveBehavior: 'immediate',
    devNote: 'Array of key features - saved as featuresJson in DB',
  },

  advantages: {
    dbField: 'advantages',
    displayName: 'Advantages',
    type: 'array',
    saveBehavior: 'immediate',
  },

  useCases: {
    dbField: 'useCases',
    displayName: 'Use Cases',
    type: 'array',
    saveBehavior: 'immediate',
  },

  processSteps: {
    dbField: 'processSteps',
    displayName: 'Process Steps',
    type: 'array',
    saveBehavior: 'immediate',
  },

  // Complex Object Fields
  technicalImplementation: {
    dbField: 'technicalImplementation',
    displayName: 'Technical Implementation',
    type: 'object',
    saveBehavior: 'debounced',
    debounceMs: 500,
    devNote: 'Complex object with preferredEmbodiment, alternatives, etc.',
  },

  // Long Text Fields
  detailedDescription: {
    dbField: 'detailedDescription',
    displayName: 'Detailed Description',
    type: 'text',
    saveBehavior: 'debounced',
    debounceMs: 800,
    devNote: 'Long form text - debounced to prevent excessive saves',
  },

  briefDescription: {
    dbField: 'briefDescription',
    displayName: 'Brief Description',
    type: 'text',
    saveBehavior: 'on-blur',
  },
};

/**
 * Helper to get the correct database field name for a UI field
 *
 * @param uiField The field name used in the UI
 * @returns The actual database field name
 */
export function getDbFieldName(uiField: string): keyof InventionData {
  const config = FIELD_MAPPINGS[uiField];
  if (!config) {
    logger.error('[CRITICAL] Unknown field in FIELD_MAPPINGS', {
      uiField,
      availableFields: Object.keys(FIELD_MAPPINGS),
    });
    // Return as-is and hope for the best (but log it)
    return uiField as keyof InventionData;
  }
  return config.dbField;
}

/**
 * Helper to validate a field value
 */
export function validateField(uiField: string, value: any): boolean {
  const config = FIELD_MAPPINGS[uiField];
  if (!config?.validate) return true;
  return config.validate(value);
}

/**
 * Helper to get save behavior for a field
 */
export function getFieldSaveBehavior(uiField: string): SaveBehavior {
  const config = FIELD_MAPPINGS[uiField];
  return config?.saveBehavior || 'on-blur';
}

/**
 * Helper to get debounce delay for a field
 */
export function getFieldDebounceMs(uiField: string): number {
  const config = FIELD_MAPPINGS[uiField];
  return config?.debounceMs || 500;
}
