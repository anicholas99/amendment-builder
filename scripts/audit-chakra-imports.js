#!/usr/bin/env node

/**
 * Chakra UI Import Audit Script
 *
 * Scans the codebase for direct Chakra UI imports and generates a report
 * to track migration progress from Chakra-coupled to framework-agnostic components.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const config = {
  // Directories to scan
  scanDirs: [
    'src/components/**/*.{ts,tsx}',
    'src/features/**/*.{ts,tsx}',
    'src/pages/**/*.{ts,tsx}',
    'src/domains/**/*.{ts,tsx}',
    'src/shared/**/*.{ts,tsx}',
  ],
  // Directories to ignore (these should use Chakra)
  ignoreDirs: ['src/ui/**/*', 'src/theme/**/*', 'node_modules/**/*'],
  // Chakra import patterns to look for
  chakraPatterns: [
    /@chakra-ui\/react/,
    /@chakra-ui\/icons/,
    /@chakra-ui\/system/,
    /@chakra-ui\/theme/,
    /@chakra-ui\/styled-system/,
  ],
};

class ChakraAudit {
  constructor() {
    this.results = {
      totalFiles: 0,
      filesWithChakra: 0,
      filesWithoutChakra: 0,
      chakraImports: [],
      cleanFiles: [],
      summary: {},
    };
  }

  async run() {
    console.log('🔍 Auditing Chakra UI imports...\n');

    const files = this.getFilesToScan();

    for (const filePath of files) {
      await this.analyzeFile(filePath);
    }

    this.generateReport();
  }

  getFilesToScan() {
    let allFiles = [];

    for (const pattern of config.scanDirs) {
      const files = glob.sync(pattern, {
        ignore: config.ignoreDirs,
        absolute: false,
      });
      allFiles = allFiles.concat(files);
    }

    return [...new Set(allFiles)]; // Remove duplicates
  }

  async analyzeFile(filePath) {
    this.results.totalFiles++;

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const chakraImports = this.findChakraImports(content, filePath);

      if (chakraImports.length > 0) {
        this.results.filesWithChakra++;
        this.results.chakraImports.push({
          file: filePath,
          imports: chakraImports,
          lineCount: content.split('\n').length,
        });
      } else {
        this.results.filesWithoutChakra++;
        this.results.cleanFiles.push(filePath);
      }
    } catch (error) {
      console.warn(`⚠️  Could not read file: ${filePath}`);
    }
  }

  findChakraImports(content, filePath) {
    const lines = content.split('\n');
    const imports = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Skip comments
      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
        return;
      }

      // Check for Chakra imports
      config.chakraPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          imports.push({
            line: index + 1,
            content: trimmedLine,
            type: this.categorizeImport(trimmedLine),
          });
        }
      });
    });

    return imports;
  }

  categorizeImport(importLine) {
    if (importLine.includes('@chakra-ui/react')) {
      return 'components';
    } else if (importLine.includes('@chakra-ui/icons')) {
      return 'icons';
    } else if (importLine.includes('@chakra-ui/theme')) {
      return 'theme';
    } else {
      return 'other';
    }
  }

  generateReport() {
    const migrationProgress = Math.round(
      (this.results.filesWithoutChakra / this.results.totalFiles) * 100
    );

    // Group by directory
    const byDirectory = {};
    this.results.chakraImports.forEach(item => {
      const dir = path.dirname(item.file);
      if (!byDirectory[dir]) {
        byDirectory[dir] = [];
      }
      byDirectory[dir].push(item);
    });

    // Generate summary
    this.results.summary = {
      migrationProgress,
      byDirectory,
      topOffenders: this.results.chakraImports
        .sort((a, b) => b.imports.length - a.imports.length)
        .slice(0, 10),
    };

    this.printReport();
    this.saveReportToFile();
  }

  printReport() {
    console.log('📊 CHAKRA UI IMPORT AUDIT REPORT');
    console.log('================================\n');

    console.log('📈 MIGRATION PROGRESS');
    console.log(`Total files scanned: ${this.results.totalFiles}`);
    console.log(`Files using Chakra directly: ${this.results.filesWithChakra}`);
    console.log(
      `Files using @/ui components: ${this.results.filesWithoutChakra}`
    );
    console.log(
      `Migration progress: ${this.results.summary.migrationProgress}%\n`
    );

    if (this.results.filesWithChakra > 0) {
      console.log('🎯 TOP FILES TO REFACTOR');
      console.log('(Most Chakra imports first)');
      this.results.summary.topOffenders.slice(0, 5).forEach((item, index) => {
        console.log(
          `${index + 1}. ${item.file} (${item.imports.length} imports)`
        );
      });
      console.log('');

      console.log('📁 IMPORTS BY DIRECTORY');
      Object.entries(this.results.summary.byDirectory)
        .sort(([, a], [, b]) => b.length - a.length)
        .slice(0, 8)
        .forEach(([dir, files]) => {
          console.log(`${dir}: ${files.length} files with Chakra imports`);
        });
      console.log('');
    }

    console.log('✅ MIGRATION SUGGESTIONS');
    if (this.results.summary.migrationProgress < 25) {
      console.log('🟡 Early stage - Focus on new components using @/ui');
    } else if (this.results.summary.migrationProgress < 50) {
      console.log('🟠 Good progress - Start refactoring simple components');
    } else if (this.results.summary.migrationProgress < 75) {
      console.log('🔵 Great progress - Tackle more complex components');
    } else {
      console.log('🟢 Excellent progress - Almost there!');
    }

    console.log('\nNext steps:');
    console.log('1. New components: Use @/ui components exclusively');
    console.log('2. Quick wins: Refactor simple components when touched');
    console.log('3. Big refactors: Plan for complex components');
    console.log('\n📄 Detailed report saved to: chakra-audit-report.json');
  }

  saveReportToFile() {
    const reportData = {
      timestamp: new Date().toISOString(),
      ...this.results,
    };

    fs.writeFileSync(
      'chakra-audit-report.json',
      JSON.stringify(reportData, null, 2)
    );

    // Also create a simple CSV for spreadsheet analysis
    const csvLines = [
      'File,ChakraImports,LineCount,Directory',
      ...this.results.chakraImports.map(
        item =>
          `"${item.file}",${item.imports.length},${item.lineCount},"${path.dirname(item.file)}"`
      ),
    ];

    fs.writeFileSync('chakra-audit-report.csv', csvLines.join('\n'));
  }
}

// Run the audit
if (require.main === module) {
  const audit = new ChakraAudit();
  audit.run().catch(console.error);
}

module.exports = ChakraAudit;
