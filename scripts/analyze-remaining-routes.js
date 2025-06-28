#!/usr/bin/env node

/**
 * Script to analyze remaining API routes using composeApiMiddleware
 * and sort them by risk level (mutations are higher risk).
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

// Risk levels for different HTTP methods
const methodRiskLevels = {
  DELETE: 5,
  PUT: 4,
  PATCH: 4,
  POST: 3,
  GET: 1,
  HEAD: 0,
  OPTIONS: 0,
};

async function findLegacyRoutes() {
  const apiDir = path.join(process.cwd(), 'src/pages/api');
  const files = glob.sync('**/*.{ts,tsx}', { cwd: apiDir });

  const legacyRoutes = [];

  for (const file of files) {
    const filePath = path.join(apiDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    if (content.includes('composeApiMiddleware')) {
      const route = analyzeRoute(filePath, content);
      if (route) {
        legacyRoutes.push(route);
      }
    }
  }

  return legacyRoutes;
}

function analyzeRoute(filePath, content) {
  const relativePath = path.relative(process.cwd(), filePath);
  const apiPath = relativePath
    .replace(/^src\/pages\/api/, '/api')
    .replace(/\.(ts|tsx)$/, '')
    .replace(/\/index$/, '');

  // Detect HTTP methods handled by the route
  const methods = detectMethods(content);

  // Calculate risk score based on methods
  const riskScore = Math.max(...methods.map(m => methodRiskLevels[m] || 0));

  // Check for tenant guard
  const hasTenantGuard = content.includes('resolveTenantId');

  // Check for validation
  const hasValidation =
    content.includes('schema:') || content.includes('withValidation');

  // Check for CSRF protection
  const hasCsrf = content.includes('withCsrf');

  // Calculate priority score for migration
  const isMutation = methods.some(m =>
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(m)
  );
  const needsTenant = isMutation && !hasTenantGuard;

  // Priority scoring: mutations without tenant guards are highest priority
  const priorityScore =
    (methods.includes('DELETE') ? 5 : 0) +
    (methods.includes('PUT') || methods.includes('PATCH') ? 4 : 0) +
    (methods.includes('POST') ? 3 : 0) +
    (needsTenant ? 3 : 0) +
    (!hasCsrf && isMutation ? 2 : 0) +
    (!hasValidation && isMutation ? 1 : 0);

  return {
    path: apiPath,
    file: relativePath,
    methods,
    riskScore,
    priorityScore,
    hasTenantGuard,
    hasValidation,
    hasCsrf,
    isMutation,
    needsTenant,
  };
}

