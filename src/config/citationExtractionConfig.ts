/**
 * Citation Extraction Configuration
 *
 * This file centralizes all configuration for citation extraction behavior.
 * Future developers: Update these settings to modify citation behavior across the application.
 *
 * THRESHOLDS EXPLAINED:
 * - defaultThreshold: Used when extracting citations from external API (what confidence % to request)
 * - filterThreshold: Applied after receiving results to filter out low-quality matches
 *
 * @see src/config/environment.ts for environment variable configuration
 */

import { environment } from './environment';

/**
 * @deprecated This configuration is no longer used. Citation extraction no longer uses element variants.
 * Kept for reference only - DO NOT USE in new code.
 *
 * Configuration for citation extraction search input strategy.
 * - Set to 0 to use only the original element.text.
 * - Set to 1 to use the first variant (element.variants[0]), falling back to element.text if no variants exist.
 * - Set to 2 to use the first two variants (element.variants[0], element.variants[1]), falling back as needed.
 * - ... and so on.
 * - Set to -1 (or any negative number) to use ALL available variants AND the original text.
 */
export const NUM_VARIANTS_TO_USE_FOR_EXTRACTION = 0; // Default: Use first variant or fallback

/**
 * Citation confidence thresholds
 * These control what citations are requested and displayed
 */
export const CITATION_THRESHOLDS = {
  /** Default threshold for API requests (what minimum confidence to request from external service) */
  default: environment.citation.defaultThreshold,

  /** Minimum allowed threshold (prevents users from setting threshold too low) */
  min: environment.citation.minThreshold,

  /** Maximum allowed threshold (100% confidence) */
  max: environment.citation.maxThreshold,

  /** Post-processing filter (citations below this % are filtered out after retrieval) */
  filter: environment.citation.filterThreshold,
} as const;

/**
 * UI configuration for threshold selection
 * Future: Add these options to the citation extraction UI
 */
export const THRESHOLD_PRESETS = [
  {
    value: 20,
    label: '20% - Maximum results, lower precision',
    description: 'Cast a wide net, may include less relevant matches',
  },
  {
    value: 30,
    label: '30% - Balanced (Default)',
    description: 'Good balance between coverage and relevance',
  },
  {
    value: 40,
    label: '40% - Moderate filtering',
    description: 'Filters out weaker matches',
  },
  {
    value: 60,
    label: '60% - High confidence',
    description: 'Only strong matches',
  },
  {
    value: 80,
    label: '80% - Very high confidence',
    description: 'Only the most relevant citations',
  },
] as const;

/**
 * Get the appropriate threshold value with validation
 * @param requestedThreshold - User-requested threshold
 * @returns Validated threshold within allowed bounds
 */
export function getValidatedThreshold(requestedThreshold?: number): number {
  if (requestedThreshold === undefined) {
    return CITATION_THRESHOLDS.default;
  }

  // Ensure threshold is within bounds
  return Math.max(
    CITATION_THRESHOLDS.min,
    Math.min(CITATION_THRESHOLDS.max, requestedThreshold)
  );
}
