#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

interface TodoComment {
  file: string;
  line: number;
  type: 'TODO' | 'FIXME' | 'HACK' | 'XXX' | 'NOTE';
  content: string;
  author?: string;
  date?: string;
}

const SRC_DIR = path.join(process.cwd(), 'src');

// Patterns to detect TODO-style comments
const TODO_PATTERNS = [
  {
    pattern: /\/\/\s*(TODO|FIXME|HACK|XXX|NOTE)(\([^)]+\))?:?\s*(.*)/,
    multiline: false,
  },
  {
    pattern: /\/\*\s*(TODO|FIXME|HACK|XXX|NOTE)(\([^)]+\))?:?\s*([^*]*)/,
    multiline: true,
  },
  {
    pattern: /\*\s*(TODO|FIXME|HACK|XXX|NOTE)(\([^)]+\))?:?\s*(.*)/,
    multiline: false,
  },
];

function checkFile(filePath: string): TodoComment[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const comments: TodoComment[] = [];

    // Skip certain files
    if (
      filePath.includes('node_modules') ||
      filePath.includes('.git') ||
      filePath.includes('dist') ||
      filePath.includes('build')
    ) {
      return comments;
    }

    lines.forEach((line, lineIndex) => {
      TODO_PATTERNS.forEach(({ pattern }) => {
        const regex = new RegExp(pattern, 'gi');
        let match;

        while ((match = regex.exec(line)) !== null) {
          const [, type, authorPart, content] = match;

          // Extract author if present (e.g., TODO(john): or TODO @john:)
          let author: string | undefined;
          if (authorPart) {
            author = authorPart.replace(/[()@]/g, '').trim();
          }

          comments.push({
            file: filePath,
            line: lineIndex + 1,
            type: type.toUpperCase() as TodoComment['type'],
            content: content.trim(),
            author,
          });
        }
      });
    });

    return comments;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}

function formatResults(comments: TodoComment[]): void {
  if (comments.length === 0) {
    console.log('✅ No TODO/FIXME comments found! Clean codebase! 🎉');
    return;
  }

  console.log(`\n📝 Found ${comments.length} TODO-style comments:\n`);

  // Group by type
  const byType = comments.reduce(
    (acc, comment) => {
      if (!acc[comment.type]) {
        acc[comment.type] = [];
      }
      acc[comment.type].push(comment);
      return acc;
    },
    {} as Record<string, TodoComment[]>
  );

  // Summary
  console.log('📊 Summary by type:');
  Object.entries(byType).forEach(([type, typeComments]) => {
    const emoji =
      {
        TODO: '📌',
        FIXME: '🔧',
        HACK: '⚡',
        XXX: '⚠️',
        NOTE: '📝',
      }[type] || '📌';
    console.log(`   ${emoji} ${type}: ${typeComments.length}`);
  });

  // Group by file
  const byFile = comments.reduce(
    (acc, comment) => {
      if (!acc[comment.file]) {
        acc[comment.file] = [];
      }
      acc[comment.file].push(comment);
      return acc;
    },
    {} as Record<string, TodoComment[]>
  );

  console.log(
    `\n📁 Files with technical debt: ${Object.keys(byFile).length}\n`
  );

  // Show high priority items first (FIXME, XXX, HACK)
  const highPriority = comments.filter(c =>
    ['FIXME', 'XXX', 'HACK'].includes(c.type)
  );
  if (highPriority.length > 0) {
    console.log('🚨 High Priority Items:');
    highPriority.forEach(comment => {
      const relativePath = path.relative(process.cwd(), comment.file);
      const author = comment.author ? ` [@${comment.author}]` : '';
      console.log(
        `   ${relativePath}:${comment.line} - ${comment.type}${author}: ${comment.content}`
      );
    });
    console.log('');
  }

  // Show all by file
  console.log('📄 All comments by file:\n');
  Object.entries(byFile).forEach(([file, fileComments]) => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`${relativePath}`);

    fileComments.forEach(comment => {
      const emoji =
        {
          TODO: '📌',
          FIXME: '🔧',
          HACK: '⚡',
          XXX: '⚠️',
          NOTE: '📝',
        }[comment.type] || '📌';
      const author = comment.author ? ` [@${comment.author}]` : '';
      console.log(
        `   ${emoji} Line ${comment.line}: ${comment.type}${author}: ${comment.content}`
      );
    });
    console.log('');
  });

  // Tips
  console.log('💡 Best practices:');
  console.log('   - TODO: General improvements or features to implement');
  console.log('   - FIXME: Known bugs that need to be fixed');
  console.log('   - HACK: Temporary workarounds that should be improved');
  console.log('   - Include author/date for accountability');
  console.log('   - Convert TODOs to tickets/issues for tracking');
  console.log('   - Review and clean up old TODOs regularly');
}

async function main() {
  console.log('🔍 Auditing codebase for TODO/FIXME comments...\n');

  // Find all source files
  const patterns = [
    path.join(SRC_DIR, '**/*.{ts,tsx,js,jsx}').replace(/\\/g, '/'),
    path.join(process.cwd(), 'scripts', '**/*.{ts,js}').replace(/\\/g, '/'),
  ];

  let allFiles: string[] = [];
  patterns.forEach(pattern => {
    const files = glob.sync(pattern);
    allFiles = allFiles.concat(files);
  });

  console.log(`Found ${allFiles.length} files to scan\n`);

  const allComments: TodoComment[] = [];

  for (const file of allFiles) {
    const comments = checkFile(file);
    allComments.push(...comments);
  }

  formatResults(allComments);

  // Exit with error code if high-priority issues found
  const highPriorityCount = allComments.filter(c =>
    ['FIXME', 'XXX', 'HACK'].includes(c.type)
  ).length;
  process.exit(highPriorityCount > 0 ? 1 : 0);
}

// Run the audit
main().catch(console.error);
