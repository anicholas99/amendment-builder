#!/usr/bin/env ts-node
import * as fs from 'fs';
import * as path from 'path';

interface FileChange {
  file: string;
  changes: Array<{
    pattern: RegExp;
    replacement: string;
    description: string;
  }>;
}

// Define all the simple replacements we want to make
const simpleReplacements: FileChange[] = [
  // Fix all simple catch (error: any) blocks
  {
    file: 'src/features/search/hooks/usePriorArtManagement.ts',
    changes: [
      {
        pattern: /} catch \(error: any\) {/g,
        replacement: '} catch (error: unknown) {',
        description: 'Replace catch (error: any) with catch (error: unknown)',
      },
    ],
  },
  {
    file: 'src/features/search/hooks/useSavedArtAndExclusions.ts',
    changes: [
      {
        pattern: /} catch \(error: any\) {/g,
        replacement: '} catch (error: unknown) {',
        description: 'Replace catch (error: any) with catch (error: unknown)',
      },
    ],
  },
  {
    file: 'src/features/claim-refinement/components/LoadVersionModal.tsx',
    changes: [
      {
        pattern: /} catch \(error: any\) {/g,
        replacement: '} catch (error: unknown) {',
        description: 'Replace catch (error: any) with catch (error: unknown)',
      },
    ],
  },
  {
    file: 'src/features/claim-refinement/components/SaveClaimDraftButton.tsx',
    changes: [
      {
        pattern: /} catch \(error: any\) {/g,
        replacement: '} catch (error: unknown) {',
        description: 'Replace catch (error: any) with catch (error: unknown)',
      },
    ],
  },
  {
    file: 'src/features/patent-application/components/VersionsHistoryModal.tsx',
    changes: [
      {
        pattern: /} catch \(error: any\) {/g,
        replacement: '} catch (error: unknown) {',
        description: 'Replace catch (error: any) with catch (error: unknown)',
      },
    ],
  },
  {
    file: 'src/features/citation-extraction/hooks/useClaimSetVersions.ts',
    changes: [
      {
        pattern: /} catch \(error: any\) {/g,
        replacement: '} catch (error: unknown) {',
        description: 'Replace catch (error: any) with catch (error: unknown)',
      },
    ],
  },
  {
    file: 'src/lib/clients/patbase/patbaseClient.ts',
    changes: [
      {
        pattern: /} catch \(error: any\) {/g,
        replacement: '} catch (error: unknown) {',
        description: 'Replace catch (error: any) with catch (error: unknown)',
      },
    ],
  },
  {
    file: 'src/lib/api/asyncSemanticSearch.ts',
    changes: [
      {
        pattern: /} catch \(error: any\) {/g,
        replacement: '} catch (error: unknown) {',
        description: 'Replace catch (error: any) with catch (error: unknown)',
      },
    ],
  },
  {
    file: 'src/lib/api/patbase/familyService.ts',
    changes: [
      {
        pattern: /} catch \(error: any\) {/g,
        replacement: '} catch (error: unknown) {',
        description: 'Replace catch (error: any) with catch (error: unknown)',
      },
    ],
  },
  {
    file: 'src/lib/api/parse-claim.ts',
    changes: [
      {
        pattern: /} catch \(error: any\) {/g,
        replacement: '} catch (error: unknown) {',
        description: 'Replace catch (error: any) with catch (error: unknown)',
      },
    ],
  },
  {
    file: 'src/contexts/ProjectDataContext.tsx',
    changes: [
      {
        pattern: /} catch \(error: any\) {/g,
        replacement: '} catch (error: unknown) {',
        description: 'Replace catch (error: any) with catch (error: unknown)',
      },
    ],
  },
  {
    file: 'src/lib/generate-suggestions.ts',
    changes: [
      {
        pattern: /} catch \(parseError: any\) {/g,
        replacement: '} catch (parseError: unknown) {',
        description:
          'Replace catch (parseError: any) with catch (parseError: unknown)',
      },
      {
        pattern: /} catch \(apiError: any\) {/g,
        replacement: '} catch (apiError: unknown) {',
        description:
          'Replace catch (apiError: any) with catch (apiError: unknown)',
      },
    ],
  },
  // Fix all Record<string, any> patterns
  {
    file: 'src/pages/api/projects/[projectId]/exclusions.ts',
    changes: [
      {
        pattern: /Record<string, any>/g,
        replacement: 'Record<string, unknown>',
        description: 'Replace Record<string, any> with Record<string, unknown>',
      },
    ],
  },
  {
    file: 'src/middleware/activityLogger.ts',
    changes: [
      {
        pattern: /Record<string, any>/g,
        replacement: 'Record<string, unknown>',
        description: 'Replace Record<string, any> with Record<string, unknown>',
      },
    ],
  },
];

// Function to apply replacements to a file
async function applyReplacements(fileChange: FileChange): Promise<void> {
  const filePath = path.join(process.cwd(), fileChange.file);

  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    let changeCount = 0;

    for (const change of fileChange.changes) {
      const matches = content.match(change.pattern);
      if (matches) {
        content = content.replace(change.pattern, change.replacement);
        changeCount += matches.length;
        console.log(`  ✓ ${change.description} (${matches.length} instances)`);
      }
    }

    if (changeCount > 0) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated ${fileChange.file} (${changeCount} changes)\n`);
    } else {
      console.log(`⏭️  No changes needed in ${fileChange.file}\n`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${fileChange.file}:`, error);
  }
}

// Main execution
async function main() {
  console.log('🔧 Applying simple any type fixes...\n');

  for (const fileChange of simpleReplacements) {
    await applyReplacements(fileChange);
  }

  console.log('\n✅ Simple fixes complete!');
  console.log('\nNext steps:');
  console.log(
    '1. Run TypeScript compiler to check for any new errors: npm run type-check'
  );
  console.log('2. Add type guards where needed for error handling');
  console.log('3. Replace remaining any types with proper types');
}

main().catch(console.error);
