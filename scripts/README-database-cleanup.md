# Database Cleanup Scripts

This directory contains scripts to clean your database, keeping only the User, Tenant, and UserTenant tables (and related authentication tables).

## ⚠️ WARNING

**This process will permanently delete all data except User and Tenant information. Make sure you have a backup before proceeding.**

## Files Created

- `clean-database.sql` - SQL script to drop all tables except User/Tenant
- `clean-database.js` - Node.js script to execute the SQL cleanup
- `backup-database.js` - Creates a backup of all data before cleanup
- `full-database-cleanup.js` - Complete process (backup + cleanup + schema update)
- `schema-clean.prisma` - Clean Prisma schema with only User/Tenant models

## Quick Start

To run the complete cleanup process:

```bash
node scripts/full-database-cleanup.js
```

This will:
1. Create a backup of your current database
2. Delete all tables except User, Tenant, and related tables
3. Update your Prisma schema
4. Generate the new Prisma client
5. Verify the remaining tables

## Individual Scripts

### Backup Only
```bash
node scripts/backup-database.js
```

### Clean Database Only
```bash
node scripts/clean-database.js
```

## Tables That Will Remain

After cleanup, only these tables will remain:

- `users` - User accounts
- `tenants` - Tenant organizations
- `user_tenants` - User-Tenant relationships
- `accounts` - OAuth accounts
- `sessions` - User sessions
- `user_preferences` - User preferences
- `user_privacy` - Privacy settings

## Tables That Will Be Deleted

All other tables will be deleted, including:
- `projects` - All project data
- `search_history` - Search history
- `citations` - Citation data
- `inventions` - Invention data
- `office_actions` - Office action data
- And all other application-specific tables

## Recovery

If you need to restore your data:

1. The backup file will be in `backups/backup-[timestamp].sql`
2. The original schema is backed up to `prisma/schema-backup.prisma`
3. You can restore using your database management tools

## Post-Cleanup Steps

After running the cleanup:

1. **Update your application code** to remove references to deleted tables
2. **Restart your application** to use the new Prisma client
3. **Test your application** to ensure it works with the simplified schema
4. **Update any API endpoints** that referenced deleted tables

## Verification

The cleanup script will verify that only the expected tables remain and report any issues.

## Safety Features

- Automatic backup creation before cleanup
- Schema backup before modification
- Verification of remaining tables
- Detailed logging of all operations
- Error handling with rollback information

## Troubleshooting

If the cleanup fails:

1. Check the error messages in the console
2. Verify your database connection
3. Ensure you have proper permissions
4. Check that no applications are actively using the database

## Manual Cleanup

If you prefer to run the SQL manually:

1. First run the backup script
2. Execute the SQL in `clean-database.sql` using your database client
3. Update your Prisma schema manually
4. Run `npx prisma generate`

## Notes

- The cleanup process is irreversible once completed
- All application data will be lost except user/tenant information
- Make sure to test in a development environment first
- Consider the impact on your application's functionality 