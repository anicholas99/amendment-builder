const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    console.log('🚀 Starting database cleanup...');
    
    // Read the SQL script
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'clean-database.sql'), 
      'utf8'
    );
    
    console.log('📋 Executing SQL cleanup script...');
    
    // Execute the SQL script
    await prisma.$executeRawUnsafe(sqlScript);
    
    console.log('✅ Database cleanup completed successfully!');
    console.log('📊 Remaining tables:');
    
    // Verify remaining tables
    const remainingTables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND TABLE_SCHEMA = 'dbo'
      ORDER BY TABLE_NAME
    `;
    
    remainingTables.forEach(table => {
      console.log(`   - ${table.TABLE_NAME}`);
    });
    
    console.log(`\n📈 Total remaining tables: ${remainingTables.length}`);
    
  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  cleanDatabase()
    .then(() => {
      console.log('🎉 Database cleanup process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanDatabase }; 