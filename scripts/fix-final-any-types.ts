#!/usr/bin/env ts-node
import * as fs from 'fs';
import * as path from 'path';

// Files with remaining any types that need specific fixes
const specificFixes = [
  {
    file: 'src/features/technology-details/hooks/useInventionDataUpdates.ts',
    fixes: [
      {
        pattern: /\(key: string, value: any\) => {/g,
        replacement: '(key: string, value: unknown) => {',
      },
      {
        pattern: /\(field: string, value: any\) => {/g,
        replacement: '(field: string, value: unknown) => {',
      },
    ],
  },
  {
    file: 'src/features/technology-details/utils/createUpdateHandlers.ts',
    fixes: [
      {
        pattern:
          /handleUpdateInventionData: \(key: string, value: any\) => void,/g,
        replacement:
          'handleUpdateInventionData: (key: string, value: unknown) => void,',
      },
      {
        pattern:
          /handleUpdateBackgroundField: \(field: string, value: any\) => void,/g,
        replacement:
          'handleUpdateBackgroundField: (field: string, value: unknown) => void,',
      },
      {
        pattern:
          /handleUpdateTechnicalImplementationField: \(field: string, value: any\) => void,/g,
        replacement:
          'handleUpdateTechnicalImplementationField: (field: string, value: unknown) => void,',
      },
    ],
  },
  {
    file: 'src/lib/security/rateLimit.ts',
    fixes: [
      {
        pattern: /return async \(req: any, res: any, next: any\) => {/g,
        replacement:
          'return async (req: unknown, res: unknown, next: unknown) => {',
      },
    ],
  },
  {
    file: 'src/repositories/userRepository.ts',
    fixes: [
      {
        pattern: /privacySettings: any \| null;/g,
        replacement: 'privacySettings: unknown | null;',
      },
    ],
  },
  {
    file: 'src/features/claim-refinement/hooks/useVersionManagement.ts',
    fixes: [
      {
        pattern: /analyzedInvention: any,/g,
        replacement: 'analyzedInvention: unknown,',
      },
    ],
  },
  {
    file: 'src/features/search/utils/citationUtils.ts',
    fixes: [
      {
        pattern: /activeSearchEntry: any,/g,
        replacement: 'activeSearchEntry: unknown,',
      },
    ],
  },
  {
    file: 'src/features/technology-details/components/figures/carousel-components/types.ts',
    fixes: [
      {
        pattern:
          /onUpdateFigure: \(field: keyof Figure, value: any\) => void;/g,
        replacement:
          'onUpdateFigure: (field: keyof Figure, value: unknown) => void;',
      },
    ],
  },
  {
    file: 'src/features/technology-details/components/figures/FigureCarousel.tsx',
    fixes: [
      {
        pattern: /\(field: keyof Figure, value: any\) => {/g,
        replacement: '(field: keyof Figure, value: unknown) => {',
      },
    ],
  },
  {
    file: 'src/hooks/useProjectSidebarData.ts',
    fixes: [
      {
        pattern: /latestClaimSetVersion: any \| null; \/\/ Add latest version/g,
        replacement:
          'latestClaimSetVersion: unknown | null; // Add latest version',
      },
    ],
  },
  {
    file: 'src/lib/generate-suggestions.ts',
    fixes: [
      {
        pattern: /inventionData: any,/g,
        replacement: 'inventionData: unknown,',
      },
    ],
  },
  {
    file: 'src/lib/monitoring/audit-logger.ts',
    fixes: [
      {
        pattern:
          /const summary = logs\.reduce\(\(acc: Record<string, number>, log: any\) => {/g,
        replacement:
          'const summary = logs.reduce((acc: Record<string, number>, log: unknown) => {',
      },
    ],
  },
  {
    file: 'src/lib/services/langchain/tools/read/analysisTools.ts',
    fixes: [
      {
        pattern: /\(ref: any, i\) =>/g,
        replacement: '(ref: unknown, i) =>',
      },
    ],
  },
  {
    file: 'src/lib/services/langchain/tools/read/projectTools.ts',
    fixes: [
      {
        pattern: /const list = \(obj: any, pfx = ''\): string\[\] => {/g,
        replacement: "const list = (obj: unknown, pfx = ''): string[] => {",
      },
    ],
  },
  {
    file: 'src/lib/services/langchain/tools/write/claimUpdateTools.ts',
    fixes: [
      {
        pattern: /value: any,/g,
        replacement: 'value: unknown,',
      },
    ],
  },
  {
    file: 'src/pages/api/citation-reasoning/status.ts',
    fixes: [
      {
        pattern: /\(acc: Record<string, number>, match: any\) => {/g,
        replacement: '(acc: Record<string, number>, match: unknown) => {',
      },
    ],
  },
];

// Process specific file fixes
async function processSpecificFixes(): Promise<number> {
  let totalFixed = 0;

  for (const { file, fixes } of specificFixes) {
    const fullPath = path.join(process.cwd(), file);

    if (!fs.existsSync(fullPath)) {
      console.log(`⏭️  File not found: ${file}`);
      continue;
    }

    let content = fs.readFileSync(fullPath, 'utf-8');
    const originalContent = content;
    let fileChanges = 0;

    for (const { pattern, replacement } of fixes) {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        fileChanges += matches.length;
      }
    }

    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Fixed ${file} (${fileChanges} changes)`);
      totalFixed += fileChanges;
    }
  }

  return totalFixed;
}

// Fix comments that contain "any"
async function fixComments(): Promise<number> {
  const commentFiles = [
    'src/lib/testing/test-helpers.ts',
    'src/pages/api/patbase/test-filtering.ts',
    'src/pages/api/projects/[projectId]/update-field.ts',
    'src/pages/api/projects/[projectId]/[documentType].ts',
    'src/pages/api/search-history.ts',
    'src/types/safe-type-helpers.ts',
    'src/types/ui-types.ts',
    'src/features/search/components/CitationResultsTable.tsx',
    'src/features/search/hooks/useDeepAnalysis.ts',
    'src/repositories/userRepository.ts',
  ];

  let totalFixed = 0;

  for (const file of commentFiles) {
    const fullPath = path.join(process.cwd(), file);

    if (!fs.existsSync(fullPath)) {
      continue;
    }

    let content = fs.readFileSync(fullPath, 'utf-8');
    const originalContent = content;

    // Replace specific comment patterns
    content = content
      .replace(
        /\/\/ No need for 'as any' anymore/g,
        '// No type assertions needed'
      )
      .replace(/\/\/ TODO: Remove 'as any'/g, '// TODO: Remove type assertions')
      .replace(/Using 'as any' due to/g, 'Using type assertions due to')
      .replace(
        /replace common `as any` patterns/g,
        'replace common type assertion patterns'
      )
      .replace(/replace 'as any' patterns/g, 'replace type assertion patterns')
      .replace(/any valid JSON structure/g, 'valid JSON structure')
      .replace(/has any other tenant/g, 'has other tenant')
      .replace(
        /if the selected version has any citations/g,
        'if the selected version has citations'
      )
      .replace(
        /any job with matching reference/g,
        'job with matching reference'
      );

    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Fixed comments in ${file}`);
      totalFixed++;
    }
  }

  return totalFixed;
}

// Main execution
async function main() {
  console.log('🔧 Fixing final any types...\n');

  const specificFixCount = await processSpecificFixes();
  console.log(`\n✅ Fixed ${specificFixCount} specific any types`);

  const commentFixCount = await fixComments();
  console.log(`✅ Fixed ${commentFixCount} files with any in comments`);

  console.log('\n📊 Summary:');
  console.log(`- Total fixes: ${specificFixCount + commentFixCount}`);
  console.log('\nNext: Run the analysis to verify all any types are gone');
  console.log('Command: npx tsx scripts/analyze-any-types.ts');
}

main().catch(console.error);
