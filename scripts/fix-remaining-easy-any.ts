#!/usr/bin/env ts-node
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

// Comprehensive patterns to fix
const comprehensivePatterns = [
  // Common any arrays
  {
    pattern: /: any\[\]/g,
    replacement: ': unknown[]',
  },
  // Record<string, any>
  {
    pattern: /Record<string, any>/g,
    replacement: 'Record<string, unknown>',
  },
  // Function params
  {
    pattern: /\(([\w]+): any\)/g,
    replacement: '($1: unknown)',
  },
  // Multiple params with any
  {
    pattern: /\(([\w]+): any, ([\w]+): any\)/g,
    replacement: '($1: unknown, $2: unknown)',
  },
  // Variable declarations
  {
    pattern: /let ([\w]+): any =/g,
    replacement: 'let $1: unknown =',
  },
  {
    pattern: /const ([\w]+): any =/g,
    replacement: 'const $1: unknown =',
  },
  // Generic any
  {
    pattern: /<any>/g,
    replacement: '<unknown>',
  },
  // as any type assertions
  {
    pattern: / as any\b/g,
    replacement: ' as unknown',
  },
  // Promise<any>
  {
    pattern: /Promise<any>/g,
    replacement: 'Promise<unknown>',
  },
  // useState<any>
  {
    pattern: /useState<any>/g,
    replacement: 'useState<unknown>',
  },
  // Array<any>
  {
    pattern: /Array<any>/g,
    replacement: 'Array<unknown>',
  },
  // Rest parameters
  {
    pattern: /\.\.\.args: any\[\]/g,
    replacement: '...args: unknown[]',
  },
  // Object method params
  {
    pattern: /\(([\w]+): any, ([\w]+): number\)/g,
    replacement: '($1: unknown, $2: number)',
  },
  // Callback params
  {
    pattern: /\(([\w]+): any\) =>/g,
    replacement: '($1: unknown) =>',
  },
  // Multiple callback params
  {
    pattern: /\(([\w]+): any, ([\w]+): any\) =>/g,
    replacement: '($1: unknown, $2: unknown) =>',
  },
  // Type annotations in interfaces
  {
    pattern: /: any;/g,
    replacement: ': unknown;',
  },
  // Optional params
  {
    pattern: /\?: any/g,
    replacement: '?: unknown',
  },
  // Function return types
  {
    pattern: /\): any {/g,
    replacement: '): unknown {',
  },
  {
    pattern: /\): Promise<any> {/g,
    replacement: '): Promise<unknown> {',
  },
  // Catch blocks
  {
    pattern: /} catch \(([\w]+): any\) {/g,
    replacement: '} catch ($1: unknown) {',
  },
  // JSON parse
  {
    pattern: /JSON\.parse\((.*?)\) as any/g,
    replacement: 'JSON.parse($1) as unknown',
  },
  // Mock returns
  {
    pattern: /mockReturnValue\(([\w]+) as any\)/g,
    replacement: 'mockReturnValue($1 as unknown)',
  },
  // Object literal types
  {
    pattern: /: { \[key: string\]: any }/g,
    replacement: ': { [key: string]: unknown }',
  },
  // Set and Map generics
  {
    pattern: /Set<any>/g,
    replacement: 'Set<unknown>',
  },
  {
    pattern: /Map<string, any>/g,
    replacement: 'Map<string, unknown>',
  },
];

// Files to exclude from automatic fixing
const excludePatterns = [
  '**/node_modules/**',
  '**/*.d.ts',
  '**/dist/**',
  '**/.next/**',
  '**/scripts/fix-*.ts', // Don't fix the fix scripts themselves
];

// Get all TypeScript files
function getAllTypeScriptFiles(): string[] {
  const tsFiles = glob.sync('**/*.{ts,tsx}', {
    ignore: excludePatterns,
  });

  return tsFiles;
}

// Process file with all patterns
async function processFile(filePath: string): Promise<number> {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    return 0;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;
  let totalChanges = 0;

  // Skip files with specific comments
  if (content.includes('eslint-disable @typescript-eslint/no-explicit-any')) {
    return 0;
  }

  // Apply all patterns
  for (const { pattern, replacement } of comprehensivePatterns) {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      totalChanges += matches.length;
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content);
    return totalChanges;
  }

  return 0;
}

// Main execution
async function main() {
  console.log('🔧 Fixing all remaining easy any types...\n');

  const files = getAllTypeScriptFiles();
  console.log(`Found ${files.length} TypeScript files to process\n`);

  let totalFixed = 0;
  let filesFixed = 0;

  for (const file of files) {
    const changes = await processFile(file);
    if (changes > 0) {
      console.log(`✅ ${file} (${changes} changes)`);
      totalFixed += changes;
      filesFixed++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`- Files processed: ${files.length}`);
  console.log(`- Files fixed: ${filesFixed}`);
  console.log(`- Total any types fixed: ${totalFixed}`);

  console.log('\nNext: Run TypeScript compiler to check for errors');
  console.log('Command: npm run type-check');
}

main().catch(console.error);
