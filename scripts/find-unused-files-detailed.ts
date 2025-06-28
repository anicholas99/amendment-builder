#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, basename, dirname } from 'path';

const SRC_PATH = join(__dirname, '..', 'src');
const PROJECT_ROOT = join(__dirname, '..');

// Files that are entry points or special cases
const ENTRY_POINTS = new Set([
  'src/pages/_app.tsx',
  'src/pages/_document.tsx',
  'src/pages/index.tsx',
  'src/middleware.ts',
  'jest.setup.js',
  'next.config.js',
  'vite.config.ts',
]);

// Patterns for files that might be imported without extension or with different patterns
const SPECIAL_IMPORT_PATTERNS = [
  /\.d\.ts$/, // Type definition files
  /\.test\.(ts|tsx|js|jsx)$/, // Test files
  /\.spec\.(ts|tsx|js|jsx)$/, // Spec files
  /__tests__/, // Test directories
  /\.stories\.(ts|tsx|js|jsx)$/, // Storybook files
];

// Files that should be ignored
const IGNORE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /dist/,
  /build/,
  /coverage/,
];

function getAllFiles(dir: string, files: string[] = []): string[] {
  try {
    const items = readdirSync(dir);
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!IGNORE_PATTERNS.some(pattern => pattern.test(fullPath))) {
          getAllFiles(fullPath, files);
        }
      } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
  return files;
}

function extractImports(content: string): string[] {
  const imports: string[] = [];
  
  // ES6 imports
  const es6ImportRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = es6ImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  // CommonJS requires
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requireRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  // Dynamic imports
  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  return imports;
}

