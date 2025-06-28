#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

interface ConsoleUsage {
  file: string;
  line: number;
  code: string;
  method: string;
  context: string;
  isWrapped?: boolean;
}

// Console methods to look for
const CONSOLE_METHODS = [
  'log',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'table',
  'time',
  'timeEnd',
  'timeLog',
  'group',
  'groupEnd',
  'groupCollapsed',
  'dir',
  'dirxml',
  'count',
  'countReset',
  'assert',
  'clear',
  'profile',
  'profileEnd',
];

// Files/directories to skip
const SKIP_PATTERNS = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  '**/build/**',
  '**/*.test.ts',
  '**/*.spec.ts',
  '**/__tests__/**',
  '**/scripts/audit/**',
  '**/jest.setup.js',
  '**/next.config.js',
  '**/*.config.js',
  '**/*.config.ts',
];

// Patterns that might indicate legitimate console usage
const LEGITIMATE_PATTERNS = [
  /\/\/ eslint-disable-next-line no-console/,
  /\/\/ @ts-ignore/,
  /process\.env\.NODE_ENV\s*!==?\s*['"]production['"]/,
  /if\s*\(\s*(?:process\.env\.)?DEBUG/,
];

function getFileContext(filePath: string): string {
  if (filePath.includes('/pages/api/')) {
    return 'API Route';
  } else if (filePath.includes('/lib/') || filePath.includes('/utils/')) {
    return 'Library/Utility';
  } else if (filePath.includes('/components/')) {
    return 'React Component';
  } else if (filePath.includes('/pages/') && !filePath.includes('/api/')) {
    return 'Page Component';
  } else if (filePath.includes('/hooks/')) {
    return 'React Hook';
  } else if (filePath.includes('/services/')) {
    return 'Service';
  } else if (filePath.includes('/repositories/')) {
    return 'Repository';
  } else {
    return 'Other';
  }
}

function checkFile(filePath: string): ConsoleUsage[] {
  const usages: ConsoleUsage[] = [];

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check if line has legitimate usage pattern
      const hasLegitimatePattern = LEGITIMATE_PATTERNS.some(pattern =>
        pattern.test(lines.slice(Math.max(0, index - 2), index + 1).join('\n'))
      );

      // Check for console methods
      CONSOLE_METHODS.forEach(method => {
        const regex = new RegExp(`console\\.${method}\\s*\\(`, 'g');

        if (regex.test(line)) {
          usages.push({
            file: filePath,
            line: index + 1,
            code: line.trim(),
            method,
            context: getFileContext(filePath),
            // Mark if it has a legitimate pattern but still report it
            isWrapped: hasLegitimatePattern,
          });
        }
      });
    });
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
  }

  return usages;
}

function formatResults(usages: ConsoleUsage[]): void {
  if (usages.length === 0) {
    console.log('✅ No console usage found!');
    return;
  }

  console.log(`\n[!] Found ${usages.length} console usage(s):\n`);

  // Group by context
  const byContext = usages.reduce(
    (acc, usage) => {
      if (!acc[usage.context]) {
        acc[usage.context] = [];
      }
      acc[usage.context].push(usage);
      return acc;
    },
    {} as Record<string, ConsoleUsage[]>
  );

  // Sort contexts by usage count (descending)
  const sortedContexts = Object.entries(byContext).sort(
    ([, a], [, b]) => b.length - a.length
  );

  sortedContexts.forEach(([context, contextUsages]) => {
    console.log(
      `\n📁 ${context} (${contextUsages.length} usage${contextUsages.length > 1 ? 's' : ''}):`
    );

    // Group by file within context
    const byFile = contextUsages.reduce(
      (acc, usage) => {
        if (!acc[usage.file]) {
          acc[usage.file] = [];
        }
        acc[usage.file].push(usage);
        return acc;
      },
      {} as Record<string, ConsoleUsage[]>
    );

    Object.entries(byFile).forEach(([file, fileUsages]) => {
      const relativePath = path.relative(process.cwd(), file);
      console.log(`\n  ${relativePath}`);

      fileUsages.forEach(usage => {
        console.log(`    Line ${usage.line}: console.${usage.method}(...)`);
        console.log(`      ${usage.code}`);
      });
    });
  });

  // Summary by method
  console.log('\n\n📊 Summary by console method:');
  const byMethod = usages.reduce(
    (acc, usage) => {
      acc[usage.method] = (acc[usage.method] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  Object.entries(byMethod)
    .sort(([, a], [, b]) => b - a)
    .forEach(([method, count]) => {
      console.log(`  console.${method}: ${count} usage${count > 1 ? 's' : ''}`);
    });

  console.log('\n\n💡 Recommendations:');
  console.log(`
1. Replace console usage with a proper logger:
   import { logger } from '@/lib/logger';
   logger.info('Message', { data });

2. For debugging during development:
   if (process.env.NODE_ENV !== 'production') {
     console.log('Debug info');
   }

3. For API routes and services:
   - Use structured logging with proper log levels
   - Include request IDs and user context
   - Never log sensitive data

4. To suppress specific warnings:
   // eslint-disable-next-line no-console
   console.log('Intentional console usage');
`);
}

async function main() {
  console.log('🔍 Auditing console usage...\n');

  // Find all TypeScript/JavaScript files
  const patterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];
  const allUsages: ConsoleUsage[] = [];

  for (const pattern of patterns) {
    const files = glob.sync(pattern, {
      ignore: SKIP_PATTERNS,
    });

    for (const file of files) {
      const usages = checkFile(file);
      allUsages.push(...usages);
    }
  }

  console.log(
    `Scanned ${glob.sync('{**/*.ts,**/*.tsx,**/*.js,**/*.jsx}', { ignore: SKIP_PATTERNS }).length} files`
  );

  formatResults(allUsages);

  // Exit with error code if issues found
  process.exit(allUsages.length > 0 ? 1 : 0);
}

// Run the audit
main().catch(console.error);
