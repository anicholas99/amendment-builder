/**
 * Environment Configuration Module for Patent Drafter
 *
 * This module provides a centralized configuration object for the application.
 * It safely handles both client and server environments by:
 * - Only accessing NEXT_PUBLIC_* variables on the client
 * - Providing safe defaults for server-only variables when on client
 * - Using process.env directly to avoid complex bundling issues
 */
// LogEnvironment import removed - using local Environment type instead

// Helper functions
const parseBoolean = (
  value: string | undefined,
  defaultValue: boolean = false
): boolean => {
  if (!value) return defaultValue;
  return value === 'true' || value === '1';
};

const parseNumber = (
  value: string | undefined,
  defaultValue: number
): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

const parseFloatSafe = (
  value: string | undefined,
  defaultValue: number
): number => {
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Define available environment types
export type Environment = 'development' | 'production' | 'test' | 'qa';

// Check if we're on the server
const isServer = typeof window === 'undefined';

// Get current environment - safe for both client and server
const ENV = process.env.NODE_ENV || 'development';
const APP_ENV = (process.env.NEXT_PUBLIC_APP_ENV ||
  'development') as Environment;

// Environment-specific configuration
const ENV_CONFIG = {
  development: {
    apiBaseUrl: '/api',
    useLocalStorage: false,
    enableMocks: false,
    logLevel: 'info' as const,
    authProvider: 'auth0' as const,
  },
  qa: {
    apiBaseUrl: 'https://patentdraft-qa.ipdashboard.com/api',
    useLocalStorage: false,
    enableMocks: false,
    logLevel: 'info' as const,
    authProvider: 'auth0' as const,
  },
  production: {
    apiBaseUrl: 'https://patentdraft.ipdashboard.com/api',
    useLocalStorage: false,
    enableMocks: false,
    logLevel: 'error' as const,
    authProvider: 'auth0' as const,
  },
  test: {
    apiBaseUrl: 'http://localhost:3000/api',
    useLocalStorage: false,
    enableMocks: true,
    logLevel: 'debug' as const,
    authProvider: 'auth0' as const,
  },
};

// Get current environment config
const currentEnv = ENV_CONFIG[APP_ENV];

// Environment flags
export const isProduction = APP_ENV === 'production';
export const isDevelopment = APP_ENV === 'development';
export const isQA = APP_ENV === 'qa';
export const isTest = ENV === 'test';

/**
 * Complete application configuration with all settings
 * Import this object anywhere to access environment settings
 */
export const environment = {
  // Core environment settings
  isProduction,
  isDevelopment,
  isQA,
  isTest,
  env: APP_ENV,

  // Application settings
  appName: 'Amendment Builder',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'),

  // API settings
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || currentEnv.apiBaseUrl,
    timeout: 30000, // 30 seconds
    rateLimitWindow: isServer
      ? parseNumber(process.env.RATE_LIMIT_WINDOW, 60000)
      : 60000,
    maxRequestsPerWindow: isServer
      ? parseNumber(process.env.MAX_REQUESTS_PER_WINDOW, 100)
      : 100,
  },

  // Authentication settings for Auth0
  auth: {
    provider: 'auth0' as const,
    domain: isServer
      ? process.env.AUTH0_ISSUER_BASE_URL ||
        (isTest ? 'https://test.auth0.com' : '')
      : '',
    clientId: isServer
      ? process.env.AUTH0_CLIENT_ID || (isTest ? 'test-client-id' : '')
      : '',
    clientSecret: isServer
      ? process.env.AUTH0_CLIENT_SECRET || (isTest ? 'test-client-secret' : '')
      : '',
    audience: isServer
      ? process.env.AUTH0_AUDIENCE || (isTest ? 'https://api.test.com' : '')
      : '',
    scope: 'openid profile email',
    redirectUri: isServer
      ? `${process.env.AUTH0_BASE_URL || (isTest ? 'http://localhost:3000' : '')}/api/auth/callback`
      : '',
    logoutUri: isServer
      ? process.env.AUTH0_BASE_URL || (isTest ? 'http://localhost:3000' : '')
      : '',
    sessionSecret: isServer
      ? process.env.AUTH0_SECRET ||
        process.env.NEXTAUTH_SECRET ||
        (isTest ? 'test-session-secret' : 'change-this-in-production')
      : '',
  },

  // Database settings
  database: {
    host: isServer ? process.env.DB_HOST || '' : '',
    name: isServer ? process.env.DB_NAME || '' : '',
    user: isServer ? process.env.DB_USER || '' : '',
    password: isServer ? process.env.DB_PASSWORD || '' : '',
    port: isServer ? parseNumber(process.env.DB_PORT, 1433) : 1433,
    useSSL: isServer ? parseBoolean(process.env.DB_USE_SSL, false) : false,
    url: isServer ? process.env.DATABASE_URL : '',
    poolSize: isServer ? parseNumber(process.env.DB_POOL_SIZE, 10) : 10,
  },

  // Feature flags
  features: {
    useLocalStorage: currentEnv.useLocalStorage,
    multiTenant: true,
    enableDrafting: isServer
      ? parseBoolean(process.env.ENABLE_DRAFTING, true)
      : true,
    enableCostTracking: isServer
      ? parseBoolean(process.env.ENABLE_COST_TRACKING, false)
      : false,
    enablePriorArtSearch: isServer
      ? parseBoolean(process.env.ENABLE_PRIOR_ART_SEARCH, true)
      : true,
    aiSuggestions: true,
    export: true,
    versionHistory: true,
    useCitationWorker: isServer
      ? parseBoolean(process.env.USE_CITATION_WORKER, false)
      : false,
    enableDeepAnalysis:
      parseBoolean(process.env.NEXT_PUBLIC_ENABLE_DEEP_ANALYSIS, false) ||
      (isServer
        ? parseBoolean(process.env.ENABLE_DEEP_ANALYSIS, false)
        : false),
    enableExaminerAnalysis: isServer
      ? parseBoolean(process.env.ENABLE_EXAMINER_ANALYSIS, false)
      : false,
    enableClaimRefinement: parseBoolean(
      process.env.NEXT_PUBLIC_ENABLE_CLAIM_REFINEMENT,
      true
    ),
    enableAiAudit: parseBoolean(process.env.ENABLE_AI_AUDIT, true),
    enableRefreshButton: parseBoolean(
      process.env.NEXT_PUBLIC_ENABLE_REFRESH_BUTTON,
      false
    ),
    enableTwoPhaseValidation: parseBoolean(process.env.ENABLE_TWO_PHASE_VALIDATION, false),
    enableMultiReferenceValidation: parseBoolean(process.env.ENABLE_MULTI_REFERENCE_VALIDATION, false),
  },

  // UI settings
  ui: {
    defaultSidebarWidth: 300,
    toastDuration: 5000,
    maxClaimVersions: 20,
  },

  // Logging configuration
  logging: {
    level: isServer ? process.env.LOG_LEVEL || 'info' : 'info',
    enableConsole: true,
    enableRemote: APP_ENV !== 'development',
    remoteEndpoint: isServer ? process.env.LOG_ENDPOINT || '' : '',
    logEnv: APP_ENV as Environment,
  },

  // Deployment info
  deployment: {
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    buildDate: process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString(),
    commitHash: process.env.NEXT_PUBLIC_COMMIT_HASH || 'development',
  },

  // OpenAI configurations
  openai: {
    apiKey: isServer ? process.env.OPENAI_API_KEY || '' : '',
    model: isServer ? process.env.OPENAI_MODEL || 'gpt-4' : 'gpt-4',
    temperature: isServer
      ? parseFloatSafe(process.env.OPENAI_TEMPERATURE, 0.7)
      : 0.7,
    maxTokens: isServer
      ? parseNumber(process.env.OPENAI_MAX_TOKENS, 8000)
      : 8000,
    deepAnalysisModel: isServer
      ? process.env.DEEP_ANALYSIS_MODEL || process.env.OPENAI_MODEL || 'gpt-4'
      : 'gpt-4',
    deepAnalysisTimeout: isServer
      ? parseNumber(process.env.DEEP_ANALYSIS_TIMEOUT_MS, 180000)
      : 180000,
    deepAnalysisMaxCitationsPerElement: isServer
      ? parseNumber(process.env.DEEP_ANALYSIS_MAX_CITATIONS_PER_ELEMENT, 3)
      : 3,
    deepAnalysisMaxAmendmentsForValidation: isServer
      ? parseNumber(process.env.DEEP_ANALYSIS_MAX_AMENDMENTS_FOR_VALIDATION, 3)
      : 3,
    deepAnalysisMaxTokens: isServer
      ? parseNumber(process.env.DEEP_ANALYSIS_MAX_TOKENS, 16000)
      : 16000,
  },

  // Azure settings
  azure: {
    storageConnectionString: isServer
      ? process.env.AZURE_STORAGE_CONNECTION_STRING || ''
      : '',
    storageContainerName: isServer
      ? process.env.AZURE_STORAGE_CONTAINER_NAME || 'figures'
      : 'figures',
    openai: {
      apiKey: isServer ? process.env.AZURE_OPENAI_API_KEY || '' : '',
      endpoint: isServer ? process.env.AZURE_OPENAI_ENDPOINT || '' : '',
      deploymentName: isServer
        ? process.env.AZURE_OPENAI_DEPLOYMENT_NAME || ''
        : '',
      apiVersion: isServer
        ? process.env.AZURE_OPENAI_API_VERSION || '2024-02-01'
        : '2024-02-01',
    },
    computerVision: {
      endpoint: isServer ? process.env.AZURE_COMPUTER_VISION_ENDPOINT || '' : '',
      apiKey: isServer ? process.env.AZURE_COMPUTER_VISION_API_KEY || '' : '',
      apiVersion: isServer
        ? process.env.AZURE_COMPUTER_VISION_API_VERSION || '2024-02-01'
        : '2024-02-01',
    },
    documentIntelligence: {
      endpoint: isServer ? process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT || '' : '',
      apiKey: isServer ? process.env.AZURE_DOCUMENT_INTELLIGENCE_API_KEY || '' : '',
      apiVersion: isServer
        ? process.env.AZURE_DOCUMENT_INTELLIGENCE_API_VERSION || '2024-07-31-preview'
        : '2024-07-31-preview',
    },
  },

  // External AI API settings
  aiapi: {
    apiKey: isServer ? process.env.AIAPI_API_KEY || '' : '',
  },

  // Citation extraction settings
  citation: {
    defaultThreshold: isServer
      ? parseNumber(process.env.CITATION_DEFAULT_THRESHOLD, 30)
      : 30,
    minThreshold: isServer
      ? parseNumber(process.env.CITATION_MIN_THRESHOLD, 10)
      : 10,
    maxThreshold: isServer
      ? parseNumber(process.env.CITATION_MAX_THRESHOLD, 100)
      : 100,
    filterThreshold: isServer
      ? parseNumber(process.env.CITATION_FILTER_THRESHOLD, 20)
      : 20,
  },

  // PatBase API settings
  patbase: {
    user: isServer ? process.env.PATBASE_USER || '' : '',
    password: isServer ? process.env.PATBASE_PASS || '' : '',
  },

  // USPTO ODP API settings
  uspto: {
    apiKey: isServer ? process.env.USPTO_ODP_API_KEY || '' : '',
    apiUrl: isServer ? process.env.USPTO_ODP_API_URL || 'https://api.uspto.gov/api/v1' : 'https://api.uspto.gov/api/v1',
  },

  // AI Provider settings
  ai: {
    provider: isServer
      ? (process.env.AI_PROVIDER as 'openai' | 'azure' | 'aiapi') || 'openai'
      : 'openai',
    maxTokens: parseNumber(process.env.NEXT_PUBLIC_AI_MAX_INPUT_TOKENS, 6000),
  },

  // Cardinal API settings
  cardinal: {
    apiBaseUrl: process.env.NEXT_PUBLIC_CARDINAL_API_BASE_URL || '',
  },

  // Storage settings
  storage: {
    type: isServer
      ? (process.env.STORAGE_TYPE as 'local' | 'azure') || 'local'
      : 'local',
  },

  // Redis settings
  redis: {
    url: isServer ? process.env.REDIS_URL || '' : '',
  },

  // Security settings
  security: {
    trustedProxyIps: isServer
      ? (process.env.TRUSTED_PROXY_IPS || '')
          .split(',')
          .map(ip => ip.trim())
          .filter(Boolean)
      : [],
    virusTotalApiKey: isServer ? process.env.VIRUSTOTAL_API_KEY || '' : '',
    sessionTimeoutMinutes: isServer
      ? parseNumber(process.env.SESSION_TIMEOUT_MINUTES, 30) // 30 minutes default
      : 30,
    sessionAbsoluteTimeoutHours: isServer
      ? parseNumber(process.env.SESSION_ABSOLUTE_TIMEOUT_HOURS, 8) // 8 hours default
      : 8,
  },
};

// Logger has been removed from this file - use @/server/logger for server-side or @/utils/clientLogger for client-side

// Export commonly used configurations
export const API_CONFIG = environment.api;
export const FEATURES = environment.features;
export const OPENAI_CONFIG = environment.openai;
export const DB_CONFIG = environment.database;
export const AUTH_CONFIG = environment.auth;

// Export default configuration
export default environment;
