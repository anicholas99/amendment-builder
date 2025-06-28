module.exports = {
  extends: ['./.eslintrc.js'],
  plugins: ['security'],
  rules: {
    // Security-specific rules
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-new-buffer': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-non-literal-require': 'warn',
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-pseudoRandomBytes': 'error',
    'security/detect-sql-injection': 'error',

    // Custom patterns for this project
    'no-restricted-syntax': [
      'error',
      {
        selector:
          'MemberExpression[object.name="process"][property.name="env"] > LogicalExpression[operator="||"]',
        message:
          'Use getEnvVar() or getRequiredEnvVar() instead of hardcoded fallbacks',
      },
      {
        selector:
          'CallExpression[callee.property.name="json"] > ObjectExpression > Property[key.name="error"][value.type="MemberExpression"][value.property.name="message"]',
        message:
          'Use sendSafeErrorResponse() instead of exposing error.message',
      },
      {
        selector:
          'MemberExpression[object.name="prisma"][property.type="Identifier"]:not([property.name="$transaction"]):not([property.name="$connect"]):not([property.name="$disconnect"])',
        message:
          'Use repository pattern instead of direct Prisma access in API routes',
      },
    ],

    // Require CSRF protection on mutations
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@/middleware/compose',
            importNames: ['composeApiMiddleware'],
            message: 'Ensure withCsrf is used for POST/PUT/DELETE endpoints',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['src/pages/api/**/*.ts'],
      rules: {
        // Stricter rules for API routes
        'security/detect-object-injection': 'error',
        'security/detect-non-literal-fs-filename': 'error',
        'no-console': 'error',
      },
    },
    {
      files: ['src/repositories/**/*.ts', 'src/lib/db/**/*.ts'],
      rules: {
        // Allow Prisma in repository layer
        'no-restricted-syntax': 'off',
      },
    },
    {
      files: ['src/pages/api/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: 'ExportDefaultDeclaration',
            message:
              'API routes must use the secure middleware pattern. Use composeApiMiddleware or ensure withAuth and withTenantGuard are properly applied.',
          },
        ],
        // Custom rule to enforce tenant validation on mutations
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['*'],
                message:
                  'Ensure withTenantGuard is imported and used for mutation endpoints',
              },
            ],
          },
        ],
      },
    },
  ],
};

// Add this to your build process to enforce security patterns
// Create a separate file: scripts/validate-api-security.js
const VALIDATE_API_SECURITY_SCRIPT = `
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// CRITICAL: This script validates that all API routes follow security patterns
const MUTATION_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
const API_DIR = path.join(__dirname, '../src/pages/api');

function validateApiRoute(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const errors = [];
  
  // Check if it's a mutation endpoint
  const hasMutationMethod = MUTATION_METHODS.some(method => 
    content.includes(\`method === '\${method}'\`) || 
    content.includes(\`method == '\${method}'\`) ||
    content.includes(\`['\${method}']\`) ||
    content.includes(\`"\${method}"\`)
  );
  
  if (hasMutationMethod) {
    // Must have withTenantGuard
    if (!content.includes('withTenantGuard')) {
      errors.push(\`\${filePath}: Mutation endpoint missing withTenantGuard\`);
    }
    
    // Must have resolveTenantId function
    if (!content.includes('resolveTenantId')) {
      errors.push(\`\${filePath}: Missing resolveTenantId function\`);
    }
  }
  
  // All endpoints must have authentication (via composeApiMiddleware or withAuth)
  if (!content.includes('composeApiMiddleware') && !content.includes('withAuth')) {
    errors.push(\`\${filePath}: Missing authentication middleware\`);
  }
  
  return errors;
}

// Validate all API routes
const apiFiles = glob.sync(path.join(API_DIR, '**/*.{ts,tsx}'));
const allErrors = [];

apiFiles.forEach(file => {
  const errors = validateApiRoute(file);
  allErrors.push(...errors);
});

if (allErrors.length > 0) {
  console.error('\\n❌ API Security Validation Failed:\\n');
  allErrors.forEach(error => console.error('  ' + error));
  console.error('\\n⚠️  Fix these security issues before deploying!\\n');
  process.exit(1);
} else {
  console.log('✅ All API routes pass security validation');
}
`;
