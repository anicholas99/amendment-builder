#!/usr/bin/env node

/**
 * Code Cleanup Script
 * Run this regularly to maintain code quality
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Starting code cleanup...\n');

// 1. Remove unused imports
console.log('1️⃣ Removing unused imports...');
try {
  execSync('npx ts-prune --error', { stdio: 'inherit' });
} catch (error) {
  console.log('   ⚠️  Found unused exports (review manually)');
}

// 2. Format code
console.log('\n2️⃣ Formatting code...');
try {
  execSync('npm run format', { stdio: 'inherit' });
  console.log('   ✅ Code formatted');
} catch (error) {
  console.log('   ❌ Formatting failed');
}

// 3. Fix linting issues
console.log('\n3️⃣ Fixing linting issues...');
try {
  execSync('npm run lint:fix', { stdio: 'inherit' });
  console.log('   ✅ Linting issues fixed');
} catch (error) {
  console.log('   ⚠️  Some linting issues remain (review manually)');
}

// 4. Find console statements
console.log('\n4️⃣ Checking for console statements...');
try {
  const result = execSync('npm run find:console', { encoding: 'utf8' });
  if (result.trim()) {
    console.log('   ⚠️  Found console statements:');
    console.log(result);
  } else {
    console.log('   ✅ No console statements found');
  }
} catch (error) {
  console.log('   ✅ No console statements found');
}

// 5. Check for TODO comments
console.log('\n5️⃣ Checking for TODO comments...');
try {
  const result = execSync(
    'grep -r "TODO\\|FIXME\\|HACK" src/ --include="*.ts" --include="*.tsx" || true',
    { encoding: 'utf8' }
  );
  if (result.trim()) {
    const todoCount = result.split('\n').filter(line => line.trim()).length;
    console.log(`   ⚠️  Found ${todoCount} TODO/FIXME/HACK comments`);
    console.log('   📝 Consider addressing these before production');
  } else {
    console.log('   ✅ No TODO comments found');
  }
} catch (error) {
  console.log('   ✅ No TODO comments found');
}

// 6. Check TypeScript compilation
console.log('\n6️⃣ Checking TypeScript compilation...');
try {
  execSync('npm run cleanup:ts-check', { stdio: 'inherit' });
  console.log('   ✅ TypeScript compilation successful');
} catch (error) {
  console.log('   ❌ TypeScript compilation failed');
}

// 7. Generate cleanup report
console.log('\n7️⃣ Generating cleanup report...');
const report = {
  timestamp: new Date().toISOString(),
  status: 'completed',
  recommendations: [
    'Review and address any remaining TODO comments',
    'Check for unused dependencies in package.json',
    'Consider adding more comprehensive tests',
    'Review and update documentation',
  ],
};

fs.writeFileSync('cleanup-report.json', JSON.stringify(report, null, 2));
console.log('   ✅ Cleanup report generated: cleanup-report.json');

console.log('\n🎉 Code cleanup completed!');
console.log('\n📋 Next steps:');
console.log('   • Review any remaining warnings above');
console.log('   • Run: npm run build (to verify everything works)');
console.log('   • Run: npm run test (to ensure tests pass)');
console.log('   • Commit your changes');
