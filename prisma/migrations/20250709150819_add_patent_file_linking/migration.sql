BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[inventions] ADD [applicationType] NVARCHAR(1000) CONSTRAINT [inventions_applicationType_df] DEFAULT 'original',
[linkedFileIdsJson] NVARCHAR(max),
[parentApplicationsJson] NVARCHAR(max);

-- AlterTable
ALTER TABLE [dbo].[saved_prior_art] ADD [extractedMetadata] NVARCHAR(max),
[extractedText] NVARCHAR(max),
[fileType] NVARCHAR(1000) CONSTRAINT [saved_prior_art_fileType_df] DEFAULT 'cited-reference',
[isLinked] BIT NOT NULL CONSTRAINT [saved_prior_art_isLinked_df] DEFAULT 1,
[sessionId] NVARCHAR(1000),
[storageUrl] NVARCHAR(1000);

-- CreateIndex
CREATE NONCLUSTERED INDEX [saved_prior_art_sessionId_idx] ON [dbo].[saved_prior_art]([sessionId]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
