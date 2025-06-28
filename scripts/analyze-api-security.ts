#!/usr/bin/env tsx
/**
 * Analyze API endpoints for security features
 * Used by SOC 2 compliance reporting
 */

import { readFileSync } from 'fs';
import { glob } from 'glob';
import * as path from 'path';

interface SecurityMetrics {
  totalEndpoints: number;
  endpointsWithAuth: number;
  endpointsWithValidation: number;
  endpointsWithTenantGuard: number;
  endpointsWithRoleCheck: number;
  endpointsWithRateLimit: number;
  endpointsWithCsrf: number;
  rateLimitTypes: Record<string, number>;
}

async function analyzeEndpoint(filePath: string): Promise<{
  hasAuth: boolean;
  hasValidation: boolean;
  hasTenantGuard: boolean;
  hasRoleCheck: boolean;
  hasRateLimit: boolean;
  hasCsrf: boolean;
  rateLimitType?: string;
}> {
  const content = readFileSync(filePath, 'utf-8');

  // Check for various security features
  const hasAuth =
    content.includes('composeApiMiddleware') ||
    content.includes('withAuth') ||
    content.includes('getServerSidePropsWithAuth');

  const hasValidation =
    content.includes('schema:') ||
    content.includes('querySchema:') ||
    content.includes('withValidation');

  const hasTenantGuard =
    content.includes('resolveTenantId') ||
    content.includes('withTenantGuard') ||
    content.includes('requireTenant: false') || // Explicitly disabled counts as handled
    content.includes('requireTenant:false');

  const hasRoleCheck =
    content.includes('requiredRole:') || content.includes('requireRole');

  // Check for rate limiting - both object and string configurations
  const hasRateLimit = content.includes('rateLimit:');
  let rateLimitType: string | undefined;

  if (hasRateLimit) {
    // Try to extract rate limit type
    const rateLimitMatch = content.match(/rateLimit:\s*['"](\w+)['"]/);
    if (rateLimitMatch) {
      rateLimitType = rateLimitMatch[1];
    } else if (content.includes('rateLimit: {')) {
      rateLimitType = 'custom';
    }
  }

  const hasCsrf =
    content.includes('withCsrf') ||
    content.includes('csrf:') ||
    content.includes('csrfToken');

  return {
    hasAuth,
    hasValidation,
    hasTenantGuard,
    hasRoleCheck,
    hasRateLimit,
    hasCsrf,
    rateLimitType,
  };
}

async function main() {
  console.log('🔍 Analyzing API endpoints for security features...\n');

  // Find all API route files
  const apiFiles = await glob('src/pages/api/**/*.{ts,tsx}', {
    ignore: ['**/*.test.ts', '**/*.spec.ts', '**/test-*.ts'],
  });

  console.log(`Found ${apiFiles.length} API endpoints\n`);

  const metrics: SecurityMetrics = {
    totalEndpoints: apiFiles.length,
    endpointsWithAuth: 0,
    endpointsWithValidation: 0,
    endpointsWithTenantGuard: 0,
    endpointsWithRoleCheck: 0,
    endpointsWithRateLimit: 0,
    endpointsWithCsrf: 0,
    rateLimitTypes: {},
  };

  const endpointDetails: Array<{
    endpoint: string;
    features: Awaited<ReturnType<typeof analyzeEndpoint>>;
  }> = [];

  for (const file of apiFiles) {
    const features = await analyzeEndpoint(file);
    const endpoint = file
      .replace('src/pages/api/', '/api/')
      .replace(/\.(ts|tsx)$/, '');

    endpointDetails.push({ endpoint, features });

    if (features.hasAuth) metrics.endpointsWithAuth++;
    if (features.hasValidation) metrics.endpointsWithValidation++;
    if (features.hasTenantGuard) metrics.endpointsWithTenantGuard++;
    if (features.hasRoleCheck) metrics.endpointsWithRoleCheck++;
    if (features.hasRateLimit) {
      metrics.endpointsWithRateLimit++;
      if (features.rateLimitType) {
        metrics.rateLimitTypes[features.rateLimitType] =
          (metrics.rateLimitTypes[features.rateLimitType] || 0) + 1;
      }
    }
    if (features.hasCsrf) metrics.endpointsWithCsrf++;
  }

  // Print summary
  console.log('📊 Security Feature Coverage:\n');
  console.log(
    `Authentication:     ${metrics.endpointsWithAuth}/${metrics.totalEndpoints} (${((metrics.endpointsWithAuth / metrics.totalEndpoints) * 100).toFixed(1)}%)`
  );
  console.log(
    `Validation:         ${metrics.endpointsWithValidation}/${metrics.totalEndpoints} (${((metrics.endpointsWithValidation / metrics.totalEndpoints) * 100).toFixed(1)}%)`
  );
  console.log(
    `Tenant Guard:       ${metrics.endpointsWithTenantGuard}/${metrics.totalEndpoints} (${((metrics.endpointsWithTenantGuard / metrics.totalEndpoints) * 100).toFixed(1)}%)`
  );
  console.log(
    `Role-Based Access:  ${metrics.endpointsWithRoleCheck}/${metrics.totalEndpoints} (${((metrics.endpointsWithRoleCheck / metrics.totalEndpoints) * 100).toFixed(1)}%)`
  );
  console.log(
    `Rate Limiting:      ${metrics.endpointsWithRateLimit}/${metrics.totalEndpoints} (${((metrics.endpointsWithRateLimit / metrics.totalEndpoints) * 100).toFixed(1)}%)`
  );
  console.log(
    `CSRF Protection:    ${metrics.endpointsWithCsrf}/${metrics.totalEndpoints} (${((metrics.endpointsWithCsrf / metrics.totalEndpoints) * 100).toFixed(1)}%)`
  );

  if (Object.keys(metrics.rateLimitTypes).length > 0) {
    console.log('\n📈 Rate Limit Types:');
    for (const [type, count] of Object.entries(metrics.rateLimitTypes)) {
      console.log(`  ${type}: ${count} endpoints`);
    }
  }

  // Show endpoints without rate limiting
  const endpointsWithoutRateLimit = endpointDetails
    .filter(({ features }) => !features.hasRateLimit)
    .map(({ endpoint }) => endpoint);

  if (endpointsWithoutRateLimit.length > 0) {
    console.log('\n⚠️  Endpoints without rate limiting:');
    endpointsWithoutRateLimit.slice(0, 10).forEach(endpoint => {
      console.log(`  - ${endpoint}`);
    });
    if (endpointsWithoutRateLimit.length > 10) {
      console.log(`  ... and ${endpointsWithoutRateLimit.length - 10} more`);
    }
  }

  // Export metrics for use by other scripts
  const metricsPath = path.join(
    process.cwd(),
    'scripts/api-security-metrics.json'
  );
  const fs = await import('fs');
  fs.writeFileSync(
    metricsPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        metrics,
        endpointDetails,
      },
      null,
      2
    )
  );

  console.log(`\n✅ Metrics saved to: ${metricsPath}`);

  // Provide recommendations
  console.log('\n💡 Recommendations:');
  if (metrics.endpointsWithRateLimit < metrics.totalEndpoints * 0.8) {
    console.log(
      '  - Add rate limiting to more endpoints (target: 80%+ coverage)'
    );
  }
  if (metrics.endpointsWithValidation < metrics.totalEndpoints * 0.7) {
    console.log(
      '  - Add input validation to more endpoints (target: 70%+ coverage)'
    );
  }
  if (metrics.endpointsWithTenantGuard < metrics.totalEndpoints * 0.9) {
    console.log('  - Ensure tenant isolation on data-modifying endpoints');
  }

  // Return exit code based on coverage
  const rateLimitCoverage =
    metrics.endpointsWithRateLimit / metrics.totalEndpoints;
  if (rateLimitCoverage < 0.5) {
    console.log('\n❌ Rate limiting coverage is below 50%');
    process.exit(1);
  }
}

main().catch(console.error);
