import { promises as fs } from 'fs';
import path from 'path';

interface TenantGuardIssue {
  file: string;
  method: string;
  line: number;
  issue: string;
  context?: string;
}

interface FileAnalysis {
  hasTenantGuard: boolean;
  hasComposeApiMiddleware: boolean;
  requireTenantFalse: boolean;
  mutationMethods: string[];
  issues: TenantGuardIssue[];
}

const MUTATION_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

async function analyzeTenantGuards(): Promise<void> {
  console.log('🔒 TENANT GUARD VERIFICATION\n');
  console.log('Scanning for missing tenant guards on mutation endpoints...\n');

  const apiDir = path.join(process.cwd(), 'src/pages/api');
  const issues: TenantGuardIssue[] = [];
  let totalMutationEndpoints = 0;
  let endpointsWithGuards = 0;
  let endpointsExplicitlySkipped = 0;

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
        await analyzeFile(fullPath);
      }
    }
  }

  async function analyzeFile(filePath: string): Promise<void> {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = path.relative(apiDir, filePath).replace(/\\/g, '/');

    // Skip certain files that don't need tenant guards
    const skipPatterns = [
      /^auth\//, // Auth endpoints
      /^health/, // Health checks
      /^swagger/, // API documentation
      /\/\[\.\.\.path\]\.ts$/, // Catch-all routes
    ];

    if (skipPatterns.some(pattern => pattern.test(relativePath))) {
      return;
    }

    const analysis = analyzeFileContent(content, lines);

    // Check if this file handles mutations
    if (analysis.mutationMethods.length === 0) {
      return; // Not a mutation endpoint
    }

    totalMutationEndpoints++;

    // Check for proper tenant guard implementation
    if (analysis.hasComposeApiMiddleware) {
      if (analysis.requireTenantFalse) {
        endpointsExplicitlySkipped++;
        // This is okay - explicitly disabled
      } else {
        // Using composeApiMiddleware - it automatically adds tenant guards
        endpointsWithGuards++;
      }
    } else if (analysis.hasTenantGuard) {
      // Manually applied tenant guard
      endpointsWithGuards++;
    } else {
      // Missing tenant guard!
      issues.push({
        file: `src/pages/api/${relativePath}`,
        method: analysis.mutationMethods.join(', '),
        line: 0,
        issue: 'Missing tenant guard for mutation endpoint',
        context: `Handles ${analysis.mutationMethods.join(', ')} but has no tenant guard`,
      });
    }
  }

  function analyzeFileContent(content: string, lines: string[]): FileAnalysis {
    const analysis: FileAnalysis = {
      hasTenantGuard: false,
      hasComposeApiMiddleware: false,
      requireTenantFalse: false,
      mutationMethods: [],
      issues: [],
    };

    // Check for tenant guard patterns
    const tenantPatterns = [
      /withTenantGuard/,
      /withTenantValidation/,
      /resolveTenantId/,
    ];

    // Check for compose middleware
    if (/composeApiMiddleware/.test(content)) {
      analysis.hasComposeApiMiddleware = true;

      // Check if requireTenant is explicitly set to false
      if (/requireTenant\s*:\s*false/.test(content)) {
        analysis.requireTenantFalse = true;
      }
    }

    // Check for manual tenant guard application
    tenantPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        analysis.hasTenantGuard = true;
      }
    });

    // Detect which HTTP methods this handler supports
    const methodPatterns = [
      {
        method: 'POST',
        patterns: [
          /case\s+['"]POST['"]/,
          /method\s*===?\s*['"]POST['"]/,
          /req\.method\s*===?\s*['"]POST['"]/,
        ],
      },
      {
        method: 'PUT',
        patterns: [
          /case\s+['"]PUT['"]/,
          /method\s*===?\s*['"]PUT['"]/,
          /req\.method\s*===?\s*['"]PUT['"]/,
        ],
      },
      {
        method: 'PATCH',
        patterns: [
          /case\s+['"]PATCH['"]/,
          /method\s*===?\s*['"]PATCH['"]/,
          /req\.method\s*===?\s*['"]PATCH['"]/,
        ],
      },
      {
        method: 'DELETE',
        patterns: [
          /case\s+['"]DELETE['"]/,
          /method\s*===?\s*['"]DELETE['"]/,
          /req\.method\s*===?\s*['"]DELETE['"]/,
        ],
      },
    ];

    methodPatterns.forEach(({ method, patterns }) => {
      if (patterns.some(pattern => pattern.test(content))) {
        analysis.mutationMethods.push(method);
      }
    });

    // If no explicit method handling found, check for generic handlers that might handle all methods
    if (
      analysis.mutationMethods.length === 0 &&
      /export\s+default/.test(content)
    ) {
      // Look for handlers that don't check method at all (handles all methods)
      if (
        !/(switch|if).*req\.method/.test(content) &&
        !/(GET|HEAD|OPTIONS)/.test(content)
      ) {
        // Assume it might handle mutations if it doesn't explicitly check methods
        if (/create|update|delete|save|remove|add|edit|modify/.test(content)) {
          analysis.mutationMethods.push('*mutations*');
        }
      }
    }

    return analysis;
  }

  await scanDirectory(apiDir);

  // Display results
  console.log('📊 VERIFICATION RESULTS:');
  console.log('═'.repeat(60));
  console.log(`Total mutation endpoints found: ${totalMutationEndpoints}`);
  console.log(`Endpoints with tenant guards: ${endpointsWithGuards}`);
  console.log(`Endpoints explicitly skipped: ${endpointsExplicitlySkipped}`);
  console.log(`Endpoints missing guards: ${issues.length}`);
  console.log(
    `Tenant Guard Coverage: ${totalMutationEndpoints > 0 ? ((endpointsWithGuards / totalMutationEndpoints) * 100).toFixed(1) : 100}%`
  );
  console.log('═'.repeat(60));

  if (issues.length > 0) {
    console.log('\n❌ MISSING TENANT GUARDS:\n');

    issues.forEach(issue => {
      console.log(`${issue.file}`);
      console.log(`  Methods: ${issue.method}`);
      console.log(`  Issue: ${issue.issue}`);
      if (issue.context) {
        console.log(`  Context: ${issue.context}`);
      }
      console.log();
    });

    console.log('🔧 HOW TO FIX:');
    console.log('\n1️⃣  Option 1: Use composeApiMiddleware (Recommended)');
    console.log(`
// ✅ BEST: Automatic tenant guard for mutations
import { composeApiMiddleware } from '@/middleware/compose';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Your handler logic
}

// For project-based resources
const resolveTenantId = async (req: NextApiRequest) => {
  const { projectId } = req.query;
  const project = await findProjectById(String(projectId));
  return project?.tenantId || null;
};

export default composeApiMiddleware(handler, {
  resolveTenantId, // Custom resolver for project-based resources
  // OR don't specify to use default (req.user.tenantId)
});
`);

    console.log('\n2️⃣  Option 2: Explicit tenant guard (for complex cases)');
    console.log(`
// ✅ MANUAL: When you need more control
import { withTenantGuard } from '@/middleware/authorization';
import { withAuth } from '@/middleware/auth';

const resolveTenantId = async (req: NextApiRequest) => {
  // Custom resolution logic
};

export default withAuth(withTenantGuard(resolveTenantId)(handler));
`);

    console.log('\n3️⃣  Option 3: Explicitly skip (for special cases)');
    console.log(`
// For endpoints that genuinely don't need tenant guards
export default composeApiMiddleware(handler, {
  requireTenant: false, // Explicitly disable tenant guard
  // Document why this endpoint doesn't need tenant isolation
});
`);

    console.log('\n═'.repeat(60));
    console.log('❌ VERIFICATION FAILED: MISSING TENANT GUARDS DETECTED');
    console.log(`${issues.length} mutation endpoints need tenant guards`);
    console.log('═'.repeat(60));

    process.exit(1);
  } else {
    console.log(
      '\n✅ VERIFICATION PASSED: ALL MUTATION ENDPOINTS HAVE TENANT GUARDS'
    );
    console.log(
      'All mutation endpoints are properly protected with tenant isolation'
    );
  }
}

// Run the analysis
analyzeTenantGuards().catch(console.error);
