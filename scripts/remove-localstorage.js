#!/usr/bin/env node

/**
 * Script to help remove localStorage from the codebase
 * Run: node scripts/remove-localstorage.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Files to check
const patterns = ['src/**/*.ts', 'src/**/*.tsx'];

// localStorage patterns to find
const localStoragePatterns = [
  /localStorage\.(getItem|setItem|removeItem|clear)/g,
  /window\.localStorage/g,
];

// Find all files with localStorage
console.log('🔍 Searching for localStorage usage...\n');

let totalOccurrences = 0;
const fileOccurrences = {};

patterns.forEach(pattern => {
  const files = glob.sync(pattern);

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let fileCount = 0;

    localStoragePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        fileCount += matches.length;
      }
    });

    if (fileCount > 0) {
      fileOccurrences[file] = fileCount;
      totalOccurrences += fileCount;
    }
  });
});

// Report findings
console.log(
  `Found ${totalOccurrences} localStorage references in ${Object.keys(fileOccurrences).length} files:\n`
);

Object.entries(fileOccurrences)
  .sort(([a], [b]) => a.localeCompare(b))
  .forEach(([file, count]) => {
    console.log(`  ${file}: ${count} occurrences`);
  });

console.log('\n📋 Quick Fix Suggestions:\n');

console.log('1. For UI state (sidebar, theme):');
console.log('   Replace: localStorage.getItem("key")');
console.log('   With:    false // or your default value\n');

console.log('2. For caching:');
console.log('   Remove entirely - React Query handles this\n');

console.log('3. For "last used" values:');
console.log('   Move to project data or URL params\n');

console.log('4. Add ESLint rule to prevent future usage:');
console.log(`
{
  "rules": {
    "no-restricted-globals": ["error", {
      "name": "localStorage",
      "message": "Use React state, server storage, or URL params instead"
    }]
  }
}
`);

console.log('\n🚀 To remove all at once:');
console.log('1. Delete src/utils/storage/localStorage.ts');
console.log('2. Delete src/utils/storage/secureStorage.ts');
console.log('3. Run: npm run lint --fix');
console.log('4. Fix remaining type errors with sensible defaults\n');
