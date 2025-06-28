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
  hasRateLimit: boolean;
  lineCount: number;
  anyTypeUsage: number;
  hasTestFile: boolean;
}

interface AnyTypeUsage {
  line: number;
  context: string;
}

async function analyzeApiRoute(filePath: string): Promise<RouteAnalysis> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Check for composeApiMiddleware
  const usesMiddleware = content.includes('composeApiMiddleware');

  // Check for schema (body validation)
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

  // Check for rate limiting
  const hasRateLimit =
    content.includes('rateLimit') ||
    content.includes('rateLimitOptions') ||
    content.includes('withRateLimit');

  // Count any type usage
  const anyTypePattern = /:\s*any\b|as\s+any\b/g;
  const anyTypeMatches = content.match(anyTypePattern) || [];
  const anyTypeUsage = anyTypeMatches.length;

  // Check for test file
  const testFileName = path.basename(filePath, '.ts') + '.test.ts';
  const testDir = path.join(path.dirname(filePath), '__tests__');
  const testFilePath = path.join(testDir, testFileName);
  const hasTestFile = fs.existsSync(testFilePath);

  return {
    filePath,
    usesMiddleware,
    hasSchema,
    hasQuerySchema,
    hasTenantGuard,
    hasRoleCheck,
    roleCheckDetails,
    hasRateLimit,
    lineCount: lines.length,
    anyTypeUsage,
    hasTestFile,
  };
}

