#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔒 Checking environment variable security...\n');

// Required environment variables for production
const REQUIRED_PRODUCTION_VARS = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET',
  'AUTH0_ISSUER',
  'INTERNAL_API_KEY',
  'AZURE_STORAGE_CONNECTION_STRING',
  'OPENAI_API_KEY',
  'SENTRY_DSN',
];

// Variables that should never have defaults in code
const NO_DEFAULT_ALLOWED = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'AUTH0_CLIENT_SECRET',
  'INTERNAL_API_KEY',
  'OPENAI_API_KEY',
  'AZURE_STORAGE_CONNECTION_STRING',
  'PATBASE_PASS',
  'AZURE_OPENAI_API_KEY',
  'AIAPI_API_KEY',
];

// Minimum lengths for secrets
const MIN_SECRET_LENGTHS = {
  NEXTAUTH_SECRET: 32,
  INTERNAL_API_KEY: 32,
  AUTH0_CLIENT_SECRET: 32,
};

let errors = 0;
let warnings = 0;

// Check if .env.example exists and is up to date
function checkEnvExample() {
  const envExamplePath = path.join(process.cwd(), '.env.example');

  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ .env.example file is missing');
    errors++;
    return;
  }

  const envExample = fs.readFileSync(envExamplePath, 'utf8');

  // Check all required vars are documented
  REQUIRED_PRODUCTION_VARS.forEach(varName => {
    if (!envExample.includes(varName)) {
      console.error(`❌ ${varName} is not documented in .env.example`);
      errors++;
    }
  });

  console.log('✅ .env.example file exists and contains required variables\n');
}

// Check for hardcoded defaults in source code
function checkHardcodedDefaults() {
  console.log('Scanning for hardcoded environment variable defaults...\n');

  const srcDir = path.join(process.cwd(), 'src');
  const files = getAllFiles(srcDir, ['.ts', '.tsx', '.js', '.jsx']);

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');

    NO_DEFAULT_ALLOWED.forEach(varName => {
      // Check for process.env.VAR || 'default' pattern
      const pattern = new RegExp(
        `process\\.env\\.${varName}\\s*\\|\\|\\s*['"\`]`,
        'g'
      );
      const matches = content.match(pattern);

      if (matches) {
        console.error(
          `❌ Hardcoded default found for ${varName} in ${path.relative(process.cwd(), file)}`
        );
        errors++;
      }
    });
  });

  if (errors === 0) {
    console.log('✅ No hardcoded defaults found for sensitive variables\n');
  }
}

// Check current environment (if not in CI)
function checkCurrentEnvironment() {
  if (process.env.CI) {
    console.log('⏭️  Skipping environment checks in CI\n');
    return;
  }

  console.log('Checking current environment variables...\n');

  // Check secret lengths
  Object.entries(MIN_SECRET_LENGTHS).forEach(([varName, minLength]) => {
    const value = process.env[varName];
    if (value && value.length < minLength) {
      console.error(
        `❌ ${varName} is too short (minimum ${minLength} characters)`
      );
      errors++;
    }
  });

  // Warn about missing production variables
  if (process.env.NODE_ENV === 'production') {
    REQUIRED_PRODUCTION_VARS.forEach(varName => {
      if (!process.env[varName]) {
        console.error(
          `❌ Required variable ${varName} is not set in production`
        );
        errors++;
      }
    });
  }

  console.log('✅ Environment variable checks complete\n');
}

// Check for sensitive data in committed files
function checkSensitiveFiles() {
  console.log('Checking for sensitive files...\n');

  const sensitivePatterns = [
    '.env',
    '.env.local',
    '.env.production',
    'serviceAccount.json',
    'credentials.json',
    'key.pem',
    'cert.pem',
  ];

  sensitivePatterns.forEach(pattern => {
    const filePath = path.join(process.cwd(), pattern);
    if (fs.existsSync(filePath)) {
      // Check if it's in .gitignore
      const gitignorePath = path.join(process.cwd(), '.gitignore');
      const gitignore = fs.readFileSync(gitignorePath, 'utf8');

      if (!gitignore.includes(pattern)) {
        console.error(
          `❌ Sensitive file ${pattern} exists and is not in .gitignore`
        );
        errors++;
      } else {
        console.warn(
          `⚠️  Sensitive file ${pattern} exists (but is gitignored)`
        );
        warnings++;
      }
    }
  });

  if (errors === 0 && warnings === 0) {
    console.log('✅ No sensitive files found\n');
  }
}

// Helper function to get all files recursively
function getAllFiles(dirPath, extensions, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !file.includes('node_modules') &&
      !file.includes('.next')
    ) {
      arrayOfFiles = getAllFiles(filePath, extensions, arrayOfFiles);
    } else if (extensions.some(ext => file.endsWith(ext))) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// Run all checks
console.log('🔍 Starting environment security audit...\n');

checkEnvExample();
checkHardcodedDefaults();
checkCurrentEnvironment();
checkSensitiveFiles();

// Summary
console.log('\n📊 Summary:');
console.log(`   Errors: ${errors}`);
console.log(`   Warnings: ${warnings}`);

if (errors > 0) {
  console.error('\n❌ Environment security check failed!');
  console.log('\nPlease fix the errors above before proceeding.');
  process.exit(1);
} else if (warnings > 0) {
  console.warn('\n⚠️  Environment security check passed with warnings');
  process.exit(0);
} else {
  console.log('\n✅ Environment security check passed!');
  process.exit(0);
}
