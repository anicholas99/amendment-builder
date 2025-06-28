#!/usr/bin/env ts-node

/**
 * Script to analyze data fetching patterns in the codebase
 * Identifies files using axios, direct fetch, or other non-standard patterns
 */

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

interface FileReport {
  file: string;
  patterns: {
    axios: number;
    fetch: number;
    apiFetch: number;
    useQuery: number;
    useMutation: number;
    useState: number;
  };
  issues: string[];
}

const FRONTEND_DIRS = [
  'src/components',
  'src/features',
  'src/hooks',
  'src/utils',
  'src/contexts',
  'src/pages/*.tsx', // Pages but not API routes
];

const EXCLUDED_PATTERNS = [
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
  '**/__tests__/**',
  '**/node_modules/**',
];

function analyzeFile(filePath: string): FileReport {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues: string[] = [];

  const patterns = {
    axios:
      (content.match(/\baxios\./g) || []).length +
      (content.match(/import.*axios/g) || []).length,
    fetch: (content.match(/\bfetch\(/g) || []).length,
    apiFetch: (content.match(/\bapiFetch\(/g) || []).length,
    useQuery: (content.match(/\buseQuery[<(]/g) || []).length,
    useMutation: (content.match(/\buseMutation[<(]/g) || []).length,
    useState: (content.match(/useState.*(?:loading|error|data)/gi) || [])
      .length,
  };

  // Identify issues
  if (patterns.axios > 0) {
    issues.push(`Uses axios (${patterns.axios} times)`);
  }

  if (patterns.fetch > 0) {
    issues.push(`Uses direct fetch() (${patterns.fetch} times)`);
  }

  if (
    patterns.useState > 0 &&
    (patterns.axios > 0 || patterns.fetch > 0 || patterns.apiFetch > 0)
  ) {
    issues.push('Manual state management with API calls');
  }

  if (
    patterns.apiFetch > 0 &&
    patterns.useQuery === 0 &&
    patterns.useMutation === 0
  ) {
    issues.push('Uses apiFetch without React Query');
  }

  return { file: filePath, patterns, issues };
}

function getFiles(): string[] {
  const files: string[] = [];

  FRONTEND_DIRS.forEach(dir => {
    let pattern: string;
    if (dir.includes('*')) {
      // Already has a glob pattern
      pattern = dir;
    } else {
      // Add glob pattern for subdirectories
      pattern = path.join(dir, '**/*.{ts,tsx}');
    }

    const matches = glob.sync(pattern, {
      ignore: EXCLUDED_PATTERNS,
    });
    files.push(...matches);
  });

  return Array.from(new Set(files)); // Remove duplicates
}

function generateReport() {
  console.log('🔍 Analyzing Data Fetching Patterns...\n');

  const files = getFiles();
  const reports: FileReport[] = [];

  files.forEach(file => {
    const report = analyzeFile(file);
    if (report.issues.length > 0) {
      reports.push(report);
    }
  });

  // Sort by number of issues
  reports.sort((a, b) => b.issues.length - a.issues.length);

  // Summary statistics
  const stats = {
    totalFiles: files.length,
    filesWithIssues: reports.length,
    axiosUsage: reports.filter(r => r.patterns.axios > 0).length,
    fetchUsage: reports.filter(r => r.patterns.fetch > 0).length,
    manualStateManagement: reports.filter(r =>
      r.issues.some(i => i.includes('Manual state'))
    ).length,
    apiFetchWithoutReactQuery: reports.filter(r =>
      r.issues.some(i => i.includes('without React Query'))
    ).length,
  };

  console.log('📊 Summary Statistics:');
  console.log(`Total frontend files analyzed: ${stats.totalFiles}`);
  console.log(`Files needing migration: ${stats.filesWithIssues}`);
  console.log(`Files using axios: ${stats.axiosUsage}`);
  console.log(`Files using direct fetch: ${stats.fetchUsage}`);
  console.log(
    `Files with manual state management: ${stats.manualStateManagement}`
  );
  console.log(
    `Files using apiFetch without React Query: ${stats.apiFetchWithoutReactQuery}`
  );
  console.log('\n');

  // Detailed report
  console.log('📋 Files Requiring Migration (sorted by priority):\n');

  reports.slice(0, 20).forEach((report, index) => {
    console.log(`${index + 1}. ${report.file}`);
    report.issues.forEach(issue => {
      console.log(`   ⚠️  ${issue}`);
    });
    console.log('');
  });

  if (reports.length > 20) {
    console.log(`... and ${reports.length - 20} more files\n`);
  }

  // Save full report to file
  const fullReport = {
    timestamp: new Date().toISOString(),
    stats,
    files: reports,
  };

  fs.writeFileSync(
    'data-fetching-report.json',
    JSON.stringify(fullReport, null, 2)
  );

  console.log('💾 Full report saved to data-fetching-report.json\n');

  // Migration priority
  console.log('🎯 Migration Priority:\n');
  console.log('1. Components using axios in features/ directory');
  console.log('2. Components with manual state management');
  console.log('3. Hooks that could be converted to React Query');
  console.log('4. Services using direct fetch instead of apiFetch');
}

// Run the analysis
generateReport();
