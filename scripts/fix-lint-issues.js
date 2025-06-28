#!/usr/bin/env node

/**
 * Script to automatically fix common lint issues
 * Usage: node scripts/fix-lint-issues.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

console.log(
  `${colors.bright}${colors.blue}🔍 Starting lint issue fixes${colors.reset}\n`
);

// Fix 1: Replace 'any' with appropriate type
const fixAnyTypes = () => {
  console.log(`${colors.cyan}Fixing 'any' type uses...${colors.reset}`);

  // Create imports for common type definitions
  const commonImport =
    "import { UnknownObject, ApiData } from '@/types/common';";

  const anyReplacements = [
    { pattern: /(\w+):\s*any(\[\])?/g, replacement: '$1: unknown$2' },
    { pattern: /Promise<any>/g, replacement: 'Promise<unknown>' },
    {
      pattern: /Record<string,\s*any>/g,
      replacement: 'Record<string, unknown>',
    },
    { pattern: /Map<\w+,\s*any>/g, replacement: 'Map<$1, unknown>' },
    { pattern: /as\s+any/g, replacement: 'as unknown' },
  ];

  let filesUpdated = 0;
  const tsFiles = glob.sync('src/**/*.{ts,tsx}', {
    ignore: ['**/*.d.ts', 'node_modules/**'],
  });

  tsFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Apply replacements
    anyReplacements.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    // Add common import if needed and file was modified
    if (
      modified &&
      !content.includes('@/types/common') &&
      content.includes('import ')
    ) {
      content = content.replace(/import\s+.*?;\n/, `$&${commonImport}\n`);
      filesUpdated++;
      fs.writeFileSync(file, content);
      console.log(`  ${colors.green}✓${colors.reset} Fixed ${file}`);
    } else if (modified) {
      filesUpdated++;
      fs.writeFileSync(file, content);
      console.log(`  ${colors.green}✓${colors.reset} Fixed ${file}`);
    }
  });

  console.log(
    `  ${colors.green}Fixed 'any' types in ${filesUpdated} files${colors.reset}\n`
  );
};

// Fix 2: Prefix unused variables with underscore
const fixUnusedVariables = () => {
  console.log(`${colors.cyan}Fixing unused variables...${colors.reset}`);

  const unusedVarPattern = /\/\/ @typescript-eslint\/no-unused-vars/g;
  const varDefPattern =
    /(\bconst|\blet|\bvar|\bfunction|\bparameter|\bargument|\binline parameter) [a-zA-Z0-9_]+/g;

  let filesUpdated = 0;
  const tsFiles = glob.sync('src/**/*.{ts,tsx}', {
    ignore: ['**/*.d.ts', 'node_modules/**'],
  });

  tsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');

    // Check for unused variable comments
    if (unusedVarPattern.test(content)) {
      const lines = content.split('\n');
      let modified = false;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('@typescript-eslint/no-unused-vars')) {
          // Look at the line before or after for variable definition
          const lineToCheck = lines[i - 1] || lines[i + 1];
          const varMatch = lineToCheck.match(varDefPattern);

          if (varMatch) {
            const varName = varMatch[0].split(' ')[1];
            // Only prefix if not already prefixed
            if (!varName.startsWith('_')) {
              lines[i - 1] = lines[i - 1].replace(varName, `_${varName}`);
              modified = true;
            }
          }
        }
      }

      if (modified) {
        const newContent = lines.join('\n');
        fs.writeFileSync(file, newContent);
        filesUpdated++;
        console.log(`  ${colors.green}✓${colors.reset} Fixed ${file}`);
      }
    }
  });

  console.log(
    `  ${colors.green}Fixed unused variables in ${filesUpdated} files${colors.reset}\n`
  );
};

