BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[ai_audit_logs] ADD CONSTRAINT [ai_audit_logs_status_df] DEFAULT 'SUCCESS' FOR [status];

-- AlterTable
ALTER TABLE [dbo].[citation_jobs] ADD [claim1Hash] NVARCHAR(1000),
[parsedElementsUsed] NVARCHAR(max),
[parserVersionUsed] NVARCHAR(1000);

-- AlterTable
ALTER TABLE [dbo].[combined_examiner_analyses] ADD [citationJobIds] NVARCHAR(max),
[claim1Hash] NVARCHAR(1000),
[parserVersionUsed] NVARCHAR(1000);

-- AlterTable
ALTER TABLE [dbo].[inventions] ADD [claim1Hash] NVARCHAR(1000),
[claim1ParsedAt] DATETIME2,
[parserVersion] NVARCHAR(1000) CONSTRAINT [inventions_parserVersion_df] DEFAULT 'v1.0';

-- CreateIndex
CREATE NONCLUSTERED INDEX [citation_jobs_claim1Hash_idx] ON [dbo].[citation_jobs]([claim1Hash]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [combined_examiner_analyses_claim1Hash_idx] ON [dbo].[combined_examiner_analyses]([claim1Hash]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [inventions_claim1Hash_idx] ON [dbo].[inventions]([claim1Hash]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
