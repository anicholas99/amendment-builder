/*
  Warnings:

  - You are about to drop the column `description` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `featuresJson` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `novelty` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `patentCategory` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `inventions` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[inventions] DROP COLUMN [description],
[featuresJson],
[novelty],
[patentCategory],
[summary];
ALTER TABLE [dbo].[inventions] ADD [background] NVARCHAR(max),
[briefDescription] NVARCHAR(max),
[challengesJson] NVARCHAR(max),
[componentsJson] NVARCHAR(max),
[constraints] NVARCHAR(max),
[dataFlow] NVARCHAR(max),
[dependencies] NVARCHAR(max),
[detailedDescription] NVARCHAR(max),
[developmentStage] NVARCHAR(1000),
[examplesJson] NVARCHAR(max),
[implementationNotes] NVARCHAR(max),
[industrialApplication] NVARCHAR(max),
[inventionType] NVARCHAR(1000),
[inventiveStep] NVARCHAR(max),
[ipcClassification] NVARCHAR(1000),
[keyAlgorithms] NVARCHAR(max),
[noveltyStatement] NVARCHAR(max),
[performanceMetrics] NVARCHAR(max),
[problemStatement] NVARCHAR(max),
[shortDescription] NVARCHAR(max),
[solutionSummary] NVARCHAR(max),
[subField] NVARCHAR(max),
[systemArchitecture] NVARCHAR(max),
[systemRequirements] NVARCHAR(max),
[technologyStack] NVARCHAR(max);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
