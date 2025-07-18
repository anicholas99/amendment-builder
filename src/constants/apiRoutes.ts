/**
 * Centralized API Route Constants
 *
 * This file contains ALL API endpoint paths to prevent magic strings
 * and enable easy refactoring when routes change.
 *
 * Organization:
 * - Grouped by domain/feature
 * - Dynamic routes use functions
 * - Consistent naming convention
 */

import { normalizePatentNumber } from '@/features/patent-application/utils/patentUtils';

export const API_ROUTES = {
  // ============ AUTHENTICATION & USERS ============
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    SESSION: '/api/auth/session',
    CALLBACK: '/api/auth/callback',
    SWITCH_TENANT: '/api/auth/switch-tenant',
  },

  USER: {
    PREFERENCES: {
      ACTIVE_PROJECT: '/api/user/preferences/activeProject',
      ACTIVE_DOCUMENT: '/api/user/preferences/activeDocument',
      UI: '/api/user/preferences/ui',
    },
    PRIVACY: '/api/users/privacy',
  },

  // ============ TENANTS ============
  TENANTS: {
    USER: '/api/tenants/user',
    ACTIVE: '/api/tenants/active',
  },

  // ============ PROJECTS ============
  PROJECTS: {
    // Base endpoints
    LIST: '/api/projects',
    CREATE: '/api/projects',
    ACTIVE: '/api/projects/active',

    // Project-specific endpoints (by ID)
    BY_ID: (id: string) => `/api/projects/${id}`,
    UPDATE: (id: string) => `/api/projects/${id}`,
    DELETE: (id: string) => `/api/projects/${id}`,
    WORKSPACE: (id: string) => `/api/projects/${id}/workspace`,

    // Project sub-resources
    INVENTION: (projectId: string) => `/api/projects/${projectId}/invention`,
    INVENTION_TITLE: (projectId: string) =>
      `/api/projects/${projectId}/invention/title`,
    INVENTION_SUMMARY: (projectId: string) =>
      `/api/projects/${projectId}/invention/summary`,
    INVENTION_ABSTRACT: (projectId: string) =>
      `/api/projects/${projectId}/invention/abstract`,
    INVENTION_TECHNICAL_FIELD: (projectId: string) =>
      `/api/projects/${projectId}/invention/technical-field`,
    INVENTION_FEATURES: (projectId: string) =>
      `/api/projects/${projectId}/invention/features`,
    INVENTION_ADVANTAGES: (projectId: string) =>
      `/api/projects/${projectId}/invention/advantages`,
    INVENTION_BACKGROUND: (projectId: string) =>
      `/api/projects/${projectId}/invention/background`,
    INVENTION_USE_CASES: (projectId: string) =>
      `/api/projects/${projectId}/invention/use-cases`,
    INVENTION_PROCESS_STEPS: (projectId: string) =>
      `/api/projects/${projectId}/invention/process-steps`,
    TECHNOLOGY_DETAILS: (id: string) =>
      `/api/projects/${id}/technology-details`,
    PROCESS_INVENTION: (id: string) => `/api/projects/${id}/process-invention`,

    // Project content
    FULL_CONTENT: (id: string) => `/api/projects/${id}/FULL_CONTENT`,
    UPDATE_FIELD: (id: string) => `/api/projects/${id}/update-field`,
    GENERATE_APPLICATION_SECTIONS: (id: string) =>
      `/api/projects/${id}/generate-application-sections`,
    REGENERATE_SECTION: (id: string) =>
      `/api/projects/${id}/regenerate-section`,

    // Project features
    EXCLUSIONS: (projectId: string) => `/api/projects/${projectId}/exclusions`,
    CLAIM_SYNC: (id: string) => `/api/projects/${id}/claim-sync`,
    PRIOR_ART: {
      LIST: (projectId: string) => `/api/projects/${projectId}/prior-art`,
      CREATE: (projectId: string) => `/api/projects/${projectId}/prior-art`,
      BY_ID: (projectId: string, priorArtId: string) =>
        `/api/projects/${projectId}/prior-art/${priorArtId}`,
    },
    CHAT: (id: string) => `/api/projects/${id}/chat`,
    // DEPRECATED: Old LangChain streaming route kept for reference. Do not use.
    // CHAT_STREAM_LEGACY: (id: string) => `/api/projects/${id}/chat/stream-langchain`,

    // New lightweight chat streaming route
    CHAT_STREAM: '/api/chat/stream',

    // Figures management under projects
    FIGURES: {
      LIST: (projectId: string) => `/api/projects/${projectId}/figures`,
      UPLOAD: (projectId: string) => `/api/projects/${projectId}/figures`,
      CREATE_PENDING: (projectId: string) =>
        `/api/projects/${projectId}/figures/create-pending`,
      UNASSIGNED: (projectId: string) =>
        `/api/projects/${projectId}/figures/unassigned`,
      BY_ID: (projectId: string, figureId: string) =>
        `/api/projects/${projectId}/figures/${figureId}`,
      UPDATE: (projectId: string, figureId: string) =>
        `/api/projects/${projectId}/figures/${figureId}`,
      DELETE: (projectId: string, figureId: string) =>
        `/api/projects/${projectId}/figures/${figureId}`,
      DOWNLOAD: (projectId: string, figureId: string) =>
        `/api/projects/${projectId}/figures/${figureId}/download`,
      // New normalized figure endpoints
      METADATA: (projectId: string, figureId: string) =>
        `/api/projects/${projectId}/figures/${figureId}/metadata`,
      ELEMENTS: (projectId: string, figureId: string) =>
        `/api/projects/${projectId}/figures/${figureId}/elements`,
    },

    // Element management under projects
    ELEMENTS: {
      LIST: (projectId: string) => `/api/projects/${projectId}/elements`,
      BY_KEY: (projectId: string, elementKey: string) =>
        `/api/projects/${projectId}/elements/${elementKey}`,
    },

    // New claims-specific routes under projects
    CLAIMS: {
      LIST: (projectId: string) => `/api/projects/${projectId}/claims`,
      CREATE: (projectId: string) => `/api/projects/${projectId}/claims`,
      UPDATE: (claimId: string) => `/api/claims/${claimId}`,
      DELETE: (claimId: string) => `/api/claims/${claimId}`,
      RENUMBER: (claimId: string) => `/api/claims/${claimId}/renumber`,
      INSERT: (projectId: string) => `/api/projects/${projectId}/claims/insert`,
      BATCH_INSERT: (projectId: string) =>
        `/api/projects/${projectId}/claims/batch-insert`,
      BATCH_UPDATE: (projectId: string) =>
        `/api/projects/${projectId}/claims/batch-update`,
      UPDATE_NUMBER: (claimId: string) => `/api/claims/${claimId}/number`,
      VERSIONS: '/api/claims/versions',
      GENERATE_CLAIM1: (projectId: string) =>
        `/api/projects/${projectId}/claims/generate-claim1`,
      PARSE: (projectId: string) =>
        `/api/projects/${projectId}/claims/parse/v2`,
      GENERATE_QUERIES: (projectId: string) =>
        `/api/projects/${projectId}/claims/queries/v2`,
      MIRROR: (projectId: string) => `/api/projects/${projectId}/claims/mirror`,
    },

    // Versions
    VERSIONS: {
      LIST: (projectId: string) => `/api/projects/${projectId}/versions`,
      CREATE: (projectId: string) => `/api/projects/${projectId}/versions`,
      BY_ID: (projectId: string, versionId: string) =>
        `/api/projects/${projectId}/versions/${versionId}`,
      LATEST: (projectId: string) =>
        `/api/projects/${projectId}/versions/latest`,
      DOCUMENT: (projectId: string, versionId: string) =>
        `/api/projects/${projectId}/versions/${versionId}/document`,
      DOCUMENTS: (projectId: string, versionId: string) =>
        `/api/projects/${projectId}/versions/${versionId}/documents`,
      GENERATE_PATENT: (projectId: string) =>
        `/api/projects/${projectId}/generate-application-sections`,
      RESET: (projectId: string) => `/api/projects/${projectId}/versions/reset`,
    },

    // Draft documents
    DRAFT: (projectId: string) => `/api/projects/${projectId}/draft`,

    // Search history for a project
    SEARCH_HISTORY: (projectId: string) =>
      `/api/projects/${projectId}/search-history`,

    // Claim version tracking
    CLAIM_HASH: (projectId: string) => `/api/projects/${projectId}/claim-hash`,
    
    // Patent PDF retrieval
    RETRIEVE_PATENT_PDF: (projectId: string) => `/api/projects/${projectId}/retrieve-patent-pdf`,
  },

  // ============ SEARCH & HISTORY ============
  SEARCH_HISTORY: {
    BASE: '/api/search-history',
    CREATE: '/api/search-history',
    LIST: '/api/search-history',
    ASYNC_SEARCH: '/api/search-history/async-search',
    FOR_VERSION: '/api/search-history/for-version',
    CLEAR: '/api/search-history/clear',

    // By ID operations
    BY_ID: (id: string) => `/api/search-history/${id}`,
    DELETE: (id: string) => `/api/search-history/${id}`,
    STATUS: (id: string) => `/api/search-history/${id}/status`,
    CITATION_MATCHES: (id: string) =>
      `/api/search-history/${id}/citation-matches`,
    EXCLUDE_REFERENCE: (id: string) =>
      `/api/search-history/${id}/exclude-reference`,
  },

  // ============ CITATIONS ============
  CITATIONS: {
    METADATA: (referenceNumber: string) =>
      `/api/citations/metadata?referenceNumber=${encodeURIComponent(referenceNumber)}`,
    METADATA_BATCH: '/api/citations/metadata/batch',
    JOB_DETAIL: (jobId: string) => `/api/citation-jobs/${jobId}`,
  },

  CITATION_EXTRACTION: {
    QUEUE: '/api/citation-extraction/queue',
    RESULT: '/api/citation-extraction/result',
    BY_JOB_ID: (jobId: string) => `/api/citation-extraction/result/${jobId}`,
  },

  CITATION_JOBS: {
    LIST: '/api/citation-jobs',
    CREATE: '/api/citation-jobs',
    EXAMINER_ANALYSIS: '/api/citation-jobs/examiner-analysis',
    BY_ID: (id: string) => `/api/citation-jobs/${id}`,
    STATUS: (id: string) => `/api/citation-jobs/${id}/status`,
    DEEP_ANALYSIS: (id: string) => `/api/citation-jobs/${id}/deep-analysis`,
    REFRESH: (id: string) => `/api/citation-jobs/${id}/refresh`,
  } as const,

  CITATION_MATCHES: {
    BY_SEARCH: '/api/citation-matches/by-search',
    TOP_RESULTS: '/api/citation-matches/top-results',
  },

  CITATION_REASONING: {
    BASE: '/api/citation-reasoning',
  },

  CITATION_LOCATION: {
    RESULT: (jobId: string) => `/api/citation-location/result/${jobId}`,
  },

  // ============ CLAIMS ============
  CLAIMS: {
    GENERATE_QUERIES: '/api/generate-queries',
    GENERATE_SUGGESTIONS: '/api/generate-suggestions',
    GENERATE_DEPENDENT: '/api/generate-dependent-claims',
    DETAILS: (claimId: string) => `/api/claims/${claimId}`,
    VERSIONS: '/api/claims/versions',
  },

  // ============ PRIOR ART ============
  PRIOR_ART: {
    ANALYZE: '/api/prior-art/analyze',
    SAVED: (projectId: string) => `/api/projects/${projectId}/prior-art`,
    SEARCH: '/api/prior-art/search',
  },

  // ============ AI & ANALYSIS ============
  AI: {
    COMBINED_ANALYSIS: '/api/ai/combined-analysis',
    COMBINED_ANALYSES_BY_SEARCH: (searchHistoryId: string) =>
      `/api/combined-analyses/${searchHistoryId}`,
    GENERATE_FIGURE_DETAILS: '/api/ai/generate-figure-details',

    // AI Audit endpoints
    AUDIT: {
      LOGS: '/api/ai-audit/logs',
      LOG_BY_ID: (auditLogId: string) => `/api/ai-audit/logs/${auditLogId}`,
      MARK_REVIEWED: (auditLogId: string) =>
        `/api/ai-audit/logs/${auditLogId}/review`,
      EXPORT: (projectId: string) => `/api/ai-audit/export/${projectId}`,
      EXPORT_DOWNLOAD: (projectId: string) =>
        `/api/ai-audit/export/${projectId}/download`,
      STATS: (projectId: string) => `/api/ai-audit/stats/${projectId}`,
    },
  },

  // ANALYZE section removed - no longer needed

  // ============ DOCUMENTS & FILES ============
  DOCUMENTS: {
    BASE: '/api/documents',
    BATCH_UPDATE: '/api/documents/batch-update',
    UPLOAD: '/api/documents/upload',
    BY_ID: (id: string) => `/api/documents/${id}` as const,
  },

  FILES: {
    UPLOAD_INVENTION: '/api/documents/upload',
    EXTRACT_TEXT: '/api/utils/extract-text',
  },

  FIGURES: {
    BY_NAME: (blobName: string) => `/api/figures/${blobName}`,
  },

  // ============ PATENT OPERATIONS ============
  PATENT: {
    EXPORT: '/api/export-patent',
    CONSISTENCY_CHECK: '/api/consistency-check',
  },

  // ============ PATBASE INTEGRATION ============
  PATBASE: {
    SEARCH: {
      ENHANCE: '/api/patbase/search/enhance',
    },
    PATENT: {
      BASE: '/api/patbase/patent',
    },
    PATBASE_LOOKUP: (patentNumber: string) =>
      `/api/patbase/patent/${normalizePatentNumber(patentNumber)}`,
  },

  // ============ ADMIN & DEBUG ============
  ADMIN: {
    COSTS: '/api/admin/costs',
  },

  DEBUG: {
    TOOLS: {
      FIND_JOB: '/api/debug-tools/find-job',
    },
    CITATION: '/api/debug-citation',
  },

  // ============ MISCELLANEOUS ============
  MISC: {
    HEALTH: '/api/health',
    CSRF_TOKEN: '/api/csrf-token',
    SEARCH_PRIOR_ART: '/api/search-prior-art',
    PARSED_ELEMENTS: '/api/parsed-elements',
    SAVE_PROJECT: '/api/save-project',
    LOAD_PROJECT: '/api/load-project',
    OPENAI_TEST: '/api/openai-test',
  },

  // ============ V1 API (Legacy) ============
  V1: {
    PROJECTS: {
      LIST: '/api/v1/projects',
      BY_ID: (id: string) => `/api/v1/projects/${id}`,
    },
  },

  // ============ INTERNAL ============
  INTERNAL: {
    BASE: '/api/internal',
  },

  UTILS: {
    EXTRACT_TEXT: '/api/utils/extract-text',
  },

  // ============ AMENDMENTS ============
  AMENDMENTS: {
    OFFICE_ACTIONS: {
      UPLOAD: (projectId: string) => `/api/projects/${projectId}/office-actions/upload`,
      BY_ID: (projectId: string, officeActionId: string) => 
        `/api/projects/${projectId}/office-actions/${officeActionId}`,
      PARSE: (projectId: string, officeActionId: string) =>
        `/api/projects/${projectId}/office-actions/${officeActionId}/parse`,
      LIST: (projectId: string) => `/api/projects/${projectId}/office-actions`,
    },
    REJECTIONS: {
      ANALYZE: (projectId: string, officeActionId: string) =>
        `/api/projects/${projectId}/office-actions/${officeActionId}/analyze`,
      BY_ID: (projectId: string, officeActionId: string, rejectionId: string) =>
        `/api/projects/${projectId}/office-actions/${officeActionId}/rejections/${rejectionId}`,
      ANALYZE_ALL: (projectId: string, officeActionId: string) =>
        `/api/projects/${projectId}/office-actions/${officeActionId}/analyze-rejections`,
      ANALYZE_SINGLE: (projectId: string, officeActionId: string, rejectionId: string) =>
        `/api/projects/${projectId}/office-actions/${officeActionId}/rejections/${rejectionId}/analyze`,
    },
    RESPONSES: {
      GENERATE: (projectId: string, officeActionId: string) =>
        `/api/projects/${projectId}/office-actions/${officeActionId}/generate-response`,
      BY_ID: (projectId: string, responseId: string) =>
        `/api/projects/${projectId}/amendment-responses/${responseId}`,
      EXPORT: (projectId: string, responseId: string) =>
        `/api/projects/${projectId}/amendment-responses/${responseId}/export`,
    },
    FILES: {
      // Amendment project file tracking
      LIST: (amendmentProjectId: string) => 
        `/api/amendment-projects/${amendmentProjectId}/files`,
      UPLOAD: (amendmentProjectId: string) => 
        `/api/amendment-projects/${amendmentProjectId}/files/upload`,
      STATS: (amendmentProjectId: string) => 
        `/api/amendment-projects/${amendmentProjectId}/files/stats`,
      
      // Individual file operations
      BY_ID: (fileId: string) => `/api/amendment-project-files/${fileId}`,
      UPDATE: (fileId: string) => `/api/amendment-project-files/${fileId}`,
      DELETE: (fileId: string) => `/api/amendment-project-files/${fileId}`,
      DOWNLOAD: (fileId: string) => `/api/amendment-project-files/${fileId}/download`,
      VERSION: (fileId: string) => `/api/amendment-project-files/${fileId}/versions`,
      HISTORY: (fileId: string) => `/api/amendment-project-files/${fileId}/history`,
    },
  },
} as const;

/**
 * Utility function to build query string
 */
export const buildQueryString = (
  params: Record<string, string | number | boolean | undefined>
): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};

/**
 * Helper to build URLs with query parameters
 */
export const buildApiUrl = (
  baseUrl: string,
  params?: Record<string, string | number | boolean | undefined>
): string => {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }
  const queryString = buildQueryString(params);
  return `${baseUrl}?${queryString}`;
};

/**
 * Type-safe API route builder
 * @example
 * const url = api.projects.byId('123'); // '/api/projects/123'
 * const urlWithQuery = buildApiUrl(api.projects.list, { page: 1, limit: 10 }); // '/api/projects?page=1&limit=10'
 */
export const api = API_ROUTES;
