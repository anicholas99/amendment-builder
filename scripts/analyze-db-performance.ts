/**
 * Database Performance Analysis Script
 * 
 * This script analyzes database query patterns and identifies missing indexes
 * that could be causing performance issues.
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

interface QueryAnalysis {
  model: string;
  operation: string;
  fields: string[];
  hasIndex: boolean;
  recommendation?: string;
}

async function analyzePerformance() {
  console.log(chalk.blue.bold('\n🔍 Database Performance Analysis\n'));

  const analyses: QueryAnalysis[] = [];

  // Check Projects table indexes
  console.log(chalk.yellow('Analyzing Projects table...'));
  
  // Common query patterns from the codebase
  const projectQueries = [
    { fields: ['tenantId', 'userId'], operation: 'findMany' },
    { fields: ['tenantId', 'id'], operation: 'findUnique' },
    { fields: ['tenantId', 'updatedAt'], operation: 'orderBy' },
    { fields: ['userId', 'updatedAt'], operation: 'orderBy' },
  ];

  for (const query of projectQueries) {
    analyses.push({
      model: 'Project',
      operation: query.operation,
      fields: query.fields,
      hasIndex: false, // We'll check this against schema
      recommendation: `CREATE INDEX idx_project_${query.fields.join('_')} ON "Project"(${query.fields.map(f => `"${f}"`).join(', ')});`
    });
  }

  // Check UserPreference table indexes
  console.log(chalk.yellow('Analyzing UserPreference table...'));
  
  analyses.push({
    model: 'UserPreference',
    operation: 'findUnique',
    fields: ['userId', 'key'],
    hasIndex: true, // This should have a unique constraint
  });

  // Check ProjectCollaborator table indexes
  console.log(chalk.yellow('Analyzing ProjectCollaborator table...'));
  
  analyses.push({
    model: 'ProjectCollaborator',
    operation: 'findMany',
    fields: ['userId', 'tenantId'],
    hasIndex: false,
    recommendation: `CREATE INDEX idx_project_collaborator_user_tenant ON "ProjectCollaborator"("userId", "tenantId");`
  });

  // Analyze actual query performance
  console.log(chalk.yellow('\nRunning performance tests...\n'));

  // Test 1: Project listing query (the slow one)
  const start1 = Date.now();
  await prisma.project.findMany({
    where: {
      tenantId: '0552dd51-21cd-4f5a-986f-8360e19e1c20', // Use a test tenant ID
      OR: [
        { userId: 'test-user-id' },
        {
          collaborators: {
            some: {
              userId: 'test-user-id',
            }
          }
        }
      ]
    },
    take: 20,
    orderBy: { updatedAt: 'desc' }
  }).catch(() => []); // Ignore errors for non-existent data
  const duration1 = Date.now() - start1;

  console.log(chalk.white(`Project listing query: ${duration1}ms ${duration1 > 1000 ? chalk.red('[SLOW]') : chalk.green('[OK]')}`));

  // Test 2: User preference query
  const start2 = Date.now();
  await prisma.userPreference.findFirst({
    where: {
      userId: 'test-user-id',
      key: 'activeProject'
    }
  }).catch(() => null);
  const duration2 = Date.now() - start2;

  console.log(chalk.white(`User preference query: ${duration2}ms ${duration2 > 100 ? chalk.red('[SLOW]') : chalk.green('[OK]')}`));

  // Print recommendations
  console.log(chalk.blue.bold('\n📊 Recommendations:\n'));

  const missingIndexes = analyses.filter(a => !a.hasIndex && a.recommendation);
  
  if (missingIndexes.length > 0) {
    console.log(chalk.red('Missing Indexes Detected:\n'));
    
    for (const analysis of missingIndexes) {
      console.log(chalk.white(`Model: ${analysis.model}`));
      console.log(chalk.white(`Query Pattern: ${analysis.operation} on ${analysis.fields.join(', ')}`));
      console.log(chalk.green(`Recommendation: ${analysis.recommendation}\n`));
    }

    // Generate SQL file
    const sqlCommands = missingIndexes
      .map(a => a.recommendation)
      .filter(Boolean)
      .join('\n');

    console.log(chalk.yellow('\n📝 SQL Commands to add indexes:\n'));
    console.log(chalk.gray(sqlCommands));
    
    // Write to file
    fs.writeFileSync('add-performance-indexes.sql', sqlCommands);
    console.log(chalk.green('\n✅ SQL commands saved to: add-performance-indexes.sql'));
  } else {
    console.log(chalk.green('✅ All recommended indexes are present'));
  }

  // Additional performance tips
  console.log(chalk.blue.bold('\n💡 Additional Performance Tips:\n'));
  
  console.log(chalk.white('1. Enable Prisma query logging in development:'));
  console.log(chalk.gray('   const prisma = new PrismaClient({ log: ["query"] })'));
  
  console.log(chalk.white('\n2. Use connection pooling for better performance:'));
  console.log(chalk.gray('   DATABASE_URL="...?connection_limit=10&pool_timeout=30"'));
  
  console.log(chalk.white('\n3. Consider implementing Redis caching for frequently accessed data'));
  
  console.log(chalk.white('\n4. Use database query analysis tools:'));
  console.log(chalk.gray('   - EXPLAIN ANALYZE for PostgreSQL'));
  console.log(chalk.gray('   - Prisma Studio for visual query inspection'));

  await prisma.$disconnect();
}

// Run the analysis
analyzePerformance().catch(error => {
  console.error(chalk.red('Error running analysis:'), error);
  process.exit(1);
}); 