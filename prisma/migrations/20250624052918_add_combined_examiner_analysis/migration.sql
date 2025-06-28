BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[combined_examiner_analyses] (
    [id] NVARCHAR(1000) NOT NULL,
    [searchHistoryId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000),
    [referenceNumbers] NVARCHAR(1000) NOT NULL,
    [analysisJson] NVARCHAR(max) NOT NULL,
    [claim1Text] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [combined_examiner_analyses_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [combined_examiner_analyses_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [combined_examiner_analyses_searchHistoryId_idx] ON [dbo].[combined_examiner_analyses]([searchHistoryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [combined_examiner_analyses_userId_idx] ON [dbo].[combined_examiner_analyses]([userId]);

-- AddForeignKey
ALTER TABLE [dbo].[combined_examiner_analyses] ADD CONSTRAINT [combined_examiner_analyses_searchHistoryId_fkey] FOREIGN KEY ([searchHistoryId]) REFERENCES [dbo].[search_history]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[combined_examiner_analyses] ADD CONSTRAINT [combined_examiner_analyses_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