function detectMethods(content) {
  const methods = new Set();

  // Common patterns for method checking
  const patterns = [
    /req\.method\s*===?\s*['"`](\w+)['"`]/g,
    /req\.method\s*!==?\s*['"`](\w+)['"`]/g,
    /case\s+['"`](\w+)['"`]\s*:/g,
    /\[['"](\w+)['"]\]\.includes\(req\.method/g,
    /methods:\s*\[([^\]]+)\]/g,
    /roleCheckMethods:\s*\[([^\]]+)\]/g,
  ];

  patterns.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        if (match[1].includes(',')) {
          // Handle arrays like ['GET', 'POST']
          match[1].split(',').forEach(m => {
            const method = m.trim().replace(/['"]/g, '').toUpperCase();
            if (method && methodRiskLevels.hasOwnProperty(method)) {
              methods.add(method);
            }
          });
        } else {
          const method = match[1].toUpperCase();
          if (methodRiskLevels.hasOwnProperty(method)) {
            methods.add(method);
          }
        }
      }
    }
  });

  // If no methods detected, assume it handles GET
  if (methods.size === 0) {
    methods.add('GET');
  }

  return Array.from(methods);
}

function formatOutput(routes) {
  // Sort by priority score first, then risk score
  routes.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    return b.riskScore - a.riskScore;
  });

  console.log(
    colors.bold +
      '\n📊 Remaining Routes Using composeApiMiddleware\n' +
      colors.reset
  );
  console.log(`Total routes found: ${routes.length}\n`);

  // Show top 10 priority routes
  console.log(
    colors.red +
      colors.bold +
      '🔥 TOP PRIORITY ROUTES FOR MIGRATION:\n' +
      colors.reset
  );
  const topPriority = routes.slice(0, 10);

  topPriority.forEach((route, index) => {
    console.log(`${colors.bold}${index + 1}.${colors.reset} ${route.path}`);
    console.log(
      `   Methods: ${route.methods.join(', ')} | Priority Score: ${route.priorityScore}`
    );
    console.log(`   File: ${colors.gray}${route.file}${colors.reset}`);

    const issues = [];
    if (route.needsTenant)
      issues.push(colors.red + '⚠️  Missing tenant guard!' + colors.reset);
    if (!route.hasCsrf)
      issues.push(colors.yellow + '⚠️  No CSRF protection' + colors.reset);
    if (!route.hasValidation && route.isMutation)
      issues.push(colors.yellow + '⚠️  No validation' + colors.reset);

    if (issues.length > 0) {
      issues.forEach(issue => console.log(`   ${issue}`));
    }
    console.log();
  });

  // Group by risk level
  const highRisk = routes.filter(r => r.riskScore >= 3);
  const mediumRisk = routes.filter(r => r.riskScore === 2);
  const lowRisk = routes.filter(r => r.riskScore <= 1);

  if (highRisk.length > 0) {
    console.log(
      colors.red +
        colors.bold +
        '🔴 HIGH RISK (Mutations) - ' +
        highRisk.length +
        ' routes' +
        colors.reset
    );
    console.log(
      colors.gray +
        'These modify data and MUST have tenant guards:\n' +
        colors.reset
    );

    highRisk.forEach(route => {
      console.log(`  ${colors.red}●${colors.reset} ${route.path}`);
      console.log(`    Methods: ${route.methods.join(', ')}`);
      console.log(`    File: ${colors.gray}${route.file}${colors.reset}`);

      const warnings = [];
      if (route.isMutation && !route.hasTenantGuard) {
        warnings.push(colors.red + '⚠️  Missing tenant guard!' + colors.reset);
      }
      if (!route.hasCsrf) {
        warnings.push(colors.yellow + '⚠️  No CSRF protection' + colors.reset);
      }
      if (
        !route.hasValidation &&
        route.methods.some(m => ['POST', 'PUT', 'PATCH'].includes(m))
      ) {
        warnings.push(
          colors.yellow + '⚠️  No validation schema' + colors.reset
        );
      }

      if (warnings.length > 0) {
        warnings.forEach(w => console.log(`    ${w}`));
      }
      console.log();
    });
  }

  if (mediumRisk.length > 0) {
    console.log(
      colors.yellow +
        colors.bold +
        '🟡 MEDIUM RISK - ' +
        mediumRisk.length +
        ' routes' +
        colors.reset
    );
    console.log(colors.gray + 'These may access tenant data:\n' + colors.reset);

    mediumRisk.forEach(route => {
      console.log(`  ${colors.yellow}●${colors.reset} ${route.path}`);
      console.log(`    Methods: ${route.methods.join(', ')}`);
      console.log(`    File: ${colors.gray}${route.file}${colors.reset}`);
      console.log();
    });
  }

  if (lowRisk.length > 0) {
    console.log(
      colors.green +
        colors.bold +
        '🟢 LOW RISK (Queries) - ' +
        lowRisk.length +
        ' routes' +
        colors.reset
    );
    console.log(
      colors.gray + 'These are read-only operations:\n' + colors.reset
    );

    lowRisk.forEach(route => {
      console.log(`  ${colors.green}●${colors.reset} ${route.path}`);
      console.log(`    File: ${colors.gray}${route.file}${colors.reset}`);
    });
  }

  // Summary statistics
  console.log(colors.bold + '\n📈 Summary:' + colors.reset);
  console.log(`  High Risk (mutations): ${highRisk.length}`);
  console.log(`  Medium Risk: ${mediumRisk.length}`);
  console.log(`  Low Risk (queries): ${lowRisk.length}`);
  console.log(`  Total: ${routes.length}`);

  // Migration command helper
  console.log(
    colors.blue + colors.bold + '\n🔧 Quick Migration Commands:' + colors.reset
  );
  console.log(
    colors.gray + '  # Count remaining legacy routes:' + colors.reset
  );
  console.log(
    '  grep -r "composeApiMiddleware" src/pages/api --include="*.ts" -c\n'
  );

  if (highRisk.length > 0) {
    console.log(
      colors.gray + '  # Open the next high-risk file:' + colors.reset
    );
    console.log(`  code ${highRisk[0].file}\n`);
  }
}

// Main execution
async function main() {
  try {
    console.log(colors.blue + 'Analyzing API routes...\n' + colors.reset);

    const routes = await findLegacyRoutes();

    if (routes.length === 0) {
      console.log(
        colors.green +
          colors.bold +
          '✅ No routes using composeApiMiddleware found!' +
          colors.reset
      );
      console.log('Migration is complete! 🎉');
      return;
    }

    formatOutput(routes);
  } catch (error) {
    console.error(colors.red + 'Error analyzing routes:' + colors.reset, error);
    process.exit(1);
  }
}

// Check if glob is installed
try {
  require('glob');
} catch (e) {
  console.log(
    colors.yellow + 'Installing required dependency: glob' + colors.reset
  );
  require('child_process').execSync('npm install --no-save glob', {
    stdio: 'inherit',
  });
}

main();
