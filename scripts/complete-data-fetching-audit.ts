#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface DataFetchingIssue {
  file: string;
  line: number;
  pattern: 'axios' | 'fetch' | 'apiFetch-no-query' | 'manual-state';
  code: string;
  severity: 'critical' | 'high' | 'medium';
}

interface FileAnalysis {
  path: string;
  issues: DataFetchingIssue[];
  hasReactQuery: boolean;
  hasManualState: boolean;
}

async function analyzeFile(filePath: string): Promise<FileAnalysis | null> {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues: DataFetchingIssue[] = [];

  // Skip test files and API routes
  if (
    filePath.includes('.test.') ||
    filePath.includes('.spec.') ||
    filePath.includes('/pages/api/') ||
    filePath.includes('__tests__')
  ) {
    return null;
  }

  let hasReactQuery = false;
  let hasManualState = false;

  lines.forEach((line, index) => {
    // Check for axios usage
    if (line.includes('axios.') || line.includes('import axios')) {
      issues.push({
        file: filePath,
        line: index + 1,
        pattern: 'axios',
        code: line.trim(),
        severity: 'critical',
      });
    }

    // Check for direct fetch (not in apiFetch)
    if (
      line.includes('fetch(') &&
      !line.includes('apiFetch') &&
      !filePath.includes('apiClient.ts') &&
      !filePath.includes('apiFetch')
    ) {
      issues.push({
        file: filePath,
        line: index + 1,
        pattern: 'fetch',
        code: line.trim(),
        severity: 'critical',
      });
    }

    // Check for apiFetch without React Query
    if (
      line.includes('apiFetch(') &&
      !content.includes('useQuery') &&
      !content.includes('useMutation') &&
      !filePath.includes('/api/')
    ) {
      issues.push({
        file: filePath,
        line: index + 1,
        pattern: 'apiFetch-no-query',
        code: line.trim(),
        severity: 'high',
      });
    }

    // Check for manual loading states
    if (
      (line.includes('const [loading,') ||
        line.includes('const [isLoading,') ||
        line.includes('setLoading(') ||
        line.includes('setIsLoading(')) &&
      !line.includes('// React Query handles')
    ) {
      hasManualState = true;
      issues.push({
        file: filePath,
        line: index + 1,
        pattern: 'manual-state',
        code: line.trim(),
        severity: 'medium',
      });
    }

    // Check for React Query usage
    if (line.includes('useQuery') || line.includes('useMutation')) {
      hasReactQuery = true;
    }
  });

  return {
    path: filePath,
    issues,
    hasReactQuery,
    hasManualState,
  };
}

async function main() {
  console.log('🔍 Comprehensive Data Fetching Audit\n');

  // Get all TypeScript/React files
  const files = await glob('src/**/*.{ts,tsx}', {
    ignore: [
      '**/node_modules/**',
      '**/*.test.*',
      '**/*.spec.*',
      '**/pages/api/**', // API routes can use fetch directly
    ],
  });

  const analyses: FileAnalysis[] = [];

  for (const file of files) {
    const analysis = await analyzeFile(file);
    if (analysis && analysis.issues.length > 0) {
      analyses.push(analysis);
    }
  }

  // Sort by severity and number of issues
  analyses.sort((a, b) => {
    const aSeverity = a.issues.filter(i => i.severity === 'critical').length;
    const bSeverity = b.issues.filter(i => i.severity === 'critical').length;
    return bSeverity - aSeverity || b.issues.length - a.issues.length;
  });

  // Generate report
  console.log('📊 Summary:');
  console.log(`Total files with issues: ${analyses.length}`);
  console.log(
    `Total issues found: ${analyses.reduce((sum, a) => sum + a.issues.length, 0)}\n`
  );

  // Group by pattern
  const byPattern = {
    axios: 0,
    fetch: 0,
    'apiFetch-no-query': 0,
    'manual-state': 0,
  };

  analyses.forEach(a => {
    a.issues.forEach(issue => {
      byPattern[issue.pattern]++;
    });
  });

  console.log('🚨 Issues by Type:');
  console.log(
    `  Axios usage: ${byPattern.axios} (CRITICAL - breaks tenant headers)`
  );
  console.log(
    `  Direct fetch: ${byPattern.fetch} (CRITICAL - no auth/error handling)`
  );
  console.log(
    `  apiFetch without React Query: ${byPattern['apiFetch-no-query']} (HIGH - no caching)`
  );
  console.log(
    `  Manual loading states: ${byPattern['manual-state']} (MEDIUM - unnecessary code)\n`
  );

  // Show top 10 files to fix
  console.log('🎯 Top Priority Files to Migrate:\n');
  analyses.slice(0, 10).forEach((analysis, index) => {
    console.log(`${index + 1}. ${analysis.path}`);
    const critical = analysis.issues.filter(i => i.severity === 'critical');
    if (critical.length > 0) {
      console.log(`   🔴 ${critical.length} CRITICAL issues:`);
      critical.slice(0, 3).forEach(issue => {
        console.log(
          `      Line ${issue.line}: ${issue.code.substring(0, 60)}...`
        );
      });
    }
    console.log('');
  });

  // Generate detailed report
  const report = {
    summary: {
      totalFiles: analyses.length,
      totalIssues: analyses.reduce((sum, a) => sum + a.issues.length, 0),
      byPattern,
      timestamp: new Date().toISOString(),
    },
    files: analyses.map(a => ({
      path: a.path,
      issueCount: a.issues.length,
      criticalCount: a.issues.filter(i => i.severity === 'critical').length,
      issues: a.issues,
    })),
  };

  fs.writeFileSync('data-fetching-audit.json', JSON.stringify(report, null, 2));
  console.log('📄 Detailed report saved to: data-fetching-audit.json\n');

  // Generate migration script
  console.log('🛠️  Quick Fix Commands:\n');
  console.log('# Install React Query if not already installed:');
  console.log('npm install @tanstack/react-query\n');

  console.log('# Add ESLint rule to prevent axios/fetch:');
  console.log('Add to .eslintrc:');
  console.log(`{
  "rules": {
    "no-restricted-imports": ["error", {
      "paths": [{
        "name": "axios",
        "message": "Use apiFetch + React Query instead"
      }]
    }]
  }
}\n`);
}

main().catch(console.error);
