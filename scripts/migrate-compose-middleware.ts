#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface ApiRoute {
  file: string;
  relativePath: string;
  methods: string[];
  hasTenantResolver: boolean;
  hasSchema: boolean;
  hasRoleCheck: boolean;
  hasRateLimit: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

// Analyze a file to determine its characteristics
function analyzeApiRoute(filePath: string): ApiRoute | null {
  const content = fs.readFileSync(filePath, 'utf8');

  // Skip if doesn't use composeApiMiddleware
  if (!content.includes('composeApiMiddleware')) {
    return null;
  }

  const relativePath = path.relative(process.cwd(), filePath);

  // Extract HTTP methods
  const methods: string[] = [];
  const methodPatterns = [
    /method === ['"](\w+)['"]/g,
    /method == ['"](\w+)['"]/g,
    /\['(GET|POST|PUT|PATCH|DELETE)'\]/g,
    /req\.method !== ['"](\w+)['"]/g,
  ];

  methodPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (match[1] && !methods.includes(match[1])) {
        methods.push(match[1]);
      }
    }
  });

  // Check for mutation methods
  const mutationMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  const hasMutations = methods.some(m => mutationMethods.includes(m));

  // Check for various middleware options
  const hasTenantResolver = content.includes('resolveTenantId');
  const hasSchema = content.includes('schema:') || content.includes('schema,');
  const hasRoleCheck =
    content.includes('requiredRole:') || content.includes('requiredRole,');
  const hasRateLimit =
    content.includes('rateLimit:') || content.includes('rateLimit,');

  // Determine priority
  let priority: 'critical' | 'high' | 'medium' | 'low' = 'low';

  if (relativePath.includes('/auth/') || relativePath.includes('/health')) {
    priority = 'low'; // Auth and health endpoints
  } else if (hasMutations && !hasTenantResolver) {
    priority = 'critical'; // Mutations without tenant validation!
  } else if (hasMutations) {
    priority = 'high'; // All other mutations
  } else {
    priority = 'medium'; // GET endpoints
  }

  return {
    file: filePath,
    relativePath,
    methods: methods.length > 0 ? methods : ['Unknown'],
    hasTenantResolver,
    hasSchema,
    hasRoleCheck,
    hasRateLimit,
    priority,
  };
}

// Main analysis
async function main() {
  console.log('🔍 Analyzing API routes using composeApiMiddleware...\n');

  const apiFiles = await glob('src/pages/api/**/*.{ts,tsx}');
  const routes: ApiRoute[] = [];

  for (const file of apiFiles) {
    const route = analyzeApiRoute(file);
    if (route) {
      routes.push(route);
    }
  }

  // Group by priority
  const critical = routes.filter(r => r.priority === 'critical');
  const high = routes.filter(r => r.priority === 'high');
  const medium = routes.filter(r => r.priority === 'medium');
  const low = routes.filter(r => r.priority === 'low');

  console.log(`📊 Total routes to migrate: ${routes.length}\n`);
  console.log(
    `🚨 Critical Priority (Mutations without tenant validation): ${critical.length}`
  );
  console.log(`🔴 High Priority (Mutations with validation): ${high.length}`);
  console.log(`🟡 Medium Priority (GET endpoints): ${medium.length}`);
  console.log(`🟢 Low Priority (Auth/Health/System): ${low.length}\n`);

  // Show critical issues
  if (critical.length > 0) {
    console.log(
      '⚠️  CRITICAL SECURITY ISSUES - Mutations without tenant validation:\n'
    );
    critical.forEach(route => {
      console.log(`  ${route.relativePath}`);
      console.log(`    Methods: ${route.methods.join(', ')}`);
    });
    console.log('');
  }

  // Create migration plan
  const migrationPlan = {
    summary: {
      total: routes.length,
      critical: critical.length,
      high: high.length,
      medium: medium.length,
      low: low.length,
    },
    routes: {
      critical: critical.map(r => ({
        path: r.relativePath,
        methods: r.methods,
        missingTenantValidation: !r.hasTenantResolver,
      })),
      high: high.map(r => ({
        path: r.relativePath,
        methods: r.methods,
      })),
      medium: medium.slice(0, 10).map(r => ({
        // First 10 only
        path: r.relativePath,
        methods: r.methods,
      })),
    },
  };

  // Save migration plan
  fs.writeFileSync(
    'scripts/compose-middleware-migration-plan.json',
    JSON.stringify(migrationPlan, null, 2)
  );

  console.log(
    '📝 Migration plan saved to: scripts/compose-middleware-migration-plan.json\n'
  );

  // Show next steps
  console.log('🎯 Recommended Migration Order:\n');
  console.log(
    '1. Fix CRITICAL issues first (mutations without tenant validation)'
  );
  console.log('2. Migrate other mutation endpoints (POST/PUT/PATCH/DELETE)');
  console.log('3. Migrate GET endpoints with sensitive data');
  console.log('4. Finally migrate auth/health/system endpoints\n');

  // Show example migration
  if (routes.length > 0) {
    const example =
      routes.find(r => r.priority === 'high' && r.hasTenantResolver) ||
      routes[0];
    console.log('📚 Example migration pattern:\n');
    console.log(`File: ${example.relativePath}`);
    console.log(
      'See: src/pages/api/projects/index.ts for reference implementation'
    );
  }
}

main().catch(console.error);
