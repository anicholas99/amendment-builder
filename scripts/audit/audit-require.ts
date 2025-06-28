#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

interface RequireUsage {
  file: string;
  line: number;
  column: number;
  context: string;
  type: 'commonjs' | 'dynamic' | 'conditional';
}

const SRC_DIR = path.join(process.cwd(), 'src');

// Patterns to detect require() usage
const REQUIRE_PATTERNS = [
  { pattern: /require\s*\(['"`]([^'"`]+)['"`]\)/, type: 'commonjs' as const },
  { pattern: /require\s*\(([^)]+)\)/, type: 'dynamic' as const },
  { pattern: /const\s+\w+\s*=\s*require/, type: 'commonjs' as const },
  { pattern: /let\s+\w+\s*=\s*require/, type: 'commonjs' as const },
  { pattern: /var\s+\w+\s*=\s*require/, type: 'commonjs' as const },
];

function checkFile(filePath: string): RequireUsage[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const usages: RequireUsage[] = [];

    // Skip certain files
    if (
      filePath.includes('node_modules') ||
      filePath.includes('.git') ||
      filePath.includes('dist') ||
      filePath.includes('build') ||
      filePath.includes('__tests__') ||
      filePath.includes('.test.') ||
      filePath.includes('.spec.') ||
      filePath.endsWith('.js') || // Skip JS files as they might legitimately use require
      filePath.includes('jest.config') ||
      filePath.includes('next.config') ||
      filePath.includes('.config.')
    ) {
      return usages;
    }

    lines.forEach((line, lineIndex) => {
      // Skip comments
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*')) {
        return;
      }

      // Check if it's inside a conditional (might be legitimate)
      const isConditional =
        line.includes('if') || line.includes('else') || line.includes('?');

      REQUIRE_PATTERNS.forEach(({ pattern, type }) => {
        const regex = new RegExp(pattern, 'g');
        let match;

        while ((match = regex.exec(line)) !== null) {
          if (match.index !== undefined) {
            // Skip if it's just the word "require" in a string or comment
            const beforeMatch = line.substring(0, match.index);
            if (
              beforeMatch.includes('//') ||
              beforeMatch.includes('"') ||
              beforeMatch.includes("'")
            ) {
              continue;
            }

            usages.push({
              file: filePath,
              line: lineIndex + 1,
              column: match.index + 1,
              context: line.trim(),
              type: isConditional ? 'conditional' : type,
            });
          }
        }
      });
    });

    return usages;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}

function formatResults(usages: RequireUsage[]): void {
  if (usages.length === 0) {
    console.log('✅ No require() statements found! Pure ES modules! 🚀');
    return;
  }

  console.log(`\n⚠️  Found ${usages.length} uses of require():\n`);

  // Group by type
  const byType = usages.reduce(
    (acc, usage) => {
      if (!acc[usage.type]) {
        acc[usage.type] = 0;
      }
      acc[usage.type]++;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log('📊 Summary by type:');
  Object.entries(byType).forEach(([type, count]) => {
    const emoji =
      {
        commonjs: '📦',
        dynamic: '⚡',
        conditional: '🔀',
      }[type] || '📦';
    console.log(`   ${emoji} ${type}: ${count}`);
  });

  // Group by file
  const byFile = usages.reduce(
    (acc, usage) => {
      if (!acc[usage.file]) {
        acc[usage.file] = [];
      }
      acc[usage.file].push(usage);
      return acc;
    },
    {} as Record<string, RequireUsage[]>
  );

  console.log(`\n📁 Files using require(): ${Object.keys(byFile).length}\n`);

  // Show details
  Object.entries(byFile).forEach(([file, fileUsages]) => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`📄 ${relativePath}`);

    fileUsages.forEach(usage => {
      const typeEmoji =
        {
          commonjs: '📦',
          dynamic: '⚡',
          conditional: '🔀',
        }[usage.type] || '📦';
      console.log(`   ${typeEmoji} Line ${usage.line}: ${usage.context}`);
    });
    console.log('');
  });

  console.log('💡 How to fix:');
  console.log('\n1️⃣  Static CommonJS requires:');
  console.log(`
// ❌ Old CommonJS
const fs = require('fs');
const { readFile } = require('fs/promises');

// ✅ ES Modules
import fs from 'fs';
import { readFile } from 'fs/promises';
`);

  console.log('\n2️⃣  Dynamic requires:');
  console.log(`
// ❌ Old dynamic require
const module = require(\`./modules/\${name}\`);

// ✅ Dynamic import (returns Promise)
const module = await import(\`./modules/\${name}\`);
`);

  console.log('\n3️⃣  Conditional requires:');
  console.log(`
// ❌ Old conditional require
if (process.env.NODE_ENV === 'development') {
  const devTools = require('./dev-tools');
}

// ✅ Dynamic import with condition
if (process.env.NODE_ENV === 'development') {
  const { devTools } = await import('./dev-tools');
}
`);

  console.log('\n📚 Additional notes:');
  console.log(
    '   - Update tsconfig.json to use "module": "esnext" or "es2020"'
  );
  console.log('   - Dynamic imports are async - handle with await or .then()');
  console.log(
    "   - Some Next.js config files may still need require() - that's OK"
  );
  console.log('   - Consider using top-level await for cleaner async imports');
}

async function main() {
  console.log('🔍 Auditing TypeScript files for require() usage...\n');

  // Find all TypeScript files
  const patterns = [
    path.join(SRC_DIR, '**/*.{ts,tsx}').replace(/\\/g, '/'),
    path.join(process.cwd(), 'scripts', '**/*.{ts,tsx}').replace(/\\/g, '/'),
  ];

  let allFiles: string[] = [];
  patterns.forEach(pattern => {
    const files = glob.sync(pattern);
    allFiles = allFiles.concat(files);
  });

  console.log(`Found ${allFiles.length} TypeScript files\n`);

  const allUsages: RequireUsage[] = [];

  for (const file of allFiles) {
    const usages = checkFile(file);
    allUsages.push(...usages);
  }

  formatResults(allUsages);

  // Exit with error code if issues found
  process.exit(allUsages.length > 0 ? 1 : 0);
}

// Run the audit
main().catch(console.error);