function findAnyTypeUsages(filePath: string): AnyTypeUsage[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const usages: AnyTypeUsage[] = [];

  lines.forEach((line, index) => {
    if (/:\s*any\b|as\s+any\b/.test(line)) {
      usages.push({
        line: index + 1,
        context: line.trim(),
      });
    }
  });

  return usages;
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
      } else if (
        entry.isFile() &&
        entry.name.endsWith('.ts') &&
        !entry.name.endsWith('.test.ts') &&
        !entry.name.endsWith('.bak')
      ) {
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

  // Generate enhanced markdown report
  console.log('# 🔒 API Route Security & Quality Audit Report\n');
  console.log(`**Generated:** ${new Date().toISOString()}`);
  console.log(`**Total API Routes:** ${results.length}\n`);

  // Calculate statistics
  const stats = {
    withMiddleware: results.filter(r => r.usesMiddleware).length,
    withSchema: results.filter(r => r.hasSchema).length,
    withQuerySchema: results.filter(r => r.hasQuerySchema).length,
    withTenantGuard: results.filter(r => r.hasTenantGuard).length,
    withRoleCheck: results.filter(r => r.hasRoleCheck).length,
    withRateLimit: results.filter(r => r.hasRateLimit).length,
    withTests: results.filter(r => r.hasTestFile).length,
    largeFiles: results.filter(r => r.lineCount > 700).length,
    filesWithAny: results.filter(r => r.anyTypeUsage > 0).length,
    totalAnyUsage: results.reduce((sum, r) => sum + r.anyTypeUsage, 0),
  };

  console.log('## 📊 Coverage Statistics\n');
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
    `- **Has Role Check:** ${stats.withRoleCheck}/${results.length} (${Math.round((stats.withRoleCheck / results.length) * 100)}%)`
  );
  console.log(
    `- **Has Rate Limiting:** ${stats.withRateLimit}/${results.length} (${Math.round((stats.withRateLimit / results.length) * 100)}%)`
  );
  console.log(
    `- **Has Test Files:** ${stats.withTests}/${results.length} (${Math.round((stats.withTests / results.length) * 100)}%)`
  );
  console.log(`- **Files > 700 lines:** ${stats.largeFiles}`);
  console.log(
    `- **Files with \`any\` type:** ${stats.filesWithAny} (${stats.totalAnyUsage} total usages)\n`
  );

  // Issue summary
  console.log('## 🚨 Issue Summary\n');
  console.log(
    `1. **Missing Tenant Guard:** ${results.filter(r => r.usesMiddleware && !r.hasTenantGuard).length} routes`
  );
  console.log(
    `2. **Missing Body Validation:** ${results.filter(r => r.usesMiddleware && !r.hasSchema && !r.hasQuerySchema).length} routes`
  );
  console.log(
    `3. **No Middleware:** ${results.filter(r => !r.usesMiddleware).length} routes`
  );
  console.log(`4. **Large Files (>700 lines):** ${stats.largeFiles} files`);
  console.log(`5. **Using \`any\` type:** ${stats.filesWithAny} files`);
  console.log(
    `6. **Missing Tests:** ${results.filter(r => !r.hasTestFile).length} routes`
  );
  console.log(
    `7. **Missing Rate Limiting:** ${results.filter(r => !r.hasRateLimit).length} routes\n`
  );

  // Files over 700 lines
  const largeFiles = results.filter(r => r.lineCount > 700);
  if (largeFiles.length > 0) {
    console.log('## 📏 Large Files (>700 lines)\n');
    console.log('These files should be refactored into smaller modules:\n');
    largeFiles
      .sort((a, b) => b.lineCount - a.lineCount)
      .forEach(r => {
        const relativePath = path
          .relative(process.cwd(), r.filePath)
          .replace(/\\/g, '/');
        console.log(`- \`${relativePath}\` (${r.lineCount} lines)`);
      });
    console.log('');
  }

  // Files with any type usage
  const filesWithAny = results.filter(r => r.anyTypeUsage > 0);
  if (filesWithAny.length > 0) {
    console.log('## ⚠️ TypeScript `any` Usage\n');
    filesWithAny
      .sort((a, b) => b.anyTypeUsage - a.anyTypeUsage)
      .forEach(r => {
        const relativePath = path
          .relative(process.cwd(), r.filePath)
          .replace(/\\/g, '/');
        console.log(
          `### \`${relativePath}\` (${r.anyTypeUsage} occurrences)\n`
        );

        const usages = findAnyTypeUsages(r.filePath);
        usages.slice(0, 5).forEach(usage => {
          console.log(`- Line ${usage.line}: \`${usage.context}\``);
        });
        if (usages.length > 5) {
          console.log(`- ... and ${usages.length - 5} more\n`);
        } else {
          console.log('');
        }
      });
  }

  // Missing test files
  const missingTests = results.filter(r => !r.hasTestFile);
  if (missingTests.length > 0) {
    console.log('## 🧪 Routes Missing Test Files\n');
    console.log('Consider adding test coverage for these routes:\n');
    missingTests.forEach(r => {
      const relativePath = path
        .relative(process.cwd(), r.filePath)
        .replace(/\\/g, '/');
      console.log(`- \`${relativePath}\``);
    });
    console.log('');
  }

  // Missing rate limiting
  const missingRateLimit = results.filter(r => !r.hasRateLimit);
  if (missingRateLimit.length > 0) {
    console.log('## ⏱️ Routes Without Rate Limiting\n');
    console.log('Consider adding rate limiting to prevent abuse:\n');
    // Only show top 20 to avoid overwhelming output
    missingRateLimit.slice(0, 20).forEach(r => {
      const relativePath = path
        .relative(process.cwd(), r.filePath)
        .replace(/\\/g, '/');
      console.log(`- \`${relativePath}\``);
    });
    if (missingRateLimit.length > 20) {
      console.log(`- ... and ${missingRateLimit.length - 20} more\n`);
    } else {
      console.log('');
    }
  }

  // Detailed route analysis table
  console.log('## 📋 Detailed Route Analysis\n');
  console.log(
    '| File | Lines | Middleware | Schema | Query | Tenant | Role | Rate | Test | Any |'
  );
  console.log(
    '|------|-------|------------|--------|-------|--------|------|------|------|-----|'
  );

  for (const result of results) {
    const relativePath = path
      .relative(process.cwd(), result.filePath)
      .replace(/\\/g, '/');
    const shortPath = relativePath.replace('src/pages/api/', '');
    const middleware = result.usesMiddleware ? '✅' : '❌';
    const schema = result.hasSchema ? '✅' : '❌';
    const querySchema = result.hasQuerySchema ? '✅' : '❌';
    const tenantGuard = result.hasTenantGuard ? '✅' : '❌';
    const roleCheck = result.hasRoleCheck ? `✅` : '❌';
    const rateLimit = result.hasRateLimit ? '✅' : '❌';
    const hasTest = result.hasTestFile ? '✅' : '❌';
    const anyType =
      result.anyTypeUsage > 0 ? `⚠️ (${result.anyTypeUsage})` : '✅';
    const lineIndicator =
      result.lineCount > 700
        ? `⚠️ ${result.lineCount}`
        : result.lineCount.toString();

    console.log(
      `| \`${shortPath}\` | ${lineIndicator} | ${middleware} | ${schema} | ${querySchema} | ${tenantGuard} | ${roleCheck} | ${rateLimit} | ${hasTest} | ${anyType} |`
    );
  }

  // Critical security issues
  console.log('\n## 🔴 Critical Security Issues\n');

  const routesWithoutMiddleware = results.filter(r => !r.usesMiddleware);
  if (routesWithoutMiddleware.length > 0) {
    console.log('### Missing `composeApiMiddleware`:\n');
    routesWithoutMiddleware.forEach(r => {
      const relativePath = path
        .relative(process.cwd(), r.filePath)
        .replace(/\\/g, '/');
      console.log(`- \`${relativePath}\``);
    });
    console.log('');
  }

  const mutationRoutesWithoutGuard = results.filter(r => {
    const content = fs.readFileSync(r.filePath, 'utf-8');
    const hasMutation = /case\s+['"]?(POST|PUT|PATCH|DELETE)['"]?\s*:/i.test(
      content
    );
    return hasMutation && !r.hasTenantGuard && r.usesMiddleware;
  });

  if (mutationRoutesWithoutGuard.length > 0) {
    console.log('### Mutation Routes Without Tenant Guard:\n');
    mutationRoutesWithoutGuard.forEach(r => {
      const relativePath = path
        .relative(process.cwd(), r.filePath)
        .replace(/\\/g, '/');
      console.log(`- \`${relativePath}\``);
    });
    console.log('');
  }

  // Intentionally public routes
  console.log('## ✅ Intentionally Public/Exempt Routes\n');
  const publicRoutes = [
    'auth/[...auth0].ts',
    'auth/login.ts',
    'auth/session.ts',
    'csrf-token.ts',
    'health.ts',
    'swagger.ts',
  ];

  console.log(
    'These routes are intentionally public or handle their own auth:\n'
  );
  publicRoutes.forEach(route => {
    console.log(`- \`src/pages/api/${route}\``);
  });

  // Recommendations
  console.log('\n## 💡 Recommendations\n');
  console.log(
    '1. **Refactor large files** - Move business logic to `src/lib/services/`'
  );
  console.log(
    '2. **Add missing validation** - Use Zod schemas for all request inputs'
  );
  console.log(
    '3. **Implement tenant guards** - All mutation routes need `withTenantGuard`'
  );
  console.log(
    '4. **Remove `any` types** - Use proper TypeScript types for better safety'
  );
  console.log(
    '5. **Add rate limiting** - Protect endpoints from abuse with rate limits'
  );
  console.log(
    '6. **Write tests** - Aim for 80%+ test coverage on critical routes'
  );
}

// Run the analysis
analyzeAllRoutes().catch(console.error);
