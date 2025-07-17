-- CreateTable
CREATE TABLE [dbo].[office_actions] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [tenantId] NVARCHAR(1000) NOT NULL,
    [oaNumber] NVARCHAR(1000),
    [dateIssued] DATETIME2,
    [examinerId] NVARCHAR(1000),
    [artUnit] NVARCHAR(1000),
    [blobName] NVARCHAR(1000),
    [originalFileName] NVARCHAR(1000),
    [mimeType] NVARCHAR(1000),
    [sizeBytes] INT,
    [parsedJson] NVARCHAR(max),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [DF_office_actions_status] DEFAULT 'UPLOADED',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DF_office_actions_createdAt] DEFAULT getdate(),
    [updatedAt] DATETIME2 NOT NULL,
    [deletedAt] DATETIME2,
    CONSTRAINT [PK_office_actions] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[rejections] (
    [id] NVARCHAR(1000) NOT NULL,
    [officeActionId] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [claimNumbers] NVARCHAR(max) NOT NULL,
    [citedPriorArt] NVARCHAR(max),
    [examinerText] NVARCHAR(max) NOT NULL,
    [parsedElements] NVARCHAR(max),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [DF_rejections_status] DEFAULT 'PENDING',
    [displayOrder] INT NOT NULL CONSTRAINT [DF_rejections_displayOrder] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DF_rejections_createdAt] DEFAULT getdate(),
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PK_rejections] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[amendment_projects] (
    [id] NVARCHAR(1000) NOT NULL,
    [officeActionId] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [tenantId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [DF_amendment_projects_status] DEFAULT 'DRAFT',
    [dueDate] DATETIME2,
    [filedDate] DATETIME2,
    [responseType] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DF_amendment_projects_createdAt] DEFAULT getdate(),
    [updatedAt] DATETIME2 NOT NULL,
    [deletedAt] DATETIME2,
    CONSTRAINT [PK_amendment_projects] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_office_actions_projectId] ON [dbo].[office_actions]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_office_actions_tenantId] ON [dbo].[office_actions]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_office_actions_tenantId_projectId] ON [dbo].[office_actions]([tenantId], [projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_office_actions_status] ON [dbo].[office_actions]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_rejections_officeActionId] ON [dbo].[rejections]([officeActionId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_rejections_type] ON [dbo].[rejections]([type]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_amendment_projects_officeActionId] ON [dbo].[amendment_projects]([officeActionId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_amendment_projects_projectId] ON [dbo].[amendment_projects]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_amendment_projects_tenantId] ON [dbo].[amendment_projects]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_amendment_projects_userId] ON [dbo].[amendment_projects]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_amendment_projects_tenantId_userId] ON [dbo].[amendment_projects]([tenantId], [userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_amendment_projects_status_dueDate] ON [dbo].[amendment_projects]([status], [dueDate]);

-- AddForeignKey
ALTER TABLE [dbo].[office_actions] ADD CONSTRAINT [FK_office_actions_projectId] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[office_actions] ADD CONSTRAINT [FK_office_actions_tenantId] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[tenants]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[rejections] ADD CONSTRAINT [FK_rejections_officeActionId] FOREIGN KEY ([officeActionId]) REFERENCES [dbo].[office_actions]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[amendment_projects] ADD CONSTRAINT [FK_amendment_projects_officeActionId] FOREIGN KEY ([officeActionId]) REFERENCES [dbo].[office_actions]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[amendment_projects] ADD CONSTRAINT [FK_amendment_projects_projectId] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[amendment_projects] ADD CONSTRAINT [FK_amendment_projects_tenantId] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[tenants]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[amendment_projects] ADD CONSTRAINT [FK_amendment_projects_userId] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION; 