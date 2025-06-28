#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Running Production Readiness Check...\n');

const issues = [];
const warnings = [];
const successes = [];

// Helper function to search files
function searchInFiles(dir, pattern, extensions = ['.ts', '.tsx', '.js']) {
  const results = [];

  function walkDir(currentDir) {
    try {
      const files = fs.readdirSync(currentDir);
      files.forEach(file => {
        const filePath = path.join(currentDir, file);
        const stat = fs.statSync(filePath);

        if (
          stat.isDirectory() &&
          !file.includes('node_modules') &&
          !file.includes('.next') &&
          !file.includes('dist')
        ) {
          walkDir(filePath);
        } else if (extensions.some(ext => file.endsWith(ext))) {
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (pattern.test(line)) {
              results.push(`${filePath}:${index + 1}: ${line.trim()}`);
            }
          });
        }
      });
    } catch (e) {
      // Skip directories we can't read
    }
  }

  walkDir(dir);
  return results;
}

// Check 1: Environment Variables
console.log('1. Checking environment variables...');
const requiredEnvVars = [
  'DATABASE_URL',
  'AUTH0_SECRET',
  'AUTH0_BASE_URL',
  'AUTH0_ISSUER_BASE_URL',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET',
  'OPENAI_API_KEY',
  'INTERNAL_API_KEY',
  'AIAPI_API_KEY',
];

const envExample = fs.readFileSync('.env.example', 'utf8');
requiredEnvVars.forEach(varName => {
  if (!process.env[varName] && envExample.includes(varName)) {
    issues.push(`❌ Missing required environment variable: ${varName}`);
  }
});

// Check 2: Hardcoded Secrets
console.log('2. Checking for hardcoded secrets...');
const secretPattern = /(password|secret|key|token)\s*=\s*["'][^"']+["']/i;
const secretResults = searchInFiles('src', secretPattern);
secretResults.forEach(result => {
  if (
    !result.includes('process.env') &&
    !result.includes('mock_') &&
    !result.includes('example')
  ) {
    warnings.push(
      `⚠️  Potential hardcoded secret: ${result.substring(0, 100)}...`
    );
  }
});

// Check 3: Console statements
console.log('3. Checking for console statements...');
const consolePattern = /console\.(log|error|warn|debug)/;
const consoleResults = searchInFiles('src', consolePattern);
consoleResults.forEach(result => {
  if (!result.includes('logger.ts') && !result.includes('logging.ts')) {
    warnings.push(
      `⚠️  Console statement found: ${result.substring(0, 100)}...`
    );
  }
});

// Check 4: API Endpoints without auth
console.log('4. Checking API endpoints for authentication...');
const apiDir = path.join(__dirname, '../src/pages/api');
const checkAuthInFile = filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const hasAuth =
    content.includes('withAuth') || content.includes('withApiAuthRequired');
  const hasExportDefault = content.includes('export default');
  const isTestFile = filePath.includes('.test.') || filePath.includes('.spec.');

  if (hasExportDefault && !hasAuth && !isTestFile) {
    const relativePath = path.relative(process.cwd(), filePath);
    warnings.push(`⚠️  API endpoint without authentication: ${relativePath}`);
  }
};

const walkDir = dir => {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        checkAuthInFile(filePath);
      }
    });
  } catch (e) {
    // Skip directories we can't read
  }
};

walkDir(apiDir);

// Check 5: TypeScript errors
console.log('5. Checking for TypeScript errors...');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  successes.push('✅ No TypeScript errors found');
} catch (e) {
  issues.push(
    '❌ TypeScript compilation errors found. Run "npx tsc --noEmit" for details.'
  );
}

// Check 6: Security headers
console.log('6. Checking security headers...');
const nextConfig = fs.readFileSync('next.config.js', 'utf8');
if (nextConfig.includes('securityHeaders')) {
  successes.push('✅ Security headers configured');
} else {
  issues.push('❌ Security headers not configured in next.config.js');
}

// Check 7: Database connection pooling
console.log('7. Checking database configuration...');
const prismaFile = fs.readFileSync('src/lib/prisma.ts', 'utf8');
if (!prismaFile.includes('connection_limit') && !prismaFile.includes('pool')) {
  warnings.push('⚠️  Database connection pooling not explicitly configured');
}

// Check 8: Error handling
console.log('8. Checking error handling...');
if (fs.existsSync('src/utils/error-handling/error-handler.ts')) {
  successes.push('✅ Centralized error handling found');
} else {
  warnings.push('⚠️  No centralized error handling found');
}

// Check 9: Rate limiting
console.log('9. Checking rate limiting...');
if (fs.existsSync('middleware.ts')) {
  const middlewareContent = fs.readFileSync('middleware.ts', 'utf8');
  if (middlewareContent.includes('rateLimit')) {
    successes.push('✅ Rate limiting configured');
  } else {
    warnings.push('⚠️  Rate limiting not found in middleware');
  }
}

// Check 10: Test coverage
console.log('10. Checking test coverage...');
let testCount = 0;
function countTestFiles(dir) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory() && !file.includes('node_modules')) {
        countTestFiles(filePath);
      } else if (file.includes('.test.') || file.includes('.spec.')) {
        testCount++;
      }
    });
  } catch (e) {
    // Skip directories we can't read
  }
}
countTestFiles('src');

if (testCount < 10) {
  issues.push(
    `❌ Insufficient test coverage: Only ${testCount} test files found`
  );
} else {
  successes.push(`✅ ${testCount} test files found`);
}

// Summary
console.log('\n📊 Production Readiness Summary:\n');

if (successes.length > 0) {
  console.log('✅ Passed Checks:');
  successes.forEach(s => console.log(`   ${s}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  Warnings:');
  warnings.forEach(w => console.log(`   ${w}`));
  console.log('');
}

if (issues.length > 0) {
  console.log('❌ Critical Issues:');
  issues.forEach(i => console.log(`   ${i}`));
  console.log('');
}

const score = Math.round(
  (successes.length / (successes.length + issues.length + warnings.length)) *
    100
);
console.log(`\n🎯 Production Readiness Score: ${score}%`);

if (issues.length > 0) {
  console.log(
    '\n⚠️  Please fix all critical issues before deploying to production!'
  );
  process.exit(1);
} else if (warnings.length > 0) {
  console.log(
    '\n⚠️  Consider addressing warnings for better production stability.'
  );
} else {
  console.log('\n✅ Application appears to be production ready!');
}
