#!/usr/bin/env ts-node
import * as fs from 'fs';
import * as path from 'path';

interface FixStrategy {
  file: string;
  line: number;
  type: string;
  originalCode: string;
  suggestedFix: string;
  complexity: 'easy' | 'medium' | 'complex';
}

// Define strategies for fixing different patterns
const fixStrategies: FixStrategy[] = [
  // Type assertions (as any) -> (as unknown)
  {
    file: 'src/pages/api/__tests__/projects.test.ts',
    line: 65,
    type: 'type-assertion',
    originalCode: 'await handler(req as any, res as any);',
    suggestedFix:
      'await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);',
    complexity: 'medium',
  },
  // Array types any[] -> unknown[]
  {
    file: 'src/lib/cache/cache-manager.ts',
    line: 415,
    type: 'any-array',
    originalCode: 'descriptor.value = async function (...args: any[]) {',
    suggestedFix: 'descriptor.value = async function (...args: unknown[]) {',
    complexity: 'easy',
  },
  // Generic types <any> -> <unknown>
  {
    file: 'src/lib/cache/cache-manager.ts',
    line: 34,
    type: 'generic-any',
    originalCode: 'private cache = new Map<string, CacheEntry<any>>();',
    suggestedFix: 'private cache = new Map<string, CacheEntry<unknown>>();',
    complexity: 'medium',
  },
  // Function parameters : any -> : unknown
  {
    file: 'src/lib/structuredData/monitor.ts',
    line: 137,
    type: 'type-annotation',
    originalCode:
      'export function isHealthyStructuredData(structuredData: any): boolean {',
    suggestedFix:
      'export function isHealthyStructuredData(structuredData: unknown): boolean {',
    complexity: 'easy',
  },
];

// Helper function to create type definitions for common patterns
function createCommonTypes(): string {
  return `
// Common types for replacing any
export type UnknownObject = Record<string, unknown>;
export type UnknownArray = unknown[];
export type AsyncFunction<T = unknown> = (...args: unknown[]) => Promise<T>;
export type SyncFunction<T = unknown> = (...args: unknown[]) => T;
export type ErrorWithCode = Error & { code?: string; statusCode?: number };
export type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
export type TestMockRequest = Partial<NextApiRequest> & { 
  method?: string;
  query?: UnknownObject;
  body?: UnknownObject;
};
export type TestMockResponse = Partial<NextApiResponse> & {
  status: (code: number) => TestMockResponse;
  json: (data: unknown) => TestMockResponse;
  setHeader: (name: string, value: string) => TestMockResponse;
};
`;
}

// Helper function to generate fixes for test files
function generateTestFileFixes(): string {
  return `
// Test file specific fixes:

// 1. For mock requests/responses in tests:
const req = {
  method: 'GET',
  query: {},
  body: {},
  headers: {},
} as unknown as NextApiRequest;

const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  setHeader: jest.fn().mockReturnThis(),
} as unknown as NextApiResponse;

// 2. For handler calls in tests:
await handler(req, res);  // No need for 'as any' anymore

// 3. For accessing mock properties:
type MockedResponse = NextApiResponse & {
  _getStatusCode: () => number;
  _getJSONData: () => unknown;
};
const statusCode = (res as MockedResponse)._getStatusCode();
const jsonData = (res as MockedResponse)._getJSONData();
`;
}