function normalizeImportPath(importPath: string, fromFile: string): string[] {
  const possiblePaths: string[] = [];
  const fromDir = dirname(fromFile);
  
  // Handle relative imports
  if (importPath.startsWith('.')) {
    const basePath = join(fromDir, importPath);
    possiblePaths.push(basePath);
    possiblePaths.push(`${basePath}.ts`);
    possiblePaths.push(`${basePath}.tsx`);
    possiblePaths.push(`${basePath}.js`);
    possiblePaths.push(`${basePath}.jsx`);
    possiblePaths.push(join(basePath, 'index.ts'));
    possiblePaths.push(join(basePath, 'index.tsx'));
    possiblePaths.push(join(basePath, 'index.js'));
    possiblePaths.push(join(basePath, 'index.jsx'));
  } else if (importPath.startsWith('@/') || importPath.startsWith('~/')) {
    // Handle alias imports
    const cleanPath = importPath.replace(/^[@~]\//, '');
    const basePath = join(SRC_PATH, cleanPath);
    possiblePaths.push(basePath);
    possiblePaths.push(`${basePath}.ts`);
    possiblePaths.push(`${basePath}.tsx`);
    possiblePaths.push(`${basePath}.js`);
    possiblePaths.push(`${basePath}.jsx`);
    possiblePaths.push(join(basePath, 'index.ts'));
    possiblePaths.push(join(basePath, 'index.tsx'));
    possiblePaths.push(join(basePath, 'index.js'));
    possiblePaths.push(join(basePath, 'index.jsx'));
  } else if (!importPath.includes('/')) {
    // Might be a node_module, skip
    return [];
  } else {
    // Absolute imports from src
    const basePath = join(SRC_PATH, importPath);
    possiblePaths.push(basePath);
    possiblePaths.push(`${basePath}.ts`);
    possiblePaths.push(`${basePath}.tsx`);
    possiblePaths.push(`${basePath}.js`);
    possiblePaths.push(`${basePath}.jsx`);
    possiblePaths.push(join(basePath, 'index.ts'));
    possiblePaths.push(join(basePath, 'index.tsx'));
    possiblePaths.push(join(basePath, 'index.js'));
    possiblePaths.push(join(basePath, 'index.jsx'));
  }
  
  return possiblePaths;
}

function findUnusedFiles() {
  console.log('Scanning for unused files...\n');
  
  // Get all files
  const allFiles = getAllFiles(PROJECT_ROOT);
  const srcFiles = allFiles.filter(f => f.includes('/src/'));
  
  console.log(`Found ${allFiles.length} total files, ${srcFiles.length} in src/\n`);
  
  // Track which files are imported
  const importedFiles = new Set<string>();
  const fileImportMap = new Map<string, Set<string>>();
  
  // Check all files for imports
  for (const file of allFiles) {
    try {
      const content = readFileSync(file, 'utf-8');
      const imports = extractImports(content);
      
      for (const importPath of imports) {
        const possiblePaths = normalizeImportPath(importPath, file);
        for (const possiblePath of possiblePaths) {
          if (srcFiles.includes(possiblePath)) {
            importedFiles.add(possiblePath);
            if (!fileImportMap.has(possiblePath)) {
              fileImportMap.set(possiblePath, new Set());
            }
            fileImportMap.get(possiblePath)!.add(file);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  }
  
  // Find unused files
  const unusedFiles: string[] = [];
  const categorizedUnused = {
    components: [] as string[],
    hooks: [] as string[],
    utils: [] as string[],
    types: [] as string[],
    services: [] as string[],
    api: [] as string[],
    other: [] as string[],
  };
  
  for (const file of srcFiles) {
    const relativePath = relative(PROJECT_ROOT, file);
    
    // Skip entry points and special files
    if (ENTRY_POINTS.has(relativePath)) continue;
    if (SPECIAL_IMPORT_PATTERNS.some(pattern => pattern.test(file))) continue;
    
    // Check if file is imported
    if (!importedFiles.has(file)) {
      unusedFiles.push(file);
      
      // Categorize the file
      if (file.includes('/components/')) {
        categorizedUnused.components.push(file);
      } else if (file.includes('/hooks/')) {
        categorizedUnused.hooks.push(file);
      } else if (file.includes('/utils/')) {
        categorizedUnused.utils.push(file);
      } else if (file.includes('/types/')) {
        categorizedUnused.types.push(file);
      } else if (file.includes('/services/') || file.includes('service')) {
        categorizedUnused.services.push(file);
      } else if (file.includes('/api/')) {
        categorizedUnused.api.push(file);
      } else {
        categorizedUnused.other.push(file);
      }
    }
  }
  
  // Print results
  console.log('=== UNUSED FILES REPORT ===\n');
  console.log(`Total unused files: ${unusedFiles.length}\n`);
  
  for (const [category, files] of Object.entries(categorizedUnused)) {
    if (files.length > 0) {
      console.log(`\n${category.toUpperCase()} (${files.length} files):`);
      console.log('=' .repeat(50));
      for (const file of files.sort()) {
        const relativePath = relative(PROJECT_ROOT, file);
        console.log(`  ${relativePath}`);
        
        // Try to determine why it might be unused
        try {
          const content = readFileSync(file, 'utf-8');
          const lines = content.split('\n');
          const hasExports = /export\s+(?:default|{|function|class|const|let|var)/.test(content);
          const isIndexFile = basename(file).startsWith('index.');
          
          if (!hasExports && !isIndexFile) {
            console.log(`    → No exports found (might be a script or side-effect file)`);
          } else if (isIndexFile) {
            console.log(`    → Index file (might be barrel export)`);
          }
          
          // Check for TODOs or WIP comments
          if (/TODO|FIXME|WIP|DEPRECATED/i.test(content)) {
            console.log(`    → Contains TODO/FIXME/WIP/DEPRECATED comments`);
          }
          
          // Check if it's a test utility
          if (file.includes('test') || file.includes('mock')) {
            console.log(`    → Appears to be test-related`);
          }
        } catch (error) {
          // Ignore read errors
        }
      }
    }
  }
  
  // Summary
  console.log('\n\nSUMMARY:');
  console.log('=' .repeat(50));
  console.log(`Components: ${categorizedUnused.components.length}`);
  console.log(`Hooks: ${categorizedUnused.hooks.length}`);
  console.log(`Utils: ${categorizedUnused.utils.length}`);
  console.log(`Types: ${categorizedUnused.types.length}`);
  console.log(`Services: ${categorizedUnused.services.length}`);
  console.log(`API: ${categorizedUnused.api.length}`);
  console.log(`Other: ${categorizedUnused.other.length}`);
  console.log(`\nTotal: ${unusedFiles.length} potentially unused files`);
}

// Run the analysis
findUnusedFiles();