import { promises as fs } from 'fs';
import path from 'path';

interface RepositoryIssue {
  file: string;
  line: number;
  code: string;
  issue: string;
}

async function analyzeRepositoryPattern(): Promise<void> {
  console.log('🔍 REPOSITORY PATTERN VERIFICATION\n');
  console.log('Scanning for direct Prisma usage in API routes...\n');

  const apiDir = path.join(process.cwd(), 'src/pages/api');
  const issues: RepositoryIssue[] = [];
  let totalFiles = 0;
  let filesWithIssues = 0;

  async function scanDirectory(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('_')) {
        await scanDirectory(fullPath);
      } else if (
        entry.isFile() &&
        entry.name.endsWith('.ts') &&
        !entry.name.includes('.test.') &&
        !entry.name.includes('.spec.')
      ) {
        totalFiles++;
        await analyzeFile(fullPath);
      }
    }
  }

  async function analyzeFile(filePath: string): Promise<void> {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = path.relative(apiDir, filePath).replace(/\\/g, '/');

    // Check for direct Prisma usage patterns
    const patterns = [
      /const\s+prisma\s*=\s*getPrismaClient\(\)/,
      /const\s+prisma\s*=\s*new\s+PrismaClient/,
      /prisma\.(project|user|tenant|searchHistory|citationMatch|claimSetVersion)\./,
      /getPrismaClient\(\)\.(project|user|tenant|searchHistory|citationMatch|claimSetVersion)\./,
    ];

    let hasIssues = false;

    lines.forEach((line, index) => {
      patterns.forEach(pattern => {
        if (pattern.test(line)) {
          hasIssues = true;
          issues.push({
            file: `src/pages/api/${relativePath}`,
            line: index + 1,
            code: line.trim(),
            issue: 'Direct Prisma usage - should use repository pattern',
          });
        }
      });
    });

    if (hasIssues) {
      filesWithIssues++;
    }
  }

  await scanDirectory(apiDir);

  // Display results
  console.log('📊 VERIFICATION RESULTS:');
  console.log('═'.repeat(60));
  console.log(`Total API files scanned: ${totalFiles}`);
  console.log(`Files with direct Prisma usage: ${filesWithIssues}`);
  console.log(`Total violations found: ${issues.length}`);
  console.log(
    `Repository Pattern Compliance: ${((1 - filesWithIssues / totalFiles) * 100).toFixed(1)}%`
  );
  console.log('═'.repeat(60));

  if (issues.length > 0) {
    console.log('\n❌ DIRECT PRISMA USAGE FOUND:\n');

    // Group by file
    const fileGroups = issues.reduce(
      (acc, issue) => {
        if (!acc[issue.file]) {
          acc[issue.file] = [];
        }
        acc[issue.file].push(issue);
        return acc;
      },
      {} as Record<string, RepositoryIssue[]>
    );

    Object.entries(fileGroups).forEach(([file, fileIssues]) => {
      console.log(`${file}`);
      console.log(`  Direct Prisma calls: ${fileIssues.length}`);
      fileIssues.forEach(issue => {
        console.log(`  Line ${issue.line}: ${issue.code}`);
      });
      console.log();
    });

    console.log('🔧 HOW TO FIX:');
    console.log('1. Create or use existing repository functions');
    console.log('2. Import from repositories instead of using Prisma directly');
    console.log('3. Example:\n');
    console.log('// ❌ BAD - Direct Prisma usage');
    console.log('const prisma = getPrismaClient();');
    console.log('const project = await prisma.project.findUnique({...});\n');
    console.log('// ✅ GOOD - Repository pattern');
    console.log(
      "import { findProjectById } from '@/repositories/projectRepository';"
    );
    console.log('const project = await findProjectById(projectId);\n');

    console.log('═'.repeat(60));
    console.log('❌ VERIFICATION FAILED: DIRECT PRISMA USAGE DETECTED');
    console.log(`${filesWithIssues} files violate the repository pattern`);
    console.log('═'.repeat(60));

    process.exit(1);
  } else {
    console.log('\n✅ VERIFICATION PASSED: REPOSITORY PATTERN COMPLIANCE');
    console.log('All API routes use the repository pattern correctly');
  }
}

// Run the analysis
analyzeRepositoryPattern().catch(console.error);
