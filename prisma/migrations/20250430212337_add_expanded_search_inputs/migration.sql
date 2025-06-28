BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[search_history] ADD CONSTRAINT [search_history_citationExtractionStatus_df] DEFAULT 'pending' FOR [citationExtractionStatus];
ALTER TABLE [dbo].[search_history] ADD [expandedSearchInputs] NVARCHAR(max);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
