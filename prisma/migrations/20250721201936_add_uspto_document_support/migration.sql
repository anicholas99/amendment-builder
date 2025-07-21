BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[project_documents] ALTER COLUMN [storageUrl] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[project_documents] ADD [documentCategory] NVARCHAR(1000),
[isEssentialDoc] BIT NOT NULL CONSTRAINT [project_documents_isEssentialDoc_df] DEFAULT 0,
[usptoDocumentCode] NVARCHAR(1000),
[usptoMailDate] DATETIME2;

-- CreateIndex
CREATE NONCLUSTERED INDEX [project_documents_projectId_isEssentialDoc_fileType_idx] ON [dbo].[project_documents]([projectId], [isEssentialDoc], [fileType]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [project_documents_projectId_usptoDocumentCode_idx] ON [dbo].[project_documents]([projectId], [usptoDocumentCode]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
