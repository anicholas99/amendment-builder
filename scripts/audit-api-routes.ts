import * as fs from 'fs';
import * as path from 'path';

interface RouteAnalysis {
  filePath: string;
  usesMiddleware: boolean;
  hasSchema: boolean;
  hasQuerySchema: boolean;
  hasTenantGuard: boolean;
  hasRoleCheck: boolean;
  roleCheckDetails?: string;
}

async function analyzeApiRoute(filePath: string): Promise<RouteAnalysis> {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Check for composeApiMiddleware
  const usesMiddleware = content.includes('composeApiMiddleware');

  // Check for schema (body validation)
  // Look for either "schema:" or "bodySchema" patterns
  const hasSchema =
    /(?:schema:|bodySchema)\s*[=:]/i.test(content) ||
    /const\s+\w*[Ss]chema\s*=\s*z\.object/i.test(content);

  // Check for querySchema
  const hasQuerySchema =
    /querySchema\s*[=:]/i.test(content) ||
    /const\s+query[Ss]chema\s*=\s*z\.object/i.test(content);

  // Check for tenant guard
  const hasTenantGuard =
    content.includes('withTenantGuard') || content.includes('resolveTenantId');

  // Check for role-based access
  const roleCheckMatch = content.match(
    /req\.user\?.role\s*[!=]=\s*['"](\w+)['"]/
  );
  const requireRoleMatch = content.match(/requireRole\(['"](\w+)['"]\)/);
  const requiredRoleMatch = content.match(/requiredRole:\s*['"](\w+)['"]/);
  const hasRoleCheck =
    !!roleCheckMatch || !!requireRoleMatch || !!requiredRoleMatch;

  let roleCheckDetails: string | undefined;
  if (roleCheckMatch) {
    roleCheckDetails = roleCheckMatch[1];
  } else if (requireRoleMatch) {
    roleCheckDetails = requireRoleMatch[1];
  } else if (requiredRoleMatch) {
    roleCheckDetails = requiredRoleMatch[1];
  }

  return {
    filePath,
    usesMiddleware,
    hasSchema,
    hasQuerySchema,
    hasTenantGuard,
    hasRoleCheck,
    roleCheckDetails,
  };
}

async function analyzeAllRoutes() {
  const apiDir = path.join(process.cwd(), 'src', 'pages', 'api');
  const results: RouteAnalysis[] = [];

  function findTsFiles(dir: string): string[] {
    const files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== '__tests__') {
        files.push(...findTsFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  const files = findTsFiles(apiDir).sort();

  for (const file of files) {
    const analysis = await analyzeApiRoute(file);
    results.push(analysis);
  }

  // Generate markdown table
  console.log('## API Route Validation & Security Progress\n');
  console.log(`**Total API Routes:** ${results.length}\n`);

  // Calculate statistics
  const stats = {
    withMiddleware: results.filter(r => r.usesMiddleware).length,
    withSchema: results.filter(r => r.hasSchema).length,
    withQuerySchema: results.filter(r => r.hasQuerySchema).length,
    withTenantGuard: results.filter(r => r.hasTenantGuard).length,
    withRoleCheck: results.filter(r => r.hasRoleCheck).length,
  };

  console.log('### Coverage Statistics\n');
  console.log(
    `- **Uses Middleware:** ${stats.withMiddleware}/${results.length} (${Math.round((stats.withMiddleware / results.length) * 100)}%)`
  );
  console.log(
    `- **Has Body Validation (schema):** ${stats.withSchema}/${results.length} (${Math.round((stats.withSchema / results.length) * 100)}%)`
  );
  console.log(
    `- **Has Query Validation (querySchema):** ${stats.withQuerySchema}/${results.length} (${Math.round((stats.withQuerySchema / results.length) * 100)}%)`
  );
  console.log(
    `- **Has Tenant Guard:** ${stats.withTenantGuard}/${results.length} (${Math.round((stats.withTenantGuard / results.length) * 100)}%)`
  );
  console.log(
    `- **Has Role Check:** ${stats.withRoleCheck}/${results.length} (${Math.round((stats.withRoleCheck / results.length) * 100)}%)\n`
  );

  console.log('### Detailed Route Analysis\n');
  console.log(
    '| File Path | Uses Middleware | schema | querySchema | Tenant Guard | Role Check |'
  );
  console.log(
    '|-----------|-----------------|--------|-------------|--------------|------------|'
  );

  for (const result of results) {
    const relativePath = path
      .relative(process.cwd(), result.filePath)
      .replace(/\\/g, '/');
    const middleware = result.usesMiddleware ? '✅' : '❌';
    const schema = result.hasSchema ? '✅' : '❌';
    const querySchema = result.hasQuerySchema ? '✅' : '❌';
    const tenantGuard = result.hasTenantGuard ? '✅' : '❌';
    const roleCheck = result.hasRoleCheck
      ? `✅ (${result.roleCheckDetails})`
      : '❌';

    console.log(
      `| \`${relativePath}\` | ${middleware} | ${schema} | ${querySchema} | ${tenantGuard} | ${roleCheck} |`
    );
  }

  // List routes that need attention
  console.log('\n### Routes Needing Attention\n');

  const routesWithoutMiddleware = results.filter(r => !r.usesMiddleware);
  if (routesWithoutMiddleware.length > 0) {
    console.log('#### Missing `composeApiMiddleware`:\n');
    routesWithoutMiddleware.forEach(r => {
      console.log(
        `- \`${path.relative(process.cwd(), r.filePath).replace(/\\/g, '/')}\``
      );
    });
    console.log('');
  }

  const routesWithoutValidation = results.filter(
    r => r.usesMiddleware && !r.hasSchema && !r.hasQuerySchema
  );
  if (routesWithoutValidation.length > 0) {
    console.log('#### Using Middleware but No Validation:\n');
    routesWithoutValidation.forEach(r => {
      console.log(
        `- \`${path.relative(process.cwd(), r.filePath).replace(/\\/g, '/')}\``
      );
    });
    console.log('');
  }

  const routesWithoutTenantGuard = results.filter(
    r => r.usesMiddleware && !r.hasTenantGuard
  );
  if (routesWithoutTenantGuard.length > 0) {
    console.log('#### Missing Tenant Guard:\n');
    routesWithoutTenantGuard.forEach(r => {
      console.log(
        `- \`${path.relative(process.cwd(), r.filePath).replace(/\\/g, '/')}\``
      );
    });
  }
}

// Run the analysis
analyzeAllRoutes().catch(console.error);
