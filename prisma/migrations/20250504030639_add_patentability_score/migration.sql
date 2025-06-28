BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[patentability_scores] (
    [id] NVARCHAR(1000) NOT NULL,
    [claimSetVersionId] NVARCHAR(1000) NOT NULL,
    [searchHistoryId] NVARCHAR(1000) NOT NULL,
    [score] FLOAT(53) NOT NULL,
    [elementAnalysisJson] NVARCHAR(max),
    [overlapMatrixJson] NVARCHAR(max),
    [recommendations] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [patentability_scores_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [patentability_scores_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [patentability_scores_claimSetVersionId_searchHistoryId_key] UNIQUE NONCLUSTERED ([claimSetVersionId],[searchHistoryId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [patentability_scores_claimSetVersionId_idx] ON [dbo].[patentability_scores]([claimSetVersionId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [patentability_scores_searchHistoryId_idx] ON [dbo].[patentability_scores]([searchHistoryId]);

-- AddForeignKey
ALTER TABLE [dbo].[patentability_scores] ADD CONSTRAINT [patentability_scores_claimSetVersionId_fkey] FOREIGN KEY ([claimSetVersionId]) REFERENCES [dbo].[claim_set_versions]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[patentability_scores] ADD CONSTRAINT [patentability_scores_searchHistoryId_fkey] FOREIGN KEY ([searchHistoryId]) REFERENCES [dbo].[search_history]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
