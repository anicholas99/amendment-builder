const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupDatabase() {
  try {
    console.log('💾 Starting database backup...');
    
    // Get current timestamp for backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '..', 'backups');
    
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);
    
    console.log(`📁 Creating backup at: ${backupFile}`);
    
    // Get all table names
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND TABLE_SCHEMA = 'dbo'
      ORDER BY TABLE_NAME
    `;
    
    console.log(`📊 Found ${tables.length} tables to backup`);
    
    let backupContent = `-- Database Backup - ${new Date().toISOString()}\n`;
    backupContent += `-- Generated before database cleanup\n\n`;
    
    // For each table, get the data
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      console.log(`📋 Backing up table: ${tableName}`);
      
      try {
        // Get table structure
        const columns = await prisma.$queryRaw`
          SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = ${tableName}
          AND TABLE_SCHEMA = 'dbo'
          ORDER BY ORDINAL_POSITION
        `;
        
        // Get table data
        const data = await prisma.$queryRawUnsafe(`SELECT * FROM [${tableName}]`);
        
        backupContent += `-- Table: ${tableName}\n`;
        backupContent += `-- Structure:\n`;
        columns.forEach(col => {
          backupContent += `--   ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}\n`;
        });
        backupContent += `-- Data count: ${data.length} rows\n\n`;
        
        if (data.length > 0) {
          backupContent += `-- INSERT statements for ${tableName}\n`;
          data.forEach(row => {
            const columns = Object.keys(row);
            const values = Object.values(row).map(val => {
              if (val === null) return 'NULL';
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              if (val instanceof Date) return `'${val.toISOString()}'`;
              return val;
            });
            backupContent += `INSERT INTO [${tableName}] (${columns.map(c => `[${c}]`).join(', ')}) VALUES (${values.join(', ')});\n`;
          });
          backupContent += '\n';
        }
        
      } catch (error) {
        console.warn(`⚠️  Warning: Could not backup table ${tableName}:`, error.message);
        backupContent += `-- Error backing up table ${tableName}: ${error.message}\n\n`;
      }
    }
    
    // Write backup file
    fs.writeFileSync(backupFile, backupContent);
    
    console.log(`✅ Backup completed successfully!`);
    console.log(`📁 Backup file: ${backupFile}`);
    console.log(`📊 Total tables backed up: ${tables.length}`);
    
    return backupFile;
    
  } catch (error) {
    console.error('❌ Error during database backup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the backup if this script is executed directly
if (require.main === module) {
  backupDatabase()
    .then((backupFile) => {
      console.log(`🎉 Database backup completed: ${backupFile}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database backup failed:', error);
      process.exit(1);
    });
}

module.exports = { backupDatabase }; 