#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

interface AuditResult {
  file: string;
  methods: string[];
  hasCsrf: boolean;
  hasComposeApiMiddleware: boolean;
  line?: number;
}

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
const API_DIR = path.join(process.cwd(), 'src', 'pages', 'api');

// Patterns to look for
const CSRF_PATTERNS = [/withCsrf\s*\(/, /composeApiMiddleware\s*\(/];

const METHOD_PATTERNS = {
  POST: /req\.method\s*===?\s*['"]POST['"]/,
  PUT: /req\.method\s*===?\s*['"]PUT['"]/,
  PATCH: /req\.method\s*===?\s*['"]PATCH['"]/,
  DELETE: /req\.method\s*===?\s*['"]DELETE['"]/,
};

function checkFile(filePath: string): AuditResult | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Skip test files
    if (
      filePath.includes('__tests__') ||
      filePath.includes('.test.') ||
      filePath.includes('.spec.')
    ) {
      return null;
    }

    // Check if file exports a handler
    if (
      !content.includes('export default') &&
      !content.includes('export async function')
    ) {
      return null;
    }

    // Check for mutating methods
    const methods: string[] = [];
    let methodLine: number | undefined;

    for (const [method, pattern] of Object.entries(METHOD_PATTERNS)) {
      if (pattern.test(content)) {
        methods.push(method);
        // Find the line number
        if (!methodLine) {
          lines.forEach((line, index) => {
            if (pattern.test(line)) {
              methodLine = index + 1;
            }
          });
        }
      }
    }

    // If no mutating methods, skip
    if (methods.length === 0) {
      return null;
    }

    // Check for CSRF protection
    const hasWithCsrf = /withCsrf\s*\(/.test(content);
    const hasComposeApiMiddleware = /composeApiMiddleware\s*\(/.test(content);

    // Only consider it protected if it has withCsrf
    const hasCsrf = hasWithCsrf;

    return {
      file: filePath,
      methods,
      hasCsrf,
      hasComposeApiMiddleware,
      line: methodLine,
    };
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

function formatResults(results: AuditResult[]): void {
  const missingCsrf = results.filter(r => !r.hasCsrf);

  if (missingCsrf.length === 0) {
    console.log('✅ All mutating API routes have CSRF protection!');
    return;
  }

  console.log(
    `\n[!] Missing CSRF protection in ${missingCsrf.length} file(s):\n`
  );

  missingCsrf.forEach(result => {
    const relativePath = path.relative(process.cwd(), result.file);
    const methods = result.methods.join(', ');
    const lineInfo = result.line ? `:${result.line}` : '';

    console.log(`- ${relativePath}${lineInfo} (${methods})`);

    if (!result.hasComposeApiMiddleware) {
      console.log(`  ⚠️  Consider using composeApiMiddleware`);
    }
  });

  console.log(
    '\n→ Consider wrapping with `withCsrf` inside `composeApiMiddleware(...)`'
  );
  console.log('\nExample fix:');
  console.log(`
import { composeApiMiddleware } from '@/lib/middleware';
import { withCsrf } from '@/lib/middleware/csrf';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Your handler logic
};

export default composeApiMiddleware(
  withCsrf,
  // ... other middleware
)(handler);
`);
}

async function main() {
  console.log('🔍 Auditing API routes for CSRF protection...\n');

  // Find all API route files
  const pattern = path.join(API_DIR, '**/*.{ts,tsx}').replace(/\\/g, '/');
  const files = glob.sync(pattern);

  console.log(`Found ${files.length} API route files\n`);

  const results: AuditResult[] = [];

  for (const file of files) {
    const result = checkFile(file);
    if (result) {
      results.push(result);
    }
  }

  formatResults(results);

  // Exit with error code if issues found
  const hasIssues = results.some(r => !r.hasCsrf);
  process.exit(hasIssues ? 1 : 0);
}

// Run the audit
main().catch(console.error);
