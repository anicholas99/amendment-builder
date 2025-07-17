/**
 * Client-safe Environment Configuration
 *
 * This file contains ONLY client-safe environment variables and has NO side effects.
 * Import this in React components instead of the main environment.ts to prevent
 * full page reloads during Fast Refresh.
 *
 * For server-side config, use environment.ts
 */

// Environment detection - safe for client
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

// Client-safe feature flags
export const clientFeatures = {
  enableDrafting: true,
  enablePriorArtSearch: true,
  aiSuggestions: true,
  export: true,
  versionHistory: true,
  enableDeepAnalysis: process.env.NEXT_PUBLIC_ENABLE_DEEP_ANALYSIS === 'true',
};

// UI configuration
export const uiConfig = {
  defaultSidebarWidth: 300,
  toastDuration: 5000,
  maxClaimVersions: 20,
};

// Application metadata
export const appConfig = {
  appName: 'Patent Drafter AI',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  buildDate: process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString(),
  commitHash: process.env.NEXT_PUBLIC_COMMIT_HASH || 'development',
};

// API configuration (client-safe parts only)
export const apiConfig = {
  timeout: 30000, // 30 seconds
  maxTokens: parseInt(
    process.env.NEXT_PUBLIC_AI_MAX_INPUT_TOKENS || '6000',
    10
  ),
};

// Export a combined config object for convenience
export const clientEnvironment = {
  isDevelopment,
  isProduction,
  isTest,
  features: clientFeatures,
  ui: uiConfig,
  app: appConfig,
  api: apiConfig,
} as const;

// Type exports for better TypeScript support
export type ClientEnvironment = typeof clientEnvironment;
export type ClientFeatures = typeof clientFeatures;
