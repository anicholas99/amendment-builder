#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

interface EnvVarIssue {
  file: string;
  line: number;
  code: string;
  issue: string;
  suggestion?: string;
}

// Patterns to detect insecure env var usage
const INSECURE_PATTERNS = [
  {
    // Hardcoded fallback values that look like secrets
    pattern: /process\.env\.\w+\s*\|\|\s*['"][\w-]{20,}['"]/g,
    issue: 'Hardcoded fallback value that looks like a secret',
    suggestion: 'Use getRequiredEnvVar() or move to .env.example',
  },
  {
    // API keys/secrets with defaults
    pattern:
      /process\.env\.(\w*(?:KEY|SECRET|TOKEN|PASSWORD|CREDENTIAL)\w*)\s*\|\|\s*['"]\w+['"]/gi,
    issue: 'Sensitive environment variable with hardcoded fallback',
    suggestion: 'Use getRequiredEnvVar() for sensitive values',
  },
  {
    // Direct process.env access without validation
    pattern:
      /process\.env\.(\w+)(?!\s*\|\|)(?!\s*\?)(?!\s*&&)(?!\s*!)(?!\s*\})/g,
    issue: 'Direct env var access without fallback or validation',
    suggestion: 'Consider using getEnvVar() or getRequiredEnvVar()',
  },
  {
    // Hardcoded URLs that should be env vars
    pattern:
      /(https?:\/\/(?:localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(?:1[6-9]|2[0-9]|3[0-1])\.)[\w.:\/]+)/g,
    issue: 'Hardcoded local/private URL',
    suggestion: 'Move to environment variable',
  },
  {
    // Base64 encoded strings (potential secrets)
    pattern:
      /['"](?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?['"]/g,
    issue: 'Potential base64 encoded secret',
    suggestion: 'If this is a secret, move to environment variable',
    minLength: 32,
  },
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
  '**/*.md',
  '**/scripts/audit/**',
  '.env*',
];

function checkFile(filePath: string): EnvVarIssue[] {
  const issues: EnvVarIssue[] = [];

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Skip comments and empty lines
      if (
        line.trim().startsWith('//') ||
        line.trim().startsWith('/*') ||
        line.trim() === ''
      ) {
        return;
      }

      INSECURE_PATTERNS.forEach(({ pattern, issue, suggestion, minLength }) => {
        const regex = new RegExp(pattern);
        let match;

        while ((match = regex.exec(line)) !== null) {
          // Skip if minLength is specified and match is too short
          if (minLength && match[0].length < minLength) {
            continue;
          }

          // Skip common false positives
          if (
            match[0].includes('example.com') ||
            match[0].includes('test') ||
            match[0].includes('mock') ||
            match[0].includes('demo')
          ) {
            continue;
          }

          issues.push({
            file: filePath,
            line: index + 1,
            code: line.trim(),
            issue,
            suggestion,
          });
        }
      });
    });
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
  }

  return issues;
}

function formatResults(issues: EnvVarIssue[]): void {
  if (issues.length === 0) {
    console.log('✅ No insecure environment variable patterns found!');
    return;
  }

  console.log(`\n[!] Found ${issues.length} potential issue(s):\n`);

  // Group by file
  const byFile = issues.reduce(
    (acc, issue) => {
      if (!acc[issue.file]) {
        acc[issue.file] = [];
      }
      acc[issue.file].push(issue);
      return acc;
    },
    {} as Record<string, EnvVarIssue[]>
  );

  Object.entries(byFile).forEach(([file, fileIssues]) => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`\n📄 ${relativePath}`);

    fileIssues.forEach(issue => {
      console.log(`  Line ${issue.line}: ${issue.issue}`);
      console.log(`    ${issue.code}`);
      if (issue.suggestion) {
        console.log(`    💡 ${issue.suggestion}`);
      }
    });
  });

  console.log('\n\n📚 Recommended patterns:');
  console.log(`
// For required env vars (app won't start without them):
import { getRequiredEnvVar } from '@/lib/config/env';
const apiKey = getRequiredEnvVar('API_KEY');

// For optional env vars with defaults:
import { getEnvVar } from '@/lib/config/env';
const debugMode = getEnvVar('DEBUG_MODE', 'false');

// For validation with specific types:
const port = parseInt(getEnvVar('PORT', '3000'), 10);
`);
}

async function main() {
  console.log('🔍 Auditing environment variable usage...\n');

  // Find all TypeScript/JavaScript files
  const patterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];
  const allIssues: EnvVarIssue[] = [];

  for (const pattern of patterns) {
    const files = glob.sync(pattern, {
      ignore: SKIP_PATTERNS,
    });

    for (const file of files) {
      const issues = checkFile(file);
      allIssues.push(...issues);
    }
  }

  console.log(
    `Scanned ${glob.sync('{**/*.ts,**/*.tsx,**/*.js,**/*.jsx}', { ignore: SKIP_PATTERNS }).length} files`
  );

  formatResults(allIssues);

  // Exit with error code if issues found
  process.exit(allIssues.length > 0 ? 1 : 0);
}

// Run the audit
main().catch(console.error);
