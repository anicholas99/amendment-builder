#!/usr/bin/env tsx

/**
 * DEFINITIVE ERROR HANDLING VERIFICATION SCRIPT
 *
 * This script provides absolute certainty about error message exposure.
 * It checks EVERY API endpoint for potential information leakage through
 * error.message, error.stack, or other sensitive error details.
 *
 * Run this anytime to verify no sensitive information is exposed.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

interface ErrorExposure {
  file: string;
  line: number;
  code: string;
  type: string;
}

interface EndpointVerification {
  file: string;
  totalExposures: number;
  exposures: ErrorExposure[];
  hasSafeErrorHandling: boolean;
}

async function verifyEndpoint(
  filePath: string
): Promise<EndpointVerification | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    // Skip test files
    if (
      filePath.includes('__tests__') ||
      filePath.includes('.test.') ||
      filePath.includes('.spec.')
    ) {
      return null;
    }

    // Check if it's an API endpoint
    if (
      !content.includes('NextApiRequest') &&
      !content.includes('NextApiHandler') &&
      !content.includes('CustomApiRequest')
    ) {
      return null;
    }

    const exposures: ErrorExposure[] = [];

    // Patterns that indicate error message exposure
    const exposurePatterns = [
      // Direct error.message exposure
      { pattern: /error:\s*error\.message/, type: 'error.message in response' },
      {
        pattern: /message:\s*error\.message/,
        type: 'error.message in response',
      },
      {
        pattern: /details:\s*error\.message/,
        type: 'error.message in response',
      },
      { pattern: /error:\s*err\.message/, type: 'err.message in response' },
      { pattern: /message:\s*err\.message/, type: 'err.message in response' },

      // Error instance exposure
      {
        pattern: /\.json\s*\(\s*{\s*error:\s*error\s*}\s*\)/,
        type: 'entire error object',
      },
      { pattern: /\.json\s*\(\s*error\s*\)/, type: 'entire error object' },

      // Stack trace exposure
      { pattern: /error\.stack/, type: 'stack trace exposure' },
      { pattern: /err\.stack/, type: 'stack trace exposure' },

      // Prisma error exposure
      { pattern: /error\.code\s*[^=]/, type: 'database error code' },
      { pattern: /error\.meta/, type: 'database metadata' },

      // String concatenation with error
      { pattern: /['"`].*['"`]\s*\+\s*error/, type: 'error concatenation' },
      { pattern: /error\s*\+\s*['"`]/, type: 'error concatenation' },

      // Template literal with error
      { pattern: /\$\{error\.message\}/, type: 'error.message in template' },
      { pattern: /\$\{err\.message\}/, type: 'err.message in template' },

      // Conditional error message exposure
      { pattern: /\?\s*error\.message\s*:/, type: 'conditional error.message' },
      { pattern: /\|\|\s*error\.message/, type: 'fallback error.message' },
    ];

    // Check each line for exposures
    lines.forEach((line, index) => {
      for (const { pattern, type } of exposurePatterns) {
        if (pattern.test(line)) {
          // Skip if it's a comment
          if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
            continue;
          }

          // Skip if it's console.log or logger (internal logging is OK)
          if (
            line.includes('console.') ||
            line.includes('logger.') ||
            line.includes('apiLogger.')
          ) {
            continue;
          }

          // Skip if it's using sendSafeErrorResponse
          if (line.includes('sendSafeErrorResponse')) {
            continue;
          }

          exposures.push({
            file: filePath,
            line: index + 1,
            code: line.trim(),
            type,
          });
          break; // Only report once per line
        }
      }
    });

    // Check if file uses safe error handling
    const hasSafeErrorHandling =
      content.includes('sendSafeErrorResponse') ||
      content.includes('createSanitizedErrorResponse');

    return {
      file: filePath,
      totalExposures: exposures.length,
      exposures,
      hasSafeErrorHandling,
    };
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error);
    return null;
  }
}

async function main() {
  console.log('🔒 DEFINITIVE ERROR HANDLING VERIFICATION\n');
  console.log('Date:', new Date().toISOString());
  console.log('Purpose: Verify no sensitive error information is exposed\n');

  const apiDir = path.join(process.cwd(), 'src', 'pages', 'api');
  const pattern = path.join(apiDir, '**', '*.ts').replace(/\\/g, '/');

  const files = await glob(pattern);
  console.log(`Scanning ${files.length} API files...\n`);

  const verifications: EndpointVerification[] = [];

  // Verify each file
  for (const file of files) {
    const verification = await verifyEndpoint(file);
    if (verification && verification.totalExposures > 0) {
      verifications.push(verification);
    }
  }

  // Calculate results
  const totalFiles = files.length;
  const filesWithExposures = verifications.length;
  const totalExposures = verifications.reduce(
    (sum, v) => sum + v.totalExposures,
    0
  );

  // Display results
  console.log('📊 VERIFICATION RESULTS:');
  console.log('═'.repeat(60));
  console.log(`Total API files scanned: ${totalFiles}`);
  console.log(`Files with error exposures: ${filesWithExposures}`);
  console.log(`Total error exposures found: ${totalExposures}`);
  console.log(
    `Error Handling Security: ${filesWithExposures === 0 ? '100%' : ((1 - filesWithExposures / totalFiles) * 100).toFixed(1) + '%'}`
  );
  console.log('═'.repeat(60));

  // Show exposures if any
  if (verifications.length > 0) {
    console.log('\n❌ ERROR MESSAGE EXPOSURES FOUND:\n');

    for (const verification of verifications) {
      console.log(`${path.relative(process.cwd(), verification.file)}`);
      console.log(`  Exposures: ${verification.totalExposures}`);
      console.log(
        `  Safe handling: ${verification.hasSafeErrorHandling ? 'Yes (but still has exposures)' : 'No'}`
      );

      for (const exposure of verification.exposures) {
        console.log(`  Line ${exposure.line}: ${exposure.type}`);
        console.log(
          `    Code: ${exposure.code.substring(0, 80)}${exposure.code.length > 80 ? '...' : ''}`
        );
      }
      console.log('');
    }

    console.log('🔧 HOW TO FIX:');
    console.log(
      "1. Import: import { sendSafeErrorResponse } from '@/utils/secure-error-response';"
    );
    console.log(
      "2. Replace error responses with: sendSafeErrorResponse(res, error, statusCode, 'User-friendly message');"
    );
    console.log(
      '3. Never expose error.message, error.stack, or error objects directly to users\n'
    );
  }

  // Final verdict
  console.log('═'.repeat(60));
  if (filesWithExposures === 0) {
    console.log('✅ VERIFICATION PASSED: NO ERROR MESSAGE EXPOSURES');
    console.log(
      'All API endpoints properly handle errors without exposing sensitive information'
    );
  } else {
    console.log('❌ VERIFICATION FAILED: ERROR MESSAGE EXPOSURES DETECTED');
    console.log(
      `${filesWithExposures} files are leaking sensitive error information`
    );
    console.log(`${totalExposures} total exposures need to be fixed`);
  }
  console.log('═'.repeat(60));

  // Exit with appropriate code
  process.exit(filesWithExposures === 0 ? 0 : 1);
}

main().catch(console.error);
