/**
 * Feature flags configuration
 *
 * Centralized feature flag management for the application.
 * Use these flags to enable/disable features during development.
 */

export const FEATURE_FLAGS = {
  // Add new feature flags here as needed
  // Example: ENABLE_NEW_SEARCH_UI: process.env.NEXT_PUBLIC_ENABLE_NEW_SEARCH_UI === 'true',
  
  // Enable minimalist UI for amendment studio (attorney-focused design)
  // Default to true - set NEXT_PUBLIC_MINIMALIST_AMENDMENT_UI=false to disable
  ENABLE_MINIMALIST_AMENDMENT_UI: process.env.NEXT_PUBLIC_MINIMALIST_AMENDMENT_UI !== 'false',
  
  // Enable 6-month filter for Office Actions as a fallback
  // Default to false - uses timeline-aware status determination
  // Set NEXT_PUBLIC_ENABLE_OA_SIX_MONTH_FILTER=true to enable the legacy filter
  ENABLE_OA_SIX_MONTH_FILTER: process.env.NEXT_PUBLIC_ENABLE_OA_SIX_MONTH_FILTER === 'true',
} as const;

/**
 * Type-safe feature flag checker
 */
export function isFeatureEnabled(flag: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[flag] ?? false;
}

/**
 * Get all enabled features (useful for debugging)
 */
export function getEnabledFeatures(): string[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .map(([flag]) => flag);
}
