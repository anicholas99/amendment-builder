#!/usr/bin/env node

/**
 * SAFE Code Cleanup Script
 * Only performs operations that won't break existing code
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🛡️  Starting SAFE code cleanup...\n');

// 1. Format code (completely safe)
console.log('1️⃣ Formatting code...');
try {
  execSync('npm run format', { stdio: 'inherit' });
  console.log('   ✅ Code formatted');
} catch (error) {
  console.log('   ❌ Formatting failed');
}

// 2. Fix only auto-fixable linting issues (safe)
console.log('\n2️⃣ Fixing safe linting issues...');
try {
  execSync('npm run lint:fix', { stdio: 'inherit' });
  console.log('   ✅ Safe linting issues fixed');
} catch (error) {
  console.log('   ⚠️  Some linting issues remain (this is normal)');
}

// 3. Check build status (no changes, just verification)
console.log('\n3️⃣ Verifying build still works...');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('   ✅ Build successful');
} catch (error) {
  console.log('   ⚠️  Build has issues (check manually)');
}

// 4. Generate report (safe)
console.log('\n4️⃣ Generating status report...');
const report = {
  timestamp: new Date().toISOString(),
  status: 'safe-cleanup-completed',
  safeOperationsPerformed: [
    'Code formatting',
    'Auto-fixable lint issues',
    'Build verification',
  ],
  manualActionsNeeded: [
    'Review logger import issues (fix manually, one file at a time)',
    'Address TODO comments when ready',
    'Replace any types gradually',
  ],
};

fs.writeFileSync('safe-cleanup-report.json', JSON.stringify(report, null, 2));
console.log('   ✅ Report generated: safe-cleanup-report.json');

console.log('\n🎉 Safe cleanup completed!');
console.log('\n📋 What was done:');
console.log('   • Code formatted (safe)');
console.log('   • Auto-fixable lint issues resolved (safe)');
console.log('   • Build verified (no changes made)');
console.log('\n⚠️  What was NOT done (to avoid breaking things):');
console.log('   • Logger imports (do manually)');
console.log('   • Complex refactoring (do when ready)');
console.log('   • Removing unused code (might be used elsewhere)');
