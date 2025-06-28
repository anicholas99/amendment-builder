#!/usr/bin/env node

/**
 * Fix Logger Import Issues
 * Automatically adds logger imports to files that use logger but don't import it
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing logger import issues...\n');

// Find files that use logger but don't import it
const findFilesWithLoggerIssues = () => {
  try {
    const result = execSync(
      'grep -r "logger\\." src/ --include="*.ts" --include="*.tsx" -l',
      { encoding: 'utf8' }
    );
    return result
      .trim()
      .split('\n')
      .filter(file => file.trim());
  } catch (error) {
    return [];
  }
};

const fixLoggerImport = filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check if logger is already imported
    if (
      content.includes("from '@/lib/monitoring/logger'") ||
      content.includes("from '../lib/monitoring/logger'") ||
      content.includes('import { logger }')
    ) {
      return false; // Already has import
    }

    // Check if file actually uses logger
    if (!content.includes('logger.')) {
      return false; // Doesn't use logger
    }

    // Find the last import statement
    const lines = content.split('\n');
    let lastImportIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') && !lines[i].includes('type')) {
        lastImportIndex = i;
      }
    }

    if (lastImportIndex === -1) {
      // No imports found, add at the top
      lines.unshift("import { logger } from '@/lib/monitoring/logger';");
    } else {
      // Add after the last import
      lines.splice(
        lastImportIndex + 1,
        0,
        "import { logger } from '@/lib/monitoring/logger';"
      );
    }

    fs.writeFileSync(filePath, lines.join('\n'));
    return true;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
};

const files = findFilesWithLoggerIssues();
let fixedCount = 0;

console.log(`Found ${files.length} files that might need logger imports...\n`);

files.forEach(file => {
  if (fixLoggerImport(file)) {
    console.log(`✅ Fixed: ${file}`);
    fixedCount++;
  } else {
    console.log(
      `⏭️  Skipped: ${file} (already has import or doesn't use logger)`
    );
  }
});

console.log(`\n🎉 Fixed ${fixedCount} files!`);
console.log('\n📋 Next: Run npm run lint:fix to clean up any remaining issues');
