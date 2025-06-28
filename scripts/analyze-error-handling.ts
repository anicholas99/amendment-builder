#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

interface ErrorHandlingReport {
  totalFiles: number;
  filesUsingOldSystem: string[];
  filesUsingNewSystem: string[];
  oldImports: {
    errorHandler: string[];
    apiErrorHandler: string[];
    errorUtils: string[];
  };
  createApiErrorUsage: string[];
  applicationErrorUsage: string[];
  summary: {
    migrationProgress: number;
    remainingWork: number;
  };
}

function analyzeErrorHandling(): ErrorHandlingReport {
  const report: ErrorHandlingReport = {
    totalFiles: 0,
    filesUsingOldSystem: [],
    filesUsingNewSystem: [],
    oldImports: {
      errorHandler: [],
      apiErrorHandler: [],
      errorUtils: [],
    },
    createApiErrorUsage: [],
    applicationErrorUsage: [],
    summary: {
      migrationProgress: 0,
      remainingWork: 0,
    },
  };

  // Find all TypeScript files in src/
  const files = glob.sync('src/**/*.ts', {
    ignore: ['**/*.test.ts', '**/*.spec.ts', '**/node_modules/**'],
  });

  report.totalFiles = files.length;

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');

    // Check for old imports
    if (content.includes("from '@/utils/errorHandler'")) {
      report.oldImports.errorHandler.push(file);
      report.filesUsingOldSystem.push(file);
    }
    if (content.includes("from '@/utils/apiErrorHandler'")) {
      report.oldImports.apiErrorHandler.push(file);
      report.filesUsingOldSystem.push(file);
    }
    if (content.includes("from '@/utils/error-utils'")) {
      report.oldImports.errorUtils.push(file);
      report.filesUsingOldSystem.push(file);
    }
    if (content.includes("from '../utils/errorHandler'")) {
      report.oldImports.errorHandler.push(file);
      report.filesUsingOldSystem.push(file);
    }
    if (content.includes("from '../../utils/errorHandler'")) {
      report.oldImports.errorHandler.push(file);
      report.filesUsingOldSystem.push(file);
    }
    if (content.includes("from '../../../utils/errorHandler'")) {
      report.oldImports.errorHandler.push(file);
      report.filesUsingOldSystem.push(file);
    }
    if (content.includes("from '../../../../utils/errorHandler'")) {
      report.oldImports.errorHandler.push(file);
      report.filesUsingOldSystem.push(file);
    }
    if (content.includes("from '../../../utils/apiErrorHandler'")) {
      report.oldImports.apiErrorHandler.push(file);
      report.filesUsingOldSystem.push(file);
    }
    if (content.includes("from '../../../../utils/apiErrorHandler'")) {
      report.oldImports.apiErrorHandler.push(file);
      report.filesUsingOldSystem.push(file);
    }

    // Check for new imports
    if (content.includes("from '@/lib/error'")) {
      report.filesUsingNewSystem.push(file);
    }

    // Check for createApiError usage
    if (content.includes('createApiError(')) {
      report.createApiErrorUsage.push(file);
    }

    // Check for ApplicationError usage
    if (content.includes('new ApplicationError(')) {
      report.applicationErrorUsage.push(file);
    }
  });

  // Remove duplicates
  report.filesUsingOldSystem = Array.from(new Set(report.filesUsingOldSystem));
  report.filesUsingNewSystem = Array.from(new Set(report.filesUsingNewSystem));
  report.createApiErrorUsage = Array.from(new Set(report.createApiErrorUsage));
  report.applicationErrorUsage = Array.from(
    new Set(report.applicationErrorUsage)
  );

  // Calculate summary
  const totalApiFiles = files.filter(f => f.includes('/api/')).length;
  const migratedFiles = report.filesUsingNewSystem.length;
  const remainingFiles = report.filesUsingOldSystem.length;

  report.summary.migrationProgress =
    Math.round((migratedFiles / (migratedFiles + remainingFiles)) * 100) || 0;
  report.summary.remainingWork = remainingFiles;

  return report;
}

// Run analysis
console.log('🔍 Analyzing Error Handling State...\n');
const report = analyzeErrorHandling();

console.log('📊 ERROR HANDLING MIGRATION REPORT');
console.log('=================================\n');

console.log(`Total TypeScript files: ${report.totalFiles}`);
console.log(`Files using OLD system: ${report.filesUsingOldSystem.length} ❌`);
console.log(`Files using NEW system: ${report.filesUsingNewSystem.length} ✅`);
console.log(`Migration Progress: ${report.summary.migrationProgress}%\n`);

console.log('📁 OLD IMPORT BREAKDOWN:');
console.log(`- errorHandler imports: ${report.oldImports.errorHandler.length}`);
console.log(
  `- apiErrorHandler imports: ${report.oldImports.apiErrorHandler.length}`
);
console.log(`- error-utils imports: ${report.oldImports.errorUtils.length}\n`);

console.log('🔧 FUNCTION USAGE:');
console.log(
  `- Files using createApiError: ${report.createApiErrorUsage.length}`
);
console.log(
  `- Files using ApplicationError: ${report.applicationErrorUsage.length}\n`
);

console.log('⚠️  FILES STILL USING OLD SYSTEM:');
report.filesUsingOldSystem.slice(0, 20).forEach(file => {
  console.log(`   - ${file}`);
});
if (report.filesUsingOldSystem.length > 20) {
  console.log(
    `   ... and ${report.filesUsingOldSystem.length - 20} more files\n`
  );
}

console.log('\n📝 RECOMMENDATIONS:');
if (report.summary.migrationProgress < 50) {
  console.log('❌ Migration is less than 50% complete!');
  console.log(
    '   - Consider using the migration script to update remaining files'
  );
  console.log('   - Delete old error handling files after migration');
  console.log('   - Enable ESLint rule to prevent regression');
} else if (report.summary.migrationProgress < 100) {
  console.log('⚠️  Migration is partially complete');
  console.log('   - Finish migrating remaining files');
  console.log('   - Delete old error handling files');
} else {
  console.log('✅ Migration appears complete!');
  console.log('   - Delete old error handling files');
  console.log('   - Enable ESLint rule');
}

// Save detailed report
const detailedReport = JSON.stringify(report, null, 2);
fs.writeFileSync('error-handling-report.json', detailedReport);
console.log('\n📄 Detailed report saved to: error-handling-report.json');
