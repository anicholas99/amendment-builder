/*
  Warnings:

  - You are about to drop the column `expandedSearchInputs` on the `search_history` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[saved_prior_art] ADD [savedCitationsData] NVARCHAR(max);

-- AlterTable
ALTER TABLE [dbo].[search_history] DROP CONSTRAINT [search_history_citationExtractionStatus_df];
ALTER TABLE [dbo].[search_history] DROP COLUMN [expandedSearchInputs];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
