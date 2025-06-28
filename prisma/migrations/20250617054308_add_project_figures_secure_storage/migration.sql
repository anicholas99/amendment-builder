BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[project_figures] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [fileName] NVARCHAR(1000) NOT NULL,
    [originalName] NVARCHAR(1000) NOT NULL,
    [blobName] NVARCHAR(1000) NOT NULL,
    [mimeType] NVARCHAR(1000) NOT NULL,
    [sizeBytes] INT NOT NULL,
    [figureKey] NVARCHAR(1000),
    [description] NVARCHAR(max),
    [uploadedBy] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [project_figures_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [deletedAt] DATETIME2,
    CONSTRAINT [project_figures_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [project_figures_projectId_idx] ON [dbo].[project_figures]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [project_figures_blobName_idx] ON [dbo].[project_figures]([blobName]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [project_figures_uploadedBy_idx] ON [dbo].[project_figures]([uploadedBy]);

-- AddForeignKey
ALTER TABLE [dbo].[project_figures] ADD CONSTRAINT [project_figures_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[project_figures] ADD CONSTRAINT [project_figures_uploadedBy_fkey] FOREIGN KEY ([uploadedBy]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
