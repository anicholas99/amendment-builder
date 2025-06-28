#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// CRITICAL: This script validates that all API routes follow security patterns
const MUTATION_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
const API_DIR = path.join(__dirname, '../src/pages/api');

// Routes that are allowed to bypass certain security checks
const SECURITY_EXCEPTIONS = {
  // Auth routes don't need tenant validation
  'api/auth/': {
    skipTenantValidation: true,
    reason: 'Authentication endpoints',
  },
  'api/health': {
    skipAuth: true,
    skipTenantValidation: true,
    reason: 'Health check endpoint',
  },
  'api/system/': {
    skipTenantValidation: true,
    reason: 'System endpoints',
  },
};

function shouldSkipCheck(filePath, checkType) {
  const relativePath = path.relative(API_DIR, filePath).replace(/\\/g, '/');

  for (const [pattern, config] of Object.entries(SECURITY_EXCEPTIONS)) {
    if (relativePath.includes(pattern)) {
      return config[checkType] || false;
    }
  }

  return false;
}

function validateApiRoute(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const errors = [];
  const warnings = [];

  // Skip test files
  if (filePath.includes('__tests__') || filePath.includes('.test.')) {
    return { errors, warnings };
  }

  // Check if it's a mutation endpoint
  const hasMutationMethod = MUTATION_METHODS.some(
    method =>
      content.includes(`method === '${method}'`) ||
      content.includes(`method == '${method}'`) ||
      content.includes(`['${method}']`) ||
      content.includes(`"${method}"`)
  );

  // All endpoints must have authentication (unless explicitly excepted)
  if (!shouldSkipCheck(filePath, 'skipAuth')) {
    if (
      !content.includes('composeApiMiddleware') &&
      !content.includes('withAuth')
    ) {
      errors.push({
        file: filePath,
        message: 'Missing authentication middleware',
        severity: 'error',
      });
    }
  }

  // Mutation endpoints must have tenant validation
  if (hasMutationMethod && !shouldSkipCheck(filePath, 'skipTenantValidation')) {
    if (!content.includes('withTenantGuard')) {
      errors.push({
        file: filePath,
        message: 'Mutation endpoint missing withTenantGuard',
        severity: 'error',
      });
    }

    if (!content.includes('resolveTenantId')) {
      warnings.push({
        file: filePath,
        message: 'Missing resolveTenantId function (may be using default)',
        severity: 'warning',
      });
    }
  }

  // Check for manual tenant resolution (potential security risk)
  if (
    content.includes("req.headers['x-tenant-slug']") ||
    content.includes('req.headers["x-tenant-slug"]')
  ) {
    warnings.push({
      file: filePath,
      message:
        'Manual tenant header access detected - use withTenantGuard instead',
      severity: 'warning',
    });
  }

  return { errors, warnings };
}

// Main validation
console.log('🔍 Validating API route security patterns...\n');

const apiFiles = glob.sync(path.join(API_DIR, '**/*.{ts,tsx}'));
const allErrors = [];
const allWarnings = [];

apiFiles.forEach(file => {
  const { errors, warnings } = validateApiRoute(file);
  allErrors.push(...errors);
  allWarnings.push(...warnings);
});

// Report results
if (allWarnings.length > 0) {
  console.log('⚠️  Warnings:\n');
  allWarnings.forEach(({ file, message }) => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`  ${relativePath}: ${message}`);
  });
  console.log('');
}

if (allErrors.length > 0) {
  console.error('❌ API Security Validation Failed:\n');
  allErrors.forEach(({ file, message }) => {
    const relativePath = path.relative(process.cwd(), file);
    console.error(`  ${relativePath}: ${message}`);
  });
  console.error('\n⚠️  Fix these security issues before deploying!\n');
  console.error('📚 Security Guidelines:');
  console.error(
    '  1. All API routes must use withAuth or composeApiMiddleware'
  );
  console.error(
    '  2. Mutation endpoints (POST/PUT/PATCH/DELETE) must use withTenantGuard'
  );
  console.error('  3. Define a resolveTenantId function for tenant validation');
  console.error(
    '  4. Never manually access tenant headers - use the middleware\n'
  );
  process.exit(1);
} else {
  console.log('✅ All API routes pass security validation\n');
  console.log(`📊 Validated ${apiFiles.length} API routes`);
  if (allWarnings.length > 0) {
    console.log(`⚠️  ${allWarnings.length} warnings (non-blocking)`);
  }
}
