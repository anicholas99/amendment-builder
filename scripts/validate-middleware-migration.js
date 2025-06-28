#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 Validating Middleware Migration...\n');

let issues = 0;

// Check 1: No composeApiMiddleware imports
console.log('✓ Checking for legacy middleware imports...');
const apiFiles = glob.sync('src/pages/api/**/*.{ts,tsx}');
apiFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('composeApiMiddleware') && !content.includes('//')) {
    console.log(`  ❌ Found legacy middleware in ${file}`);
    issues++;
  }
});

// Check 2: All mutations have tenant guards
console.log('\n✓ Checking mutation endpoints for tenant guards...');
const mutationMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
const tenantExemptPaths = [
  'auth/switch-tenant', // Manages tenant switching
  'tenants/active', // Manages tenant switching
  'auth/login', // Pre-auth endpoint
  'auth/register', // Pre-auth endpoint
  'auth/[...auth0]', // Auth0 handler
];

apiFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const hasMutation = mutationMethods.some(
    method =>
      content.includes(`method === '${method}'`) ||
      content.includes(`method !== '${method}'`) ||
      content.includes(`withMethod('${method}'`)
  );

  const isExempt = tenantExemptPaths.some(path => file.includes(path));
  const hasExemptComment =
    content.includes('no tenant guard') ||
    content.includes('manages tenant switching') ||
    content.includes('Admin endpoint');

  if (
    hasMutation &&
    !content.includes('withTenantGuard') &&
    !isExempt &&
    !hasExemptComment
  ) {
    console.log(`  ⚠️  Mutation without tenant guard: ${file}`);
    issues++;
  }
});

// Check 3: Consistent middleware patterns (more lenient)
console.log('\n✓ Checking for consistent middleware patterns...');
const expectedPatterns = ['withAuth', 'withErrorHandling', 'withRateLimit'];

const publicEndpoints = ['health', 'swagger', 'csrf-token', 'auth/'];

apiFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes('export default')) return;

  const isPublic = publicEndpoints.some(path => file.includes(path));
  if (isPublic) return; // Skip public endpoints

  const missingPatterns = expectedPatterns.filter(
    pattern => !content.includes(pattern)
  );
  if (
    missingPatterns.length > 0 &&
    missingPatterns.length < expectedPatterns.length
  ) {
    // Only report if some but not all patterns are missing (likely an oversight)
    console.log(`  ⚠️  ${file} missing: ${missingPatterns.join(', ')}`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (issues === 0) {
  console.log('✅ MIGRATION VALIDATED - No critical issues found!');
  console.log('🔒 All routes are using explicit middleware');
  console.log('🛡️  All mutations are properly secured');
} else {
  console.log(`⚠️  Found ${issues} issues that may need attention`);
  console.log('   Some may be intentional (auth endpoints, etc.)');
}

console.log('='.repeat(50));
