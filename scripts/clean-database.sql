-- Clean Database Script
-- This script will delete all tables except User, Tenant, and UserTenant
-- WARNING: This will permanently delete all data in the specified tables

-- Drop foreign key constraints first
ALTER TABLE [dbo].[ChatMessage] DROP CONSTRAINT [ChatMessage_projectId_fkey];
ALTER TABLE [dbo].[projects] DROP CONSTRAINT [projects_tenantId_fkey];
ALTER TABLE [dbo].[projects] DROP CONSTRAINT [projects_userId_fkey];

-- Now drop the tables we don't want
DROP TABLE IF EXISTS [dbo].[ChatMessage]
DROP TABLE IF EXISTS [dbo].[AuditLog]
DROP TABLE IF EXISTS [dbo].[RefinementSession]
DROP TABLE IF EXISTS [dbo].[projects]

-- Keep these tables:
-- users
-- tenants  
-- user_tenants
-- _prisma_migrations (system table)

-- Verify only User, Tenant, and UserTenant tables remain
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE' 
AND TABLE_SCHEMA = 'dbo'
ORDER BY TABLE_NAME 