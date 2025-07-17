/**
 * Runtime environment detection utilities
 */

/**
 * Check if we're running in a Node.js runtime (not Edge Runtime)
 * Uses Next.js runtime environment check
 */
export function isNodeRuntime(): boolean {
  // Next.js sets this for Edge Runtime
  // If it's not set or is 'nodejs', we're in Node.js runtime
  return process.env.NEXT_RUNTIME !== 'edge';
}

/**
 * Check if we're running on the server (not in browser)
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Check if we're running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if we're running in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if we're running in test mode
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}
