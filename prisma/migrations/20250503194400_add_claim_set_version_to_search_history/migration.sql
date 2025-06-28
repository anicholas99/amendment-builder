/*
  Warnings:

  - You are about to drop the `PriorArtAnalysisCache` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[PriorArtAnalysisCache] DROP CONSTRAINT [PriorArtAnalysisCache_projectId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[PriorArtAnalysisCache] DROP CONSTRAINT [PriorArtAnalysisCache_searchHistoryId_fkey];

-- AlterTable
ALTER TABLE [dbo].[search_history] ADD [claimSetVersionId] NVARCHAR(1000);

-- DropTable
DROP TABLE [dbo].[PriorArtAnalysisCache];

-- CreateTable
CREATE TABLE [dbo].[prior_art_analysis_cache] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [searchHistoryId] NVARCHAR(1000) NOT NULL,
    [claim1TextHash] NVARCHAR(1000) NOT NULL,
    [resultsJson] TEXT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [prior_art_analysis_cache_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [prior_art_analysis_cache_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [prior_art_analysis_cache_projectId_searchHistoryId_claim1TextHash_key] UNIQUE NONCLUSTERED ([projectId],[searchHistoryId],[claim1TextHash])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [prior_art_analysis_cache_projectId_idx] ON [dbo].[prior_art_analysis_cache]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [prior_art_analysis_cache_searchHistoryId_idx] ON [dbo].[prior_art_analysis_cache]([searchHistoryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [search_history_claimSetVersionId_idx] ON [dbo].[search_history]([claimSetVersionId]);

-- AddForeignKey
ALTER TABLE [dbo].[search_history] ADD CONSTRAINT [search_history_claimSetVersionId_fkey] FOREIGN KEY ([claimSetVersionId]) REFERENCES [dbo].[claim_set_versions]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[prior_art_analysis_cache] ADD CONSTRAINT [prior_art_analysis_cache_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[prior_art_analysis_cache] ADD CONSTRAINT [prior_art_analysis_cache_searchHistoryId_fkey] FOREIGN KEY ([searchHistoryId]) REFERENCES [dbo].[search_history]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
