/*
  Warnings:

  - You are about to drop the column `claimElement` on the `citation_matches` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[citation_matches] DROP COLUMN [claimElement];
ALTER TABLE [dbo].[citation_matches] ADD [locationErrorMessage] NVARCHAR(max);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
