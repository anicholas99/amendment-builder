/**
 * Configuration Module for Patent Drafter
 *
 * This module consolidates all configuration settings and feature flags.
 * It re-exports environment settings from ./environment
 * to maintain backward compatibility while transitioning to the new structure.
 */

import {
  environment,
  logger,
  API_CONFIG,
  FEATURES,
  OPENAI_CONFIG,
  DB_CONFIG,
} from './environment';

import { API_ROUTES } from '../constants/apiRoutes';

// Re-export environment configuration
export { environment, logger, API_CONFIG, FEATURES, OPENAI_CONFIG, DB_CONFIG };

// Application configuration
export const config = {
  // Core environment settings from environment.ts
  ...environment,

  // Feature flags
  features: {
    ...FEATURES,
    enableAI: true,
    enableInventionData: true,
    enablePriorArtSearch: true,
    enableVersionHistory: true,
    enableCostTracking: true,
  },

  // UI Configuration
  ui: {
    sidebarWidth: 250,
    collapsedSidebarWidth: 60,
    headerHeight: 50,
    toastDuration: 5000,
    maxClaimVersions: 20,
    defaultAnimationDuration: 300,
  },

  // API Configuration
  api: {
    ...API_CONFIG,
    endpoints: {
      projects: API_ROUTES.PROJECTS.LIST,
      // claims: API_ROUTES.CLAIMS.PARSE, // Removed - claims parsing is now project-specific: API_ROUTES.PROJECTS.CLAIMS.PARSE(projectId)
      priorArt: API_ROUTES.PROJECTS.PRIOR_ART.LIST,
      suggestions: API_ROUTES.CLAIMS.GENERATE_SUGGESTIONS,
      costs: API_ROUTES.ADMIN.COSTS,
    },
  },

  // OpenAI Configuration
  openai: {
    ...OPENAI_CONFIG,
    defaultParams: {
      temperature: 0.7,
      maxTokens: 8000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    },
  },

  // Storage Configuration
  storage: {
    prefix: 'patent_drafter_',
    keys: {
      projects: 'projects',
      activeProject: 'active_project',
      activeDocument: 'active_document',
      userSettings: 'user_settings',
    },
  },

  API_ENDPOINTS: {
    projects: {
      list: API_ROUTES.PROJECTS.LIST,
      create: API_ROUTES.PROJECTS.CREATE,
      byId: API_ROUTES.PROJECTS.BY_ID,
      update: API_ROUTES.PROJECTS.UPDATE,
      delete: API_ROUTES.PROJECTS.DELETE,
      exclusions: API_ROUTES.PROJECTS.EXCLUSIONS,
      priorArt: API_ROUTES.PROJECTS.PRIOR_ART.LIST,
    },
    search: {
      history: API_ROUTES.SEARCH_HISTORY.LIST,
    },
  },
};

// Default export for convenience
export default config;
