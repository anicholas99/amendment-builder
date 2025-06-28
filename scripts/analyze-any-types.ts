#!/usr/bin/env ts-node
import * as fs from 'fs';
import * as path from 'path';

interface AnyUsageDetail {
  file: string;
  line: number;
  column: number;
  type: string;
  context: string;
  suggestion: string;
  severity: 'easy' | 'medium' | 'complex';
}

interface AnalysisReport {
  totalCount: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  byFile: Record<string, AnyUsageDetail[]>;
  topFiles: Array<{ file: string; count: number }>;
  suggestions: Record<string, string>;
}

function analyzeLine(
  line: string,
  lineNumber: number,
  filePath: string
): AnyUsageDetail[] {
  const results: AnyUsageDetail[] = [];

  // Pattern 1: catch (error: any)
  const catchPattern = /catch\s*\(\s*(\w+)\s*:\s*any\s*\)/g;
  let match;
  while ((match = catchPattern.exec(line)) !== null) {
    results.push({
      file: filePath,
      line: lineNumber,
      column: match.index,
      type: 'catch-error',
      context: line.trim(),
      suggestion: `Replace with: catch (${match[1]}: unknown)`,
      severity: 'easy',
    });
  }

  // Pattern 2: : any in function parameters or variables
  const typeAnnotationPattern = /(\w+)\s*:\s*any(?=[,\s\)])/g;
  while ((match = typeAnnotationPattern.exec(line)) !== null) {
    if (!line.includes('catch')) {
      const varName = match[1];
      let suggestion = 'Replace with: unknown';
      let severity: 'easy' | 'medium' | 'complex' = 'medium';

      if (varName.includes('error') || varName.includes('err')) {
        suggestion = `Replace with: ${varName}: unknown`;
        severity = 'easy';
      } else if (varName.includes('data') || varName.includes('response')) {
        suggestion = `Replace with: ${varName}: unknown (then narrow type)`;
      } else if (varName.includes('project')) {
        suggestion = `Replace with: ${varName}: Project`;
        severity = 'complex';
      } else if (varName.includes('citation')) {
        suggestion = `Replace with: ${varName}: CitationMatch`;
        severity = 'complex';
      }

      results.push({
        file: filePath,
        line: lineNumber,
        column: match.index,
        type: 'type-annotation',
        context: line.trim(),
        suggestion,
        severity,
      });
    }
  }

  // Pattern 3: any[]
  const arrayPattern = /:\s*any\[\]/g;
  while ((match = arrayPattern.exec(line)) !== null) {
    results.push({
      file: filePath,
      line: lineNumber,
      column: match.index,
      type: 'any-array',
      context: line.trim(),
      suggestion: 'Replace with: unknown[] (then define proper array type)',
      severity: 'medium',
    });
  }

  // Pattern 4: as unknown
  const asAnyPattern = /as\s+any\b/g;
  while ((match = asAnyPattern.exec(line)) !== null) {
    results.push({
      file: filePath,
      line: lineNumber,
      column: match.index,
      type: 'type-assertion',
      context: line.trim(),
      suggestion: 'Remove assertion or replace with: as unknown',
      severity: 'medium',
    });
  }

  // Pattern 5: Generic<any> (but not <unknown>)
  const genericPattern = /<any>/g;
  while ((match = genericPattern.exec(line)) !== null) {
    results.push({
      file: filePath,
      line: lineNumber,
      column: match.index,
      type: 'generic-any',
      context: line.trim(),
      suggestion: 'Replace with: <unknown> or specific type',
      severity: 'medium',
    });
  }

  // Pattern 6: Record<string, unknown>
  const recordPattern = /Record<string,\s*any>/g;
  while ((match = recordPattern.exec(line)) !== null) {
    results.push({
      file: filePath,
      line: lineNumber,
      column: match.index,
      type: 'record-any',
      context: line.trim(),
      suggestion: 'Replace with: Record<string, unknown>',
      severity: 'easy',
    });
  }

  return results;
}

function analyzeFile(filePath: string): AnyUsageDetail[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const results: AnyUsageDetail[] = [];

  lines.forEach((line, index) => {
    const lineResults = analyzeLine(line, index + 1, filePath);
    results.push(...lineResults);
  });

  return results;
}

