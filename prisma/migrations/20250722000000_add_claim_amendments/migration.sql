-- CreateTable
CREATE TABLE [dbo].[claim_amendments] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [officeActionId] NVARCHAR(1000) NOT NULL,
    [tenantId] NVARCHAR(1000) NOT NULL,
    [claimNumber] INT NOT NULL,
    [originalText] NVARCHAR(MAX) NOT NULL,
    [amendedText] NVARCHAR(MAX) NOT NULL,
    [changes] NVARCHAR(MAX),
    [changeReason] NVARCHAR(MAX) NOT NULL,
    [aiGenerated] BIT NOT NULL DEFAULT 1,
    [userApproved] BIT NOT NULL DEFAULT 0,
    [version] INT NOT NULL DEFAULT 1,
    [status] NVARCHAR(1000) NOT NULL DEFAULT 'DRAFT',
    [createdAt] DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [deletedAt] DATETIME2,
    CONSTRAINT [claim_amendments_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[amendment_recommendations] (
    [id] NVARCHAR(1000) NOT NULL,
    [officeActionId] NVARCHAR(1000) NOT NULL,
    [tenantId] NVARCHAR(1000) NOT NULL,
    [claimNumber] INT,
    [recommendation] NVARCHAR(MAX) NOT NULL,
    [priority] NVARCHAR(1000) NOT NULL DEFAULT 'MEDIUM',
    [category] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [deletedAt] DATETIME2,
    CONSTRAINT [amendment_recommendations_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [claim_amendments_projectId_idx] ON [dbo].[claim_amendments]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [claim_amendments_officeActionId_idx] ON [dbo].[claim_amendments]([officeActionId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [claim_amendments_tenantId_idx] ON [dbo].[claim_amendments]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [claim_amendments_tenantId_projectId_idx] ON [dbo].[claim_amendments]([tenantId], [projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [claim_amendments_claimNumber_version_idx] ON [dbo].[claim_amendments]([claimNumber], [version]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [claim_amendments_status_idx] ON [dbo].[claim_amendments]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [amendment_recommendations_officeActionId_idx] ON [dbo].[amendment_recommendations]([officeActionId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [amendment_recommendations_tenantId_idx] ON [dbo].[amendment_recommendations]([tenantId]);

-- AddForeignKey
ALTER TABLE [dbo].[claim_amendments] ADD CONSTRAINT [claim_amendments_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[claim_amendments] ADD CONSTRAINT [claim_amendments_officeActionId_fkey] FOREIGN KEY ([officeActionId]) REFERENCES [dbo].[office_actions]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[claim_amendments] ADD CONSTRAINT [claim_amendments_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[tenants]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[amendment_recommendations] ADD CONSTRAINT [amendment_recommendations_officeActionId_fkey] FOREIGN KEY ([officeActionId]) REFERENCES [dbo].[office_actions]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[amendment_recommendations] ADD CONSTRAINT [amendment_recommendations_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[tenants]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;