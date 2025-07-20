const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function fullDatabaseCleanup() {
  try {
    console.log('🚀 Starting full database cleanup process...\n');
    
    // Step 1: Create backup
    console.log('📋 Step 1: Creating database backup...');
    const { backupDatabase } = require('./backup-database');
    const backupFile = await backupDatabase();
    console.log(`✅ Backup completed: ${backupFile}\n`);
    
    // Step 2: Clean database
    console.log('🗑️  Step 2: Cleaning database (removing all tables except User, Tenant, UserTenant)...');
    const { cleanDatabase } = require('./clean-database');
    await cleanDatabase();
    console.log('✅ Database cleanup completed\n');
    
    // Step 3: Update Prisma schema
    console.log('📝 Step 3: Updating Prisma schema...');
    const cleanSchemaPath = path.join(__dirname, '..', 'prisma', 'schema-clean.prisma');
    const mainSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
    
    // Backup original schema
    const schemaBackupPath = path.join(__dirname, '..', 'prisma', 'schema-backup.prisma');
    fs.copyFileSync(mainSchemaPath, schemaBackupPath);
    console.log(`📁 Original schema backed up to: ${schemaBackupPath}`);
    
    // Replace with clean schema
    fs.copyFileSync(cleanSchemaPath, mainSchemaPath);
    console.log('✅ Schema updated with clean version\n');
    
    // Step 4: Generate Prisma client
    console.log('🔧 Step 4: Generating Prisma client...');
    try {
      execSync('npx prisma generate', { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      console.log('✅ Prisma client generated\n');
    } catch (error) {
      console.warn('⚠️  Warning: Could not generate Prisma client:', error.message);
    }
    
    // Step 5: Verify remaining tables
    console.log('🔍 Step 5: Verifying remaining tables...');
    const remainingTables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND TABLE_SCHEMA = 'dbo'
      ORDER BY TABLE_NAME
    `;
    
    console.log('📊 Remaining tables:');
    remainingTables.forEach(table => {
      console.log(`   - ${table.TABLE_NAME}`);
    });
    
    const expectedTables = ['users', 'tenants', 'user_tenants', 'accounts', 'sessions', 'user_preferences', 'user_privacy'];
    const actualTables = remainingTables.map(t => t.TABLE_NAME.toLowerCase());
    
    const missingTables = expectedTables.filter(table => !actualTables.includes(table));
    const extraTables = actualTables.filter(table => !expectedTables.includes(table));
    
    if (missingTables.length > 0) {
      console.warn(`⚠️  Warning: Missing expected tables: ${missingTables.join(', ')}`);
    }
    
    if (extraTables.length > 0) {
      console.warn(`⚠️  Warning: Extra tables found: ${extraTables.join(', ')}`);
    }
    
    if (missingTables.length === 0 && extraTables.length === 0) {
      console.log('✅ All expected tables are present and no extra tables remain');
    }
    
    console.log(`\n📈 Total remaining tables: ${remainingTables.length}`);
    
    // Step 6: Summary
    console.log('\n🎉 Database cleanup process completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • Backup created: ${backupFile}`);
    console.log(`   • Original schema backed up: ${schemaBackupPath}`);
    console.log(`   • Clean schema applied: ${mainSchemaPath}`);
    console.log(`   • Remaining tables: ${remainingTables.length}`);
    
    console.log('\n⚠️  Important notes:');
    console.log('   • Your original data has been backed up');
    console.log('   • Only User, Tenant, and related tables remain');
    console.log('   • You may need to restart your application');
    console.log('   • Update your application code to remove references to deleted tables');
    
  } catch (error) {
    console.error('❌ Error during database cleanup process:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the full cleanup if this script is executed directly
if (require.main === module) {
  fullDatabaseCleanup()
    .then(() => {
      console.log('\n🎉 Full database cleanup process completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Full database cleanup process failed:', error);
      process.exit(1);
    });
}

module.exports = { fullDatabaseCleanup }; 