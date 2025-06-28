#!/usr/bin/env node

/**
 * Setup Pre-commit Hooks
 *
 * This script sets up git pre-commit hooks to enforce code quality standards.
 * To use husky instead (recommended):
 * 1. npm install --save-dev husky
 * 2. npx husky install
 * 3. npx husky add .husky/pre-commit "npm run pre-commit"
 */

const fs = require('fs');
const path = require('path');

const preCommitHook = `#!/bin/sh
# Pre-commit hook to enforce code quality

echo "🔍 Running pre-commit checks..."

# Check for 'as any' in staged TypeScript files
echo "Checking for 'as any' usage..."
git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(ts|tsx)$' | while read file; do
  if grep -q "as any" "$file"; then
    echo "❌ Error: 'as any' found in $file"
    echo "Please fix type assertions before committing."
    exit 1
  fi
done

# Check for '@ts-ignore' in staged TypeScript files
echo "Checking for '@ts-ignore' usage..."
git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(ts|tsx)$' | while read file; do
  if grep -q "@ts-ignore" "$file"; then
    echo "❌ Error: '@ts-ignore' found in $file"
    echo "Please fix TypeScript errors properly before committing."
    exit 1
  fi
done

# Run type checking
echo "Running TypeScript type check..."
npm run type-check
if [ $? -ne 0 ]; then
  echo "❌ TypeScript type check failed"
  exit 1
fi

echo "✅ All pre-commit checks passed!"
`;

const gitHooksDir = path.join(process.cwd(), '.git', 'hooks');
const preCommitPath = path.join(gitHooksDir, 'pre-commit');

// Ensure .git/hooks directory exists
if (!fs.existsSync(gitHooksDir)) {
  console.error(
    '❌ .git/hooks directory not found. Are you in a git repository?'
  );
  process.exit(1);
}

// Write pre-commit hook
try {
  fs.writeFileSync(preCommitPath, preCommitHook);

  // Make the hook executable (Unix-like systems)
  if (process.platform !== 'win32') {
    fs.chmodSync(preCommitPath, '755');
  }

  console.log('✅ Pre-commit hook installed successfully!');
  console.log('\nThe following checks will run before each commit:');
  console.log('- No "as any" in staged files');
  console.log('- No "@ts-ignore" in staged files');
  console.log('- TypeScript type checking passes');
  console.log(
    '\nTo bypass these checks (not recommended), use: git commit --no-verify'
  );
} catch (error) {
  console.error('❌ Failed to install pre-commit hook:', error);
  process.exit(1);
}
