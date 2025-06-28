import { promises as fs } from 'fs';
import path from 'path';

interface RBACIssue {
  file: string;
  line: number;
  code: string;
  issue: string;
}

async function analyzeRBACCoverage(): Promise<void> {
  console.log('🔒 RBAC COVERAGE VERIFICATION\n');
  console.log('Scanning API endpoints for role-based access control...\n');

  const apiDir = path.join(process.cwd(), 'src/pages/api');
  const issues: RBACIssue[] = [];
  let totalFiles = 0;
  let filesWithRBAC = 0;
  let mutationEndpoints = 0;
  let protectedMutations = 0;

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

    // Check if file has mutation endpoints
    const hasMutations =
      /req\.method\s*===?\s*['"](?:POST|PUT|PATCH|DELETE)['"]/.test(content) ||
      /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/.test(content);

    if (hasMutations) {
      mutationEndpoints++;
    }

    // Check for RBAC implementation
    const hasRequiredRole =
      /requiredRole:\s*['"](?:USER|ADMIN|VIEWER)['"]/.test(content);
    const hasRoleCheck = /roleCheckMethods:\s*\[/.test(content);
    const hasWithRole = /withRole\(/.test(content);
    const hasRequireRole = /requireRole\(/.test(content);

    const hasRBAC =
      hasRequiredRole || hasRoleCheck || hasWithRole || hasRequireRole;

    if (hasRBAC) {
      filesWithRBAC++;
      if (hasMutations) {
        protectedMutations++;
      }
    } else if (hasMutations) {
      // This is a mutation endpoint without RBAC
      lines.forEach((line, index) => {
        if (
          /req\.method\s*===?\s*['"](?:POST|PUT|PATCH|DELETE)['"]/.test(line) ||
          /export\s+default/.test(line)
        ) {
          issues.push({
            file: `src/pages/api/${relativePath}`,
            line: index + 1,
            code: line.trim(),
            issue: 'Mutation endpoint without role-based access control',
          });
        }
      });
    }
  }

  await scanDirectory(apiDir);

  // Display results
  console.log('📊 VERIFICATION RESULTS:');
  console.log('═'.repeat(60));
  console.log(`Total API files scanned: ${totalFiles}`);
  console.log(`Files with RBAC: ${filesWithRBAC}`);
  console.log(`Mutation endpoints: ${mutationEndpoints}`);
  console.log(`Protected mutations: ${protectedMutations}`);
  console.log(
    `Unprotected mutations: ${mutationEndpoints - protectedMutations}`
  );
  console.log(
    `RBAC Coverage: ${((filesWithRBAC / totalFiles) * 100).toFixed(1)}%`
  );
  console.log(
    `Mutation Protection: ${mutationEndpoints > 0 ? ((protectedMutations / mutationEndpoints) * 100).toFixed(1) : 0}%`
  );
  console.log('═'.repeat(60));

  if (issues.length > 0) {
    console.log('\n❌ UNPROTECTED MUTATION ENDPOINTS:\n');

    // Group by file
    const fileGroups = issues.reduce(
      (acc, issue) => {
        if (!acc[issue.file]) {
          acc[issue.file] = [];
        }
        acc[issue.file].push(issue);
        return acc;
      },
      {} as Record<string, RBACIssue[]>
    );

    Object.entries(fileGroups).forEach(([file, fileIssues]) => {
      console.log(`${file}`);
      console.log(`  Unprotected mutations: ${fileIssues.length}`);
      fileIssues.slice(0, 2).forEach(issue => {
        console.log(`  Line ${issue.line}: ${issue.code}`);
      });
      if (fileIssues.length > 2) {
        console.log(`  ... and ${fileIssues.length - 2} more`);
      }
      console.log();
    });

    console.log('🔧 HOW TO FIX:');
    console.log('Add role-based access control to mutation endpoints:\n');
    console.log('export default composeApiMiddleware(handler, {');
    console.log("  requiredRole: 'USER', // or 'ADMIN' for admin endpoints");
    console.log("  roleCheckMethods: ['POST', 'PUT', 'DELETE'],");
    console.log('  // ... other options');
    console.log('});\n');

    console.log('═'.repeat(60));
    console.log('❌ VERIFICATION FAILED: INSUFFICIENT RBAC COVERAGE');
    console.log(
      `${issues.length} mutation endpoints need role-based access control`
    );
    console.log('═'.repeat(60));

    process.exit(1);
  } else {
    console.log('\n✅ VERIFICATION PASSED: ALL MUTATIONS PROTECTED');
    console.log('All mutation endpoints have proper role-based access control');
  }
}

// Run the analysis
analyzeRBACCoverage().catch(console.error);
