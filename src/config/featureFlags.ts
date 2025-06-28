/**
 * Feature flags configuration
 *
 * Centralized feature flag management for the application.
 * Use these flags to enable/disable features during development.
 */

export const FEATURE_FLAGS = {
  // Add new feature flags here as needed
  // Example: ENABLE_NEW_SEARCH_UI: process.env.NEXT_PUBLIC_ENABLE_NEW_SEARCH_UI === 'true',
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
