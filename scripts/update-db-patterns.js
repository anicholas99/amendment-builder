/**
 * Database Pattern Migration Script
 *
 * This script helps developers update API routes to use the new database
 * connection management and retry patterns.
 *
 * Usage:
 * node scripts/update-db-patterns.js
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

const API_DIR = path.join(process.cwd(), 'src', 'pages', 'api');
const UPDATE_COUNT = {
  updated: 0,
  skipped: 0,
  failed: 0,
};

// Pattern replacements to apply
const REPLACEMENTS = [
  // Update imports
  {
    pattern: /import \{ PrismaClient \} from ['"]@prisma\/client['"]/g,
    replacement: `import { PrismaClient } from '@prisma/client'`,
  },
  {
    pattern:
      /import \{ getPrismaClient(?!\s*,\s*withDatabaseRetry) \} from ['"](\.\.\/)+lib\/prisma['"]/g,
    replacement: `import { getPrismaClient, withDatabaseRetry } from '$1lib/prisma'`,
  },
  // Replace direct prisma instantiation
  {
    pattern: /const prisma = new PrismaClient\(\)/g,
    replacement: `const prisma = getPrismaClient()`,
  },
  // Replace try/catch with withDatabaseRetry for specific patterns
  {
    pattern: /try\s*\{\s*const\s+(\w+)\s*=\s*await\s+prisma\.(\w+)\.(\w+)\(/g,
    replacement: `const $1 = await withDatabaseRetry(async () => prisma.$2.$3(`,
  },
  {
    pattern: /try\s*\{\s*const\s+(\w+)\s*=\s*await\s+prisma\.\$transaction/g,
    replacement: `const $1 = await withDatabaseRetry(async () => prisma.$transaction`,
  },
  // Close replaced try blocks
  {
    pattern: /}\s*catch\s*\(\s*error\s*\)\s*\{\s*.*?console\.error\(.*?\)/gs,
    replacement: `})`,
  },
];

/**
 * Find all API files recursively in the directory
 */
async function findApiFiles(dir) {
  const files = [];
  const entries = await readdirAsync(dir);

  for (const entry of entries) {
    const entryPath = path.join(dir, entry);
    const stats = await statAsync(entryPath);

    if (stats.isDirectory()) {
      const subDirFiles = await findApiFiles(entryPath);
      files.push(...subDirFiles);
    } else if (
      stats.isFile() &&
      (entry.endsWith('.ts') || entry.endsWith('.js'))
    ) {
      files.push(entryPath);
    }
  }

  return files;
}

/**
 * Update a single file with the new patterns
 */
async function updateFile(filePath) {
  try {
    // Read file content
    const content = await readFileAsync(filePath, 'utf-8');

    // Skip if already using withDatabaseRetry
    if (content.includes('withDatabaseRetry')) {
      console.log(`✓ Already updated: ${filePath}`);
      UPDATE_COUNT.skipped++;
      return;
    }

    // Apply all replacements
    let updatedContent = content;
    let changed = false;

    for (const { pattern, replacement } of REPLACEMENTS) {
      const newContent = updatedContent.replace(pattern, replacement);
      if (newContent !== updatedContent) {
        changed = true;
        updatedContent = newContent;
      }
    }

    // Skip if no changes were made
    if (!changed) {
      console.log(`- No changes needed: ${filePath}`);
      UPDATE_COUNT.skipped++;
      return;
    }

    // Write updated content
    await writeFileAsync(filePath, updatedContent, 'utf-8');
    console.log(`✓ Updated: ${filePath}`);
    UPDATE_COUNT.updated++;
  } catch (error) {
    console.error(`✗ Failed to update ${filePath}:`, error.message);
    UPDATE_COUNT.failed++;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Searching for API files...');
  const files = await findApiFiles(API_DIR);
  console.log(`Found ${files.length} API files to process`);

  // Process each file
  for (const file of files) {
    await updateFile(file);
  }

  // Print summary
  console.log('\n--- Summary ---');
  console.log(`Total files processed: ${files.length}`);
  console.log(`Updated: ${UPDATE_COUNT.updated}`);
  console.log(`Skipped: ${UPDATE_COUNT.skipped}`);
  console.log(`Failed: ${UPDATE_COUNT.failed}`);

  if (UPDATE_COUNT.failed > 0) {
    console.log(
      '\nSome files failed to update. Please check the logs above and update them manually.'
    );
  }

  console.log(
    '\nNote: This script provides basic updates. Please review the changes and:'
  );
  console.log('1. Add specific error handling where needed');
  console.log('2. Verify that transaction logic is properly wrapped');
  console.log('3. Add proper logging where appropriate');
}

// Run the script
main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
