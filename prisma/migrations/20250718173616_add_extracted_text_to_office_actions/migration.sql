BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[amendment_projects] DROP CONSTRAINT [DF_amendment_projects_status];
EXEC SP_RENAME N'dbo.PK_amendment_projects', N'amendment_projects_pkey';
ALTER TABLE [dbo].[amendment_projects] ADD CONSTRAINT [amendment_projects_status_df] DEFAULT 'DRAFT' FOR [status];

-- AlterTable
ALTER TABLE [dbo].[draft_documents] ADD [amendmentProjectId] NVARCHAR(1000);

-- AlterTable
ALTER TABLE [dbo].[office_actions] DROP CONSTRAINT [DF_office_actions_status];
EXEC SP_RENAME N'dbo.PK_office_actions', N'office_actions_pkey';
ALTER TABLE [dbo].[office_actions] ADD CONSTRAINT [office_actions_status_df] DEFAULT 'UPLOADED' FOR [status];
ALTER TABLE [dbo].[office_actions] ADD [extractedText] NVARCHAR(max);

-- AlterTable
ALTER TABLE [dbo].[rejections] DROP CONSTRAINT [DF_rejections_displayOrder],
[DF_rejections_status];
EXEC SP_RENAME N'dbo.PK_rejections', N'rejections_pkey';
ALTER TABLE [dbo].[rejections] ADD CONSTRAINT [rejections_displayOrder_df] DEFAULT 0 FOR [displayOrder], CONSTRAINT [rejections_status_df] DEFAULT 'PENDING' FOR [status];

