BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[project_figures] ALTER COLUMN [fileName] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[project_figures] ALTER COLUMN [originalName] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[project_figures] ALTER COLUMN [blobName] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[project_figures] ALTER COLUMN [mimeType] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[project_figures] ALTER COLUMN [sizeBytes] INT NULL;
ALTER TABLE [dbo].[project_figures] ADD [status] NVARCHAR(1000) NOT NULL CONSTRAINT [project_figures_status_df] DEFAULT 'PENDING';

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
