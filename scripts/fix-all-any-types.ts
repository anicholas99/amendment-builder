#!/usr/bin/env ts-node
import { Project, SyntaxKind, ts, Node } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Initialize the project
const project = new Project({
  tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
});

// Add source files
project.addSourceFilesAtPaths(['src/**/*.{ts,tsx}', 'scripts/**/*.ts']);

// Statistics tracking
const stats = {
  totalFixed: 0,
  errorAny: 0,
  arrayAny: 0,
  genericAny: 0,
  recordAny: 0,
  functionParams: 0,
  stateHooks: 0,
  apiResponses: 0,
  asAny: 0,
  manualReview: 0,
};

// Track files that need manual review
const manualReviewFiles: Map<string, string[]> = new Map();

// Common type replacements
const TYPE_REPLACEMENTS: Record<string, string> = {
  'any[]': 'unknown[]',
  'Array<any>': 'Array<unknown>',
  'Record<string, any>': 'Record<string, unknown>',
  'Promise<any>': 'Promise<unknown>',
  'React.Dispatch<any>': 'React.Dispatch<unknown>',
};

// Domain-specific type imports to add
const DOMAIN_IMPORTS: Record<string, string[]> = {
  Project: ["import { Project } from '@/types';"],
  Figure: ["import { Figure } from '@/types';"],
  CitationMatch: ["import { CitationMatch } from '@/types';"],
  SearchHistory: ["import { SearchHistory } from '@/types';"],
  ParsedElement: ["import { ParsedElement } from '@/types';"],
};

function addManualReview(filePath: string, reason: string) {
  const relativePath = path.relative(process.cwd(), filePath);
  if (!manualReviewFiles.has(relativePath)) {
    manualReviewFiles.set(relativePath, []);
  }
  manualReviewFiles.get(relativePath)!.push(reason);
  stats.manualReview++;
}

function detectContextualType(node: Node, paramName?: string): string | null {
  // Check for common React patterns
  if (paramName?.includes('dispatch')) {
    return 'React.Dispatch<{ type: string; payload?: unknown }>';
  }

  if (paramName?.includes('error') || paramName?.includes('err')) {
    return 'unknown';
  }

  if (paramName?.includes('data') || paramName?.includes('result')) {
    // Check if in API context
    const sourceFile = node.getSourceFile();
    if (sourceFile.getFilePath().includes('/api/')) {
      return 'unknown';
    }
  }

  if (paramName?.includes('invention')) {
    return 'InventionData';
  }

  if (paramName?.includes('project')) {
    return 'Project';
  }

  if (paramName?.includes('citation')) {
    return 'CitationMatch';
  }

  return null;
}

