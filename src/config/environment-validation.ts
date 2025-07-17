/**
 * Environment Variable Validation
 *
 * Centralized validation for all environment variables.
 * This runs on server startup to catch configuration errors early.
 */

import { z } from 'zod';

// Environment variable schemas
const envSchema = z.object({
  // Core Required Variables
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Auth0 Configuration (Required)
  AUTH0_DOMAIN: z.string().min(1, 'AUTH0_DOMAIN is required'),
  AUTH0_CLIENT_ID: z.string().min(1, 'AUTH0_CLIENT_ID is required'),
  AUTH0_CLIENT_SECRET: z.string().min(1, 'AUTH0_CLIENT_SECRET is required'),
  AUTH0_AUDIENCE: z.string().min(1, 'AUTH0_AUDIENCE is required'),
  AUTH0_BASE_URL: z.string().url('AUTH0_BASE_URL must be a valid URL'),
  AUTH0_SECRET: z
    .string()
    .min(32, 'AUTH0_SECRET must be at least 32 characters'),

  // Database Configuration (Required)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // OpenAI Configuration (Required)
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),

  // Optional but validated if present
  REDIS_URL: z.string().url().optional(),
  AZURE_STORAGE_CONNECTION_STRING: z.string().optional(),
  VIRUSTOTAL_API_KEY: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW: z.string().regex(/^\d+$/).optional(),
  MAX_REQUESTS_PER_WINDOW: z.string().regex(/^\d+$/).optional(),

  // Feature Flags
  ENABLE_DEEP_ANALYSIS: z.enum(['true', 'false']).optional(),
  ENABLE_EXAMINER_ANALYSIS: z.enum(['true', 'false']).optional(),
  USE_CITATION_WORKER: z.enum(['true', 'false']).optional(),

  // AI Configuration
  AI_PROVIDER: z.enum(['openai', 'azure', 'claude']).optional(),
  AZURE_OPENAI_ENDPOINT: z.string().url().optional(),
  AZURE_OPENAI_API_KEY: z.string().optional(),
  AZURE_OPENAI_DEPLOYMENT_NAME: z.string().optional(),

  // App Configuration
  NEXT_PUBLIC_APP_ENV: z
    .enum(['development', 'qa', 'production', 'test'])
    .optional(),
  NEXT_PUBLIC_APP_VERSION: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Service Account Credentials (for Patbase API)
  PATBASE_SERVICE_ACCOUNT_ID: z.string().optional(),
  PATBASE_SERVICE_ACCOUNT_SECRET: z.string().optional(),

  // Storage Configuration
  STORAGE_TYPE: z.enum(['azure', 'local']).optional(),

  // Queue Configuration
  QUEUE_TYPE: z.enum(['azure', 'memory']).optional(),

  // Session Configuration
  SESSION_TIMEOUT_MINUTES: z.string().regex(/^\d+$/).optional(),
  MAX_CONCURRENT_SESSIONS: z.string().regex(/^\d+$/).optional(),
});

// Production-specific requirements
const productionSchema = envSchema.extend({
  REDIS_URL: z.string().url('REDIS_URL is required in production'),
  AZURE_STORAGE_CONNECTION_STRING: z
    .string()
    .min(1, 'Azure Storage is required in production'),
});

/**
 * Validates all environment variables
 * @throws {Error} If validation fails
 */
export function validateEnvironment(): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const schema = isProduction ? productionSchema : envSchema;

  try {
    schema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map(issue => `  - ${issue.path.join('.')}: ${issue.message}`)
        .join('\n');

      throw new Error(
        `Environment validation failed:\n${issues}\n\n` +
          `Please check your environment variables.`
      );
    }
    throw error;
  }
}

// Helper functions for backward compatibility
export function isFeatureEnabled(feature: string): boolean {
  const value = process.env[feature];
  return value === 'true' || value === '1';
}

export function getNumericEnv(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}
