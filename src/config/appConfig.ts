// Application configuration that depends on environment
import { environment } from './environment';
import { API_ROUTES } from '../constants/apiRoutes';

// API endpoints - now using centralized routes
export const API_ENDPOINTS = {
  GENERATE_SUGGESTIONS: API_ROUTES.CLAIMS.GENERATE_SUGGESTIONS,
  EXPORT_PATENT: API_ROUTES.PATENT.EXPORT,
  SEARCH_PRIOR_ART: API_ROUTES.MISC.SEARCH_PRIOR_ART,
  SAVE_PROJECT: API_ROUTES.MISC.SAVE_PROJECT,
  LOAD_PROJECT: API_ROUTES.MISC.LOAD_PROJECT,
  // GENERATE_CLAIM_1: API_ROUTES.CLAIMS.GENERATE_CLAIM1, // Now project-scoped, use API_ROUTES.PROJECTS.CLAIMS.GENERATE_CLAIM1(projectId)
  OPENAI_TEST: API_ROUTES.MISC.OPENAI_TEST,
  CONSISTENCY_CHECK: API_ROUTES.PATENT.CONSISTENCY_CHECK,
};

// Re-export UI timeouts from environment
export const TIMEOUTS = {
  TOAST_DURATION: environment.ui.toastDuration,
};

// Re-export feature flags from environment
export const FEATURES = environment.features;
