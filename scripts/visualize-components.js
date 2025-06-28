#!/usr/bin/env node

/**
 * This script analyzes the component dependencies in the main views
 * and generates a visualization of the component hierarchy.
 *
 * Usage:
 * node scripts/visualize-components.js
 *
 * Output:
 * - Creates component-dependencies-*.md files with Mermaid diagrams
 * - Creates component-list-*.md files with lists of all components
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const outputDir = path.join(rootDir, 'docs');
const mainViews = [
  'PatentApplicationView',
  'ClaimRefinementView',
  'TechnologyDetailsView',
];

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to find all import statements in a file
function findImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const importRegex =
      /import\s+(?:{([^}]+)}|([^;]+))\s+from\s+['"]([^'"]+)['"]/g;
    const imports = [];
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const namedImports = match[1]
        ? match[1].split(',').map(s => s.trim())
        : [];
      const defaultImport = match[2] ? match[2].trim().split(' ')[0] : null;
      const importPath = match[3];

      if (defaultImport) {
        imports.push({ name: defaultImport, path: importPath });
      }

      for (const namedImport of namedImports) {
        // Handle "import { X as Y }" syntax
        const parts = namedImport.split(' as ');
        const name = parts.length > 1 ? parts[1].trim() : parts[0].trim();
        if (name) {
          imports.push({ name, path: importPath });
        }
      }
    }

    return imports;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}

// Function to find a component file
function findComponentFile(componentName, searchDir = srcDir) {
  const possibleExtensions = ['.tsx', '.jsx', '.ts', '.js'];
  const possibleDirs = [
    path.join(searchDir, 'components'),
    path.join(searchDir, 'components/features'),
    path.join(searchDir, 'components/views'),
    path.join(searchDir, 'components/common'),
    path.join(searchDir, 'components/features/patent'),
    path.join(searchDir, 'components/features/figures'),
    path.join(searchDir, 'components/features/elements'),
    path.join(searchDir, 'components/features/version'),
    path.join(searchDir, 'components/features/verification'),
    path.join(searchDir, 'components/features/chat'),
    path.join(searchDir, 'components/features/claims'),
    path.join(searchDir, 'components/features/references'),
    path.join(searchDir, 'components/features/technical'),
  ];

  for (const dir of possibleDirs) {
    for (const ext of possibleExtensions) {
      const filePath = path.join(dir, `${componentName}${ext}`);
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    }
  }

  return null;
}

// Function to build the component dependency tree
function buildDependencyTree(componentName, visited = new Set()) {
  if (visited.has(componentName)) {
    return { name: componentName, children: [], circular: true };
  }

  visited.add(componentName);
  const filePath = findComponentFile(componentName);

  if (!filePath) {
    return { name: componentName, children: [], external: true };
  }

  const imports = findImports(filePath);
  const children = [];

  for (const importItem of imports) {
    // Only include React components (starting with uppercase letter)
    if (/^[A-Z]/.test(importItem.name) && !importItem.name.includes('.')) {
      const child = buildDependencyTree(importItem.name, new Set(visited));
      children.push(child);
    }
  }

  return { name: componentName, children, filePath };
}

// Function to generate a Mermaid diagram from the dependency tree
function generateMermaidDiagram(tree, level = 0) {
  let diagram = '';
  const indent = '  '.repeat(level);

  if (tree.circular) {
    diagram += `${indent}${tree.name}[${tree.name} (circular)]\n`;
    return diagram;
  }

  if (tree.external) {
    diagram += `${indent}${tree.name}[${tree.name} (external)]\n`;
    return diagram;
  }

  diagram += `${indent}${tree.name}[${tree.name}]\n`;

  for (const child of tree.children) {
    diagram += `${indent}${tree.name} --> ${child.name}\n`;
    diagram += generateMermaidDiagram(child, level);
  }

  return diagram;
}

// Function to generate a component list
function generateComponentList(tree, components = []) {
  if (tree.filePath && !components.some(c => c.name === tree.name)) {
    components.push({
      name: tree.name,
      filePath: path.relative(rootDir, tree.filePath),
    });
  }

  for (const child of tree.children) {
    if (!child.circular && !child.external) {
      generateComponentList(child, components);
    }
  }

  return components;
}

// Function to generate a component hierarchy
function generateComponentHierarchy(viewName) {
  console.log(`Analyzing component dependencies for ${viewName}...`);
  const tree = buildDependencyTree(viewName);

  // Generate Mermaid diagram
  const mermaidDiagram = `# ${viewName} Component Dependencies

\`\`\`mermaid
graph TD
${generateMermaidDiagram(tree)}
\`\`\`

This diagram shows the component dependencies in the ${viewName}.
`;

  // Generate component list
  const componentList = generateComponentList(tree);
  componentList.sort((a, b) => a.name.localeCompare(b.name));

  const componentListMd = `# ${viewName} Components

This is a list of all components used in the ${viewName}:

${componentList.map(c => `- **${c.name}** - \`${c.filePath}\``).join('\n')}
`;

  // Write output files
  const diagramFileName = `component-dependencies-${viewName.toLowerCase()}.md`;
  const listFileName = `component-list-${viewName.toLowerCase()}.md`;

  fs.writeFileSync(path.join(outputDir, diagramFileName), mermaidDiagram);
  fs.writeFileSync(path.join(outputDir, listFileName), componentListMd);

  console.log(`- Mermaid diagram: ${path.join(outputDir, diagramFileName)}`);
  console.log(`- Component list: ${path.join(outputDir, listFileName)}`);

  return {
    viewName,
    componentCount: componentList.length,
    components: componentList,
  };
}

// Function to generate a summary of all views
function generateSummary(results) {
  const summary = `# Patent Drafter AI Component Summary

This document provides a summary of all components used in the main views of the application.

## Overview

${results.map(r => `- **${r.viewName}**: ${r.componentCount} components`).join('\n')}

## Common Components

The following components are used in multiple views:

${findCommonComponents(results)}

## View-Specific Components

${results
  .map(
    r => `### ${r.viewName} (${r.componentCount} components)

${r.components.map(c => `- **${c.name}** - \`${c.filePath}\``).join('\n')}
`
  )
  .join('\n')}
`;

  fs.writeFileSync(path.join(outputDir, 'component-summary.md'), summary);
  console.log(`- Summary: ${path.join(outputDir, 'component-summary.md')}`);
}

// Function to find components used in multiple views
function findCommonComponents(results) {
  const componentCounts = {};

  // Count occurrences of each component
  results.forEach(result => {
    result.components.forEach(component => {
      if (!componentCounts[component.name]) {
        componentCounts[component.name] = {
          count: 0,
          views: [],
          filePath: component.filePath,
        };
      }
      componentCounts[component.name].count++;
      componentCounts[component.name].views.push(result.viewName);
    });
  });

  // Filter components used in multiple views
  const commonComponents = Object.entries(componentCounts)
    .filter(([_, data]) => data.count > 1)
    .map(([name, data]) => ({
      name,
      views: data.views,
      filePath: data.filePath,
    }))
    .sort((a, b) => b.views.length - a.views.length);

  if (commonComponents.length === 0) {
    return 'No common components found across views.';
  }

  return commonComponents
    .map(
      c =>
        `- **${c.name}** - \`${c.filePath}\` - Used in: ${c.views.join(', ')}`
    )
    .join('\n');
}

// Main execution
console.log(
  `Analyzing component dependencies for ${mainViews.length} main views...`
);

const results = mainViews.map(viewName => {
  return generateComponentHierarchy(viewName);
});

// Generate summary
generateSummary(results);

console.log(`\nComponent dependency analysis complete!`);
console.log(`Run the following command to make the script executable:`);
console.log(`chmod +x ${path.relative(rootDir, __filename)}`);
