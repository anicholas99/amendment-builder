/**
 * Script to find potentially unused files in the codebase
 *
 * Run with: node find-unused-files.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directory to scan
const sourceDir = './src';

// Function to recursively get all files in a directory
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (
      filePath.endsWith('.ts') ||
      filePath.endsWith('.tsx') ||
      filePath.endsWith('.js') ||
      filePath.endsWith('.jsx')
    ) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Get all files in the source directory
const allFiles = getAllFiles(sourceDir);

// Track which files are imported by other files
const isImported = {};
allFiles.forEach(file => {
  isImported[file] = false;
});

// Set page files as implicitly used
allFiles.forEach(file => {
  // Pages are implicitly used by Next.js
  if (file.includes('/pages/') && !file.includes('/_')) {
    isImported[file] = true;
  }

  // Components in the index.ts are considered exported
  if (file.endsWith('index.ts') || file.endsWith('index.tsx')) {
    isImported[file] = true;
  }
});

// Check each file to see if it imports other files
allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');

  allFiles.forEach(potentialImport => {
    if (file === potentialImport) return; // Skip self

    // Get the filename without extension and path
    const importName = path.basename(
      potentialImport,
      path.extname(potentialImport)
    );
    const importPath = path.dirname(potentialImport).replace(/\\/g, '/');

    // Check for different import patterns
    const importPatterns = [
      `import .*from ['"]${importPath}/${importName}['"]`,
      `import .*from ['"]${importPath}['"]`,
      `import\\(['"]${importPath}/${importName}['"]\\)`,
      `require\\(['"]${importPath}/${importName}['"]\\)`,
    ];

    for (const pattern of importPatterns) {
      if (new RegExp(pattern).test(content)) {
        isImported[potentialImport] = true;
        break;
      }
    }
  });
});

// Generate report of potentially unused files
console.log('Potentially unused files in the codebase:');
console.log('----------------------------------------');

const unusedFiles = Object.keys(isImported)
  .filter(file => !isImported[file])
  .sort();

// Group files by type
const unusedByType = {};
unusedFiles.forEach(file => {
  const type = path.extname(file).substring(1);
  if (!unusedByType[type]) unusedByType[type] = [];
  unusedByType[type].push(file);
});

// Print results
Object.keys(unusedByType).forEach(type => {
  console.log(`\n${type.toUpperCase()} files:`);
  unusedByType[type].forEach(file => {
    console.log(`- ${file}`);
  });
});

console.log('\nTotal potentially unused files:', unusedFiles.length);
console.log(
  'Note: Some files might be dynamically imported or used by the build system.'
);

// Save the report to a file
fs.writeFileSync(
  'unused-files-report.md',
  `# Potentially Unused Files Report\n\nGenerated: ${new Date().toISOString()}\n\n` +
    Object.keys(unusedByType)
      .map(
        type =>
          `## ${type.toUpperCase()} files\n\n` +
          unusedByType[type].map(file => `- \`${file}\``).join('\n')
      )
      .join('\n\n') +
    `\n\n## Summary\n\nTotal potentially unused files: ${unusedFiles.length}\n\n` +
    `Note: Some files might be dynamically imported or used by the build system. Please verify before deleting.`
);

console.log('\nReport saved to unused-files-report.md');
