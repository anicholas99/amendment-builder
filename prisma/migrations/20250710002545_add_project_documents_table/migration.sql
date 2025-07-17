BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[project_documents] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [fileName] NVARCHAR(1000) NOT NULL,
    [originalName] NVARCHAR(1000) NOT NULL,
    [fileType] NVARCHAR(1000) NOT NULL CONSTRAINT [project_documents_fileType_df] DEFAULT 'uploaded-doc',
    [storageUrl] NVARCHAR(1000) NOT NULL,
    [extractedText] NVARCHAR(max),
    [extractedMetadata] NVARCHAR(max),
    [uploadedBy] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [project_documents_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [project_documents_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [project_documents_projectId_idx] ON [dbo].[project_documents]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [project_documents_uploadedBy_idx] ON [dbo].[project_documents]([uploadedBy]);

-- AddForeignKey
ALTER TABLE [dbo].[project_documents] ADD CONSTRAINT [project_documents_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[project_documents] ADD CONSTRAINT [project_documents_uploadedBy_fkey] FOREIGN KEY ([uploadedBy]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
