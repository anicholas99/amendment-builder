BEGIN TRY

BEGIN TRAN;

-- DropIndex
DROP INDEX [IX_CitationJob_SearchHistoryId_Status] ON [dbo].[citation_jobs];

-- DropIndex
DROP INDEX [IX_CitationMatch_CitationJobId_RefNumber] ON [dbo].[citation_matches];

-- DropIndex
DROP INDEX [IX_Element_ProjectId_ElementKey] ON [dbo].[elements];

-- DropIndex
DROP INDEX [IX_ProjectFigure_ProjectId_DeletedAt_DisplayOrder] ON [dbo].[project_figures];

-- DropIndex
DROP INDEX [IX_ProjectFigure_ProjectId_FigureKey] ON [dbo].[project_figures];

-- DropIndex
DROP INDEX [IX_ProjectFigure_ProjectId_Status] ON [dbo].[project_figures];

-- DropIndex
DROP INDEX [IX_Project_TenantId_DeletedAt_UpdatedAt] ON [dbo].[projects];

-- DropIndex
DROP INDEX [IX_Project_TenantId_Name] ON [dbo].[projects];

-- DropIndex
DROP INDEX [IX_SearchHistory_ProjectId_Timestamp] ON [dbo].[search_history];

-- CreateTable
CREATE TABLE [dbo].[claim_versions] (
    [id] NVARCHAR(1000) NOT NULL,
    [inventionId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [claim_versions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [claim_versions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[claim_snapshots] (
    [id] NVARCHAR(1000) NOT NULL,
    [claimVersionId] NVARCHAR(1000) NOT NULL,
    [number] INT NOT NULL,
    [text] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [claim_snapshots_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [claim_snapshots_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [claim_versions_inventionId_idx] ON [dbo].[claim_versions]([inventionId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [claim_versions_userId_idx] ON [dbo].[claim_versions]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [claim_versions_inventionId_createdAt_idx] ON [dbo].[claim_versions]([inventionId], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [claim_snapshots_claimVersionId_idx] ON [dbo].[claim_snapshots]([claimVersionId]);

-- AddForeignKey
ALTER TABLE [dbo].[claim_versions] ADD CONSTRAINT [claim_versions_inventionId_fkey] FOREIGN KEY ([inventionId]) REFERENCES [dbo].[inventions]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[claim_versions] ADD CONSTRAINT [claim_versions_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[claim_snapshots] ADD CONSTRAINT [claim_snapshots_claimVersionId_fkey] FOREIGN KEY ([claimVersionId]) REFERENCES [dbo].[claim_versions]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
