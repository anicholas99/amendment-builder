#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const API_DIR = path.join(__dirname, '../src/pages/api');
const MUTATION_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Find all TypeScript files in the API directory
const pattern = path.join(API_DIR, '**/*.ts').replace(/\\/g, '/');
console.log(`Looking for files matching: ${pattern}`);
const apiFiles = glob.sync(pattern);

console.log(`Found ${apiFiles.length} API files\n`);

const results = {
  totalMutationRoutes: 0,
  protectedRoutes: [],
  unprotectedRoutes: [],
  manualTenantChecks: [],
  suspiciousRoutes: [],
};

apiFiles.forEach(file => {
  // Skip test files
  if (file.includes('__tests__') || file.includes('.test.')) return;

  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(process.cwd(), file).replace(/\\/g, '/');

  // Check if it has mutation methods
  const hasMutations = MUTATION_METHODS.some(method => {
    const patterns = [
      `method === '${method}'`,
      `method == '${method}'`,
      `method === "${method}"`,
      `method == "${method}"`,
      `req.method === '${method}'`,
      `req.method == '${method}'`,
      `req.method === "${method}"`,
      `req.method == "${method}"`,
    ];
    return patterns.some(pattern => content.includes(pattern));
  });

  if (!hasMutations) return;

  results.totalMutationRoutes++;

  // Check for withTenantGuard
  const hasWithTenantGuard = content.includes('withTenantGuard');

  // Check for manual tenant checks
  const hasManualTenantCheck =
    content.includes("req.headers['x-tenant-slug']") ||
    content.includes('req.headers["x-tenant-slug"]') ||
    content.includes('findTenantBySlug');

  // Check for auth endpoints (which might not need tenant guard)
  const isAuthEndpoint =
    file.includes('/auth/') || file.includes('/csrf-token');

  // Check for health/system endpoints
  const isSystemEndpoint =
    file.includes('/health') || file.includes('/system/');

  if (hasWithTenantGuard) {
    results.protectedRoutes.push(relativePath);

    // Check if it ALSO has manual checks (double protection = confusion)
    if (hasManualTenantCheck) {
      results.suspiciousRoutes.push({
        file: relativePath,
        issue: 'Has BOTH withTenantGuard AND manual tenant checks',
      });
    }
  } else if (!isAuthEndpoint && !isSystemEndpoint) {
    results.unprotectedRoutes.push(relativePath);

    if (hasManualTenantCheck) {
      results.manualTenantChecks.push(relativePath);
    }
  }
});

// Output results
console.log('🔍 Multi-Tenant Security Audit Results\n');
console.log(`Total mutation routes found: ${results.totalMutationRoutes}`);
console.log(
  `Protected with withTenantGuard: ${results.protectedRoutes.length}`
);
console.log(`UNPROTECTED routes: ${results.unprotectedRoutes.length}`);
console.log(
  `Routes with manual tenant checks: ${results.manualTenantChecks.length}`
);
console.log(`Suspicious routes: ${results.suspiciousRoutes.length}\n`);

if (results.unprotectedRoutes.length > 0) {
  console.log('🚨 CRITICAL: Unprotected mutation routes:');
  results.unprotectedRoutes.forEach(route => {
    console.log(`  - ${route}`);
  });
  console.log('');
}

if (results.suspiciousRoutes.length > 0) {
  console.log('⚠️  WARNING: Routes with confusing patterns:');
  results.suspiciousRoutes.forEach(({ file, issue }) => {
    console.log(`  - ${file}: ${issue}`);
  });
  console.log('');
}

if (results.manualTenantChecks.length > 0) {
  console.log('📋 Routes using manual tenant checks:');
  results.manualTenantChecks.forEach(route => {
    console.log(`  - ${route}`);
  });
}

// Exit with error code if unprotected routes found
if (results.unprotectedRoutes.length > 0) {
  process.exit(1);
}
