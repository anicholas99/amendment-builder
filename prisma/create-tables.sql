-- SQL script to create the database schema based on Prisma schema.prisma

-- First make sure we're using the right database
USE [patent-drafter];

-- Drop tables if they exist (for clean setup)
IF OBJECT_ID('user_tenants', 'U') IS NOT NULL DROP TABLE [user_tenants];
IF OBJECT_ID('user_preferences', 'U') IS NOT NULL DROP TABLE [user_preferences];
IF OBJECT_ID('documents', 'U') IS NOT NULL DROP TABLE [documents];
IF OBJECT_ID('projects', 'U') IS NOT NULL DROP TABLE [projects];
IF OBJECT_ID('sessions', 'U') IS NOT NULL DROP TABLE [sessions];
IF OBJECT_ID('accounts', 'U') IS NOT NULL DROP TABLE [accounts];
IF OBJECT_ID('tenants', 'U') IS NOT NULL DROP TABLE [tenants];
IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE [users];

-- Create tables

-- Users Table
CREATE TABLE [users] (
  [id] NVARCHAR(36) PRIMARY KEY,
  [email] NVARCHAR(255) UNIQUE NOT NULL,
  [name] NVARCHAR(255) NULL,
  [passwordHash] NVARCHAR(255) NULL,
  [salt] NVARCHAR(255) NULL,
  [role] NVARCHAR(255) DEFAULT 'user',
  [avatarUrl] NVARCHAR(255) NULL,
  [isVerified] BIT DEFAULT 0,
  [verificationToken] NVARCHAR(255) NULL UNIQUE,
  [resetToken] NVARCHAR(255) NULL UNIQUE,
  [resetTokenExpiry] DATETIME NULL,
  [lastLogin] DATETIME NULL,
  [createdAt] DATETIME DEFAULT GETDATE(),
  [updatedAt] DATETIME DEFAULT GETDATE()
);

-- Accounts Table
CREATE TABLE [accounts] (
  [id] NVARCHAR(36) PRIMARY KEY,
  [userId] NVARCHAR(36) NOT NULL,
  [type] NVARCHAR(255) NOT NULL,
  [provider] NVARCHAR(255) NOT NULL,
  [providerAccountId] NVARCHAR(255) NOT NULL,
  [refresh_token] NVARCHAR(MAX) NULL,
  [access_token] NVARCHAR(MAX) NULL,
  [expires_at] INT NULL,
  [token_type] NVARCHAR(255) NULL,
  [scope] NVARCHAR(255) NULL,
  [id_token] NVARCHAR(MAX) NULL,
  [session_state] NVARCHAR(255) NULL,
  CONSTRAINT FK_Accounts_User FOREIGN KEY ([userId]) REFERENCES [users]([id]) ON DELETE CASCADE,
  CONSTRAINT UQ_Accounts_Provider UNIQUE ([provider], [providerAccountId])
);

-- Tenants Table
CREATE TABLE [tenants] (
  [id] NVARCHAR(36) PRIMARY KEY,
  [name] NVARCHAR(255) NOT NULL,
  [slug] NVARCHAR(255) UNIQUE NOT NULL,
  [description] NVARCHAR(MAX) NULL,
  [settings] NVARCHAR(MAX) NULL,
  [createdAt] DATETIME DEFAULT GETDATE(),
  [updatedAt] DATETIME DEFAULT GETDATE()
);

-- Projects Table
CREATE TABLE [projects] (
  [id] NVARCHAR(36) PRIMARY KEY,
  [name] NVARCHAR(255) NOT NULL,
  [textInput] NVARCHAR(MAX) NULL,
  [userId] NVARCHAR(36) NOT NULL,
  [tenantId] NVARCHAR(36) NOT NULL,
  [structuredData] NVARCHAR(MAX) NULL,
  [status] NVARCHAR(255) DEFAULT 'draft',
  [createdAt] DATETIME DEFAULT GETDATE(),
  [updatedAt] DATETIME DEFAULT GETDATE(),
  CONSTRAINT FK_Projects_User FOREIGN KEY ([userId]) REFERENCES [users]([id]),
  CONSTRAINT FK_Projects_Tenant FOREIGN KEY ([tenantId]) REFERENCES [tenants]([id])
);