function scanDirectory(dir: string): AnyUsageDetail[] {
  const allResults: AnyUsageDetail[] = [];

  function scan(currentDir: string) {
    try {
      const files = fs.readdirSync(currentDir);

      for (const file of files) {
        const fullPath = path.join(currentDir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (
            !file.startsWith('.') &&
            file !== 'node_modules' &&
            file !== 'dist' &&
            file !== 'build' &&
            file !== 'out'
          ) {
            scan(fullPath);
          }
        } else if (stat.isFile()) {
          if (
            (file.endsWith('.ts') || file.endsWith('.tsx')) &&
            !file.endsWith('.d.ts')
          ) {
            const results = analyzeFile(fullPath);
            allResults.push(...results);
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  scan(dir);
  return allResults;
}

// Generate fix guide
function generateFixGuide(): string {
  return `
# Manual Fix Guide for 'any' Types

## Quick Fixes (Can be done with Find & Replace)

### 1. catch (error: any) → catch (error: unknown)
- **Find:** \`catch (error: any)\`
- **Replace:** \`catch (error: unknown)\`
- **Then add:** Type guard if needed
\`\`\`typescript
if (error instanceof Error) {
  console.error(error.message);
}
\`\`\`

### 2. Record<string, unknown> → Record<string, unknown>
- **Find:** \`Record<string, unknown>\`
- **Replace:** \`Record<string, unknown>\`

## Medium Complexity Fixes

### 3. Function Parameters
For parameters typed as \`any\`, determine the actual type from usage:

\`\`\`typescript
// Before
function process(data: unknown) { ... }

// After - Option 1: Use unknown and narrow
function process(data: unknown) {
  if (typeof data === 'string') { ... }
}

// After - Option 2: Use proper type
function process(data: Project | User) { ... }
\`\`\`

### 4. Array Types
\`\`\`typescript
// Before
const items: unknown[] = [];

// After - Option 1: Unknown array
const items: unknown[] = [];

// After - Option 2: Specific type
const items: Project[] = [];
\`\`\`

### 5. React State
\`\`\`typescript
// Before
const [data, setData] = useState<unknown>(null);

// After
const [data, setData] = useState<Project | null>(null);
\`\`\`

## Complex Fixes (Require Domain Knowledge)

### 6. API Responses
\`\`\`typescript
// Before
const response = await fetch('/api/data') as unknown;

// After
interface ApiResponse<T> {
  data?: T;
  error?: string;
}
const response = await fetch('/api/data') as ApiResponse<Project>;
\`\`\`

### 7. Event Handlers
\`\`\`typescript
// Before
onChange: (value: unknown) => void;

// After
onChange: (value: string | number) => void;
\`\`\`

## Type Guards for Unknown Types

\`\`\`typescript
// Use these helpers when working with unknown
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isError(value: unknown): value is Error {
  return value instanceof Error;
}

function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return typeof obj === 'object' && obj !== null && key in obj;
}
\`\`\`
`;
}

// Main execution
console.log('🔍 Analyzing "any" type usage...\n');

const srcPath = path.join(process.cwd(), 'src');
const results = scanDirectory(srcPath);

// Build report
const report: AnalysisReport = {
  totalCount: results.length,
  byType: {},
  bySeverity: { easy: 0, medium: 0, complex: 0 },
  byFile: {},
  topFiles: [],
  suggestions: {},
};

// Aggregate data
results.forEach(result => {
  // By type
  report.byType[result.type] = (report.byType[result.type] || 0) + 1;

  // By severity
  report.bySeverity[result.severity]++;

  // By file
  const relPath = path.relative(process.cwd(), result.file);
  if (!report.byFile[relPath]) {
    report.byFile[relPath] = [];
  }
  report.byFile[relPath].push(result);
});

// Get top files
report.topFiles = Object.entries(report.byFile)
  .map(([file, issues]) => ({ file, count: issues.length }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 10);

// Generate comprehensive report
let output = `# 'any' Type Analysis Report

Generated: ${new Date().toISOString()}

## Summary
- **Total instances:** ${report.totalCount}
- **Files affected:** ${Object.keys(report.byFile).length}

## By Severity
- 🟢 Easy fixes: ${report.bySeverity.easy}
- 🟡 Medium complexity: ${report.bySeverity.medium}
- 🔴 Complex fixes: ${report.bySeverity.complex}

## By Type
${Object.entries(report.byType)
  .sort(([, a], [, b]) => b - a)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}

## Top 10 Files
${report.topFiles
  .map((item, i) => `${i + 1}. ${item.file} (${item.count} instances)`)
  .join('\n')}

## Detailed Analysis by File
`;

// Add detailed file analysis
Object.entries(report.byFile)
  .sort(([, a], [, b]) => b.length - a.length)
  .forEach(([file, issues]) => {
    output += `\n### ${file}\n\n`;

    // Group by severity
    const easy = issues.filter(i => i.severity === 'easy');
    const medium = issues.filter(i => i.severity === 'medium');
    const complex = issues.filter(i => i.severity === 'complex');

    if (easy.length > 0) {
      output += `#### 🟢 Easy fixes (${easy.length})\n`;
      easy.forEach(issue => {
        output += `- Line ${issue.line}: \`${issue.context}\`\n`;
        output += `  - ${issue.suggestion}\n`;
      });
      output += '\n';
    }

    if (medium.length > 0) {
      output += `#### 🟡 Medium complexity (${medium.length})\n`;
      medium.forEach(issue => {
        output += `- Line ${issue.line}: \`${issue.context}\`\n`;
        output += `  - ${issue.suggestion}\n`;
      });
      output += '\n';
    }

    if (complex.length > 0) {
      output += `#### 🔴 Complex fixes (${complex.length})\n`;
      complex.forEach(issue => {
        output += `- Line ${issue.line}: \`${issue.context}\`\n`;
        output += `  - ${issue.suggestion}\n`;
      });
      output += '\n';
    }
  });

// Save reports
fs.writeFileSync('ANY_TYPE_ANALYSIS.md', output);
fs.writeFileSync('ANY_TYPE_FIX_GUIDE.md', generateFixGuide());

// Console summary
console.log('📊 Analysis Complete!\n');
console.log(`Total 'any' instances: ${report.totalCount}`);
console.log(`Files affected: ${Object.keys(report.byFile).length}\n`);

console.log('By Severity:');
console.log(
  `  🟢 Easy fixes: ${report.bySeverity.easy} (can be done with find/replace)`
);
console.log(`  🟡 Medium: ${report.bySeverity.medium} (need context)`);
console.log(
  `  🔴 Complex: ${report.bySeverity.complex} (need domain knowledge)\n`
);

console.log('📄 Reports generated:');
console.log('  - ANY_TYPE_ANALYSIS.md (detailed file-by-file breakdown)');
console.log('  - ANY_TYPE_FIX_GUIDE.md (manual fix instructions)\n');

console.log('💡 Recommended approach:');
console.log('  1. Start with easy fixes (catch blocks, Record types)');
console.log('  2. Create missing type definitions in src/types/');
console.log('  3. Fix medium complexity issues file by file');
console.log('  4. Address complex issues with team input');
