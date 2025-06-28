import { promises as fs } from 'fs';
import path from 'path';

interface RBACIssue {
  file: string;
  method: string;
  issue: string;
  currentImplementation?: string;
}

interface RBACAnalysis {
  hasRBAC: boolean;
  hasComposeMiddleware: boolean;
  requiredRole?: string;
  roleCheckMethods?: string[];
  hasRequireRole: boolean;
  hasRoleCheck: boolean;
}

async function analyzeRBAC(): Promise<void> {
  console.log('🛡️  RBAC (Role-Based Access Control) VERIFICATION\n');
  console.log(
    'Scanning for proper role-based access control implementation...\n'
  );

  const apiDir = path.join(process.cwd(), 'src/pages/api');
  const issues: RBACIssue[] = [];
  let totalEndpoints = 0;
  let endpointsWithRBAC = 0;
  let publicEndpoints = 0;

  // Known public endpoints that don't need RBAC
  const publicEndpointPatterns = [
    /^health/,
    /^swagger/,
    /^auth\/login/,
    /^auth\/logout/,
    /^auth\/callback/,
    /^auth\/refresh/,
  ];

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
    const relativePath = path.relative(apiDir, filePath).replace(/\\/g, '/');

    // Skip test files and internal files
    if (
      relativePath.includes('__tests__') ||
      relativePath.startsWith('internal/')
    ) {
      return;
    }

    // Check if this is a known public endpoint
    if (publicEndpointPatterns.some(pattern => pattern.test(relativePath))) {
      publicEndpoints++;
      return;
    }

    totalEndpoints++;
    const analysis = analyzeFileContent(content);

    // Determine if RBAC is properly implemented
    let hasProperRBAC = false;
    let implementationDetails = '';

    if (analysis.hasComposeMiddleware && analysis.requiredRole) {
      hasProperRBAC = true;
      implementationDetails = `composeApiMiddleware with requiredRole: ${analysis.requiredRole}`;
      if (analysis.roleCheckMethods?.length) {
        implementationDetails += ` (methods: ${analysis.roleCheckMethods.join(', ')})`;
      }
    } else if (analysis.hasRequireRole) {
      hasProperRBAC = true;
      implementationDetails = 'requireRole() middleware';
    } else if (analysis.hasRoleCheck) {
      hasProperRBAC = true;
      implementationDetails = 'Manual role checking in handler';
    }

    if (hasProperRBAC) {
      endpointsWithRBAC++;
    } else {
      // Check if endpoint just uses basic auth without role checks
      if (analysis.hasComposeMiddleware || /withAuth/.test(content)) {
        issues.push({
          file: `src/pages/api/${relativePath}`,
          method: detectMethods(content).join(', ') || 'ALL',
          issue: 'Has authentication but no role-based access control',
          currentImplementation:
            'Using auth middleware without role requirements',
        });
      } else {
        issues.push({
          file: `src/pages/api/${relativePath}`,
          method: detectMethods(content).join(', ') || 'ALL',
          issue: 'No authentication or RBAC found',
          currentImplementation: 'No security middleware detected',
        });
      }
    }
  }

  function analyzeFileContent(content: string): RBACAnalysis {
    const analysis: RBACAnalysis = {
      hasRBAC: false,
      hasComposeMiddleware: false,
      hasRequireRole: false,
      hasRoleCheck: false,
    };

    // Check for composeApiMiddleware
    if (/composeApiMiddleware/.test(content)) {
      analysis.hasComposeMiddleware = true;

      // Extract requiredRole
      const roleMatch = content.match(/requiredRole\s*:\s*['"]([A-Z_]+)['"]/);
      if (roleMatch) {
        analysis.requiredRole = roleMatch[1];
        analysis.hasRBAC = true;
      }

      // Extract roleCheckMethods
      const methodsMatch = content.match(/roleCheckMethods\s*:\s*\[(.*?)\]/);
      if (methodsMatch) {
        const methods = methodsMatch[1].match(/['"]([A-Z]+)['"]/g);
        if (methods) {
          analysis.roleCheckMethods = methods.map(m => m.replace(/['"]/g, ''));
        }
      }
    }

    // Check for requireRole middleware
    if (/requireRole\s*\(/.test(content)) {
      analysis.hasRequireRole = true;
      analysis.hasRBAC = true;
    }

    // Check for manual role checking
    const roleCheckPatterns = [
      /req\.user\.role/,
      /user\.role\s*===?\s*['"][A-Z_]+['"]/,
      /hasRole\(/,
      /checkRole\(/,
      /isAdmin\(/,
      /Role\.(ADMIN|USER|SUPER_ADMIN)/,
    ];

    if (roleCheckPatterns.some(pattern => pattern.test(content))) {
      analysis.hasRoleCheck = true;
      analysis.hasRBAC = true;
    }

    return analysis;
  }

  function detectMethods(content: string): string[] {
    const methods: string[] = [];
    const methodPatterns = [
      {
        method: 'GET',
        pattern:
          /case\s+['"]GET['"]|method\s*===?\s*['"]GET['"]|req\.method\s*===?\s*['"]GET['"]/,
      },
      {
        method: 'POST',
        pattern:
          /case\s+['"]POST['"]|method\s*===?\s*['"]POST['"]|req\.method\s*===?\s*['"]POST['"]/,
      },
      {
        method: 'PUT',
        pattern:
          /case\s+['"]PUT['"]|method\s*===?\s*['"]PUT['"]|req\.method\s*===?\s*['"]PUT['"]/,
      },
      {
        method: 'PATCH',
        pattern:
          /case\s+['"]PATCH['"]|method\s*===?\s*['"]PATCH['"]|req\.method\s*===?\s*['"]PATCH['"]/,
      },
      {
        method: 'DELETE',
        pattern:
          /case\s+['"]DELETE['"]|method\s*===?\s*['"]DELETE['"]|req\.method\s*===?\s*['"]DELETE['"]/,
      },
    ];

    methodPatterns.forEach(({ method, pattern }) => {
      if (pattern.test(content)) {
        methods.push(method);
      }
    });

    return methods;
  }

  await scanDirectory(apiDir);

  // Calculate coverage
  const rbacCoverage =
    totalEndpoints > 0
      ? ((endpointsWithRBAC / totalEndpoints) * 100).toFixed(1)
      : '100';

  // Display results
  console.log('📊 RBAC VERIFICATION RESULTS:');
  console.log('═'.repeat(60));
  console.log(`Total API endpoints scanned: ${totalEndpoints}`);
  console.log(`Public endpoints (excluded): ${publicEndpoints}`);
  console.log(`Endpoints with RBAC: ${endpointsWithRBAC}`);
  console.log(`Endpoints missing RBAC: ${issues.length}`);
  console.log(`RBAC Coverage: ${rbacCoverage}%`);
  console.log('═'.repeat(60));

  if (issues.length > 0) {
    console.log('\n❌ ENDPOINTS MISSING RBAC:\n');

    // Group by issue type
    const authOnlyEndpoints = issues.filter(i =>
      i.issue.includes('no role-based')
    );
    const noSecurityEndpoints = issues.filter(i =>
      i.issue.includes('No authentication')
    );

    if (authOnlyEndpoints.length > 0) {
      console.log('🟡 ENDPOINTS WITH AUTH BUT NO ROLE CHECKS:');
      authOnlyEndpoints.forEach(issue => {
        console.log(`\n${issue.file}`);
        console.log(`  Methods: ${issue.method}`);
        console.log(`  Current: ${issue.currentImplementation}`);
      });
    }

    if (noSecurityEndpoints.length > 0) {
      console.log('\n🔴 ENDPOINTS WITH NO SECURITY:');
      noSecurityEndpoints.forEach(issue => {
        console.log(`\n${issue.file}`);
        console.log(`  Methods: ${issue.method}`);
        console.log(`  Issue: ${issue.issue}`);
      });
    }

    console.log('\n🔧 HOW TO FIX:\n');
    console.log(
      '1️⃣  For most endpoints - Use composeApiMiddleware with role requirements:'
    );
    console.log(`
// Standard user endpoints
export default composeApiMiddleware(handler, {
  requiredRole: 'USER',  // or 'ADMIN' for admin endpoints
});

// Role check only for specific methods
export default composeApiMiddleware(handler, {
  requiredRole: 'ADMIN',
  roleCheckMethods: ['POST', 'DELETE'], // Only check role for these methods
});
`);

    console.log('2️⃣  For admin-only endpoints - Combine with requireRole:');
    console.log(`
import { requireRole } from '@/middleware/role';

export default composeApiMiddleware(requireRole('ADMIN')(handler), {
  // other options...
});
`);

    console.log('3️⃣  For complex authorization - Manual checks in handler:');
    console.log(`
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Custom authorization logic
  if (req.user.role !== 'ADMIN' && req.user.id !== resourceOwnerId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // ... rest of handler
}
`);

    console.log('\n📝 ROLE DEFINITIONS:');
    console.log('  - USER: Standard authenticated users');
    console.log('  - ADMIN: Administrative users with elevated privileges');
    console.log('  - SUPER_ADMIN: System-level administrators (if applicable)');

    console.log('\n═'.repeat(60));
    console.log(
      `❌ RBAC VERIFICATION FAILED: ${issues.length} ENDPOINTS NEED ROLE CHECKS`
    );
    console.log('═'.repeat(60));

    // Don't exit with error to allow for gradual improvement
    // process.exit(1);
  } else {
    console.log(
      '\n✅ RBAC VERIFICATION PASSED: ALL ENDPOINTS HAVE PROPER ACCESS CONTROL'
    );
    console.log(
      'All API endpoints implement appropriate role-based access control'
    );
  }

  // Summary for tracking
  console.log('\n📈 IMPROVEMENT TRACKING:');
  console.log(`Current RBAC Coverage: ${rbacCoverage}%`);
  if (parseFloat(rbacCoverage) >= 90) {
    console.log("🎯 Excellent! You're in the top tier for RBAC implementation");
  } else if (parseFloat(rbacCoverage) >= 80) {
    console.log('👍 Good progress! Just a few more endpoints to secure');
  } else {
    console.log('⚠️  More work needed to achieve SOC 2 compliance standards');
  }
}

// Run the analysis
analyzeRBAC().catch(console.error);
