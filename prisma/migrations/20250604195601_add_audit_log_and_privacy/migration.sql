/*
  Warnings:

  - You are about to drop the `chat_messages` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[chat_messages] DROP CONSTRAINT [chat_messages_projectId_fkey];

-- DropTable
DROP TABLE [dbo].[chat_messages];

-- CreateTable
CREATE TABLE [dbo].[ChatMessage] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [metadata] NVARCHAR(max),
    [timestamp] DATETIME2 NOT NULL CONSTRAINT [ChatMessage_timestamp_df] DEFAULT CURRENT_TIMESTAMP,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ChatMessage_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ChatMessage_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[AuditLog] (
    [id] NVARCHAR(1000) NOT NULL,
    [timestamp] DATETIME2 NOT NULL CONSTRAINT [AuditLog_timestamp_df] DEFAULT CURRENT_TIMESTAMP,
    [userId] NVARCHAR(1000),
    [tenantId] NVARCHAR(1000),
    [action] NVARCHAR(1000) NOT NULL,
    [resourceType] NVARCHAR(1000),
    [resourceId] NVARCHAR(1000),
    [method] NVARCHAR(1000),
    [path] NVARCHAR(1000),
    [statusCode] INT,
    [duration] INT,
    [ipAddress] NVARCHAR(1000),
    [userAgent] NVARCHAR(1000),
    [metadata] NVARCHAR(max),
    [success] BIT NOT NULL CONSTRAINT [AuditLog_success_df] DEFAULT 1,
    [errorMessage] NVARCHAR(max),
    CONSTRAINT [AuditLog_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[UserPrivacy] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [dataProcessingConsent] BIT NOT NULL CONSTRAINT [UserPrivacy_dataProcessingConsent_df] DEFAULT 0,
    [marketingConsent] BIT NOT NULL CONSTRAINT [UserPrivacy_marketingConsent_df] DEFAULT 0,
    [consentedAt] DATETIME2,
    [consentIpAddress] NVARCHAR(1000),
    [dataRetentionDays] INT NOT NULL CONSTRAINT [UserPrivacy_dataRetentionDays_df] DEFAULT 365,
    [lastDataExportAt] DATETIME2,
    [lastDataDeletionAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [UserPrivacy_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [UserPrivacy_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UserPrivacy_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ChatMessage_projectId_timestamp_idx] ON [dbo].[ChatMessage]([projectId], [timestamp]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AuditLog_userId_timestamp_idx] ON [dbo].[AuditLog]([userId], [timestamp]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AuditLog_tenantId_timestamp_idx] ON [dbo].[AuditLog]([tenantId], [timestamp]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AuditLog_action_timestamp_idx] ON [dbo].[AuditLog]([action], [timestamp]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AuditLog_resourceType_resourceId_timestamp_idx] ON [dbo].[AuditLog]([resourceType], [resourceId], [timestamp]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AuditLog_timestamp_idx] ON [dbo].[AuditLog]([timestamp]);

-- AddForeignKey
ALTER TABLE [dbo].[ChatMessage] ADD CONSTRAINT [ChatMessage_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserPrivacy] ADD CONSTRAINT [UserPrivacy_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
