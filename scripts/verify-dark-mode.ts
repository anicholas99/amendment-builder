#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import chalk from 'chalk';

interface Issue {
  file: string;
  line: number;
  column: number;
  issue: string;
  context: string;
}

// Patterns to detect hard-coded colors
const hardCodedColorPatterns = [
  // Direct color props
  { pattern: /color=["']white["']/g, message: 'Hard-coded "white" color' },
  { pattern: /color=["']black["']/g, message: 'Hard-coded "black" color' },
  {
    pattern: /color=["']gray\.\d+["']/g,
    message: 'Hard-coded gray scale color',
  },
  {
    pattern: /color=["']#[0-9a-fA-F]{3,6}["']/g,
    message: 'Hard-coded hex color',
  },

  // Background props
  { pattern: /bg=["']white["']/g, message: 'Hard-coded "white" background' },
  {
    pattern: /bg=["']gray\.\d+["']/g,
    message: 'Hard-coded gray scale background',
  },
  {
    pattern: /backgroundColor=["'][^"']+["']/g,
    message: 'Hard-coded backgroundColor',
  },

  // Border props
  {
    pattern: /borderColor=["']gray\.\d+["']/g,
    message: 'Hard-coded gray border color',
  },
  {
    pattern: /borderColor=["']#[0-9a-fA-F]{3,6}["']/g,
    message: 'Hard-coded hex border color',
  },

  // Style objects
  {
    pattern:
      /style=\{\{[^}]*color:\s*["'](?:white|black|gray|#[0-9a-fA-F]{3,6})["']/g,
    message: 'Hard-coded color in style object',
  },
  {
    pattern:
      /style=\{\{[^}]*background:\s*["'](?:white|black|gray|#[0-9a-fA-F]{3,6})["']/g,
    message: 'Hard-coded background in style object',
  },
];

// Allowed exceptions
const allowedPatterns = [
  /text\./,
  /bg\./,
  /border\./,
  /Alpha/,
  /transparent/,
  /current/,
  /_dark/,
  /_light/,
];

function isAllowed(match: string): boolean {
  return allowedPatterns.some(pattern => pattern.test(match));
}

function findIssuesInFile(filePath: string): Issue[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues: Issue[] = [];

  hardCodedColorPatterns.forEach(({ pattern, message }) => {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (!isAllowed(match[0])) {
        // Find line and column
        let charCount = 0;
        let lineNumber = 0;
        let columnNumber = 0;

        for (let i = 0; i < lines.length; i++) {
          if (charCount + lines[i].length >= match.index) {
            lineNumber = i + 1;
            columnNumber = match.index - charCount + 1;
            break;
          }
          charCount += lines[i].length + 1; // +1 for newline
        }

        issues.push({
          file: filePath,
          line: lineNumber,
          column: columnNumber,
          issue: message,
          context: match[0],
        });
      }
    }
  });

  // Check for useColorModeValue that could be replaced
  const colorModeValueRegex =
    /useColorModeValue\s*\(\s*["'](?:white|gray\.\d+)["']\s*,\s*["'][^"']+["']\s*\)/g;
  let match;

  while ((match = colorModeValueRegex.exec(content)) !== null) {
    let charCount = 0;
    let lineNumber = 0;
    let columnNumber = 0;

    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= match.index) {
        lineNumber = i + 1;
        columnNumber = match.index - charCount + 1;
        break;
      }
      charCount += lines[i].length + 1;
    }

    issues.push({
      file: filePath,
      line: lineNumber,
      column: columnNumber,
      issue: 'Consider replacing useColorModeValue with semantic tokens',
      context: match[0].substring(0, 50) + '...',
    });
  }

  return issues;
}

function main() {
  console.log(chalk.blue.bold('\n🌓 Dark Mode Verification\n'));

  const srcDir = path.join(process.cwd(), 'src');
  const patterns = [
    'components/**/*.tsx',
    'features/**/*.tsx',
    'pages/**/*.tsx',
  ];

  let totalIssues = 0;
  const fileIssues: Map<string, Issue[]> = new Map();

  patterns.forEach(pattern => {
    const files = glob.sync(path.join(srcDir, pattern));

    files.forEach(file => {
      const issues = findIssuesInFile(file);
      if (issues.length > 0) {
        fileIssues.set(file, issues);
        totalIssues += issues.length;
      }
    });
  });

  if (totalIssues === 0) {
    console.log(
      chalk.green(
        '✅ No dark mode issues found! All components use semantic tokens.\n'
      )
    );
    process.exit(0);
  }

  console.log(
    chalk.red(
      `❌ Found ${totalIssues} dark mode issues in ${fileIssues.size} files:\n`
    )
  );

  fileIssues.forEach((issues, file) => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(chalk.yellow(`\n${relativePath}:`));

    issues.forEach(issue => {
      console.log(
        chalk.gray(`  Line ${issue.line}:${issue.column}`) +
          chalk.red(` - ${issue.issue}`) +
          chalk.gray(` (${issue.context})`)
      );
    });
  });

  console.log(chalk.blue('\n💡 Quick fixes:'));
  console.log(chalk.gray('  - Replace hard-coded colors with semantic tokens'));
  console.log(
    chalk.gray(
      '  - Use bg.primary, bg.card, text.primary, border.primary, etc.'
    )
  );
  console.log(
    chalk.gray(
      '  - See docs/development/DARK_MODE_MIGRATION_GUIDE.md for details\n'
    )
  );

  process.exit(1);
}

// Run the script
if (require.main === module) {
  main();
}
