/*
  Warnings:

  - You are about to drop the column `citationJobIds` on the `search_history` table. All the data in the column will be lost.
  - You are about to drop the column `citationJobReferenceMap` on the `search_history` table. All the data in the column will be lost.
  - You are about to drop the column `citationResults` on the `search_history` table. All the data in the column will be lost.
  - You are about to drop the column `citationStatus` on the `search_history` table. All the data in the column will be lost.
  - You are about to drop the column `parsedElements` on the `search_history` table. All the data in the column will be lost.
  - You are about to drop the column `searchData` on the `search_history` table. All the data in the column will be lost.
  - You are about to drop the column `suggestionStatus` on the `search_history` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[search_history] DROP CONSTRAINT [search_history_claimSetVersionId_fkey];

-- AlterTable
ALTER TABLE [dbo].[application_versions] ADD [deletedAt] DATETIME2;

-- AlterTable
ALTER TABLE [dbo].[claim_set_versions] ADD [deletedAt] DATETIME2,
[isActive] BIT NOT NULL CONSTRAINT [claim_set_versions_isActive_df] DEFAULT 1,
[version] INT NOT NULL CONSTRAINT [claim_set_versions_version_df] DEFAULT 1;

-- AlterTable
ALTER TABLE [dbo].[documents] ADD [deletedAt] DATETIME2;

-- AlterTable
ALTER TABLE [dbo].[projects] ADD [deletedAt] DATETIME2;

-- AlterTable
ALTER TABLE [dbo].[search_history] DROP COLUMN [citationJobIds],
[citationJobReferenceMap],
[citationResults],
[citationStatus],
[parsedElements],
[searchData],
[suggestionStatus];

-- AlterTable
ALTER TABLE [dbo].[tenants] ADD [deletedAt] DATETIME2;

-- AlterTable
ALTER TABLE [dbo].[users] ADD [deletedAt] DATETIME2;

-- CreateIndex
CREATE NONCLUSTERED INDEX [claim_set_versions_projectId_isActive_idx] ON [dbo].[claim_set_versions]([projectId], [isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [search_history_timestamp_idx] ON [dbo].[search_history]([timestamp]);

-- AddForeignKey
ALTER TABLE [dbo].[search_history] ADD CONSTRAINT [search_history_claimSetVersionId_fkey] FOREIGN KEY ([claimSetVersionId]) REFERENCES [dbo].[claim_set_versions]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
