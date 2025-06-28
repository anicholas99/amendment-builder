const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_PATH = path.join(__dirname, '../src');
const UI_ATOMS_IMPORT = /from '@\/ui\/atoms([a-zA-Z\/]*)'/g;
const UI_MOLECULES_IMPORT = /from '@\/ui\/molecules([a-zA-Z\/]*)'/g;
const CHAKRA_IMPORT = "from '@chakra-ui/react'";

function getFilesRecursively(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = entries.map(entry => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? getFilesRecursively(fullPath) : fullPath;
  });
  return Array.prototype.concat(...files);
}

function refactorFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  if (UI_ATOMS_IMPORT.test(content)) {
    content = content.replace(UI_ATOMS_IMPORT, CHAKRA_IMPORT);
    changed = true;
  }

  if (UI_MOLECULES_IMPORT.test(content)) {
    content = content.replace(UI_MOLECULES_IMPORT, CHAKRA_IMPORT);
    changed = true;
  }

  if (changed) {
    // Consolidate Chakra UI imports
    const chakraImports = new Set();
    const otherLines = [];
    let importBlockFound = false;

    content.split('\n').forEach(line => {
      const match = line.match(
        /import\s+\{([^}]+)\}\s+from '@chakra-ui\/react';/
      );
      if (match) {
        importBlockFound = true;
        match[1].split(',').forEach(imp => {
          const trimmed = imp.trim();
          if (trimmed) {
            chakraImports.add(trimmed);
          }
        });
      } else {
        otherLines.push(line);
      }
    });

    if (importBlockFound && chakraImports.size > 0) {
      const consolidatedImport = `import {\n  ${[...chakraImports].sort().join(',\n  ')}\n} from '@chakra-ui/react';`;

      const importRegex = /import .* from '@chakra-ui\/react';\s*\n?/g;
      const firstImportIndex = otherLines.findIndex(line =>
        line.trim().startsWith('import')
      );

      if (firstImportIndex !== -1) {
        otherLines.splice(firstImportIndex, 0, consolidatedImport);
      } else {
        otherLines.unshift(consolidatedImport);
      }
      content = otherLines.join('\n');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored: ${filePath}`);
  }
}

function main() {
  console.log('Starting UI import refactoring...');
  const allFiles = getFilesRecursively(SRC_PATH);
  allFiles.forEach(refactorFile);
  console.log('UI import refactoring complete.');

  console.log('Running Prettier to format changes...');
  try {
    execSync('npx prettier --write "src/**/*.tsx"', { stdio: 'inherit' });
    console.log('Prettier formatting complete.');
  } catch (error) {
    console.error('Failed to run Prettier:', error);
  }
}

main();
