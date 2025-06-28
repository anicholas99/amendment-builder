BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[PriorArtAnalysisCache] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [searchHistoryId] NVARCHAR(1000) NOT NULL,
    [claim1TextHash] NVARCHAR(1000) NOT NULL,
    [resultsJson] TEXT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PriorArtAnalysisCache_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PriorArtAnalysisCache_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PriorArtAnalysisCache_projectId_searchHistoryId_claim1TextHash_key] UNIQUE NONCLUSTERED ([projectId],[searchHistoryId],[claim1TextHash])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PriorArtAnalysisCache_projectId_idx] ON [dbo].[PriorArtAnalysisCache]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PriorArtAnalysisCache_searchHistoryId_idx] ON [dbo].[PriorArtAnalysisCache]([searchHistoryId]);

-- AddForeignKey
ALTER TABLE [dbo].[PriorArtAnalysisCache] ADD CONSTRAINT [PriorArtAnalysisCache_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PriorArtAnalysisCache] ADD CONSTRAINT [PriorArtAnalysisCache_searchHistoryId_fkey] FOREIGN KEY ([searchHistoryId]) REFERENCES [dbo].[search_history]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
