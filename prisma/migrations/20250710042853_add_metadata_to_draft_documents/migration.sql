BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[draft_documents] ADD [metadata] NVARCHAR(max);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
