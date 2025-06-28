const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Detect API routes with mutations that might be missing tenant guards
 */
function detectUnguardedMutations() {
  console.log('🔍 Scanning for unguarded mutations...\n');

  const apiDir = path.join(process.cwd(), 'src/pages/api');
  const files = glob.sync('**/*.ts', { cwd: apiDir });

  const unguardedRoutes = [];
  const mutationMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  for (const file of files) {
    const filePath = path.join(apiDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Skip test files
    if (file.includes('.test.') || file.includes('.spec.')) continue;

    // Detect methods used in the route
    const methods = detectMethods(content);
    const hasMutations = methods.some(m => mutationMethods.includes(m));

    if (!hasMutations && methods.length === 0) {
      // If we can't detect methods, check for common patterns
      const likelyMutation =
        content.includes('create') ||
        content.includes('update') ||
        content.includes('delete') ||
        content.includes('POST') ||
        content.includes('PUT') ||
        content.includes('PATCH') ||
        content.includes('DELETE');

      if (likelyMutation) {
        methods.push('UNKNOWN_MUTATION');
      }
    }

    if (hasMutations || methods.includes('UNKNOWN_MUTATION')) {
      const route = {
        file,
        methods,
        hasTenantGuard: detectTenantGuard(content),
        hasAuth: detectAuth(content),
        hasCsrf: detectCsrf(content),
        usesLegacyMiddleware: detectLegacyMiddleware(content),
      };

      // Flag routes that are missing tenant guards
      if (!route.hasTenantGuard && !route.usesLegacyMiddleware) {
        unguardedRoutes.push(route);
      }
    }
  }

  // Sort by risk (routes without auth are highest risk)
  unguardedRoutes.sort((a, b) => {
    if (!a.hasAuth && b.hasAuth) return -1;
    if (a.hasAuth && !b.hasAuth) return 1;
    if (!a.hasCsrf && b.hasCsrf) return -1;
    if (a.hasCsrf && !b.hasCsrf) return 1;
    return 0;
  });

  // Report findings
  if (unguardedRoutes.length === 0) {
    console.log(
      '✅ All mutation routes have tenant guards or use legacy middleware!\n'
    );
  } else {
    console.log(
      `⚠️  Found ${unguardedRoutes.length} mutation routes without tenant guards:\n`
    );

    console.log('🔴 CRITICAL - No Auth:');
    const noAuth = unguardedRoutes.filter(r => !r.hasAuth);
    if (noAuth.length === 0) {
      console.log('  None found ✅\n');
    } else {
      noAuth.forEach(r => {
        console.log(`  ${r.file}`);
        console.log(`    Methods: ${r.methods.join(', ')}`);
        console.log(
          `    Missing: Auth, Tenant Guard${!r.hasCsrf ? ', CSRF' : ''}\n`
        );
      });
    }

    console.log('🟡 HIGH RISK - Has Auth but no Tenant Guard:');
    const hasAuthNoGuard = unguardedRoutes.filter(r => r.hasAuth);
    if (hasAuthNoGuard.length === 0) {
      console.log('  None found ✅\n');
    } else {
      hasAuthNoGuard.forEach(r => {
        console.log(`  ${r.file}`);
        console.log(`    Methods: ${r.methods.join(', ')}`);
        console.log(`    Missing: Tenant Guard${!r.hasCsrf ? ', CSRF' : ''}\n`);
      });
    }
  }

  // Summary statistics
  console.log('📊 Security Coverage Summary:');
  const totalMutations = files.filter(f => {
    const content = fs.readFileSync(path.join(apiDir, f), 'utf-8');
    const methods = detectMethods(content);
    return methods.some(m => mutationMethods.includes(m));
  }).length;

  const withTenantGuards = totalMutations - unguardedRoutes.length;
  const percentage = ((withTenantGuards / totalMutations) * 100).toFixed(1);

  console.log(`  Total mutation routes: ${totalMutations}`);
  console.log(`  With tenant guards: ${withTenantGuards} (${percentage}%)`);
  console.log(`  Missing tenant guards: ${unguardedRoutes.length}`);

  // Exit with error if unguarded mutations found
  if (unguardedRoutes.length > 0) {
    console.log('\n❌ Security check failed: Unguarded mutations detected!');
    process.exit(1);
  } else {
    console.log(
      '\n✅ Security check passed: All mutations are properly guarded!'
    );
  }
}

function detectMethods(content) {
  const methods = [];

  // Check for method checks in handler
  const methodPatterns = [
    /req\.method\s*===?\s*['"](\w+)['"]/g,
    /method\s*===?\s*['"](\w+)['"]/g,
    /case\s+['"](\w+)['"]/g,
  ];

  methodPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (match[1]) methods.push(match[1]);
    }
  });

  // Check for withMethod usage
  const withMethodMatch = content.match(/withMethod\s*\(\s*['"](\w+)['"]/);
  if (withMethodMatch && withMethodMatch[1]) {
    methods.push(withMethodMatch[1]);
  }

  // Remove duplicates
  return [...new Set(methods)];
}

function detectTenantGuard(content) {
  return (
    content.includes('withTenantGuard') ||
    content.includes('resolveTenantId') ||
    content.includes('tenant guard applied via composeApiMiddleware')
  );
}

function detectAuth(content) {
  return (
    content.includes('withAuth') ||
    content.includes('req.user') ||
    content.includes('authentication required')
  );
}

function detectCsrf(content) {
  return content.includes('withCsrf') || content.includes('csrf protection');
}

function detectLegacyMiddleware(content) {
  return content.includes('composeApiMiddleware');
}

// Run the detection
detectUnguardedMutations();
