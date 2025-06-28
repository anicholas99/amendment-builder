#!/usr/bin/env node

/**
 * Real-time progress tracker for middleware migration
 * Shows current status, progress bar, and next actions
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
  clear: '\x1b[2J\x1b[H', // Clear screen
};

// Progress bar characters
const progressChars = {
  complete: '█',
  incomplete: '░',
  arrow: '►',
};

function getRouteStats() {
  const apiDir = path.join(process.cwd(), 'src/pages/api');
  const files = glob.sync('**/*.{ts,tsx}', { cwd: apiDir });

  let totalRoutes = 0;
  let migratedRoutes = 0;
  const legacyRoutes = [];
  const routesByType = {
    mutations: { total: 0, migrated: 0 },
    queries: { total: 0, migrated: 0 },
  };

  for (const file of files) {
    const filePath = path.join(apiDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Skip test files and type definitions
    if (file.includes('.test.') || file.includes('.d.ts')) continue;

    totalRoutes++;

    const hasLegacyMiddleware = content.includes('composeApiMiddleware');
    const hasExplicitChain =
      content.includes('withAuth(') &&
      (content.includes('withTenantGuard(') || content.includes('withMethod('));

    // Detect if it's a mutation
    const methods = detectMethods(content);
    const isMutation = methods.some(m =>
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(m)
    );

    if (isMutation) {
      routesByType.mutations.total++;
    } else {
      routesByType.queries.total++;
    }

    if (!hasLegacyMiddleware || hasExplicitChain) {
      migratedRoutes++;
      if (isMutation) {
        routesByType.mutations.migrated++;
      } else {
        routesByType.queries.migrated++;
      }
    } else {
      legacyRoutes.push({
        file: file,
        methods: methods,
        isMutation: isMutation,
      });
    }
  }

  return {
    totalRoutes,
    migratedRoutes,
    legacyRoutes,
    routesByType,
    percentage: Math.round((migratedRoutes / totalRoutes) * 100),
  };
}

function detectMethods(content) {
  const methods = new Set();
  const patterns = [
    /req\.method\s*===?\s*['"`](\w+)['"`]/g,
    /req\.method\s*!==?\s*['"`](\w+)['"`]/g,
    /case\s+['"`](\w+)['"`]\s*:/g,
  ];

  patterns.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        methods.add(match[1].toUpperCase());
      }
    }
  });

  if (methods.size === 0) methods.add('GET');
  return Array.from(methods);
}

function drawProgressBar(percentage, width = 40) {
  const filled = Math.floor((percentage / 100) * width);
  const empty = width - filled;

  let bar = colors.green;
  for (let i = 0; i < filled; i++) {
    bar += progressChars.complete;
  }
  bar += colors.gray;
  for (let i = 0; i < empty; i++) {
    bar += progressChars.incomplete;
  }
  bar += colors.reset;

  return bar;
}

function formatDuration(startTime) {
  const elapsed = Date.now() - startTime;
  const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else {
    return `${hours}h`;
  }
}

function displayProgress() {
  console.log(colors.clear); // Clear screen

  const stats = getRouteStats();
  const progressBar = drawProgressBar(stats.percentage);

  // Header
  console.log(
    colors.cyan +
      colors.bold +
      '🚀 MIDDLEWARE MIGRATION PROGRESS\n' +
      colors.reset
  );

  // Progress bar
  console.log(
    `Progress: ${progressBar} ${colors.bold}${stats.percentage}%${colors.reset}`
  );
  console.log(
    `Routes: ${colors.green}${stats.migratedRoutes}${colors.reset} / ${stats.totalRoutes} migrated\n`
  );

  // Breakdown by type
  console.log(colors.bold + '📊 Breakdown by Type:' + colors.reset);
  console.log(
    `  Mutations: ${colors.yellow}${stats.routesByType.mutations.migrated}/${stats.routesByType.mutations.total}${colors.reset} (${Math.round((stats.routesByType.mutations.migrated / stats.routesByType.mutations.total) * 100)}%)`
  );
  console.log(
    `  Queries:   ${colors.blue}${stats.routesByType.queries.migrated}/${stats.routesByType.queries.total}${colors.reset} (${Math.round((stats.routesByType.queries.migrated / stats.routesByType.queries.total) * 100)}%)\n`
  );

  // Milestones
  console.log(colors.bold + '🎯 Milestones:' + colors.reset);
  const milestones = [
    { target: 60, label: 'Secure top-risk routes', emoji: '🔒' },
    { target: 75, label: 'Prep legacy removal', emoji: '⚠️' },
    { target: 80, label: 'Delete composeApiMiddleware', emoji: '🗑️' },
    { target: 100, label: 'Migration complete!', emoji: '🎉' },
  ];

  milestones.forEach(milestone => {
    const reached = stats.percentage >= milestone.target;
    const color = reached ? colors.green : colors.gray;
    const check = reached ? '✅' : '○';
    console.log(
      `  ${check} ${color}${milestone.target}% - ${milestone.label} ${milestone.emoji}${colors.reset}`
    );
  });

  // Velocity estimate
  const remainingRoutes = stats.totalRoutes - stats.migratedRoutes;
  const routesPerSession = 10; // Based on current velocity
  const sessionsRemaining = Math.ceil(remainingRoutes / routesPerSession);

  console.log(`\n${colors.bold}⏱️  Estimated Completion:${colors.reset}`);
  console.log(`  ${remainingRoutes} routes remaining`);
  console.log(`  ~${routesPerSession} routes per session`);
  console.log(
    `  ${colors.cyan}${sessionsRemaining} sessions to 100%${colors.reset}\n`
  );

  // Next actions
  if (stats.percentage < 100) {
    console.log(colors.bold + '📋 Next High-Priority Routes:' + colors.reset);
    const mutations = stats.legacyRoutes.filter(r => r.isMutation).slice(0, 5);

    mutations.forEach((route, index) => {
      console.log(
        `  ${index + 1}. ${colors.yellow}${route.file}${colors.reset}`
      );
      console.log(`     Methods: ${route.methods.join(', ')}`);
    });

    console.log(`\n${colors.bold}🛠️  Quick Commands:${colors.reset}`);
    console.log(
      `  ${colors.gray}# Analyze remaining routes by risk:${colors.reset}`
    );
    console.log(`  node scripts/analyze-remaining-routes.js\n`);
    console.log(
      `  ${colors.gray}# Open next route for migration:${colors.reset}`
    );
    if (mutations.length > 0) {
      console.log(`  code src/pages/api/${mutations[0].file}`);
    }
  } else {
    console.log(
      colors.green + colors.bold + '🎉 MIGRATION COMPLETE! 🎉' + colors.reset
    );
    console.log('\nAll routes now use explicit middleware chaining!');
    console.log(
      'Next step: Delete src/middleware/compose/composeApiMiddleware.ts'
    );
  }

  // Footer
  console.log(
    `\n${colors.gray}Last updated: ${new Date().toLocaleTimeString()}${colors.reset}`
  );
  console.log(`${colors.gray}Press Ctrl+C to exit${colors.reset}`);
}

// Main execution
function main() {
  displayProgress();

  // Watch mode - refresh every 10 seconds
  if (process.argv.includes('--watch') || process.argv.includes('-w')) {
    setInterval(displayProgress, 10000);
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
