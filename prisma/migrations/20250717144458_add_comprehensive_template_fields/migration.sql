/*
  Warnings:

  - You are about to drop the column `fullContent` on the `draft_documents` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[draft_documents] DROP COLUMN [fullContent];

-- AlterTable
ALTER TABLE [dbo].[inventions] ADD [alternativeEmbodimentsJson] NVARCHAR(max),
[commercialPotential] NVARCHAR(max),
[elevatorPitch] NVARCHAR(max),
[fundingSourcesJson] NVARCHAR(max),
[inventorsJson] NVARCHAR(max),
[knownLimitationsJson] NVARCHAR(max),
[plannedUses] NVARCHAR(max),
[problemStatement] NVARCHAR(max),
[publicDisclosuresJson] NVARCHAR(max),
[templateCompleteness] FLOAT(53) CONSTRAINT [inventions_templateCompleteness_df] DEFAULT 0.0,
[templateMode] NVARCHAR(1000) CONSTRAINT [inventions_templateMode_df] DEFAULT 'simple';

-- CreateIndex
CREATE NONCLUSTERED INDEX [inventions_templateMode_idx] ON [dbo].[inventions]([templateMode]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
