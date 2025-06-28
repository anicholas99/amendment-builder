#!/usr/bin/env ts-node

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

interface AuditResult {
  name: string;
  passed: boolean;
  duration: number;
  output: string;
}

const AUDIT_SCRIPTS = [
  { name: 'CSRF Protection', script: 'audit-csrf.ts' },
  { name: 'Console Logging', script: 'audit-console.ts' },
  { name: 'Environment Variables', script: 'audit-env-vars.ts' },
  { name: 'TypeScript Any Usage', script: 'audit-any.ts' },
  { name: 'TODO/FIXME Comments', script: 'audit-todo-comments.ts' },
  { name: 'Require Statements', script: 'audit-require.ts' },
  { name: 'Long Files', script: 'audit-long-files.ts' },
  { name: 'Direct Prisma Usage', script: 'audit-direct-prisma.ts' },
];

async function runAudit(
  name: string,
  scriptPath: string
): Promise<AuditResult> {
  return new Promise(resolve => {
    const startTime = Date.now();
    let output = '';
    let errorOutput = '';

    // Use ts-node to run the TypeScript file directly
    const child = spawn('npx', ['ts-node', scriptPath], {
      cwd: process.cwd(),
      shell: true,
    });

    child.stdout.on('data', data => {
      output += data.toString();
    });

    child.stderr.on('data', data => {
      errorOutput += data.toString();
    });

    child.on('close', code => {
      const duration = Date.now() - startTime;
      const fullOutput =
        output + (errorOutput ? `\nErrors:\n${errorOutput}` : '');

      resolve({
        name,
        passed: code === 0,
        duration,
        output: fullOutput,
      });
    });

    child.on('error', error => {
      const duration = Date.now() - startTime;
      resolve({
        name,
        passed: false,
        duration,
        output: `Failed to run audit: ${error.message}`,
      });
    });
  });
}

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

function printSummary(results: AuditResult[]): void {
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;

  console.log('\n' + '='.repeat(80));
  console.log('📊 AUDIT SUMMARY');
  console.log('='.repeat(80) + '\n');

  console.log(`Total audits run: ${results.length}`);
  console.log(`✅ Passed: ${passedCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log(`⏱️  Total time: ${formatDuration(totalDuration)}\n`);

  console.log('Results by audit:');
  console.log('-'.repeat(80));

  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    const statusText = result.passed ? 'PASSED' : 'FAILED';
    console.log(
      `${status} ${result.name.padEnd(30)} ${statusText.padEnd(10)} ${formatDuration(result.duration)}`
    );
  });

  if (failedCount > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('❌ FAILED AUDITS - Action Required');
    console.log('='.repeat(80) + '\n');

    results
      .filter(r => !r.passed)
      .forEach(result => {
        console.log(`\n${'='.repeat(40)}`);
        console.log(`${result.name} (${formatDuration(result.duration)})`);
        console.log(`${'='.repeat(40)}\n`);

        // Show only the relevant part of the output (skip the initial scanning messages)
        const lines = result.output.split('\n');
        const relevantStart = lines.findIndex(
          line =>
            line.includes('Found') ||
            line.includes('⚠️') ||
            line.includes('[!]') ||
            line.includes('Error')
        );

        if (relevantStart >= 0) {
          console.log(lines.slice(relevantStart).join('\n'));
        } else {
          console.log(result.output);
        }
      });
  }

  // Overall status
  console.log('\n' + '='.repeat(80));
  if (failedCount === 0) {
    console.log('🎉 All audits passed! Your codebase is in great shape!');
  } else {
    console.log(
      `⚠️  ${failedCount} audit(s) failed. Please review and fix the issues above.`
    );
  }
  console.log('='.repeat(80) + '\n');
}

async function main() {
  console.log('🔍 Running comprehensive codebase audit...\n');
  console.log('This will check for:');
  AUDIT_SCRIPTS.forEach(({ name }) => {
    console.log(`  • ${name}`);
  });
  console.log('\nThis may take a minute. Please wait...\n');

  const results: AuditResult[] = [];

  // Run audits sequentially to avoid overwhelming the system
  for (const { name, script } of AUDIT_SCRIPTS) {
    console.log(`Running ${name} audit...`);
    const scriptPath = path.join(__dirname, script);

    // Check if script exists
    if (!fs.existsSync(scriptPath)) {
      results.push({
        name,
        passed: false,
        duration: 0,
        output: `Audit script not found: ${script}`,
      });
      continue;
    }

    const result = await runAudit(name, scriptPath);
    results.push(result);
  }

  printSummary(results);

  // Exit with error code if any audits failed
  const hasFailures = results.some(r => !r.passed);
  process.exit(hasFailures ? 1 : 0);
}

// Run the master audit
main().catch(console.error);
