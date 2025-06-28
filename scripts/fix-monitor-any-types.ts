#!/usr/bin/env ts-node
import * as fs from 'fs';
import * as path from 'path';

// Files to fix
const monitorFiles = [
  'src/lib/structuredData/monitor.ts',
  'src/lib/structuredData/index.ts',
  'src/features/search/hooks/useDeepAnalysis.ts',
  'src/lib/api/patbase/detailsService.ts',
  'src/lib/config/environment.ts',
];

// Fix patterns
const patterns = [
  // Function parameters
  {
    pattern: /export function checkStructuredDataHealth\(projectData: any\)/g,
    replacement:
      'export function checkStructuredDataHealth(projectData: Record<string, unknown>)',
  },
  {
    pattern: /rawValue: any;/g,
    replacement: 'rawValue: unknown;',
  },
  {
    pattern:
      /export function scanProjectsForStructuredDataIssues\(projects: any\[\]\)/g,
    replacement:
      'export function scanProjectsForStructuredDataIssues(projects: Array<Record<string, unknown>>)',
  },
  {
    pattern: /export function logStructuredDataIssues\(projects: any\[\]\)/g,
    replacement:
      'export function logStructuredDataIssues(projects: Array<Record<string, unknown>>)',
  },
  {
    pattern: /export function isHealthyStructuredData\(structuredData: any\)/g,
    replacement:
      'export function isHealthyStructuredData(structuredData: unknown)',
  },
  {
    pattern: /safeJsonParse<any>/g,
    replacement: 'safeJsonParse<unknown>',
  },
  // Deep analysis hooks
  {
    pattern: /citationMatchesData\?: any\[\]/g,
    replacement: 'citationMatchesData?: unknown[]',
  },
  {
    pattern: /useState<any>\(null\)/g,
    replacement: 'useState<unknown>(null)',
  },
  {
    pattern: /\(a: any, b: any\) =>/g,
    replacement: '(a: unknown, b: unknown) =>',
  },
  // Details service
  {
    pattern: /let patentData: any = null/g,
    replacement: 'let patentData: unknown = null',
  },
  {
    pattern: /let detailedRecord: any = null/g,
    replacement: 'let detailedRecord: unknown = null',
  },
  {
    pattern: /callPatbaseApi<any>/g,
    replacement: 'callPatbaseApi<unknown>',
  },
  {
    pattern: /let results: any\[\] = \[\]/g,
    replacement: 'let results: unknown[] = []',
  },
  // Environment logger
  {
    pattern: /\(message: string, \.\.\.args: any\[\]\)/g,
    replacement: '(message: string, ...args: unknown[])',
  },
  // Other any arrays
  {
    pattern: /: any\[\]/g,
    replacement: ': unknown[]',
  },
  // CitationMatch any
  {
    pattern: /\(match: any\)/g,
    replacement: '(match: unknown)',
  },
  // Record<string, any>
  {
    pattern: /Record<string, any>/g,
    replacement: 'Record<string, unknown>',
  },
  // Generic any replacements
  {
    pattern: /: any\)/g,
    replacement: ': unknown)',
  },
  {
    pattern: /\(art: any, index: number\)/g,
    replacement: '(art: unknown, index: number)',
  },
  {
    pattern: /\(results: any\[\], count: number/g,
    replacement: '(results: unknown[], count: number',
  },
  {
    pattern: /\(searchHistory: any\[\]\)/g,
    replacement: '(searchHistory: unknown[])',
  },
  // Direct any usage
  {
    pattern: /\(value: any\)/g,
    replacement: '(value: unknown)',
  },
  {
    pattern: /\(obj: any, pfx/g,
    replacement: '(obj: unknown, pfx',
  },
  {
    pattern: /setState<any>/g,
    replacement: 'setState<unknown>',
  },
];

// Process file
async function processFile(filePath: string): Promise<void> {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;
  let changeCount = 0;

  // Apply all patterns
  for (const { pattern, replacement } of patterns) {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      changeCount += matches.length;
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed ${filePath} (${changeCount} changes)`);
  } else {
    console.log(`⏭️  No changes needed in ${filePath}`);
  }
}

// Main execution
async function main() {
  console.log('🔧 Fixing any types in monitor and related files...\n');

  for (const file of monitorFiles) {
    await processFile(file);
  }

  console.log('\n✅ Monitor files fixed!');
}

main().catch(console.error);
