/**
 * Server-side Environment Validation
 *
 * This file validates environment variables on the server only.
 * It should NEVER be imported by client-side code.
 */

// Ensure this only runs on the server
if (typeof window !== 'undefined') {
  throw new Error('env-validation.ts should only be imported on the server!');
}

// Simple validation of required environment variables
const required = [
  'AUTH0_SECRET',
  'AUTH0_ISSUER_BASE_URL',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET',
  'AUTH0_AUDIENCE',
  'AUTH0_BASE_URL',
  'DATABASE_URL',
];

const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:', missing);
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}`
  );
}

console.log('✅ Environment variables validated successfully');

export const validated = true;
