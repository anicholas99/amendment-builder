BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[inventions] ADD [claimSyncedAt] DATETIME2,
[lastSyncedClaim] NVARCHAR(max),
[parsedClaimElementsJson] NVARCHAR(max),
[searchQueriesJson] NVARCHAR(max);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
