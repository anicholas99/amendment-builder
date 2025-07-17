BEGIN TRY

BEGIN TRAN;

-- Drop foreign key constraints
ALTER TABLE [dbo].[claim_history] DROP CONSTRAINT [claim_history_claimId_fkey];
ALTER TABLE [dbo].[claim_history] DROP CONSTRAINT [claim_history_userId_fkey];

-- Drop indexes
DROP INDEX [claim_history_claimId_timestamp_idx] ON [dbo].[claim_history];
DROP INDEX [claim_history_userId_idx] ON [dbo].[claim_history];

-- Drop the table
DROP TABLE [dbo].[claim_history];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH 