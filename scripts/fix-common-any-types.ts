import { Project, SyntaxKind, ts } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

// Create a new ts-morph project
const project = new Project();

// Add source files to the project
project.addSourceFilesAtPaths('src/**/*.{ts,tsx}');

// Keep track of changes for reporting
const changedFiles: Record<
  string,
  {
    original: string[];
    fixed: string[];
  }
> = {};

// Process each source file
const sourceFiles = project.getSourceFiles();
for (const sourceFile of sourceFiles) {
  const filePath = sourceFile.getFilePath();
  const relativePath = path.relative(process.cwd(), filePath);

  // Skip node_modules
  if (filePath.includes('node_modules')) continue;

  // Get the original source before making changes
  const originalSource = sourceFile.getFullText();
  let sourceChanged = false;

  // ---- Fix pattern 1: Replace 'any[]' with 'unknown[]' ----
  const arrayTypes = [...sourceFile.getDescendantsOfKind(SyntaxKind.ArrayType)];
  for (const arrayType of arrayTypes) {
    const elementTypeNode = arrayType.getElementTypeNode();
    if (elementTypeNode && elementTypeNode.getText() === 'any') {
      // Don't change REST parameters like ...args: any[]
      const parentNode = arrayType.getParent();
      const isRestParam =
        parentNode &&
        ts.isParameter(parentNode.compilerNode) &&
        ts.isArrayTypeNode(arrayType.compilerNode) &&
        parentNode.compilerNode.dotDotDotToken;

      // If it's not a rest parameter, replace with unknown[]
      if (!isRestParam) {
        try {
          const startPos = elementTypeNode.getStart();
          const { line } = sourceFile.getLineAndColumnAtPos(startPos);
          const lineText = sourceFile
            .getFullText()
            .split('\n')
            [line - 1].trim();

          // Save original and replacement for reporting
          if (!changedFiles[relativePath]) {
            changedFiles[relativePath] = { original: [], fixed: [] };
          }
          changedFiles[relativePath].original.push(`Line ${line}: ${lineText}`);

          // Replace 'any' with 'unknown'
          sourceFile.replaceText(
            [elementTypeNode.getStart(), elementTypeNode.getEnd()],
            'unknown'
          );
          sourceChanged = true;

          // Get updated line text
          const updatedLine = sourceFile
            .getFullText()
            .split('\n')
            [line - 1].trim();
          changedFiles[relativePath].fixed.push(`Line ${line}: ${updatedLine}`);
        } catch (error) {
          console.warn(
            `Warning: Could not process array type in ${relativePath}`
          );
        }
      }
    }
  }

  // ---- Fix pattern A2: Replace 'Record<string, any>' with 'Record<string, unknown>' using string replace ----
  // This is safer than trying to manipulate nodes directly
  const originalText = sourceFile.getFullText();
  const updatedText = originalText.replace(
    /Record<string,\s*any>/g,
    'Record<string, unknown>'
  );

  if (updatedText !== originalText) {
    // Find the line numbers for reporting
    const originalLines = originalText.split('\n');
    const recordAnyRegex = /Record<string,\s*any>/g;

    let match;
    const lineNumber = 0;

    for (let i = 0; i < originalLines.length; i++) {
      const line = originalLines[i];
      if (line.match(recordAnyRegex)) {
        if (!changedFiles[relativePath]) {
          changedFiles[relativePath] = { original: [], fixed: [] };
        }
        changedFiles[relativePath].original.push(
          `Line ${i + 1}: ${line.trim()}`
        );

        // Calculate updated line
        const updatedLine = line.replace(
          recordAnyRegex,
          'Record<string, unknown>'
        );
        changedFiles[relativePath].fixed.push(
          `Line ${i + 1}: ${updatedLine.trim()}`
        );
      }
    }

    // Update the source file with the changes
    sourceFile.replaceText([0, originalText.length], updatedText);
    sourceChanged = true;
  }

  // ---- Fix pattern 3: Replace 'error: any' with 'error: unknown' in catch blocks ----
  const catchClauses = [
    ...sourceFile.getDescendantsOfKind(SyntaxKind.CatchClause),
  ];
  for (const catchClause of catchClauses) {
    try {
      // Get the variable declaration in the catch clause
      const variableDeclaration = catchClause.getVariableDeclaration();
      if (variableDeclaration) {
        const typeNode = variableDeclaration.getTypeNode();
        if (typeNode && typeNode.getText() === 'any') {
          const startPos = typeNode.getStart();
          const { line } = sourceFile.getLineAndColumnAtPos(startPos);
          const lineText = sourceFile
            .getFullText()
            .split('\n')
            [line - 1].trim();

          // Save original and replacement for reporting
          if (!changedFiles[relativePath]) {
            changedFiles[relativePath] = { original: [], fixed: [] };
          }
          changedFiles[relativePath].original.push(`Line ${line}: ${lineText}`);

          // Replace with 'unknown'
          sourceFile.replaceText(
            [typeNode.getStart(), typeNode.getEnd()],
            'unknown'
          );
          sourceChanged = true;

          // Get updated line text
          const updatedLine = sourceFile
            .getFullText()
            .split('\n')
            [line - 1].trim();
          changedFiles[relativePath].fixed.push(`Line ${line}: ${updatedLine}`);
        }
      }
    } catch (error) {
      console.warn(
        `Warning: Could not process catch clause in ${relativePath}`
      );
    }
  }

  // Save changes if the file was modified
  if (sourceChanged) {
    sourceFile.saveSync();
  }
}

// Generate a report
let report = '# Automated `any` Type Fixes Report\n\n';
report +=
  'This report shows the changes made to replace unsafe `any` types with safer alternatives.\n\n';

// Add details for each changed file
Object.entries(changedFiles).forEach(([file, changes]) => {
  report += `## ${file}\n\n`;

  for (let i = 0; i < changes.original.length; i++) {
    report += '```typescript\n';
    report += `// Before:\n${changes.original[i]}\n\n`;
    report += `// After:\n${changes.fixed[i]}\n`;
    report += '```\n\n';
  }
});

// Write the report to a file
const reportPath = path.join(process.cwd(), 'any-types-fixes-report.md');
fs.writeFileSync(reportPath, report);

console.log(`Fixes complete! Report saved to: ${reportPath}`);
console.log(
  `Modified ${Object.keys(changedFiles).length} files with safer type alternatives.`
);
