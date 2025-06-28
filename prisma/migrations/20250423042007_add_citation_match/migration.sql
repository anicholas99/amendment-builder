BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[citation_matches] (
    [id] NVARCHAR(1000) NOT NULL,
    [searchHistoryId] NVARCHAR(1000) NOT NULL,
    [citationJobId] NVARCHAR(1000) NOT NULL,
    [referenceNumber] NVARCHAR(1000) NOT NULL,
    [claimElement] NVARCHAR(max) NOT NULL,
    [citation] NVARCHAR(max) NOT NULL,
    [paragraph] NVARCHAR(max),
    [score] FLOAT(53),
    [locationJobId] INT,
    [locationStatus] NVARCHAR(1000),
    [locationData] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [citation_matches_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [citation_matches_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [citation_matches_searchHistoryId_idx] ON [dbo].[citation_matches]([searchHistoryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [citation_matches_citationJobId_idx] ON [dbo].[citation_matches]([citationJobId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [citation_matches_referenceNumber_idx] ON [dbo].[citation_matches]([referenceNumber]);

-- AddForeignKey
ALTER TABLE [dbo].[citation_matches] ADD CONSTRAINT [citation_matches_searchHistoryId_fkey] FOREIGN KEY ([searchHistoryId]) REFERENCES [dbo].[search_history]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[citation_matches] ADD CONSTRAINT [citation_matches_citationJobId_fkey] FOREIGN KEY ([citationJobId]) REFERENCES [dbo].[citation_jobs]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
