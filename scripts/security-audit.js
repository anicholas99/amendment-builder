#!/usr/bin/env node

/**
 * Security Audit Script
 *
 * This script:
 * 1. Runs npm audit to check for vulnerabilities in dependencies
 * 2. Checks for outdated packages that might need updates
 * 3. Validates key security settings in the application
 *
 * Usage:
 * node scripts/security-audit.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env files
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Set colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

console.log(
  `${colors.cyan}=== Patent Drafter AI Security Audit ====${colors.reset}\n`
);

try {
  // Check for vulnerabilities in dependencies
  console.log(
    `${colors.blue}Checking for vulnerabilities in dependencies...${colors.reset}\n`
  );

  try {
    const auditOutput = execSync('npm audit --json', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const auditResult = JSON.parse(auditOutput);

    if (auditResult.vulnerabilities) {
      const vulnCount = Object.values(auditResult.vulnerabilities).reduce(
        (sum, vuln) => sum + vuln.length,
        0
      );

      if (vulnCount > 0) {
        console.log(
          `${colors.red}Found ${vulnCount} vulnerabilities:${colors.reset}`
        );

        // Print vulnerability summary
        Object.entries(auditResult.vulnerabilities).forEach(
          ([severity, vulns]) => {
            if (vulns.length > 0) {
              console.log(
                `${colors.yellow}- ${vulns.length} ${severity} severity${colors.reset}`
              );
            }
          }
        );

        console.log(
          `\n${colors.yellow}Run 'npm audit fix' to attempt automatic fixes${colors.reset}`
        );
      } else {
        console.log(`${colors.green}No vulnerabilities found.${colors.reset}`);
      }
    }
  } catch (error) {
    console.log(
      `${colors.red}Failed to run npm audit:${colors.reset} ${error.message}`
    );
  }

  // Check for outdated packages
  console.log(
    `\n${colors.blue}Checking for outdated packages...${colors.reset}\n`
  );

  try {
    const outdatedOutput = execSync('npm outdated --json', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const outdatedPackages = JSON.parse(outdatedOutput);

    const criticalPackages = [
      'next',
      'react',
      'next-auth',
      'prisma',
      '@prisma/client',
      'bcryptjs',
      'jsonwebtoken',
      'cookie',
    ];

    const outdatedCount = Object.keys(outdatedPackages).length;

    if (outdatedCount > 0) {
      console.log(
        `${colors.yellow}Found ${outdatedCount} outdated packages:${colors.reset}\n`
      );

      // Check critical packages first
      criticalPackages.forEach(pkg => {
        if (outdatedPackages[pkg]) {
          const { current, wanted, latest } = outdatedPackages[pkg];
          console.log(`${colors.red}CRITICAL: ${pkg}${colors.reset}`);
          console.log(`  Current: ${current}, Latest: ${latest}`);
          delete outdatedPackages[pkg];
        }
      });

      // Then check remaining packages
      Object.entries(outdatedPackages).forEach(
        ([pkg, { current, wanted, latest }]) => {
          console.log(`${colors.yellow}${pkg}${colors.reset}`);
          console.log(`  Current: ${current}, Latest: ${latest}`);
        }
      );

      console.log(
        `\n${colors.yellow}Run 'npm update' to update to wanted versions${colors.reset}`
      );
      console.log(
        `${colors.yellow}Run 'npm install <package>@latest' to update to latest versions${colors.reset}`
      );
    } else {
      console.log(`${colors.green}All packages are up to date.${colors.reset}`);
    }
  } catch (error) {
    if (error.stdout && error.stdout.trim() === '{}') {
      console.log(`${colors.green}All packages are up to date.${colors.reset}`);
    } else {
      console.log(
        `${colors.red}Failed to check outdated packages:${colors.reset} ${error.message}`
      );
    }
  }

  // Validate security settings
  console.log(
    `\n${colors.blue}Validating security settings...${colors.reset}\n`
  );

  // Check important environment variables
  const requiredEnvVars = ['NEXTAUTH_SECRET', 'JWT_SECRET', 'NEXTAUTH_URL'];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    console.log(
      `${colors.red}Missing required environment variables:${colors.reset}`
    );
    missingEnvVars.forEach(envVar => {
      console.log(`- ${envVar}`);
    });
  } else {
    console.log(
      `${colors.green}All required environment variables are set.${colors.reset}`
    );
  }

  // Check JWT secret strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.log(
      `${colors.red}Warning: JWT_SECRET is too short. It should be at least 32 characters.${colors.reset}`
    );
  }

  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    console.log(
      `${colors.red}Warning: NEXTAUTH_SECRET is too short. It should be at least 32 characters.${colors.reset}`
    );
  }

  // Check for proper CORS configuration
  const corsCheck = () => {
    try {
      const apiFiles = fs
        .readdirSync(path.resolve(__dirname, '../src/pages/api'))
        .filter(f => f.endsWith('.ts'));
      let corsProperlyConfigured = true;

      for (const file of apiFiles) {
        const content = fs.readFileSync(
          path.resolve(__dirname, `../src/pages/api/${file}`),
          'utf8'
        );

        // Check if there's a CORS header without proper origin restriction
        if (
          content.includes('Access-Control-Allow-Origin') &&
          content.includes('Access-Control-Allow-Origin", "*"')
        ) {
          console.log(
            `${colors.red}Warning: Permissive CORS policy found in ${file}${colors.reset}`
          );
          corsProperlyConfigured = false;
        }
      }

      if (corsProperlyConfigured) {
        console.log(
          `${colors.green}CORS configuration looks good.${colors.reset}`
        );
      }
    } catch (error) {
      console.log(
        `${colors.red}Failed to check CORS configuration:${colors.reset} ${error.message}`
      );
    }
  };

  corsCheck();

  // Final recommendations
  console.log(`\n${colors.blue}Security Recommendations:${colors.reset}\n`);
  console.log(
    `${colors.cyan}1. Regularly run 'npm audit' and update dependencies${colors.reset}`
  );
  console.log(
    `${colors.cyan}2. Use strong, unique secrets for JWT_SECRET and NEXTAUTH_SECRET${colors.reset}`
  );
  console.log(
    `${colors.cyan}3. Implement proper CORS restrictions in production${colors.reset}`
  );
  console.log(
    `${colors.cyan}4. Enable rate limiting for all authentication endpoints${colors.reset}`
  );
  console.log(
    `${colors.cyan}5. Implement proper validation for all user inputs${colors.reset}`
  );
  console.log(
    `${colors.cyan}6. Use HTTPS in production and set secure cookies${colors.reset}`
  );
  console.log(
    `${colors.cyan}7. Keep your Node.js and npm versions up to date${colors.reset}`
  );
} catch (error) {
  console.error(
    `${colors.red}Error running security audit:${colors.reset}`,
    error
  );
  process.exit(1);
}
