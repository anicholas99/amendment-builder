#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🧹 onError Handler Cleanup Tracker\n');

// Define files to clean up
const filesToClean = [
  // Hooks
  'src/hooks/useExtractText.ts',
  'src/features/search/hooks/useExaminerAnalysis.ts',
  'src/features/search/hooks/usePatentExclusions.ts',
  'src/features/search/hooks/useRerunExtraction.ts',
  'src/features/search/hooks/useSemanticSearch.ts',
  'src/features/technology-details/hooks/useInventionAnalysis.ts',
  'src/features/patent-application/hooks/usePatentApplication.ts',
  'src/features/patent-application/hooks/usePatentView.ts',
  'src/features/claim-refinement/hooks/useClaimGeneration.ts',
  'src/features/claim-refinement/hooks/useClaimSetVersions.ts',
  'src/features/citation-extraction/hooks/useCitationHandler.ts',
  'src/features/chat/hooks/useChatHistory.ts',

  // Components
  'src/features/search/components/CitationsPanel.tsx',
  'src/features/search/components/PatentActionButtons.tsx',
  'src/features/search/components/SearchTabContainer.tsx',
  'src/features/technology-details/components/TechnologyDetailsView.tsx',
  'src/features/technology-details/components/figures/TechDetailsSidebar.tsx',
  'src/features/claim-refinement/components/SearchHandlers.tsx',
  'src/contexts/ProjectAutosaveContext.tsx',
  'src/contexts/ProjectDataContext.tsx',
];

let totalHandlers = 0;
let cleanedHandlers = 0;

filesToClean.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const onErrorMatches = content.match(/onError:\s*[\(\{]/g) || [];
    const hasComment = content.includes(
      '// onError removed - global error handler will handle this'
    );

    if (onErrorMatches.length > 0 && !hasComment) {
      console.log(`❌ ${file}: ${onErrorMatches.length} handler(s) to clean`);
      totalHandlers += onErrorMatches.length;
    } else if (hasComment) {
      console.log(`✅ ${file}: Already cleaned`);
      cleanedHandlers += onErrorMatches.length || 1;
    }
  } catch (error) {
    console.log(`⚠️  ${file}: File not found`);
  }
});

console.log('\n' + '='.repeat(50));
console.log(`Total handlers found: ${totalHandlers}`);
console.log(`Already cleaned: ${cleanedHandlers}`);
console.log(`Remaining to clean: ${totalHandlers - cleanedHandlers}`);
console.log('='.repeat(50));
