/**
 * Environment Variable Validation
 *
 * This file provides startup logging for environment validation.
 * The actual validation is performed by the env.ts module.
 */
import { env } from './env';

/**
 * Logs environment validation status at startup
 * The actual validation happens when env.ts is imported
 */
export function validateStartupEnvironment(): void {
  console.log('🔍 Environment variables validated successfully!\n');

  // Log current environment
  console.log(`📍 Environment: ${env.NODE_ENV}`);
  console.log(`📍 App Environment: ${env.NEXT_PUBLIC_APP_ENV}`);
  console.log(`📍 AI Provider: ${env.AI_PROVIDER}`);
  console.log(
    `📍 Deep Analysis: ${env.ENABLE_DEEP_ANALYSIS ? 'Enabled' : 'Disabled'}`
  );
  console.log(
    `📍 Examiner Analysis: ${env.ENABLE_EXAMINER_ANALYSIS ? 'Enabled' : 'Disabled'}\n`
  );
}

// For backward compatibility, export empty objects
// These are no longer needed as validation happens in env.ts
export const REQUIRED_ENV_VARS = {};
export const OPTIONAL_ENV_VARS = {};
