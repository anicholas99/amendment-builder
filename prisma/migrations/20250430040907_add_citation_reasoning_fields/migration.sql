BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[citation_matches] ADD [reasoningErrorMessage] NVARCHAR(max),
[reasoningJobId] INT,
[reasoningScore] FLOAT(53),
[reasoningStatus] NVARCHAR(1000),
[reasoningSummary] NVARCHAR(max);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
