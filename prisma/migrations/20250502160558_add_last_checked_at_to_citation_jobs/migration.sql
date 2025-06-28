BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[citation_jobs] ADD [lastCheckedAt] DATETIME2;

-- CreateIndex
CREATE NONCLUSTERED INDEX [citation_jobs_status_idx] ON [dbo].[citation_jobs]([status]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
