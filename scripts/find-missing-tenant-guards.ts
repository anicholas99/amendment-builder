import { readFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

// Find all API routes
const apiRoutes = glob.sync('src/pages/api/**/*.ts', {
  ignore: ['**/test.ts', '**/*.test.ts', '**/*.spec.ts', '**/_*.ts'],
});

console.log('# Routes Missing Tenant Guards\n');

const publicRoutes = [
  'auth/[...auth0].ts',
  'auth/login.ts',
  'auth/session.ts',
  'csrf-token.ts',
  'health.ts',
  'swagger.ts',
];

const missingTenantGuard: string[] = [];

apiRoutes.forEach(filePath => {
  const content = readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const relativePath = path.relative('src/pages/api', filePath);

  // Skip if it's a public route
  if (publicRoutes.some(route => relativePath.includes(route))) {
    return;
  }

  // Check if it uses composeApiMiddleware
  const usesMiddleware = content.includes('composeApiMiddleware');

  // Check for tenant guard
  const hasTenantGuard =
    content.includes('resolveTenantId') ||
    content.includes('withTenantGuard') ||
    content.includes('requireTenant: false');

  if (usesMiddleware && !hasTenantGuard) {
    missingTenantGuard.push(relativePath);
  }
});

console.log(
  `Found ${missingTenantGuard.length} routes missing tenant guards:\n`
);
missingTenantGuard.forEach(route => {
  console.log(`- ${route}`);
});

console.log('\n## Routes to Fix:\n');
missingTenantGuard.forEach(route => {
  console.log(`### ${route}`);
  console.log(
    'Needs: Add resolveTenantId function and pass to composeApiMiddleware\n'
  );
});
