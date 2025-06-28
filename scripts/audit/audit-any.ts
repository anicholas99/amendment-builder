#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

interface AnyUsage {
  file: string;
  line: number;
  column: number;
  context: string;
  type: 'explicit' | 'implicit' | 'cast';
}

const SRC_DIR = path.join(process.cwd(), 'src');

// Patterns to detect 'any' usage
const ANY_PATTERNS = [
  { pattern: /:\s*any\b/, type: 'explicit' as const }, // : any
  { pattern: /<unknown>/, type: 'cast' as const }, // <unknown>
  { pattern: /as\s+any\b/, type: 'cast' as const }, // as unknown
  { pattern: /any\[\]/, type: 'explicit' as const }, // any[]
  { pattern: /Array<unknown>/, type: 'explicit' as const }, // Array<unknown>
  { pattern: /:\s*\{[^}]*:\s*any[^}]*\}/, type: 'explicit' as const }, // : { foo: any }
];

function checkFile(filePath: string): AnyUsage[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const usages: AnyUsage[] = [];

    // Skip test files and type definition files
    if (
      filePath.includes('__tests__') ||
      filePath.includes('.test.') ||
      filePath.includes('.spec.') ||
      filePath.includes('.d.ts') ||
      filePath.includes('node_modules')
    ) {
      return usages;
    }

    lines.forEach((line, lineIndex) => {
      // Skip comments
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*')) {
        return;
      }

      ANY_PATTERNS.forEach(({ pattern, type }) => {
        const regex = new RegExp(pattern, 'g');
        let match;
        while ((match = regex.exec(line)) !== null) {
          if (match.index !== undefined) {
            usages.push({
              file: filePath,
              line: lineIndex + 1,
              column: match.index + 1,
              context: line.trim(),
              type,
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

function formatResults(usages: AnyUsage[]): void {
  if (usages.length === 0) {
    console.log('✅ No "any" types found! Strong typing FTW! 💪');
    return;
  }

  console.log(`\n⚠️  Found ${usages.length} uses of "any" type:\n`);

  // Group by file
  const byFile = usages.reduce(
    (acc, usage) => {
      if (!acc[usage.file]) {
        acc[usage.file] = [];
      }
      acc[usage.file].push(usage);
      return acc;
    },
    {} as Record<string, AnyUsage[]>
  );

  // Count by type
  const counts = {
    explicit: usages.filter(u => u.type === 'explicit').length,
    cast: usages.filter(u => u.type === 'cast').length,
    implicit: usages.filter(u => u.type === 'implicit').length,
  };

  console.log(`📊 Summary:`);
  console.log(`   - Explicit any (: any): ${counts.explicit}`);
  console.log(`   - Type assertions (as any, <unknown>): ${counts.cast}`);
  console.log(`   - Total files affected: ${Object.keys(byFile).length}\n`);

  // Show details
  Object.entries(byFile).forEach(([file, fileUsages]) => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`📄 ${relativePath}`);

    fileUsages.forEach(usage => {
      const typeEmoji = usage.type === 'cast' ? '⚡' : '🔴';
      console.log(`   ${typeEmoji} Line ${usage.line}: ${usage.context}`);
    });
    console.log('');
  });

  console.log('💡 Tips to fix:');
  console.log('   1. Define proper interfaces/types for your data');
  console.log('   2. Use generics instead of any for flexible types');
  console.log('   3. Use "unknown" if type is truly unknown (safer than any)');
  console.log('   4. Use type guards to narrow down union types');
  console.log('\nExample fixes:');
  console.log(`
// ❌ Bad
const data: unknown = await fetch('/api/data');

// ✅ Good
interface ApiResponse {
  id: string;
  name: string;
}
const data: ApiResponse = await fetch('/api/data');

// ❌ Bad
function process(input: unknown) { ... }

// ✅ Good with generics
function process<T>(input: T) { ... }

// ✅ Good with unknown
function process(input: unknown) {
  if (typeof input === 'string') {
    // TypeScript knows it's a string here
  }
}
`);
}

async function main() {
  console.log('🔍 Auditing TypeScript files for "any" usage...\n');

  // Find all TypeScript files
  const pattern = path.join(SRC_DIR, '**/*.{ts,tsx}').replace(/\\/g, '/');
  const files = glob.sync(pattern);

  console.log(`Found ${files.length} TypeScript files\n`);

  const allUsages: AnyUsage[] = [];

  for (const file of files) {
    const usages = checkFile(file);
    allUsages.push(...usages);
  }

  formatResults(allUsages);

  // Exit with error code if issues found
  process.exit(allUsages.length > 0 ? 1 : 0);
}

// Run the audit
main().catch(console.error);