// Fix 3: Remove console statements
const fixConsoleStatements = () => {
  console.log(`${colors.cyan}Removing console statements...${colors.reset}`);

  let filesUpdated = 0;
  const tsFiles = glob.sync('src/**/*.{ts,tsx}', {
    ignore: ['node_modules/**'],
  });

  // Only remove in production, otherwise just prefix with void
  const isProduction = process.env.NODE_ENV === 'production';
  const consolePattern =
    /console\.(log|warn|error|info|debug|trace|time|timeEnd|count)\((.*?)\);/g;
  const replacementText = isProduction
    ? '// Removed console statement'
    : 'void 0; // Console statement suppressed';

  tsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');

    if (consolePattern.test(content)) {
      const newContent = content.replace(consolePattern, replacementText);
      fs.writeFileSync(file, newContent);
      filesUpdated++;
      console.log(`  ${colors.green}✓${colors.reset} Fixed ${file}`);
    }
  });

  console.log(
    `  ${colors.green}Removed/suppressed console statements in ${filesUpdated} files${colors.reset}\n`
  );
};

// Fix 4: Fix unescaped entities
const fixUnescapedEntities = () => {
  console.log(`${colors.cyan}Fixing unescaped entities...${colors.reset}`);

  let filesUpdated = 0;
  const tsxFiles = glob.sync('src/**/*.tsx', { ignore: ['node_modules/**'] });

  const entityReplacements = [
    { pattern: /(\W)'(\w)/g, replacement: '$1&apos;$2' },
    { pattern: /(\w)'(\W)/g, replacement: '$1&apos;$2' },
    { pattern: /(\W)"(\w)/g, replacement: '$1&quot;$2' },
    { pattern: /(\w)"(\W)/g, replacement: '$1&quot;$2' },
  ];

  tsxFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    entityReplacements.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(file, content);
      filesUpdated++;
      console.log(`  ${colors.green}✓${colors.reset} Fixed ${file}`);
    }
  });

  console.log(
    `  ${colors.green}Fixed unescaped entities in ${filesUpdated} files${colors.reset}\n`
  );
};

// Fix 5: Fix common hook dependency array issues
const fixHookDependencies = () => {
  console.log(
    `${colors.cyan}Checking hook dependency arrays...${colors.reset}`
  );

  let filesUpdated = 0;
  const tsxFiles = glob.sync('src/**/*.{ts,tsx}', {
    ignore: ['node_modules/**'],
  });

  // Simple pattern to detect missing dependencies
  const hookPattern =
    /(useEffect|useCallback)\(\(\) => {[\s\S]*?\b(\w+)\b[\s\S]*?}, \[(.*?)\]\)/g;

  tsxFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Basic detection of missing dependencies
    const matches = [...content.matchAll(hookPattern)];
    for (const match of matches) {
      const [fullMatch, hookName, possibleDep, deps] = match;

      // Skip if the variable is defined inside the hook
      if (
        content.includes(`const ${possibleDep} =`) &&
        content.indexOf(`const ${possibleDep} =`) > content.indexOf(fullMatch)
      ) {
        continue;
      }

      // If the variable is used but not in deps, add it
      if (!deps.includes(possibleDep)) {
        const newDeps = deps ? `${deps}, ${possibleDep}` : possibleDep;
        const fixedHook = fullMatch.replace(`[${deps}]`, `[${newDeps}]`);
        content = content.replace(fullMatch, fixedHook);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(file, content);
      filesUpdated++;
      console.log(`  ${colors.green}✓${colors.reset} Fixed ${file}`);
    }
  });

  console.log(
    `  ${colors.green}Fixed hook dependencies in ${filesUpdated} files${colors.reset}\n`
  );
  console.log(
    `  ${colors.yellow}⚠️ Note: Hook dependency fixes are basic and may require manual review${colors.reset}\n`
  );
};

// Run the fixers
try {
  fixAnyTypes();
  fixUnusedVariables();
  fixConsoleStatements();
  fixUnescapedEntities();
  fixHookDependencies();

  console.log(
    `${colors.bright}${colors.green}✅ Finished fixing common lint issues${colors.reset}`
  );
  console.log(
    `${colors.yellow}Run 'npm run lint' to check remaining issues${colors.reset}`
  );
} catch (error) {
  console.error(
    `${colors.red}❌ Error while fixing lint issues:${colors.reset}`,
    error
  );
  process.exit(1);
}
