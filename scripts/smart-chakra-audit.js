const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define what makes a file safe to migrate
const SAFE_COMPONENTS = [
  'Box',
  'Flex',
  'Text',
  'Heading',
  'Stack',
  'Button',
  'Icon',
];
const HOOKS_ONLY = ['useToast', 'useBreakpointValue'];
const UNSAFE_PROPS = [
  '_hover',
  '_focus',
  '_active',
  '_dark',
  'sx',
  'layerStyle',
  'textStyle',
  '__css',
];
const COMPLEX_COMPONENTS = [
  'Modal',
  'AlertDialog',
  'Drawer',
  'Popover',
  'Menu',
  'Tabs',
  'Accordion',
  'Progress',
  'Skeleton',
  'FormControl',
  'FormLabel',
  'FormErrorMessage',
  'Input',
  'Select',
  'Checkbox',
  'Radio',
  'Slider',
  'Switch',
  'Table',
  'Thead',
  'Tbody',
  'Tr',
  'Th',
  'Td',
  'Portal',
  'Collapse',
  'Fade',
  'ScaleFade',
  'Slide',
  'SlideFade',
];
const COMPLEX_HOOKS = [
  'useColorModeValue',
  'useDisclosure',
  'useTheme',
  'useColorMode',
];

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract Chakra imports
  const importMatch = content.match(
    /import\s*{([^}]+)}\s*from\s*['"]@chakra-ui\/react['"]/
  );
  if (!importMatch) return null;

  const imports = importMatch[1]
    .split(',')
    .map(i => i.trim())
    .filter(Boolean);

  // Categorize the file
  const analysis = {
    file: filePath.replace(/\\/g, '/'),
    imports,
    safeToMigrate: true,
    hasHooks: false,
    hasComplexComponents: false,
    hasUnsafeProps: false,
    reasons: [],
  };

  // Check for hooks
  const usedHooks = imports.filter(
    imp => imp.startsWith('use') || HOOKS_ONLY.includes(imp)
  );
  if (usedHooks.length > 0) {
    analysis.hasHooks = true;
    if (usedHooks.some(h => COMPLEX_HOOKS.includes(h))) {
      analysis.safeToMigrate = false;
      analysis.reasons.push(
        `uses complex hooks: ${usedHooks.filter(h => COMPLEX_HOOKS.includes(h)).join(', ')}`
      );
    }
  }

  // Check for complex components
  const complexComps = imports.filter(imp => COMPLEX_COMPONENTS.includes(imp));
  if (complexComps.length > 0) {
    analysis.hasComplexComponents = true;
    analysis.safeToMigrate = false;
    analysis.reasons.push(
      `uses complex components: ${complexComps.join(', ')}`
    );
  }

  // Check for unsafe props in the file content
  const hasUnsafeProps = UNSAFE_PROPS.some(prop => {
    const regex = new RegExp(
      `\\b${prop.replace(/^_/, '_?')}\\s*=|\\b${prop}:`,
      'g'
    );
    return regex.test(content);
  });

  if (hasUnsafeProps) {
    analysis.hasUnsafeProps = true;
    analysis.safeToMigrate = false;
    const foundProps = UNSAFE_PROPS.filter(prop => {
      const regex = new RegExp(
        `\\b${prop.replace(/^_/, '_?')}\\s*=|\\b${prop}:`,
        'g'
      );
      return regex.test(content);
    });
    analysis.reasons.push(`uses unsafe props: ${foundProps.join(', ')}`);
  }

  // Check if file only imports hooks (which is fine)
  if (
    analysis.hasHooks &&
    !analysis.hasComplexComponents &&
    imports.every(imp => imp.startsWith('use') || HOOKS_ONLY.includes(imp))
  ) {
    analysis.safeToMigrate = false;
    analysis.reasons = ['only uses hooks (no migration needed)'];
  }

  // Final check: only safe if using basic components
  if (analysis.safeToMigrate) {
    const componentImports = imports.filter(
      imp => !imp.startsWith('use') && !HOOKS_ONLY.includes(imp)
    );
    const unsafeImports = componentImports.filter(
      imp => !SAFE_COMPONENTS.includes(imp)
    );
    if (unsafeImports.length > 0) {
      analysis.safeToMigrate = false;
      analysis.reasons.push(
        `uses non-basic components: ${unsafeImports.join(', ')}`
      );
    }
  }

  return analysis;
}

