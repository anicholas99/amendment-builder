#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface AnyUsageReport {
  file: string;
  line: number;
  code: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  context: string;
}

// Patterns that indicate critical any usage
const CRITICAL_PATTERNS = [
  /Promise<any>/,
  /\[\].*:.*any\[\]/,
  /returns?.*:.*any/,
  /export.*any/,
  /public.*:.*any/,
];

const HIGH_PATTERNS = [
  /\(.*:.*any.*\)/, // Function parameters
  /useState<any>/,
  /useRef<any>/,
  /as any/,
];

function getSeverity(line: string): 'critical' | 'high' | 'medium' | 'low' {
  if (CRITICAL_PATTERNS.some(pattern => pattern.test(line))) return 'critical';
  if (HIGH_PATTERNS.some(pattern => pattern.test(line))) return 'high';
  if (line.includes('.d.ts')) return 'low';
  return 'medium';
}

function findAnyUsage(): AnyUsageReport[] {
  const results: AnyUsageReport[] = [];

  try {
    // Find all TypeScript files excluding test files and node_modules
    const command = `grep -rn --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next --exclude="*.test.ts" --exclude="*.spec.ts" ": any" src/`;
    const output = execSync(command, { encoding: 'utf-8' });

    const lines = output.split('\n').filter(Boolean);

    for (const line of lines) {
      const match = line.match(/^([^:]+):(\d+):(.*)$/);
      if (match) {
        const [, file, lineNum, code] = match;
        results.push({
          file,
          line: parseInt(lineNum),
          code: code.trim(),
          severity: getSeverity(code),
          context: getContext(file, parseInt(lineNum)),
        });
      }
    }
  } catch (error) {
    console.error('Error running grep:', error);
  }

  return results;
}

function getContext(file: string, lineNum: number): string {
  try {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    // Find the containing function/class
    for (let i = lineNum - 1; i >= 0; i--) {
      const line = lines[i];
      if (line.match(/(function|class|interface|type|const|export)\s+(\w+)/)) {
        return line.trim();
      }
    }
  } catch (error) {
    // Ignore
  }
  return 'Unknown context';
}

function generateReport(results: AnyUsageReport[]) {
  console.log('\n📊 ANY TYPE USAGE REPORT\n');
  console.log(`Total occurrences: ${results.length}`);

  const bySeverity = results.reduce(
    (acc, item) => {
      acc[item.severity] = (acc[item.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log('\nBy Severity:');
  console.log(`  🔴 Critical: ${bySeverity.critical || 0}`);
  console.log(`  🟠 High: ${bySeverity.high || 0}`);
  console.log(`  🟡 Medium: ${bySeverity.medium || 0}`);
  console.log(`  🟢 Low: ${bySeverity.low || 0}`);

  // Group by file
  const byFile = results.reduce(
    (acc, item) => {
      if (!acc[item.file]) acc[item.file] = [];
      acc[item.file].push(item);
      return acc;
    },
    {} as Record<string, AnyUsageReport[]>
  );

  // Sort files by number of occurrences
  const sortedFiles = Object.entries(byFile)
    .sort(([, a], [, b]) => b.length - a.length)
    .slice(0, 20);

  console.log('\n🎯 Top 20 Files with Most Any Usage:');
  for (const [file, items] of sortedFiles) {
    const critical = items.filter(i => i.severity === 'critical').length;
    const high = items.filter(i => i.severity === 'high').length;
    console.log(
      `\n${file} (${items.length} total, ${critical} critical, ${high} high)`
    );

    // Show critical and high severity items
    const important = items
      .filter(i => i.severity === 'critical' || i.severity === 'high')
      .slice(0, 3);
    for (const item of important) {
      console.log(
        `  Line ${item.line} [${item.severity}]: ${item.code.substring(0, 80)}...`
      );
    }
  }

  // Write detailed report
  const reportPath = 'any-usage-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed report saved to ${reportPath}`);

  return results;
}

// Generate a fix file for the most critical issues
function generateFixFile(results: AnyUsageReport[]) {
  const critical = results
    .filter(r => r.severity === 'critical' || r.severity === 'high')
    .slice(0, 50);

  const fixes = critical.map(item => ({
    file: item.file,
    line: item.line,
    current: item.code,
    suggestion: getSuggestion(item.code),
    context: item.context,
  }));

  fs.writeFileSync('any-fixes-priority.json', JSON.stringify(fixes, null, 2));
  console.log('\n🔧 Priority fixes saved to any-fixes-priority.json');
}

function getSuggestion(code: string): string {
  if (code.includes('Promise<any>'))
    return 'Use Promise<unknown> or define specific type';
  if (code.includes('any[]'))
    return 'Use unknown[] or define specific array type';
  if (code.includes('as any')) return 'Use proper type assertion or type guard';
  if (code.includes(': any')) return 'Replace with unknown or specific type';
  return 'Define proper type';
}

// Run the analysis
const results = findAnyUsage();
generateReport(results);
generateFixFile(results);
