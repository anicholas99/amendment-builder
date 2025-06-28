/*
  Warnings:

  - You are about to drop the column `claimSetVersionId` on the `citation_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `claimSetVersionId` on the `citation_matches` table. All the data in the column will be lost.
  - You are about to drop the column `claimSetVersionId` on the `patentability_scores` table. All the data in the column will be lost.
  - You are about to drop the column `claimSetVersionId` on the `search_history` table. All the data in the column will be lost.
  - You are about to drop the `claim_set_versions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[searchHistoryId]` on the table `patentability_scores` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[citation_jobs] DROP CONSTRAINT [citation_jobs_claimSetVersionId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[citation_matches] DROP CONSTRAINT [citation_matches_claimSetVersionId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[claim_set_versions] DROP CONSTRAINT [claim_set_versions_projectId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[patentability_scores] DROP CONSTRAINT [patentability_scores_claimSetVersionId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[search_history] DROP CONSTRAINT [search_history_claimSetVersionId_fkey];

-- DropIndex
DROP INDEX [citation_jobs_claimSetVersionId_idx] ON [dbo].[citation_jobs];

-- DropIndex
DROP INDEX [citation_matches_claimSetVersionId_idx] ON [dbo].[citation_matches];

-- DropIndex
DROP INDEX [patentability_scores_claimSetVersionId_idx] ON [dbo].[patentability_scores];

-- DropIndex
ALTER TABLE [dbo].[patentability_scores] DROP CONSTRAINT [patentability_scores_claimSetVersionId_searchHistoryId_key];

-- DropIndex
DROP INDEX [search_history_claimSetVersionId_idx] ON [dbo].[search_history];

-- AlterTable
ALTER TABLE [dbo].[citation_jobs] DROP COLUMN [claimSetVersionId];

-- AlterTable
ALTER TABLE [dbo].[citation_matches] DROP COLUMN [claimSetVersionId];

-- AlterTable
ALTER TABLE [dbo].[patentability_scores] DROP COLUMN [claimSetVersionId];

-- AlterTable
ALTER TABLE [dbo].[search_history] DROP COLUMN [claimSetVersionId];

-- DropTable
DROP TABLE [dbo].[claim_set_versions];

-- CreateIndex
ALTER TABLE [dbo].[patentability_scores] ADD CONSTRAINT [patentability_scores_searchHistoryId_key] UNIQUE NONCLUSTERED ([searchHistoryId]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
