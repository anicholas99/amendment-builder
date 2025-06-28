#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 Tracking composeApiMiddleware Migration Progress\n');

const API_DIR = path.join(__dirname, '../src/pages/api');

// Find all TypeScript files in the API directory
const apiFiles = glob.sync(path.join(API_DIR, '**/*.{ts,tsx}'));

const usageReport = {
  total: 0,
  deprecated: [],
  migrated: [],
  needsMigration: [],
};

// Patterns to detect
const DEPRECATED_PATTERN = /composeApiMiddleware/;
const EXPLICIT_PATTERN = /withAuth\s*\(/;
const EXPORT_DEFAULT_PATTERN = /export\s+default/;

apiFiles.forEach(file => {
  // Skip test files
  if (file.includes('__tests__') || file.includes('.test.')) {
    return;
  }

  const content = fs.readFileSync(file, 'utf8');

  // Check if it's an API route (has export default)
  if (!EXPORT_DEFAULT_PATTERN.test(content)) {
    return;
  }

  usageReport.total++;
  const relativePath = path.relative(process.cwd(), file);

  if (DEPRECATED_PATTERN.test(content)) {
    usageReport.deprecated.push(relativePath);

    // Extract the configuration to help with migration
    const configMatch = content.match(
      /composeApiMiddleware\s*\([^,]+,\s*{([^}]+)}/s
    );
    if (configMatch) {
      const config = configMatch[1];
      usageReport.needsMigration.push({
        file: relativePath,
        config: config.trim(),
      });
    }
  } else if (EXPLICIT_PATTERN.test(content)) {
    usageReport.migrated.push(relativePath);
  }
});

// Display results
console.log(`📊 Total API Routes: ${usageReport.total}`);
console.log(`✅ Migrated to Explicit Chain: ${usageReport.migrated.length}`);
console.log(
  `❌ Still Using composeApiMiddleware: ${usageReport.deprecated.length}\n`
);

if (usageReport.deprecated.length > 0) {
  console.log('🚨 Files Still Using Deprecated Pattern:\n');
  usageReport.deprecated.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });

  console.log('\n📝 Migration Details:\n');
  usageReport.needsMigration.forEach(({ file, config }) => {
    console.log(`\n  File: ${file}`);
    console.log('  Current config:');
    console.log(`    {${config}}`);
    console.log('  Migration needed:');

    // Provide specific guidance based on config
    if (config.includes('schema')) {
      console.log('    - Add withMethodBasedValidation wrapper');
    }
    if (config.includes('resolveTenantId')) {
      console.log('    - Add withMutationTenantGuard wrapper');
    }
    if (config.includes('requiredRole')) {
      console.log('    - Add withMethodBasedRoleCheck wrapper');
    }
    if (config.includes('rateLimit')) {
      console.log('    - Wrap with withRateLimit at the outermost level');
    }
    if (config.includes('cache')) {
      console.log(
        '    - Add appropriate cache middleware (withProjectCache, etc.)'
      );
    }
  });

  console.log(
    '\n📚 Migration Guide: See SECURITY_ARCHITECTURE.md for detailed instructions'
  );
  console.log('📍 Reference Implementation: src/pages/api/projects/index.ts\n');
}

// Generate migration status file
const statusReport = {
  timestamp: new Date().toISOString(),
  summary: {
    totalRoutes: usageReport.total,
    migrated: usageReport.migrated.length,
    remaining: usageReport.deprecated.length,
    percentComplete: Math.round(
      (usageReport.migrated.length / usageReport.total) * 100
    ),
  },
  deprecated: usageReport.deprecated,
  migrated: usageReport.migrated,
};

fs.writeFileSync(
  path.join(__dirname, 'middleware-migration-status.json'),
  JSON.stringify(statusReport, null, 2)
);

console.log(
  '📄 Migration status saved to: scripts/middleware-migration-status.json'
);

// Exit with error if deprecated pattern still exists
if (usageReport.deprecated.length > 0) {
  console.log(
    '\n⚠️  Migration incomplete. Continue migrating remaining files.'
  );
  process.exit(0); // Don't fail for now, just inform
} else {
  console.log(
    '\n🎉 Migration complete! All routes use explicit middleware chaining.'
  );
}