// Find all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: [
    '**/node_modules/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/ui/**/*.tsx',
  ],
});

const results = {
  totalFiles: 0,
  chakraFiles: 0,
  safeToMigrate: [],
  hooksOnly: [],
  complex: [],
  summary: {
    safeFiles: 0,
    hookFiles: 0,
    complexFiles: 0,
  },
};

// Analyze each file
files.forEach(file => {
  results.totalFiles++;
  const analysis = analyzeFile(file);

  if (analysis) {
    results.chakraFiles++;

    if (analysis.safeToMigrate) {
      results.safeToMigrate.push({
        file: analysis.file,
        imports: analysis.imports,
      });
      results.summary.safeFiles++;
    } else if (
      analysis.reasons.includes('only uses hooks (no migration needed)')
    ) {
      results.hooksOnly.push({
        file: analysis.file,
        imports: analysis.imports,
        reason: analysis.reasons[0],
      });
      results.summary.hookFiles++;
    } else {
      results.complex.push({
        file: analysis.file,
        imports: analysis.imports,
        reasons: analysis.reasons,
      });
      results.summary.complexFiles++;
    }
  }
});

// Output results
console.log('\n🔍 SMART CHAKRA MIGRATION AUDIT');
console.log('================================\n');

console.log(`📊 SUMMARY`);
console.log(`Total files scanned: ${results.totalFiles}`);
console.log(`Files using Chakra: ${results.chakraFiles}`);
console.log(`✅ Safe to migrate: ${results.summary.safeFiles}`);
console.log(`🔷 Hooks only (skip): ${results.summary.hookFiles}`);
console.log(`❌ Complex (skip): ${results.summary.complexFiles}`);

console.log('\n✅ SAFE TO MIGRATE FILES:');
if (results.safeToMigrate.length === 0) {
  console.log('No files found that are safe to migrate.');
} else {
  results.safeToMigrate.forEach((file, index) => {
    console.log(`${index + 1}. ${file.file}`);
    console.log(`   Imports: ${file.imports.join(', ')}`);
  });
}

console.log('\n🔷 HOOKS ONLY (No migration needed):');
results.hooksOnly.slice(0, 5).forEach(file => {
  console.log(`- ${file.file}`);
});
if (results.hooksOnly.length > 5) {
  console.log(`  ... and ${results.hooksOnly.length - 5} more`);
}

console.log('\n❌ COMPLEX FILES (Skip for now):');
results.complex.slice(0, 10).forEach(file => {
  console.log(`- ${file.file}`);
  console.log(`  Reasons: ${file.reasons.join('; ')}`);
});
if (results.complex.length > 10) {
  console.log(`  ... and ${results.complex.length - 10} more`);
}

// Save detailed report
fs.writeFileSync(
  'smart-chakra-audit-report.json',
  JSON.stringify(results, null, 2)
);

console.log('\n📄 Detailed report saved to: smart-chakra-audit-report.json');

// Show migration recommendation
const currentMigration = (
  ((results.totalFiles - results.chakraFiles) / results.totalFiles) *
  100
).toFixed(1);
const potentialMigration = (
  ((results.totalFiles - results.chakraFiles + results.summary.safeFiles) /
    results.totalFiles) *
  100
).toFixed(1);

console.log('\n🎯 MIGRATION POTENTIAL:');
console.log(`Current: ${currentMigration}%`);
console.log(`After safe migrations: ${potentialMigration}%`);
console.log(`Gain: +${(potentialMigration - currentMigration).toFixed(1)}%`);
