#!/usr/bin/env tsx

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

interface EndpointAnalysis {
  file: string;
  hasCsrf: boolean;
  methods: string[];
  exportHasCsrf: boolean;
  needsCsrf: boolean;
  reason?: string;
}

async function analyzeEndpoint(
  filePath: string
): Promise<EndpointAnalysis | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');

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

    // Find which methods this endpoint handles
    const methods: string[] = [];
    const methodPatterns = [
      /method === ['"]POST['"]/,
      /method === ['"]PUT['"]/,
      /method === ['"]DELETE['"]/,
      /method === ['"]PATCH['"]/,
      /req\.method === ['"]POST['"]/,
      /req\.method === ['"]PUT['"]/,
      /req\.method === ['"]DELETE['"]/,
      /req\.method === ['"]PATCH['"]/,
    ];

    methodPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        const method = pattern.source.match(/(POST|PUT|DELETE|PATCH)/)?.[0];
        if (method && !methods.includes(method)) {
          methods.push(method);
        }
      }
    });

    // Check for CSRF protection
    const hasCsrf = content.includes('withCsrf');

    // Check if the export has CSRF
    // Use [\s\S] instead of . with 's' flag for ES compatibility
    const exportMatch = content.match(/export\s+default[\s\S]+?(?=\n\n|\n$|$)/);
    const exportHasCsrf = exportMatch
      ? exportMatch[0].includes('withCsrf')
      : false;

    // Determine if this endpoint needs CSRF
    let needsCsrf = false;
    let reason = '';

    // Check for special cases that might not need CSRF
    if (filePath.includes('auth/[...auth0]')) {
      needsCsrf = false;
      reason = 'Auth0 handler - managed by Auth0';
    } else if (filePath.includes('csrf-token')) {
      needsCsrf = false;
      reason = 'CSRF token endpoint itself';
    } else if (filePath.includes('health')) {
      needsCsrf = false;
      reason = 'Health check endpoint';
    } else if (filePath.includes('swagger')) {
      needsCsrf = false;
      reason = 'API documentation endpoint';
    } else if (methods.length > 0) {
      // Has mutation methods
      needsCsrf = true;
      reason = `Handles mutations: ${methods.join(', ')}`;
    }

    return {
      file: filePath,
      hasCsrf,
      methods,
      exportHasCsrf,
      needsCsrf,
      reason,
    };
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error);
    return null;
  }
}

async function main() {
  console.log('🔍 Comprehensive CSRF Coverage Analysis\n');

  // Use path.join and normalize for cross-platform compatibility
  const apiDir = path.join(process.cwd(), 'src', 'pages', 'api');
  const pattern = path.join(apiDir, '**', '*.ts').replace(/\\/g, '/');

  console.log(`Searching in: ${pattern}`);
  const files = await glob(pattern);
  console.log(`Found ${files.length} files to analyze\n`);

  const endpoints: EndpointAnalysis[] = [];

  // Analyze all endpoints
  for (const file of files) {
    const analysis = await analyzeEndpoint(file);
    if (analysis) {
      endpoints.push(analysis);
    }
  }

  // Categorize endpoints
  const mutationEndpoints = endpoints.filter(e => e.methods.length > 0);
  const protectedEndpoints = mutationEndpoints.filter(e => e.exportHasCsrf);
  const unprotectedEndpoints = mutationEndpoints.filter(e => !e.exportHasCsrf);
  const needsProtection = endpoints.filter(
    e => e.needsCsrf && !e.exportHasCsrf
  );

  console.log('📊 Summary:');
  console.log(`Total API endpoints analyzed: ${endpoints.length}`);
  console.log(`Endpoints handling mutations: ${mutationEndpoints.length}`);
  console.log(`Mutation endpoints with CSRF: ${protectedEndpoints.length}`);
  console.log(
    `Mutation endpoints WITHOUT CSRF: ${unprotectedEndpoints.length}`
  );
  console.log(
    `\nCSRF Coverage: ${((protectedEndpoints.length / mutationEndpoints.length) * 100).toFixed(1)}%\n`
  );

  // Show unprotected mutation endpoints
  if (unprotectedEndpoints.length > 0) {
    console.log('❌ Mutation endpoints MISSING CSRF protection:');
    unprotectedEndpoints.forEach(e => {
      console.log(`  ${path.relative(process.cwd(), e.file)}`);
      console.log(`    Methods: ${e.methods.join(', ')}`);
    });
  }

  // Show endpoints that need protection
  if (needsProtection.length > 0) {
    console.log('\n⚠️  Endpoints that NEED CSRF protection:');
    needsProtection.forEach(e => {
      console.log(`  ${path.relative(process.cwd(), e.file)}`);
      console.log(`    Reason: ${e.reason}`);
    });
  }

  // Show protected endpoints
  console.log('\n✅ Mutation endpoints WITH CSRF protection:');
  protectedEndpoints.forEach(e => {
    console.log(
      `  ${path.relative(process.cwd(), e.file)} - ${e.methods.join(', ')}`
    );
  });

  // Final verdict
  console.log('\n🎯 Final Verdict:');
  const coverage = (protectedEndpoints.length / mutationEndpoints.length) * 100;
  if (coverage === 100) {
    console.log('✅ ALL mutation endpoints have CSRF protection!');
  } else if (coverage >= 90) {
    console.log(`✅ Excellent CSRF coverage at ${coverage.toFixed(1)}%`);
  } else if (coverage >= 60) {
    console.log(
      `⚠️  Good CSRF coverage at ${coverage.toFixed(1)}% but gaps remain`
    );
  } else {
    console.log(
      `❌ Poor CSRF coverage at ${coverage.toFixed(1)}% - immediate action needed`
    );
  }
}

main().catch(console.error);
