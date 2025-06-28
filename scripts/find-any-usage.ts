import * as fs from 'fs';
import * as path from 'path';

interface AnyUsage {
  file: string;
  line: number;
  type:
    | 'as any'
    | ': any'
    | 'catch (error: unknown)'
    | 'any[]'
    | 'generic <unknown>';
  context: string;
}

function findAnyUsage(filePath: string): AnyUsage[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const usages: AnyUsage[] = [];

  lines.forEach((line, index) => {
    // Check for various patterns of 'any' usage
    if (line.match(/\bas any\b/)) {
      usages.push({
        file: filePath,
        line: index + 1,
        type: 'as any',
        context: line.trim(),
      });
    }

    if (line.match(/: any[,\s\)]/)) {
      let type: AnyUsage['type'] = ': any';
      if (line.includes('catch') && line.includes('error: any')) {
        type = 'catch (error: unknown)';
      }
      usages.push({
        file: filePath,
        line: index + 1,
        type,
        context: line.trim(),
      });
    }

    if (line.match(/: any\[\]/)) {
      usages.push({
        file: filePath,
        line: index + 1,
        type: 'any[]',
        context: line.trim(),
      });
    }

    if (line.match(/<unknown>/)) {
      usages.push({
        file: filePath,
        line: index + 1,
        type: 'generic <unknown>',
        context: line.trim(),
      });
    }
  });

  return usages;
}

function scanDirectory(dir: string): AnyUsage[] {
  const allUsages: AnyUsage[] = [];

  function scan(currentDir: string) {
    try {
      const files = fs.readdirSync(currentDir);

      for (const file of files) {
        const fullPath = path.join(currentDir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip directories we don't want to scan
          if (
            !file.startsWith('.') &&
            file !== 'node_modules' &&
            file !== 'dist' &&
            file !== 'build' &&
            file !== 'out' &&
            file !== '__tests__'
          ) {
            scan(fullPath);
          }
        } else if (stat.isFile()) {
          // Check TypeScript files, excluding test files and type definitions
          if (
            (file.endsWith('.ts') || file.endsWith('.tsx')) &&
            !file.endsWith('.test.ts') &&
            !file.endsWith('.spec.ts') &&
            !file.endsWith('.d.ts')
          ) {
            const usages = findAnyUsage(fullPath);
            allUsages.push(...usages);
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  scan(dir);
  return allUsages;
}

// Run the analysis
console.log('🔍 Scanning for "any" type usage...\n');

const srcPath = path.join(process.cwd(), 'src');
const usages = scanDirectory(srcPath);

// Group by type
const byType = usages.reduce(
  (acc, usage) => {
    if (!acc[usage.type]) acc[usage.type] = [];
    acc[usage.type].push(usage);
    return acc;
  },
  {} as Record<string, AnyUsage[]>
);

// Print summary
console.log('📊 "any" Type Usage Summary:\n');
console.log('─'.repeat(60));
console.log(`Total instances: ${usages.length}`);
console.log('─'.repeat(60));

// Print breakdown by type
Object.entries(byType).forEach(([type, instances]) => {
  console.log(`\n${type}: ${instances.length} instances`);
});

// Group by file
const byFile = usages.reduce(
  (acc, usage) => {
    const relativePath = usage.file.replace(
      process.cwd().replace(/\\/g, '/') + '/',
      ''
    );
    if (!acc[relativePath]) acc[relativePath] = 0;
    acc[relativePath]++;
    return acc;
  },
  {} as Record<string, number>
);

// Find files with most usage
const sortedFiles = Object.entries(byFile)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 10);

console.log('\n\n🔝 Top 10 Files with Most "any" Usage:');
console.log('─'.repeat(80));
sortedFiles.forEach(([file, count], index) => {
  const padding = ' '.repeat(Math.max(0, 65 - file.length));
  console.log(
    `${(index + 1).toString().padStart(2)}. ${file}${padding} ${count} instances`
  );
});

// Show specific examples for each type
console.log('\n\n📝 Examples by Type:');
console.log('─'.repeat(80));

Object.entries(byType).forEach(([type, instances]) => {
  console.log(`\n${type} (${instances.length} instances):`);
  // Show up to 5 examples
  instances.slice(0, 5).forEach(usage => {
    const relativePath = usage.file.replace(
      process.cwd().replace(/\\/g, '/') + '/',
      ''
    );
    console.log(`  ${relativePath}:${usage.line}`);
    console.log(`    ${usage.context}`);
  });
  if (instances.length > 5) {
    console.log(`  ... and ${instances.length - 5} more`);
  }
});

// Recommendations
console.log('\n\n💡 Recommendations:');
console.log('─'.repeat(80));
console.log(
  '1. Replace catch (error: unknown) with catch (error: unknown) and use type guards'
);
console.log('2. Define proper types for function parameters instead of : any');
console.log('3. Use generics instead of BaseTool<unknown> where possible');
console.log('4. Create interfaces for complex objects instead of using any');
console.log('5. Use unknown for truly unknown types and narrow them down');

// Save detailed report
const reportPath = path.join(process.cwd(), 'ANY_USAGE_REPORT.md');
let report = '# "any" Type Usage Report\n\n';
report += `Generated: ${new Date().toISOString()}\n\n`;
report += `## Summary\n\n`;
report += `- Total instances: ${usages.length}\n`;
report += `- Files affected: ${Object.keys(byFile).length}\n\n`;

report += `## Breakdown by Type\n\n`;
Object.entries(byType).forEach(([type, instances]) => {
  report += `- **${type}**: ${instances.length} instances\n`;
});

report += `\n## All Instances\n\n`;
Object.entries(byFile).forEach(([file, count]) => {
  report += `### ${file} (${count} instances)\n\n`;
  const fileUsages = usages.filter(u =>
    u.file.includes(file.replace(/\//g, path.sep))
  );
  fileUsages.forEach(usage => {
    report += `- Line ${usage.line} [${usage.type}]: \`${usage.context}\`\n`;
  });
  report += '\n';
});

fs.writeFileSync(reportPath, report);
console.log(`\n📄 Detailed report saved to: ${reportPath}`);
