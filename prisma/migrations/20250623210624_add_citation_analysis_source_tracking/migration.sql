BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[citation_matches] ADD [analysisSource] NVARCHAR(1000) NOT NULL CONSTRAINT [citation_matches_analysisSource_df] DEFAULT 'LEGACY_RELEVANCE',
[isTopResult] BIT NOT NULL CONSTRAINT [citation_matches_isTopResult_df] DEFAULT 0;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