// Process each file
project.getSourceFiles().forEach(sourceFile => {
  const filePath = sourceFile.getFilePath();
  const relativePath = path.relative(process.cwd(), filePath);

  // Skip test files and node_modules
  if (
    filePath.includes('node_modules') ||
    filePath.includes('.test.') ||
    filePath.includes('.spec.') ||
    filePath.includes('__tests__')
  ) {
    return;
  }

  let hasChanges = false;
  const importsToAdd = new Set<string>();

  // Fix catch blocks with error: any
  sourceFile
    .getDescendantsOfKind(SyntaxKind.CatchClause)
    .forEach(catchClause => {
      const variableDeclaration = catchClause.getVariableDeclaration();
      if (variableDeclaration) {
        const typeNode = variableDeclaration.getTypeNode();
        if (typeNode && typeNode.getText() === 'any') {
          typeNode.replaceWithText('unknown');
          hasChanges = true;
          stats.errorAny++;
        }
      }
    });

  // Fix array types (any[])
  sourceFile.getDescendantsOfKind(SyntaxKind.ArrayType).forEach(arrayType => {
    const elementType = arrayType.getElementTypeNode();
    if (elementType && elementType.getText() === 'any') {
      const parent = arrayType.getParent();

      // Check if it's a rest parameter
      if (
        parent &&
        ts.isParameter(parent.compilerNode) &&
        parent.compilerNode.dotDotDotToken
      ) {
        // Keep any[] for rest parameters like ...args
        return;
      }

      // Check context for better type
      const contextualType = detectContextualType(arrayType, parent?.getText());
      if (contextualType && contextualType.includes('[]')) {
        arrayType.replaceWithText(contextualType);
      } else {
        elementType.replaceWithText('unknown');
      }
      hasChanges = true;
      stats.arrayAny++;
    }
  });

  // Fix generic any (e.g., useState<any>, Promise<any>)
  sourceFile.getDescendantsOfKind(SyntaxKind.TypeReference).forEach(typeRef => {
    const typeArgs = typeRef.getTypeArguments();
    typeArgs.forEach(typeArg => {
      if (typeArg.getText() === 'any') {
        const typeName = typeRef.getTypeName().getText();

        // Handle specific generics
        if (typeName === 'useState' || typeName === 'useRef') {
          const parent = typeRef.getParent();
          const contextualType = detectContextualType(parent);
          typeArg.replaceWithText(contextualType || 'unknown');
          hasChanges = true;
          stats.stateHooks++;
        } else if (typeName === 'Promise') {
          typeArg.replaceWithText('unknown');
          hasChanges = true;
          stats.genericAny++;
        } else {
          typeArg.replaceWithText('unknown');
          hasChanges = true;
          stats.genericAny++;
        }
      }
    });
  });

  // Fix function parameters with : any
  sourceFile.getFunctions().forEach(func => {
    func.getParameters().forEach(param => {
      const typeNode = param.getTypeNode();
      if (typeNode && typeNode.getText() === 'any') {
        const paramName = param.getName();
        const contextualType = detectContextualType(param, paramName);

        if (contextualType) {
          typeNode.replaceWithText(contextualType);
          if (
            contextualType.includes('InventionData') ||
            contextualType.includes('Project') ||
            contextualType.includes('CitationMatch')
          ) {
            importsToAdd.add(contextualType.split(' ')[0]);
          }
        } else {
          typeNode.replaceWithText('unknown');
        }
        hasChanges = true;
        stats.functionParams++;
      }
    });
  });

  // Fix type assertions (as any)
  sourceFile.getDescendantsOfKind(SyntaxKind.AsExpression).forEach(asExpr => {
    if (asExpr.getType().getText() === 'any') {
      // For React components, use proper types
      const expression = asExpr.getExpression().getText();
      if (expression.includes('Components')) {
        asExpr.replaceWithText(expression); // Remove the assertion
        addManualReview(
          filePath,
          `React component type assertion: ${expression}`
        );
      } else {
        asExpr.replaceWithText(`${expression} as unknown`);
      }
      hasChanges = true;
      stats.asAny++;
    }
  });

  // Fix Record<string, any>
  const text = sourceFile.getText();
  const recordAnyRegex = /Record<string,\s*any>/g;
  if (recordAnyRegex.test(text)) {
    const fullText = sourceFile.getFullText();
    const newText = fullText.replace(recordAnyRegex, 'Record<string, unknown>');
    sourceFile.replaceText([0, fullText.length], newText);
    hasChanges = true;
    stats.recordAny++;
  }

  // Add necessary imports
  if (importsToAdd.size > 0) {
    const existingImports = sourceFile.getImportDeclarations();
    importsToAdd.forEach(typeName => {
      const importStatements = DOMAIN_IMPORTS[typeName];
      if (importStatements) {
        importStatements.forEach(importStatement => {
          // Check if import already exists
          const exists = existingImports.some(
            imp =>
              imp.getText().includes(typeName) &&
              imp.getText().includes('@/types')
          );
          if (!exists) {
            sourceFile.insertStatements(0, importStatement);
          }
        });
      }
    });
  }

  // Save changes
  if (hasChanges) {
    stats.totalFixed++;
    sourceFile.saveSync();
  }
});

// Generate report
console.log('\n📊 Fix Summary:');
console.log('─'.repeat(50));
console.log(`Total files fixed: ${stats.totalFixed}`);
console.log(`\nFixes by type:`);
console.log(`  - catch (error: any) → unknown: ${stats.errorAny}`);
console.log(`  - any[] → unknown[]: ${stats.arrayAny}`);
console.log(`  - Generic<any> → Generic<unknown>: ${stats.genericAny}`);
console.log(
  `  - Record<string, any> → Record<string, unknown>: ${stats.recordAny}`
);
console.log(`  - Function parameters: ${stats.functionParams}`);
console.log(`  - React state/refs: ${stats.stateHooks}`);
console.log(`  - Type assertions (as any): ${stats.asAny}`);
console.log(`  - Need manual review: ${stats.manualReview}`);

// Save manual review report
if (manualReviewFiles.size > 0) {
  let report = '# Manual Review Required\n\n';
  report += 'The following files need manual type definitions:\n\n';

  manualReviewFiles.forEach((reasons, file) => {
    report += `## ${file}\n\n`;
    reasons.forEach(reason => {
      report += `- ${reason}\n`;
    });
    report += '\n';
  });

  fs.writeFileSync('ANY_TYPES_MANUAL_REVIEW.md', report);
  console.log('\n📝 Manual review items saved to: ANY_TYPES_MANUAL_REVIEW.md');
}

// Update tsconfig.json to be stricter
console.log('\n🔧 Updating TypeScript configuration...');
const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));

tsconfig.compilerOptions = {
  ...tsconfig.compilerOptions,
  noImplicitAny: true,
  strictNullChecks: true,
  strict: true,
};

fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));

// Add ESLint rule
console.log('\n🔧 Adding ESLint rule to prevent future any usage...');
const eslintPath = path.join(process.cwd(), '.eslintrc.json');
if (fs.existsSync(eslintPath)) {
  const eslintConfig = JSON.parse(fs.readFileSync(eslintPath, 'utf-8'));
  eslintConfig.rules = {
    ...eslintConfig.rules,
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
  };
  fs.writeFileSync(eslintPath, JSON.stringify(eslintConfig, null, 2));
}

console.log('\n✅ Automated fixes complete!');
console.log('\nNext steps:');
console.log('1. Review the changes with: git diff');
console.log('2. Check for TypeScript errors: npm run type-check');
console.log('3. Fix any remaining type errors manually');
console.log('4. Run tests to ensure nothing broke: npm test');
console.log('5. Commit the changes');
