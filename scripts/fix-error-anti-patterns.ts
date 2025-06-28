#!/usr/bin/env tsx

/**
 * Script to detect and fix error handling anti-patterns
 *
 * This script identifies files using the old error handling patterns
 * and provides guidance on how to fix them.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

interface AntiPattern {
  file: string;
  line: number;
  pattern: string;
  issue: string;
  fix: string;
}

const ANTI_PATTERNS = [
  {
    regex: /if\s*\(\s*!response\.ok\s*\)/g,
    issue: '❌ DEAD CODE: Checking response.ok after apiFetch',
    fix: '✅ Remove this check - apiFetch throws automatically',
  },
  {
    regex:
      /const errorData = await response\.json\(\)\.catch\(\(\) => \(\{\}\)\)/g,
    issue: '❌ DEAD CODE: Parsing error response after apiFetch',
    fix: '✅ Remove this - apiFetch handles error parsing',
  },
  {
    regex: /throw new Error\(errorData\.error \|\| /g,
    issue: '❌ DEAD CODE: Manual error throwing with errorData',
    fix: '✅ Remove this - apiFetch throws structured errors',
  },
  {
    regex:
      /onError:\s*\(error:\s*Error\)\s*=>\s*\{[\s\S]*?logger\.error[\s\S]*?showErrorToast/g,
    issue: '❌ DUPLICATE: Standard onError with logging + toast',
    fix: '✅ Remove onError - handled globally',
  },
  {
    regex: /const response = await fetch\(/g,
    issue: '❌ SECURITY: Using raw fetch instead of apiFetch',
    fix: '✅ Replace fetch with apiFetch for tenant headers',
  },
];

const INCLUDE_PATTERNS = ['.ts', '.tsx'];
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next'];

async function getAllFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !EXCLUDE_DIRS.includes(entry.name)) {
        files.push(...(await getAllFiles(fullPath)));
      } else if (
        entry.isFile() &&
        INCLUDE_PATTERNS.some(ext => entry.name.endsWith(ext))
      ) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Skipping directory ${dir}:`, error);
  }

  return files;
}

async function analyzeFile(filePath: string): Promise<AntiPattern[]> {
  const issues: AntiPattern[] = [];

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    for (const { regex, issue, fix } of ANTI_PATTERNS) {
      let match;
      regex.lastIndex = 0; // Reset regex state

      while ((match = regex.exec(content)) !== null) {
        const beforeMatch = content.substring(0, match.index);
        const lineNumber = beforeMatch.split('\n').length;
        const lineContent = lines[lineNumber - 1]?.trim() || '';

        issues.push({
          file: filePath,
          line: lineNumber,
          pattern: lineContent,
          issue,
          fix,
        });
      }
    }
  } catch (error) {
    console.warn(`Error analyzing ${filePath}:`, error);
  }

  return issues;
}

function formatResults(issues: AntiPattern[]): void {
  if (issues.length === 0) {
    console.log('🎉 No error handling anti-patterns found!');
    return;
  }

  console.log(`\n🚨 Found ${issues.length} error handling anti-patterns:\n`);

  // Group by file
  const byFile = issues.reduce(
    (acc, issue) => {
      if (!acc[issue.file]) acc[issue.file] = [];
      acc[issue.file].push(issue);
      return acc;
    },
    {} as Record<string, AntiPattern[]>
  );

  for (const [file, fileIssues] of Object.entries(byFile)) {
    console.log(`📁 ${file}`);

    for (const issue of fileIssues) {
      console.log(`   Line ${issue.line}: ${issue.issue}`);
      console.log(`   Code: ${issue.pattern}`);
      console.log(`   ${issue.fix}\n`);
    }
  }

  // Summary by issue type
  console.log('\n📊 Summary by Issue Type:');
  const byIssue = issues.reduce(
    (acc, issue) => {
      const key = issue.issue;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  for (const [issueType, count] of Object.entries(byIssue)) {
    console.log(`   ${issueType}: ${count} occurrences`);
  }
}

function printMigrationGuide(): void {
  console.log(`
🔧 MIGRATION GUIDE

Priority Order:
1. Fix response.ok checks (highest impact)
2. Remove duplicate onError handlers  
3. Replace raw fetch calls
4. Update error throwing patterns

Quick Fix Examples:

BEFORE:
const response = await apiFetch('/api/projects');
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.error || 'Failed to fetch projects');
}
return response.json();

AFTER:
const response = await apiFetch('/api/projects');
return response.json(); // That's it!

BEFORE:
onError: (error: Error) => {
  logger.error('Error creating project:', error);
  showErrorToast(toast, 'Error', error.message);
}

AFTER:
// Remove onError entirely - handled globally
// OR keep only if you need custom behavior:
onError: (error, variables) => {
  showCustomModal(\`Failed to create "\${variables.name}"\`);
}

📖 Full Guide: docs/ERROR_HANDLING_GUIDE.md
`);
}

async function main(): Promise<void> {
  console.log('🔍 Scanning for error handling anti-patterns...\n');

  const rootDir = process.cwd();
  const srcDir = path.join(rootDir, 'src');

  // Check if src directory exists
  try {
    await fs.access(srcDir);
  } catch {
    console.error(
      '❌ src directory not found. Run this script from the project root.'
    );
    process.exit(1);
  }

  const files = await getAllFiles(srcDir);
  console.log(`📂 Analyzing ${files.length} TypeScript files...\n`);

  const allIssues: AntiPattern[] = [];

  for (const file of files) {
    const issues = await analyzeFile(file);
    allIssues.push(...issues);
  }

  formatResults(allIssues);

  if (allIssues.length > 0) {
    printMigrationGuide();
    console.log('\n🎯 Next Steps:');
    console.log('1. Read docs/ERROR_HANDLING_GUIDE.md');
    console.log('2. Fix files with highest issue counts first');
    console.log('3. Run this script again to track progress');
    console.log('4. Test error scenarios after fixing');

    process.exit(1); // Exit with error code to fail CI if needed
  }
}

// Run the script if called directly
main().catch(console.error);
