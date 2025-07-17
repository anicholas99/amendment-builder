import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyIndexes() {
  console.log('Verifying all performance indexes...\n');

  try {
    // Query to get all indexes on our key tables
    const query = `
      SELECT 
        t.name AS table_name,
        i.name AS index_name,
        STRING_AGG(c.name, ', ') WITHIN GROUP (ORDER BY ic.key_ordinal) AS columns
      FROM sys.indexes i
      INNER JOIN sys.tables t ON i.object_id = t.object_id
      INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
      INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
      WHERE t.name IN ('citation_matches', 'projects', 'citation_jobs', 'search_history')
        AND i.type > 0  -- Exclude heap
        AND i.is_primary_key = 0  -- Exclude primary keys
        AND i.is_unique_constraint = 0  -- Exclude unique constraints
      GROUP BY t.name, i.name
      ORDER BY t.name, i.name
    `;

    const indexes = await prisma.$queryRawUnsafe<Array<{
      table_name: string;
      index_name: string;
      columns: string;
    }>>(query);

    // Group by table
    const indexesByTable: Record<string, Array<{ name: string; columns: string }>> = {};
    
    indexes.forEach(idx => {
      if (!indexesByTable[idx.table_name]) {
        indexesByTable[idx.table_name] = [];
      }
      indexesByTable[idx.table_name].push({
        name: idx.index_name,
        columns: idx.columns
      });
    });

    // Display results
    console.log('📊 Performance Indexes by Table:');
    console.log('================================\n');

    Object.entries(indexesByTable).forEach(([table, indexes]) => {
      console.log(`📁 ${table}:`);
      indexes.forEach(idx => {
        console.log(`   ✅ ${idx.name}`);
        console.log(`      Columns: ${idx.columns}`);
      });
      console.log('');
    });

    // Check for expected indexes
    const expectedIndexes = [
      'IX_CitationMatch_SearchHistory_Reference',
      'IX_CitationMatch_Job_ReasoningStatus',
      'IX_CitationMatch_Score_Reference',
      'IX_CitationMatch_CitationJobId_RefNumber',
      'IX_Project_Tenant_User_Deleted',
      'IX_Project_Updated_Deleted',
      'IX_Project_TenantId_DeletedAt_UpdatedAt',
      'IX_Project_TenantId_Name',
      'IX_CitationJob_Status',
      'IX_CitationJob_SearchHistoryId_Status',
      'IX_SearchHistory_ProjectId_Timestamp'
    ];

    const foundIndexNames = indexes.map(idx => idx.index_name);
    const missingIndexes = expectedIndexes.filter(name => !foundIndexNames.includes(name));

    if (missingIndexes.length > 0) {
      console.log('⚠️  Missing expected indexes:');
      missingIndexes.forEach(idx => console.log(`   - ${idx}`));
    } else {
      console.log('🎉 All expected performance indexes are present!');
    }

    console.log(`\n📈 Total performance indexes: ${indexes.length}`);

  } catch (error) {
    console.error('Error verifying indexes:', error instanceof Error ? error.message : String(error));
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
verifyIndexes()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  }); 