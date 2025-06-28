#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

interface FileMetrics {
  file: string;
  lineCount: number;
  exportCount: number;
  functionCount: number;
  classCount: number;
  issues: string[];
}

const SRC_DIR = path.join(process.cwd(), 'src');
const LINE_THRESHOLD = 300;
const EXPORT_THRESHOLD = 10;
const FUNCTION_THRESHOLD = 15;

// Patterns to detect exports and declarations
const EXPORT_PATTERNS = [
  /export\s+(const|let|var|function|class|interface|type|enum)\s+/g,
  /export\s+\{[^}]+\}/g,
  /export\s+default\s+/g,
  /export\s+\*/g,
];

const FUNCTION_PATTERNS = [
  /(?:export\s+)?(?:async\s+)?function\s+\w+/g,
  /(?:export\s+)?const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g,
  /(?:export\s+)?const\s+\w+\s*=\s*(?:async\s+)?function/g,
];

const CLASS_PATTERNS = [/(?:export\s+)?class\s+\w+/g];

function analyzeFile(filePath: string): FileMetrics | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Skip certain files
    if (
      filePath.includes('node_modules') ||
      filePath.includes('.git') ||
      filePath.includes('dist') ||
      filePath.includes('build') ||
      filePath.includes('__tests__') ||
      filePath.includes('.test.') ||
      filePath.includes('.spec.') ||
      filePath.includes('.d.ts') ||
      filePath.includes('migrations') ||
      path.basename(filePath) === 'index.ts' || // Index files are often just exports
      path.basename(filePath) === 'index.tsx'
    ) {
      return null;
    }

    // Count exports
    let exportCount = 0;
    EXPORT_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        exportCount += matches.length;
      }
    });

    // Count functions
    let functionCount = 0;
    FUNCTION_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        functionCount += matches.length;
      }
    });

    // Count classes
    let classCount = 0;
    CLASS_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        classCount += matches.length;
      }
    });

    // Identify issues
    const issues: string[] = [];
    if (lines.length > LINE_THRESHOLD) {
      issues.push(`Too many lines (${lines.length} > ${LINE_THRESHOLD})`);
    }
    if (exportCount > EXPORT_THRESHOLD) {
      issues.push(`Too many exports (${exportCount} > ${EXPORT_THRESHOLD})`);
    }
    if (functionCount > FUNCTION_THRESHOLD) {
      issues.push(
        `Too many functions (${functionCount} > ${FUNCTION_THRESHOLD})`
      );
    }

    // Only return if there are issues
    if (issues.length === 0) {
      return null;
    }

    return {
      file: filePath,
      lineCount: lines.length,
      exportCount,
      functionCount,
      classCount,
      issues,
    };
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

