import * as fs from 'fs';
import * as path from 'path';

interface LongFile {
  path: string;
  lines: number;
  category: string;
}

function countLines(filePath: string): number {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n').length;
}

function categorizeFile(filePath: string): string {
  const normalizedPath = filePath.replace(/\\/g, '/');

  if (normalizedPath.includes('/pages/api/')) return 'API Route';
  if (normalizedPath.includes('/repositories/')) return 'Repository';
  if (normalizedPath.includes('/services/')) return 'Service';
  if (normalizedPath.includes('/components/')) return 'Component';
  if (
    normalizedPath.includes('/features/') &&
    normalizedPath.includes('/components/')
  )
    return 'Feature Component';
  if (normalizedPath.includes('/lib/')) return 'Library';
  if (normalizedPath.includes('/utils/')) return 'Utility';
  if (normalizedPath.includes('/hooks/')) return 'Hook';
  if (normalizedPath.includes('/contexts/')) return 'Context';
  if (normalizedPath.includes('/scripts/')) return 'Script';
  if (normalizedPath.includes('/workers/')) return 'Worker';
  return 'Other';
}

function findLongFiles(dirs: string[], threshold: number = 700): LongFile[] {
  const longFiles: LongFile[] = [];

  function scanDirectory(currentDir: string) {
    try {
      const files = fs.readdirSync(currentDir);

      for (const file of files) {
        const fullPath = path.join(currentDir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip node_modules, .git, and other non-source directories
          if (
            !file.startsWith('.') &&
            file !== 'node_modules' &&
            file !== 'dist' &&
            file !== 'build' &&
            file !== 'out'
          ) {
            scanDirectory(fullPath);
          }
        } else if (stat.isFile()) {
          // Check TypeScript and JavaScript files
          if (
            file.endsWith('.ts') ||
            file.endsWith('.tsx') ||
            file.endsWith('.js') ||
            file.endsWith('.jsx')
          ) {
            const lines = countLines(fullPath);
            if (lines > threshold) {
              longFiles.push({
                path: fullPath.replace(/\\/g, '/'),
                lines,
                category: categorizeFile(fullPath),
              });
            }
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      scanDirectory(dir);
    }
  });

  return longFiles.sort((a, b) => b.lines - a.lines);
}

// Run the script
console.log('🔍 Scanning for files over 700 lines...\n');

const dirsToScan = [
  path.join(process.cwd(), 'src'),
  path.join(process.cwd(), 'scripts'),
  path.join(process.cwd(), 'prisma'),
];

const longFiles = findLongFiles(dirsToScan);

if (longFiles.length === 0) {
  console.log('✅ Great news! No files exceed 700 lines.');
} else {
  console.log(`📊 Found ${longFiles.length} files over 700 lines:\n`);

  // Group by category
  const byCategory = longFiles.reduce(
    (acc, file) => {
      if (!acc[file.category]) acc[file.category] = [];
      acc[file.category].push(file);
      return acc;
    },
    {} as Record<string, LongFile[]>
  );

  // Print by category
  Object.entries(byCategory).forEach(([category, files]) => {
    console.log(`\n${category} (${files.length} files):`);
    console.log('─'.repeat(80));

    files.forEach(file => {
      const relativePath = file.path.replace(
        process.cwd().replace(/\\/g, '/') + '/',
        ''
      );
      const padding = ' '.repeat(Math.max(0, 70 - relativePath.length));
      console.log(`  ${relativePath}${padding} ${file.lines} lines`);
    });
  });

  // Summary statistics
  console.log('\n\n📈 Summary:');
  console.log('─'.repeat(80));
  console.log(`Total files over 700 lines: ${longFiles.length}`);
  console.log(
    `Largest file: ${longFiles[0].path.split('/').pop()} (${longFiles[0].lines} lines)`
  );
  console.log(
    `Total lines in long files: ${longFiles.reduce((sum, f) => sum + f.lines, 0).toLocaleString()}`
  );

  // Top 10 longest files
  console.log('\n\n🔝 Top 10 Longest Files:');
  console.log('─'.repeat(80));
  longFiles.slice(0, 10).forEach((file, i) => {
    const relativePath = file.path.replace(
      process.cwd().replace(/\\/g, '/') + '/',
      ''
    );
    const padding = ' '.repeat(Math.max(0, 60 - relativePath.length));
    console.log(
      `${(i + 1).toString().padStart(2)}. ${relativePath}${padding} ${file.lines} lines`
    );
  });

  // Recommendations
  console.log('\n\n💡 Recommendations:');
  console.log('─'.repeat(80));
  console.log('Consider refactoring these files by:');
  console.log('  1. Extracting related functions into separate modules');
  console.log('  2. Moving complex logic to service classes');
  console.log('  3. Splitting large components into smaller ones');
  console.log('  4. Creating shared utilities for common patterns');
  console.log('\nPriority files for refactoring (over 1000 lines):');
  const veryLongFiles = longFiles.filter(f => f.lines > 1000);
  console.log(`  - ${veryLongFiles.length} files exceed 1000 lines`);
}
