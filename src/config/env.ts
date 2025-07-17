/**
 * Environment Variables Compatibility Layer
 *
 * This file provides backward compatibility for files that import from '@/config/env'.
 * All actual configuration is in environment.ts - this just re-exports it.
 */
import { environment } from './environment';

// Check if we're on the server
const isServer = typeof window === 'undefined';

// Re-export the environment object as 'env' for backward compatibility
export const env = {
  // Core environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  NEXT_PUBLIC_APP_ENV: environment.env,

  // Application
  NEXT_PUBLIC_APP_VERSION: environment.version,
  NEXT_PUBLIC_APP_URL: environment.appUrl,
  NEXT_PUBLIC_API_BASE_URL: environment.api.baseUrl,

  // API
  RATE_LIMIT_WINDOW: environment.api.rateLimitWindow,
  MAX_REQUESTS_PER_WINDOW: environment.api.maxRequestsPerWindow,

  // Auth
  AUTH0_SECRET: environment.auth.sessionSecret,
  AUTH0_ISSUER_BASE_URL: environment.auth.domain,
  AUTH0_CLIENT_ID: environment.auth.clientId,
  AUTH0_CLIENT_SECRET: environment.auth.clientSecret,
  AUTH0_AUDIENCE: environment.auth.audience,
  AUTH0_BASE_URL: environment.auth.logoutUri,
  AUTH0_DOMAIN: environment.auth.domain,
  NEXTAUTH_SECRET: environment.auth.sessionSecret,
  NEXT_PUBLIC_AUTH_TYPE: isServer
    ? process.env.NEXT_PUBLIC_AUTH_TYPE || 'auth0'
    : 'auth0',

  // Database
  DATABASE_URL: environment.database.url,
  DB_HOST: environment.database.host,
  DB_NAME: environment.database.name,
  DB_USER: environment.database.user,
  DB_PASSWORD: environment.database.password,
  DB_PORT: environment.database.port,
  DB_USE_SSL: environment.database.useSSL,
  DB_POOL_SIZE: environment.database.poolSize,

  // Features
  ENABLE_DRAFTING: environment.features.enableDrafting,
  ENABLE_COST_TRACKING: environment.features.enableCostTracking,
  ENABLE_PRIOR_ART_SEARCH: environment.features.enablePriorArtSearch,
  USE_CITATION_WORKER: environment.features.useCitationWorker,
  ENABLE_DEEP_ANALYSIS: environment.features.enableDeepAnalysis,
  NEXT_PUBLIC_ENABLE_DEEP_ANALYSIS: environment.features.enableDeepAnalysis,
  ENABLE_EXAMINER_ANALYSIS: environment.features.enableExaminerAnalysis,

  // Logging
  LOG_LEVEL: environment.logging.level,
  LOG_ENDPOINT: environment.logging.remoteEndpoint,
  LOG_TO_FILE: false,
  ENABLE_LOGGING: environment.logging.enableConsole,

  // OpenAI
  OPENAI_API_KEY: environment.openai.apiKey,
  OPENAI_MODEL: environment.openai.model,
  OPENAI_TEMPERATURE: environment.openai.temperature,
  OPENAI_MAX_TOKENS: environment.openai.maxTokens,
  OPENAI_FALLBACK_MODEL: isServer
    ? process.env.OPENAI_FALLBACK_MODEL || 'gpt-3.5-turbo'
    : 'gpt-3.5-turbo',
  DEEP_ANALYSIS_MODEL: environment.openai.deepAnalysisModel,
  DEEP_ANALYSIS_TIMEOUT_MS: environment.openai.deepAnalysisTimeout,
  DEEP_ANALYSIS_MAX_CITATIONS_PER_ELEMENT:
    environment.openai.deepAnalysisMaxCitationsPerElement,

  // Azure
  AZURE_STORAGE_CONNECTION_STRING: environment.azure.storageConnectionString,
  AZURE_STORAGE_CONTAINER_NAME: environment.azure.storageContainerName,
  AZURE_STORAGE_INVENTION_CONTAINER_NAME: isServer
    ? process.env.AZURE_STORAGE_INVENTION_CONTAINER_NAME ||
      environment.azure.storageContainerName
    : environment.azure.storageContainerName,
  USE_AZURE_STORAGE: environment.storage.type === 'azure',
  AZURE_OPENAI_API_KEY: environment.azure.openai.apiKey,
  AZURE_OPENAI_ENDPOINT: environment.azure.openai.endpoint,
  AZURE_OPENAI_DEPLOYMENT_NAME: environment.azure.openai.deploymentName,
  AZURE_OPENAI_DEPLOYMENT_FALLBACK: isServer
    ? process.env.AZURE_OPENAI_DEPLOYMENT_FALLBACK || 'gpt-35-turbo'
    : 'gpt-35-turbo',
  AZURE_OPENAI_API_VERSION: environment.azure.openai.apiVersion,
  AZURITE_CONNECTION_STRING: isServer
    ? process.env.AZURITE_CONNECTION_STRING ||
      environment.azure.storageConnectionString
    : '',

  // Other APIs
  AIAPI_API_KEY: environment.aiapi.apiKey,
  PATBASE_USER: environment.patbase.user,
  PATBASE_PASS: environment.patbase.password,

  // Citation
  CITATION_DEFAULT_THRESHOLD: environment.citation.defaultThreshold,
  CITATION_MIN_THRESHOLD: environment.citation.minThreshold,
  CITATION_MAX_THRESHOLD: environment.citation.maxThreshold,
  CITATION_FILTER_THRESHOLD: environment.citation.filterThreshold,

  // AI Provider
  AI_PROVIDER: environment.ai.provider,
  NEXT_PUBLIC_AI_MAX_INPUT_TOKENS: environment.ai.maxTokens,

  // Cardinal
  NEXT_PUBLIC_CARDINAL_API_BASE_URL: environment.cardinal.apiBaseUrl,

  // Storage
  STORAGE_TYPE: environment.storage.type,

  // Redis
  REDIS_URL: environment.redis.url,

  // IPD Integration
  IPD_BASE_URL: isServer
    ? process.env.IPD_BASE_URL || 'https://ipdashboard.com'
    : '',
  IPD_API_URL: isServer
    ? process.env.IPD_API_URL || 'https://api.ipdashboard.com'
    : '',
  IPD_COOKIE_DOMAIN: isServer
    ? process.env.IPD_COOKIE_DOMAIN || '.ipdashboard.com'
    : '',
  IPD_SESSION_COOKIE_NAME: isServer
    ? process.env.IPD_SESSION_COOKIE_NAME || 'ipd_session'
    : '',
  IPD_USER_COOKIE_NAME: isServer
    ? process.env.IPD_USER_COOKIE_NAME || 'ipd_user'
    : '',
  IPD_TENANT_COOKIE_NAME: isServer
    ? process.env.IPD_TENANT_COOKIE_NAME || 'ipd_tenant'
    : '',
  IPD_PUBLIC_KEY: isServer ? process.env.IPD_PUBLIC_KEY || '' : '',
  IPD_VALIDATION_METHOD: isServer
    ? process.env.IPD_VALIDATION_METHOD || 'api_endpoint'
    : '',
  IPD_SHARED_SECRET: isServer ? process.env.IPD_SHARED_SECRET || '' : '',

  // Other
  NEXT_PUBLIC_BUILD_DATE: environment.deployment.buildDate,
  NEXT_PUBLIC_COMMIT_HASH: environment.deployment.commitHash,
  NEXT_PUBLIC_USE_IPD_IDENTITY: false,
  IPD_IDENTITY_URL: 'https://ipdashboard.com',
};

// Support for getServiceAccountEnv function that was used in some files
export function getServiceAccountEnv(accountType: string) {
  const key = `SERVICE_ACCOUNT_${accountType.toUpperCase()}_KEY`;
  return process.env[key] || '';
}

// Helper to get service account credentials
export function getServiceAccountCredentials(prefix: string) {
  return {
    clientId: process.env[`SERVICE_ACCOUNT_${prefix}_CLIENT_ID`] || '',
    clientSecret: process.env[`SERVICE_ACCOUNT_${prefix}_CLIENT_SECRET`] || '',
    tenantId: process.env[`SERVICE_ACCOUNT_${prefix}_TENANT_ID`] || undefined,
  };
}

// Re-export the entire environment object for files that need it
export { environment } from './environment';
