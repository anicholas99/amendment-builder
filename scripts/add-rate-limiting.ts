#!/usr/bin/env tsx
/**
 * Script to add rate limiting to API endpoints for SOC 2 compliance
 * This script carefully adds the rateLimitType property without causing syntax errors
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

// Define rate limit categories for different endpoint types
const endpointCategories = {
  auth: [
    'auth/login',
    'auth/logout',
    'auth/session',
    'auth/register',
    'auth/reset-password',
    'auth/verify-email',
    'auth/github',
    'auth/google',
    'auth/refresh',
    'auth/forgot-password',
  ],
  ai: [
    'ai/',
    'generate',
    'analyze',
    'stream',
    'enhance',
    'refine',
    'suggestions',
    'claim-refinement',
    'patent-application',
    'citation-reasoning',
    'citation-extraction',
    'chat/',
  ],
  search: ['search', 'patbase/search', 'prior-art', 'citation-location'],
  upload: ['upload', 'figures', 'documents', 'import'],
  admin: ['admin/', 'debug-tools/', 'internal/', 'system/'],
  // Most endpoints will be either 'api' (mutations) or 'read' (GET only)
};

function determineRateLimitType(filePath: string, content: string): string {
  const pathLower = filePath.toLowerCase();

  // Check categories by path
  for (const [type, patterns] of Object.entries(endpointCategories)) {
    if (patterns.some(pattern => pathLower.includes(pattern))) {
      return type;
    }
  }

  // Check if it's a read-only endpoint (only GET method)
  const hasPost =
    /methods:.*POST/i.test(content) || /case\s+['"]POST['"]/i.test(content);
  const hasPut =
    /methods:.*PUT/i.test(content) || /case\s+['"]PUT['"]/i.test(content);
  const hasPatch =
    /methods:.*PATCH/i.test(content) || /case\s+['"]PATCH['"]/i.test(content);
  const hasDelete =
    /methods:.*DELETE/i.test(content) || /case\s+['"]DELETE['"]/i.test(content);

  if (!hasPost && !hasPut && !hasPatch && !hasDelete) {
    return 'read';
  }

  return 'api'; // Default for mutations
}

function addRateLimitingToFile(filePath: string): boolean {
  try {
    let content = readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // Skip if already has rate limiting
    if (content.includes('rateLimitType:')) {
      console.log(`✓ ${filePath} - already has rate limiting`);
      return false;
    }

    // Skip test files
    if (filePath.includes('__tests__') || filePath.endsWith('.test.ts')) {
      return false;
    }

    const rateLimitType = determineRateLimitType(filePath, content);

    // Find all withAuth( patterns and add rateLimitType
    const withAuthPattern = /withAuth\s*\(\s*{([^}]+)}\s*\)/g;
    let modified = false;

    content = content.replace(withAuthPattern, (match, configContent) => {
      // Check if this config already has rateLimitType
      if (configContent.includes('rateLimitType:')) {
        return match;
      }

      // Clean up the config content - remove trailing comma if present
      const cleanedConfig = configContent.trim().replace(/,\s*$/, '');

      // Add rateLimitType with proper formatting
      const newConfig =
        cleanedConfig + `,\n  rateLimitType: '${rateLimitType}'`;

      modified = true;
      return `withAuth({\n${newConfig}\n})`;
    });

    // Also handle patterns like: export default withAuth(handler)
    // Add config object with rate limiting
    const simpleWithAuthPattern =
      /export\s+default\s+withAuth\s*\(\s*(\w+)\s*\)/g;
    content = content.replace(simpleWithAuthPattern, (match, handlerName) => {
      modified = true;
      return `export default withAuth({\n  rateLimitType: '${rateLimitType}'\n})(${handlerName})`;
    });

    if (modified) {
      // Ensure import is present
      if (
        !content.includes("from '@/middleware/withAuth'") &&
        content.includes('withAuth')
      ) {
        // Find the right place to add import (after other imports)
        const importMatch = content.match(/^((?:import .+\n)+)/m);
        if (importMatch) {
          const imports = importMatch[1];
          content = content.replace(
            imports,
            imports +
              `import { RateLimitType } from '@/middleware/rate-limit-config';\n`
          );
        }
      }

      writeFileSync(filePath, content);
      console.log(`✅ ${filePath} - added rate limiting (${rateLimitType})`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

async function main() {
  console.log(
    'Adding rate limiting to API endpoints for SOC 2 compliance...\n'
  );

  // Find all API route files
  const apiFiles = await glob('src/pages/api/**/*.{ts,tsx}', {
    ignore: ['**/*.test.ts', '**/*.spec.ts', '**/test-*.ts'],
  });

  console.log(`Found ${apiFiles.length} API files to process\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const file of apiFiles) {
    const updated = addRateLimitingToFile(file);
    if (updated) {
      updatedCount++;
    } else {
      skippedCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Updated: ${updatedCount} files`);
  console.log(`⏭️  Skipped: ${skippedCount} files`);
  console.log('='.repeat(50));

  // Update withAuth middleware to support rate limiting
  console.log('\nUpdating withAuth middleware to support rate limiting...');
  updateWithAuthMiddleware();

  console.log('\n✅ Rate limiting setup complete!');
  console.log('\nNext steps:');
  console.log('1. Review the changes');
  console.log('2. Run tests to ensure everything works');
  console.log('3. Commit the changes');
}

function updateWithAuthMiddleware() {
  const middlewarePath = join(process.cwd(), 'src/middleware/withAuth.ts');

  try {
    let content = readFileSync(middlewarePath, 'utf-8');

    // Check if already updated
    if (content.includes('rateLimitType')) {
      console.log('✓ withAuth middleware already supports rate limiting');
      return;
    }

    // Add import for rate limiters
    if (!content.includes("from '@/middleware/rate-limit-config'")) {
      const importIndex = content.lastIndexOf('import');
      const importEndIndex = content.indexOf('\n', importIndex) + 1;
      content =
        content.slice(0, importEndIndex) +
        `import { RateLimitType, rateLimiters } from '@/middleware/rate-limit-config';\n` +
        content.slice(importEndIndex);
    }

    // Update the AuthOptions type to include rateLimitType
    const typePattern = /export\s+type\s+AuthOptions\s*=\s*{([^}]+)}/;
    content = content.replace(typePattern, (match, typeContent) => {
      const cleanedContent = typeContent.trim().replace(/;?\s*$/, '');
      return `export type AuthOptions = {\n${cleanedContent};\n  rateLimitType?: RateLimitType;\n}`;
    });

    // Add rate limiting to the middleware
    const handlerPattern = /(return async function authMiddleware[^{]+{)/;
    content = content.replace(handlerPattern, match => {
      return (
        match +
        `\n    // Apply rate limiting if specified\n    if (options?.rateLimitType) {\n      const limiter = rateLimiters[options.rateLimitType];\n      await new Promise((resolve, reject) => {\n        limiter(req as unknown, res as unknown, (err: unknown) => {\n          if (err) reject(err);\n          else resolve(undefined);\n        });\n      });\n    }\n`
      );
    });

    writeFileSync(middlewarePath, content);
    console.log('✅ Updated withAuth middleware to support rate limiting');
  } catch (error) {
    console.error('❌ Error updating withAuth middleware:', error);
  }
}

// Run the script
main().catch(console.error);
