import { InventionData } from '@/types/invention';

/**
 * Checks if a value has meaningful content (non-empty)
 */
export const hasUsefulValue = (value: any): boolean => {
  if (!value) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return false;
};

/**
 * Determines if the invention has been processed/analyzed
 * by checking if any primary textual fields contain meaningful content
 */
export const hasInventionBeenProcessed = (
  inventionData: InventionData | null
): boolean => {
  if (!inventionData) return false;

  return (
    hasUsefulValue(inventionData.title) ||
    hasUsefulValue(inventionData.summary) ||
    hasUsefulValue(inventionData.abstract) ||
    hasUsefulValue(inventionData.features) ||
    hasUsefulValue(inventionData.elements) ||
    hasUsefulValue(inventionData.background) ||
    hasUsefulValue(inventionData.technicalImplementation)
  );
};