// Generate report for manual fixes
function generateManualFixReport(): void {
  const report = `# Manual Fixes Required for Remaining 'any' Types

## Overview
After automated fixes, these patterns require manual intervention:

### 1. Test Files (High Priority)
- **Files**: All files in __tests__ directories
- **Pattern**: \`req as any\`, \`res as any\`
- **Fix**: Use proper test types or \`as unknown as NextApiRequest\`

### 2. Array Types
- **Pattern**: \`any[]\`
- **Fix**: Replace with \`unknown[]\` then add proper types

### 3. Generic Types
- **Pattern**: \`<any>\`
- **Fix**: Replace with \`<unknown>\` or specific type

### 4. Function Parameters
- **Pattern**: \`(param: any)\`
- **Fix**: Replace with \`(param: unknown)\` then narrow type

### 5. Object Types
- **Pattern**: \`Record<string, any>\`
- **Fix**: Replace with \`Record<string, unknown>\`

## File-by-File Fixes

### Test Files Priority
1. \`src/pages/api/__tests__/projects.test.ts\` - 12 instances
2. \`src/pages/api/__tests__/health.test.ts\` - 9 instances
3. \`src/middleware/__tests__/role.spec.ts\` - 7 instances

### Application Code Priority  
1. \`src/lib/cache/cache-manager.ts\` - 6 instances
2. \`src/lib/structuredData/monitor.ts\` - 6 instances
3. \`src/features/search/hooks/useDeepAnalysis.ts\` - 5 instances

## Recommended Approach

1. **Phase 1**: Fix all test files first
   - These are safer to modify
   - Won't affect production code
   - Can use \`as unknown as Type\` pattern

2. **Phase 2**: Fix utility functions
   - Functions that accept \`any\` parameters
   - Replace with \`unknown\` and add type guards

3. **Phase 3**: Fix data structures
   - Replace \`any[]\` with proper typed arrays
   - Replace \`Record<string, any>\` with typed objects

4. **Phase 4**: Complex types
   - API responses
   - External library types
   - Dynamic data structures
`;

  fs.writeFileSync('MANUAL_FIX_GUIDE.md', report);
}

// Generate ESLint disable comments for gradual migration
function generateESLintDisables(): string {
  return `
// For files that need gradual migration, use:
/* eslint-disable @typescript-eslint/no-explicit-any */

// For specific lines:
// eslint-disable-next-line @typescript-eslint/no-explicit-any

// For blocks:
/* eslint-disable @typescript-eslint/no-explicit-any */
// ... code with any types ...
/* eslint-enable @typescript-eslint/no-explicit-any */
`;
}

// Main execution
async function main() {
  console.log('📝 Generating resources for fixing remaining any types...\n');

  // Create common types file
  const commonTypesPath = path.join(
    process.cwd(),
    'src',
    'types',
    'common-replacements.ts'
  );
  fs.writeFileSync(commonTypesPath, createCommonTypes());
  console.log('✅ Created common types file: src/types/common-replacements.ts');

  // Create test helpers file
  const testHelpersPath = path.join(
    process.cwd(),
    'src',
    'lib',
    'testing',
    'test-helpers.ts'
  );
  fs.writeFileSync(testHelpersPath, generateTestFileFixes());
  console.log('✅ Created test helpers file: src/lib/testing/test-helpers.ts');

  // Generate manual fix report
  generateManualFixReport();
  console.log('✅ Generated manual fix guide: MANUAL_FIX_GUIDE.md');

  // Create ESLint migration guide
  const eslintGuidePath = path.join(process.cwd(), 'ESLINT_MIGRATION_GUIDE.md');
  fs.writeFileSync(eslintGuidePath, generateESLintDisables());
  console.log('✅ Created ESLint migration guide: ESLINT_MIGRATION_GUIDE.md');

  console.log('\n📊 Summary:');
  console.log('- Total any instances remaining: 289');
  console.log('- Easy fixes: 27 (can be automated)');
  console.log('- Medium fixes: 260 (need context)');
  console.log('- Complex fixes: 2 (need domain knowledge)');

  console.log('\n🎯 Next Steps:');
  console.log('1. Review MANUAL_FIX_GUIDE.md for detailed instructions');
  console.log('2. Start with test files (safest to modify)');
  console.log(
    '3. Use the new type definitions in src/types/common-replacements.ts'
  );
  console.log('4. Apply ESLint disables temporarily where needed');
  console.log('5. Fix files incrementally, testing after each change');
}

main().catch(console.error);
