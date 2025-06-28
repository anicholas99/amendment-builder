#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import { join, relative, basename } from 'path';
import { execSync } from 'child_process';

const PROJECT_ROOT = join(__dirname, '..');

// Files to specifically check
const filesToCheck = [
  // Components that seem unused
  'src/components/common/DarkModeComponents.tsx',
  'src/components/common/NavigationLink.tsx',
  'src/components/common/ProjectTransitionWrapper.tsx',
  'src/components/common/RateLimitErrorBoundary.tsx',
  'src/components/common/TenantDebugPanel.tsx',
  
  // Hooks that seem unused
  'src/hooks/useError.ts',
  'src/hooks/usePolling.ts',
  'src/hooks/useStaggeredLoading.ts',
  'src/hooks/useTenant.ts',
  'src/hooks/useThrottledQueryInvalidation.ts',
  
  // Utils that seem unused
  'src/utils/apiHandlerTypes.ts',
  'src/utils/apiVersioning.ts',
  'src/utils/costTracker.ts',
  'src/utils/error-handling/error-handler.ts',
  'src/utils/queryCache.debug.ts',
  'src/utils/response-utils.ts',
  'src/utils/server-logging.ts',
  'src/utils/type-guards.ts',
  'src/utils/typeUtils.ts',
  'src/utils/unsavedChanges.ts',
  
  // Services that seem unused
  'src/client/services/storage/blob-storage.client-service.ts',
  'src/server/services/cached-semantic-search.server-service.ts',
  'src/server/services/external-ai-api.server-service.ts',
  'src/server/services/prior-art-analysis-cache.server-service.ts',
  'src/server/services/search-history.server-service.ts',
  'src/server/services/snippet-extraction.server-service.ts',
  
  // Types that seem unused
  'src/types/api-helpers.ts',
  'src/types/api-responses.ts',
  'src/types/citations.ts',
  'src/types/common-replacements.ts',
  'src/types/components.ts',
  'src/types/hooks.ts',
  'src/types/project-enhancements.ts',
  'src/types/suggestionTypes.ts',
  'src/types/tools.ts',
  'src/types/utility.ts',
];

function checkFileUsage(file: string) {
  const fullPath = join(PROJECT_ROOT, file);
  
  if (!existsSync(fullPath)) {
    console.log(`❌ File not found: ${file}`);
    return;
  }
  
  const fileName = basename(file).replace(/\.(ts|tsx|js|jsx)$/, '');
  
  try {
    // Use ripgrep to search for imports of this file
    const cmd = `rg -l "${fileName}" --type-add 'web:*.{ts,tsx,js,jsx}' --type web "${PROJECT_ROOT}/src" | grep -v "${file}" | head -10`;
    const result = execSync(cmd, { encoding: 'utf-8' }).trim();
    
    if (result) {
      console.log(`✅ ${file}`);
      console.log(`   Used in:`);
      const files = result.split('\n').filter(Boolean);
      files.forEach(f => {
        const relPath = relative(PROJECT_ROOT, f);
        console.log(`   - ${relPath}`);
      });
    } else {
      console.log(`❌ ${file} - UNUSED`);
      
      // Try to understand what the file exports
      try {
        const content = readFileSync(fullPath, 'utf-8');
        const hasExports = /export\s+(?:default|{|function|class|const|let|var|type|interface)/.test(content);
        const isTypeOnly = /\.d\.ts$/.test(file) || (hasExports && /export\s+(?:type|interface)/.test(content) && !/export\s+(?:default|function|class|const|let|var)/.test(content));
        
        if (!hasExports) {
          console.log(`   → No exports (might be a script or side-effect file)`);
        } else if (isTypeOnly) {
          console.log(`   → Type definitions only`);
        }
        
        // Check for specific patterns
        if (/TODO|FIXME|WIP|DEPRECATED/i.test(content)) {
          console.log(`   → Contains TODO/FIXME/WIP/DEPRECATED comments`);
        }
        if (/test|mock|stub/.test(file)) {
          console.log(`   → Test-related file`);
        }
      } catch (e) {
        // Ignore
      }
    }
    console.log('');
  } catch (error) {
    console.log(`⚠️  ${file} - Error checking usage`);
    console.log('');
  }
}

console.log('=== ANALYZING SPECIFIC UNUSED FILES ===\n');

// Check each file
filesToCheck.forEach(checkFileUsage);

console.log('\n=== SUMMARY ===');
console.log('Files checked:', filesToCheck.length);
console.log('\nNote: API routes in pages/api are not imported but used via URL routing.');
console.log('Some files might be used dynamically or as entry points.');