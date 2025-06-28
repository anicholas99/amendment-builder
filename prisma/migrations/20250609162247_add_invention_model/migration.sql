/*
  Warnings:

  - You are about to drop the column `background` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `briefDescription` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `detailedDescription` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `developmentStage` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `industrialApplication` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `inventionType` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `inventiveStep` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `ipcClassification` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `noveltyStatement` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `problemStatement` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `shortDescription` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `solutionSummary` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `subField` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the `figures` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gpt_analysis_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invention_advantages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invention_components` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invention_examples` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `technical_challenges` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `technical_details` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[figures] DROP CONSTRAINT [figures_projectId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[invention_advantages] DROP CONSTRAINT [invention_advantages_projectId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[invention_components] DROP CONSTRAINT [invention_components_parentComponentId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[invention_components] DROP CONSTRAINT [invention_components_projectId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[invention_examples] DROP CONSTRAINT [invention_examples_projectId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[technical_challenges] DROP CONSTRAINT [technical_challenges_projectId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[technical_details] DROP CONSTRAINT [technical_details_projectId_fkey];

-- AlterTable
ALTER TABLE [dbo].[inventions] ALTER COLUMN [title] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[inventions] ALTER COLUMN [abstract] NVARCHAR(max) NULL;
ALTER TABLE [dbo].[inventions] ALTER COLUMN [technicalField] NVARCHAR(max) NULL;
ALTER TABLE [dbo].[inventions] DROP COLUMN [background],
[briefDescription],
[detailedDescription],
[developmentStage],
[industrialApplication],
[inventionType],
[inventiveStep],
[ipcClassification],
[noveltyStatement],
[problemStatement],
[shortDescription],
[solutionSummary],
[subField];
ALTER TABLE [dbo].[inventions] ADD [advantagesJson] NVARCHAR(max),
[claimsJson] NVARCHAR(max),
[description] NVARCHAR(max),
[featuresJson] NVARCHAR(max),
[figuresJson] NVARCHAR(max),
[novelty] NVARCHAR(max),
[patentCategory] NVARCHAR(1000),
[priorArtJson] NVARCHAR(max),
[summary] NVARCHAR(max);

-- AlterTable
ALTER TABLE [dbo].[projects] ADD [structuredData] NVARCHAR(max);

-- DropTable
DROP TABLE [dbo].[figures];

-- DropTable
DROP TABLE [dbo].[gpt_analysis_logs];

-- DropTable
DROP TABLE [dbo].[invention_advantages];

-- DropTable
DROP TABLE [dbo].[invention_components];

-- DropTable
DROP TABLE [dbo].[invention_examples];

-- DropTable
DROP TABLE [dbo].[technical_challenges];

-- DropTable
DROP TABLE [dbo].[technical_details];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
