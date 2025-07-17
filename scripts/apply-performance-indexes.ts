import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyPerformanceIndexes() {
  console.log('Applying performance indexes to database...\n');

  const indexes = [
    {
      name: 'IX_CitationMatch_SearchHistory_Reference',
      table: 'citation_matches',
      columns: 'searchHistoryId, referenceNumber',
      description: 'Improves citation queries filtered by search history'
    },
    {
      name: 'IX_CitationMatch_Job_ReasoningStatus',
      table: 'citation_matches',
      columns: 'citationJobId, reasoningStatus',
      description: 'Improves queries filtering by reasoning status'
    },
    {
      name: 'IX_Project_Tenant_User_Deleted',
      table: 'projects',
      columns: 'tenantId, userId, deletedAt',
      description: 'Improves tenant-based project queries'
    },
    {
      name: 'IX_Project_Updated_Deleted',
      table: 'projects',
      columns: 'updatedAt DESC, deletedAt',
      description: 'Improves sorting by update time'
    },
    {
      name: 'IX_CitationMatch_Score_Reference',
      table: 'citation_matches',
      columns: 'score DESC, referenceNumber',
      description: 'Improves score-based sorting'
    },
    {
      name: 'IX_CitationJob_Status',
      table: 'citation_jobs',
      columns: 'status',
      description: 'Improves status filtering'
    }
  ];

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const index of indexes) {
    try {
      // Check if index already exists
      const checkQuery = `
        SELECT COUNT(*) as count 
        FROM sys.indexes 
        WHERE name = '${index.name}' 
        AND object_id = OBJECT_ID('${index.table}')
      `;
      
      const result = await prisma.$queryRawUnsafe<[{ count: number }]>(checkQuery);
      
      if (result[0].count > 0) {
        console.log(`⏭️  Skipping ${index.name} - already exists`);
        skipCount++;
        continue;
      }

      // Create the index
      const createQuery = `
        CREATE INDEX ${index.name} 
        ON ${index.table}(${index.columns})
      `;
      
      await prisma.$executeRawUnsafe(createQuery);
      console.log(`✅ Created ${index.name} - ${index.description}`);
      successCount++;
      
    } catch (error) {
      console.error(`❌ Error creating ${index.name}:`, error instanceof Error ? error.message : String(error));
      errorCount++;
    }
  }

  console.log(`
Summary:
--------
✅ Created: ${successCount} indexes
⏭️  Skipped: ${skipCount} indexes (already exist)
❌ Errors: ${errorCount} indexes

${successCount > 0 ? '🚀 Performance improvements applied!' : ''}
${skipCount === indexes.length ? '👍 All indexes already exist!' : ''}
`);

  await prisma.$disconnect();
}

// Run the script
applyPerformanceIndexes()
  .then(() => {
    console.log('Index application complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  }); 