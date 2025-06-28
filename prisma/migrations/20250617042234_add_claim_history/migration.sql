BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[claim_history] (
    [id] NVARCHAR(1000) NOT NULL,
    [claimId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [previousText] NVARCHAR(max) NOT NULL,
    [newText] NVARCHAR(max) NOT NULL,
    [timestamp] DATETIME2 NOT NULL CONSTRAINT [claim_history_timestamp_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [claim_history_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [claim_history_claimId_timestamp_idx] ON [dbo].[claim_history]([claimId], [timestamp]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [claim_history_userId_idx] ON [dbo].[claim_history]([userId]);

-- AddForeignKey
ALTER TABLE [dbo].[claim_history] ADD CONSTRAINT [claim_history_claimId_fkey] FOREIGN KEY ([claimId]) REFERENCES [dbo].[claims]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[claim_history] ADD CONSTRAINT [claim_history_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
