import { InventionData } from '@/types';

/**
 * Checks if an invention has been processed/analyzed
 * @param analyzedInvention - The structured invention data
 * @returns true if the invention has meaningful processed content
 */
export const hasProcessedInvention = (
  analyzedInvention: InventionData | null
): boolean => {
  if (!analyzedInvention || typeof analyzedInvention !== 'object') {
    return false;
  }

  // Check for essential processed content
  const hasBasicContent = !!(
    analyzedInvention.title ||
    analyzedInvention.abstract ||
    analyzedInvention.summary ||
    analyzedInvention.description
  );

  // Check for structural content indicating processing
  const hasStructuralContent = !!(
    (Array.isArray(analyzedInvention.components) &&
      analyzedInvention.components.length > 0) ||
    (Array.isArray(analyzedInvention.features) &&
      analyzedInvention.features.length > 0) ||
    (Array.isArray(analyzedInvention.advantages) &&
      analyzedInvention.advantages.length > 0) ||
    (Array.isArray(analyzedInvention.use_cases) &&
      analyzedInvention.use_cases.length > 0)
  );

  // Check for background/technical field information
  const hasBackgroundInfo = !!(
    analyzedInvention.background ||
    (typeof analyzedInvention.background === 'object' &&
      analyzedInvention.background !== null &&
      Object.keys(analyzedInvention.background).length > 0)
  );

  // Return true if we have any meaningful processed content
  return hasBasicContent || hasStructuralContent || hasBackgroundInfo;
};

/**
 * Gets a user-friendly message explaining what's needed to access advanced features
 */
export const getInventionRequirementMessage = (): string => {
  return 'Please process your invention in Technology Details first before accessing this feature.';
};

/**
 * Utility functions for processing invention data
 */

export function hasAnalyzedInvention(
  analyzedInvention: InventionData | null
): boolean {
  return !!(
    analyzedInvention &&
    typeof analyzedInvention === 'object' &&
    (analyzedInvention.title ||
      analyzedInvention.abstract ||
      analyzedInvention.summary ||
      (analyzedInvention.features && analyzedInvention.features.length > 0) ||
      (analyzedInvention.claims &&
        Object.keys(analyzedInvention.claims).length > 0))
  );
}
