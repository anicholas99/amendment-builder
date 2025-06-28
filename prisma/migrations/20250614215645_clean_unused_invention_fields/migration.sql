/*
  Warnings:

  - You are about to drop the column `background` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `briefDescription` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `challengesJson` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `componentsJson` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `constraints` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `dataFlow` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `dependencies` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `detailedDescription` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `developmentStage` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `examplesJson` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `implementationNotes` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `industrialApplication` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `inventionType` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `inventiveStep` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `ipcClassification` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `keyAlgorithms` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `novelty` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `performanceMetrics` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `problemStatement` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `shortDescription` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `solutionSummary` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `subField` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `systemArchitecture` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `systemRequirements` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `technologyStack` on the `inventions` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[inventions] DROP COLUMN [background],
[briefDescription],
[challengesJson],
[componentsJson],
[constraints],
[dataFlow],
[dependencies],
[detailedDescription],
[developmentStage],
[examplesJson],
[implementationNotes],
[industrialApplication],
[inventionType],
[inventiveStep],
[ipcClassification],
[keyAlgorithms],
[novelty],
[performanceMetrics],
[problemStatement],
[shortDescription],
[solutionSummary],
[subField],
[systemArchitecture],
[systemRequirements],
[technologyStack];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