function formatResults(metrics: FileMetrics[]): void {
  if (metrics.length === 0) {
    console.log('✅ All files are well-sized! Clean architecture! 🏗️');
    return;
  }

  console.log(
    `\n⚠️  Found ${metrics.length} files that may need refactoring:\n`
  );

  // Sort by line count (worst first)
  metrics.sort((a, b) => b.lineCount - a.lineCount);

  // Summary stats
  const totalLines = metrics.reduce((sum, m) => sum + m.lineCount, 0);
  const avgLines = Math.round(totalLines / metrics.length);
  const maxLines = Math.max(...metrics.map(m => m.lineCount));

  console.log('📊 Summary:');
  console.log(`   - Files needing attention: ${metrics.length}`);
  console.log(`   - Largest file: ${maxLines} lines`);
  console.log(`   - Average size: ${avgLines} lines`);
  console.log(
    `   - Total lines in large files: ${totalLines.toLocaleString()}\n`
  );

  // Group by issue type
  const byLineCount = metrics.filter(m => m.lineCount > LINE_THRESHOLD);
  const byExportCount = metrics.filter(m => m.exportCount > EXPORT_THRESHOLD);
  const byFunctionCount = metrics.filter(
    m => m.functionCount > FUNCTION_THRESHOLD
  );

  if (byLineCount.length > 0) {
    console.log(`📏 Files too long (>${LINE_THRESHOLD} lines):`);
    byLineCount.slice(0, 10).forEach(metric => {
      const relativePath = path.relative(process.cwd(), metric.file);
      console.log(`   - ${relativePath}: ${metric.lineCount} lines`);
    });
    if (byLineCount.length > 10) {
      console.log(`   ... and ${byLineCount.length - 10} more`);
    }
    console.log('');
  }

  if (byExportCount.length > 0) {
    console.log(`📦 Files with too many exports (>${EXPORT_THRESHOLD}):`);
    byExportCount.slice(0, 10).forEach(metric => {
      const relativePath = path.relative(process.cwd(), metric.file);
      console.log(`   - ${relativePath}: ${metric.exportCount} exports`);
    });
    if (byExportCount.length > 10) {
      console.log(`   ... and ${byExportCount.length - 10} more`);
    }
    console.log('');
  }

  if (byFunctionCount.length > 0) {
    console.log(`🔧 Files with too many functions (>${FUNCTION_THRESHOLD}):`);
    byFunctionCount.slice(0, 10).forEach(metric => {
      const relativePath = path.relative(process.cwd(), metric.file);
      console.log(`   - ${relativePath}: ${metric.functionCount} functions`);
    });
    if (byFunctionCount.length > 10) {
      console.log(`   ... and ${byFunctionCount.length - 10} more`);
    }
    console.log('');
  }

  // Worst offenders
  console.log('🚨 Top 5 files needing immediate attention:');
  metrics.slice(0, 5).forEach((metric, index) => {
    const relativePath = path.relative(process.cwd(), metric.file);
    console.log(`\n${index + 1}. ${relativePath}`);
    console.log(
      `   📊 Metrics: ${metric.lineCount} lines, ${metric.exportCount} exports, ${metric.functionCount} functions`
    );
    console.log(`   ⚠️  Issues: ${metric.issues.join(', ')}`);
  });

  console.log('\n💡 Refactoring strategies:');
  console.log(
    '   1. **Split by feature**: Group related functionality into separate files'
  );
  console.log(
    '   2. **Extract utilities**: Move helper functions to utils files'
  );
  console.log(
    '   3. **Create sub-modules**: Break large modules into smaller, focused ones'
  );
  console.log(
    '   4. **Use barrel exports**: Create index files to re-export from sub-modules'
  );
  console.log(
    '   5. **Apply SRP**: Each file should have a single responsibility'
  );
  console.log('\nExample refactoring:');
  console.log(`
// ❌ Before: large-component.tsx (500+ lines)
export function LargeComponent() { ... }
export function HelperA() { ... }
export function HelperB() { ... }
export const utils = { ... }

// ✅ After: Split into multiple files
// components/LargeComponent/index.tsx
export { LargeComponent } from './LargeComponent';

// components/LargeComponent/LargeComponent.tsx
import { useHelpers } from './hooks';
export function LargeComponent() { ... }

// components/LargeComponent/hooks.ts
export function useHelpers() { ... }

// components/LargeComponent/utils.ts
export const utils = { ... }
`);
}

async function main() {
  console.log('🔍 Auditing file sizes and complexity...\n');

  // Find all TypeScript files
  const pattern = path.join(SRC_DIR, '**/*.{ts,tsx}').replace(/\\/g, '/');
  const files = glob.sync(pattern);

  console.log(`Found ${files.length} TypeScript files\n`);

  const metrics: FileMetrics[] = [];

  for (const file of files) {
    const metric = analyzeFile(file);
    if (metric) {
      metrics.push(metric);
    }
  }

  formatResults(metrics);

  // Exit with error code if issues found
  process.exit(metrics.length > 0 ? 1 : 0);
}

// Run the audit
main().catch(console.error);
