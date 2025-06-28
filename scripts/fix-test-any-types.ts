#!/usr/bin/env ts-node
import * as fs from 'fs';
import * as path from 'path';

// Test files that need fixing
const testFiles = [
  'src/pages/api/__tests__/projects.test.ts',
  'src/pages/api/__tests__/health.test.ts',
  'src/middleware/__tests__/role.spec.ts',
  'src/pages/api/__tests__/authorization.spec.ts',
];

// Fix patterns for test files
const testPatterns = [
  {
    // Handler calls in tests
    pattern: /await handler\(req as any, res as any\)/g,
    replacement:
      'await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse)',
  },
  {
    // Sync handler calls
    pattern: /handler\(req as any, res as any\)/g,
    replacement:
      'handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse)',
  },
  {
    // Mock function returns
    pattern: /mockReturnValue\((\w+) as any\)/g,
    replacement: 'mockReturnValue($1 as unknown)',
  },
  {
    // Type annotations in function params
    pattern:
      /function createMocksWithEnv\(options: any\): \{ req: any; res: any \}/g,
    replacement:
      'function createMocksWithEnv(options: Record<string, unknown>): { req: NextApiRequest; res: NextApiResponse }',
  },
  {
    // Req property assignments
    pattern: /\(req as any\)\.([\w]+) =/g,
    replacement: '(req as Record<string, unknown>).$1 =',
  },
  {
    // Res as any patterns
    pattern: /const res: any = \{/g,
    replacement: 'const res = {',
  },
  {
    // Return this as any
    pattern: /return this as any;/g,
    replacement: 'return this;',
  },
  {
    // Function parameter any types
    pattern: /json\(payload: any\)/g,
    replacement: 'json(payload: unknown)',
  },
  {
    // Response body types
    pattern: /NextApiResponse & \{ body: any \}/g,
    replacement: 'NextApiResponse & { body: unknown }',
  },
  {
    // Expect assertions
    pattern: /expect\(\(res as any\)\.(body|_getData|_getStatusCode)\)/g,
    replacement: 'expect((res as Record<string, any>).$1)',
  },
  {
    // Method as any
    pattern: /method: method as any,/g,
    replacement: 'method: method as string,',
  },
  {
    // Query as any
    pattern: /\(req\.query as any\)\.([\w]+) =/g,
    replacement: '(req.query as Record<string, unknown>).$1 =',
  },
  {
    // Any arrays
    pattern: /: any\[\]/g,
    replacement: ': unknown[]',
  },
  {
    // Null/undefined as any
    pattern: /(null|undefined) as any/g,
    replacement: '$1 as unknown',
  },
];

// Function to add imports if missing
function ensureImports(content: string): string {
  const hasNextImport = content.includes("from 'next'");

  if (
    !hasNextImport &&
    (content.includes('NextApiRequest') || content.includes('NextApiResponse'))
  ) {
    // Add import after the first import statement
    const firstImportMatch = content.match(/import .* from .*;/);
    if (firstImportMatch) {
      const firstImport = firstImportMatch[0];
      const insertPosition = content.indexOf(firstImport) + firstImport.length;
      return (
        content.slice(0, insertPosition) +
        "\nimport { NextApiRequest, NextApiResponse } from 'next';" +
        content.slice(insertPosition)
      );
    }
  }

  return content;
}

// Process each test file
async function processTestFile(filePath: string): Promise<void> {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;
  let changeCount = 0;

  // Apply all patterns
  for (const { pattern, replacement } of testPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      changeCount += matches.length;
    }
  }

  // Ensure imports are present
  content = ensureImports(content);

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed ${filePath} (${changeCount} changes)`);
  } else {
    console.log(`⏭️  No changes needed in ${filePath}`);
  }
}

// Main execution
async function main() {
  console.log('🔧 Fixing any types in test files...\n');

  for (const file of testFiles) {
    await processTestFile(file);
  }

  console.log('\n✅ Test files fixed!');
  console.log('\nNext: Run TypeScript compiler to check for any new errors');
  console.log('Command: npm run type-check');
}

main().catch(console.error);
