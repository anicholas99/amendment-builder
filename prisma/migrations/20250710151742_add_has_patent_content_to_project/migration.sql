/*
  Warnings:

  - You are about to drop the column `metadata` on the `draft_documents` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[draft_documents] DROP COLUMN [metadata];

-- AlterTable
ALTER TABLE [dbo].[projects] ADD [hasPatentContent] BIT NOT NULL CONSTRAINT [projects_hasPatentContent_df] DEFAULT 0;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