-- Documents Table
CREATE TABLE [documents] (
  [id] NVARCHAR(36) PRIMARY KEY,
  [type] NVARCHAR(255) NOT NULL,
  [content] NVARCHAR(MAX) NULL,
  [projectId] NVARCHAR(36) NOT NULL,
  [createdAt] DATETIME DEFAULT GETDATE(),
  [updatedAt] DATETIME DEFAULT GETDATE(),
  CONSTRAINT FK_Documents_Project FOREIGN KEY ([projectId]) REFERENCES [projects]([id]) ON DELETE CASCADE
);

-- UserPreferences Table
CREATE TABLE [user_preferences] (
  [id] NVARCHAR(36) PRIMARY KEY,
  [userId] NVARCHAR(36) NOT NULL,
  [key] NVARCHAR(255) NOT NULL,
  [value] NVARCHAR(MAX) NOT NULL,
  [createdAt] DATETIME DEFAULT GETDATE(),
  [updatedAt] DATETIME DEFAULT GETDATE(),
  CONSTRAINT FK_UserPreferences_User FOREIGN KEY ([userId]) REFERENCES [users]([id]) ON DELETE CASCADE,
  CONSTRAINT UQ_UserPreferences UNIQUE ([userId], [key])
);

-- Sessions Table
CREATE TABLE [sessions] (
  [id] NVARCHAR(36) PRIMARY KEY,
  [userId] NVARCHAR(36) NOT NULL,
  [token] NVARCHAR(255) UNIQUE NOT NULL,
  [expiresAt] DATETIME NOT NULL,
  [ipAddress] NVARCHAR(255) NULL,
  [userAgent] NVARCHAR(MAX) NULL,
  [lastActivity] DATETIME DEFAULT GETDATE(),
  [createdAt] DATETIME DEFAULT GETDATE()
);
CREATE INDEX idx_sessions_token ON [sessions] ([token]);

-- UserTenant Table
CREATE TABLE [user_tenants] (
  [id] NVARCHAR(36) PRIMARY KEY,
  [userId] NVARCHAR(36) NOT NULL,
  [tenantId] NVARCHAR(36) NOT NULL,
  [role] NVARCHAR(255) DEFAULT 'member',
  [createdAt] DATETIME DEFAULT GETDATE(),
  [updatedAt] DATETIME DEFAULT GETDATE(),
  CONSTRAINT FK_UserTenants_User FOREIGN KEY ([userId]) REFERENCES [users]([id]) ON DELETE CASCADE,
  CONSTRAINT FK_UserTenants_Tenant FOREIGN KEY ([tenantId]) REFERENCES [tenants]([id]) ON DELETE CASCADE,
  CONSTRAINT UQ_UserTenants UNIQUE ([userId], [tenantId])
);

-- Create a record to track migrations
IF OBJECT_ID('_prisma_migrations', 'U') IS NOT NULL DROP TABLE [_prisma_migrations];
CREATE TABLE [_prisma_migrations] (
  [id] NVARCHAR(36) PRIMARY KEY,
  [checksum] NVARCHAR(64) NOT NULL,
  [finished_at] DATETIME NULL,
  [migration_name] NVARCHAR(255) NOT NULL,
  [logs] NVARCHAR(MAX) NULL,
  [rolled_back_at] DATETIME NULL,
  [started_at] DATETIME NOT NULL DEFAULT GETDATE(),
  [applied_steps_count] INT NOT NULL DEFAULT 0
);

-- Insert migration record
INSERT INTO [_prisma_migrations] (id, checksum, migration_name, finished_at, applied_steps_count)
VALUES (NEWID(), 'manual_migration', '20250327035509_init', GETDATE(), 1);

PRINT 'Database schema created successfully!';