-- CreateTable
CREATE TABLE [dbo].[amendment_project_files] (
    [id] NVARCHAR(1000) NOT NULL,
    [amendmentProjectId] NVARCHAR(1000) NOT NULL,
    [tenantId] NVARCHAR(1000) NOT NULL,
    [fileType] NVARCHAR(1000) NOT NULL,
    [fileName] NVARCHAR(1000) NOT NULL,
    [originalName] NVARCHAR(1000) NOT NULL,
    [blobName] NVARCHAR(1000),
    [storageUrl] NVARCHAR(1000),
    [mimeType] NVARCHAR(1000),
    [sizeBytes] INT,
    [version] INT NOT NULL CONSTRAINT [amendment_project_files_version_df] DEFAULT 1,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [amendment_project_files_status_df] DEFAULT 'ACTIVE',
    [tags] NVARCHAR(max),
    [description] NVARCHAR(max),
    [extractedText] NVARCHAR(max),
    [extractedMetadata] NVARCHAR(max),
    [uploadedBy] NVARCHAR(1000) NOT NULL,
    [linkedDraftId] NVARCHAR(1000),
    [parentFileId] NVARCHAR(1000),
    [exportedAt] DATETIME2,
    [filedAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [amendment_project_files_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [deletedAt] DATETIME2,
    CONSTRAINT [amendment_project_files_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [amendment_project_files_amendmentProjectId_idx] ON [dbo].[amendment_project_files]([amendmentProjectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [amendment_project_files_tenantId_idx] ON [dbo].[amendment_project_files]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [amendment_project_files_fileType_idx] ON [dbo].[amendment_project_files]([fileType]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [amendment_project_files_status_idx] ON [dbo].[amendment_project_files]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [amendment_project_files_uploadedBy_idx] ON [dbo].[amendment_project_files]([uploadedBy]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [amendment_project_files_tenantId_amendmentProjectId_idx] ON [dbo].[amendment_project_files]([tenantId], [amendmentProjectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [amendment_project_files_amendmentProjectId_fileType_idx] ON [dbo].[amendment_project_files]([amendmentProjectId], [fileType]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [amendment_project_files_amendmentProjectId_createdAt_idx] ON [dbo].[amendment_project_files]([amendmentProjectId], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [amendment_project_files_parentFileId_idx] ON [dbo].[amendment_project_files]([parentFileId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [draft_documents_amendmentProjectId_idx] ON [dbo].[draft_documents]([amendmentProjectId]);

-- RenameForeignKey
EXEC sp_rename 'dbo.FK_amendment_projects_officeActionId', 'amendment_projects_officeActionId_fkey', 'OBJECT';

-- RenameForeignKey
EXEC sp_rename 'dbo.FK_amendment_projects_projectId', 'amendment_projects_projectId_fkey', 'OBJECT';

-- RenameForeignKey
EXEC sp_rename 'dbo.FK_amendment_projects_tenantId', 'amendment_projects_tenantId_fkey', 'OBJECT';

-- RenameForeignKey
EXEC sp_rename 'dbo.FK_amendment_projects_userId', 'amendment_projects_userId_fkey', 'OBJECT';

-- RenameForeignKey
EXEC sp_rename 'dbo.FK_office_actions_projectId', 'office_actions_projectId_fkey', 'OBJECT';

-- RenameForeignKey
EXEC sp_rename 'dbo.FK_office_actions_tenantId', 'office_actions_tenantId_fkey', 'OBJECT';

-- RenameForeignKey
EXEC sp_rename 'dbo.FK_rejections_officeActionId', 'rejections_officeActionId_fkey', 'OBJECT';

-- AddForeignKey
ALTER TABLE [dbo].[draft_documents] ADD CONSTRAINT [draft_documents_amendmentProjectId_fkey] FOREIGN KEY ([amendmentProjectId]) REFERENCES [dbo].[amendment_projects]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[amendment_project_files] ADD CONSTRAINT [amendment_project_files_amendmentProjectId_fkey] FOREIGN KEY ([amendmentProjectId]) REFERENCES [dbo].[amendment_projects]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[amendment_project_files] ADD CONSTRAINT [amendment_project_files_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[tenants]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[amendment_project_files] ADD CONSTRAINT [amendment_project_files_uploadedBy_fkey] FOREIGN KEY ([uploadedBy]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[amendment_project_files] ADD CONSTRAINT [amendment_project_files_linkedDraftId_fkey] FOREIGN KEY ([linkedDraftId]) REFERENCES [dbo].[draft_documents]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[amendment_project_files] ADD CONSTRAINT [amendment_project_files_parentFileId_fkey] FOREIGN KEY ([parentFileId]) REFERENCES [dbo].[amendment_project_files]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- RenameIndex
EXEC SP_RENAME N'dbo.amendment_projects.IX_amendment_projects_officeActionId', N'amendment_projects_officeActionId_idx', N'INDEX';

-- RenameIndex
EXEC SP_RENAME N'dbo.amendment_projects.IX_amendment_projects_projectId', N'amendment_projects_projectId_idx', N'INDEX';

-- RenameIndex
EXEC SP_RENAME N'dbo.amendment_projects.IX_amendment_projects_status_dueDate', N'amendment_projects_status_dueDate_idx', N'INDEX';

-- RenameIndex
EXEC SP_RENAME N'dbo.amendment_projects.IX_amendment_projects_tenantId', N'amendment_projects_tenantId_idx', N'INDEX';

-- RenameIndex
EXEC SP_RENAME N'dbo.amendment_projects.IX_amendment_projects_tenantId_userId', N'amendment_projects_tenantId_userId_idx', N'INDEX';

-- RenameIndex
EXEC SP_RENAME N'dbo.amendment_projects.IX_amendment_projects_userId', N'amendment_projects_userId_idx', N'INDEX';

-- RenameIndex
EXEC SP_RENAME N'dbo.office_actions.IX_office_actions_projectId', N'office_actions_projectId_idx', N'INDEX';

-- RenameIndex
EXEC SP_RENAME N'dbo.office_actions.IX_office_actions_status', N'office_actions_status_idx', N'INDEX';

-- RenameIndex
EXEC SP_RENAME N'dbo.office_actions.IX_office_actions_tenantId', N'office_actions_tenantId_idx', N'INDEX';

-- RenameIndex
EXEC SP_RENAME N'dbo.office_actions.IX_office_actions_tenantId_projectId', N'office_actions_tenantId_projectId_idx', N'INDEX';

-- RenameIndex
EXEC SP_RENAME N'dbo.rejections.IX_rejections_officeActionId', N'rejections_officeActionId_idx', N'INDEX';

-- RenameIndex
EXEC SP_RENAME N'dbo.rejections.IX_rejections_type', N'rejections_type_idx', N'INDEX';

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
