/*
  Warnings:

  - Added the required column `claimSetVersionId` to the `citation_matches` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[citation_matches] ADD [claimSetVersionId] NVARCHAR(1000) NOT NULL;

-- CreateIndex
CREATE NONCLUSTERED INDEX [citation_matches_claimSetVersionId_idx] ON [dbo].[citation_matches]([claimSetVersionId]);

-- AddForeignKey
ALTER TABLE [dbo].[citation_matches] ADD CONSTRAINT [citation_matches_claimSetVersionId_fkey] FOREIGN KEY ([claimSetVersionId]) REFERENCES [dbo].[claim_set_versions]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
