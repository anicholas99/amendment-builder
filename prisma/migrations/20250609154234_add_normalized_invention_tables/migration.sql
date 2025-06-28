/*
  Warnings:

  - You are about to drop the column `structuredData` on the `projects` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[projects] DROP COLUMN [structuredData];

-- CreateTable
CREATE TABLE [dbo].[inventions] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [shortDescription] NVARCHAR(1000),
    [abstract] NVARCHAR(max) NOT NULL,
    [technicalField] NVARCHAR(1000) NOT NULL,
    [subField] NVARCHAR(1000),
    [ipcClassification] NVARCHAR(1000),
    [problemStatement] NVARCHAR(max) NOT NULL,
    [solutionSummary] NVARCHAR(max) NOT NULL,
    [background] NVARCHAR(max),
    [detailedDescription] NVARCHAR(max),
    [briefDescription] NVARCHAR(max),
    [noveltyStatement] NVARCHAR(max),
    [inventiveStep] NVARCHAR(max),
    [industrialApplication] NVARCHAR(max),
    [inventionType] NVARCHAR(1000),
    [developmentStage] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [inventions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [inventions_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [inventions_projectId_key] UNIQUE NONCLUSTERED ([projectId])
);

-- CreateTable
CREATE TABLE [dbo].[technical_details] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [systemArchitecture] NVARCHAR(max),
    [keyAlgorithms] NVARCHAR(max),
    [dataFlow] NVARCHAR(max),
    [performanceMetrics] NVARCHAR(max),
    [systemRequirements] NVARCHAR(max),
    [constraints] NVARCHAR(max),
    [implementationNotes] NVARCHAR(max),
    [technologyStack] NVARCHAR(max),
    [dependencies] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [technical_details_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [technical_details_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [technical_details_projectId_key] UNIQUE NONCLUSTERED ([projectId])
);

-- CreateTable
CREATE TABLE [dbo].[invention_components] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [referenceNumber] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(max) NOT NULL,
    [function] NVARCHAR(max),
    [parentComponentId] NVARCHAR(1000),
    [componentType] NVARCHAR(1000),
    [isCritical] BIT NOT NULL CONSTRAINT [invention_components_isCritical_df] DEFAULT 0,
    [alternatives] NVARCHAR(max),
    [orderIndex] INT NOT NULL CONSTRAINT [invention_components_orderIndex_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [invention_components_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [invention_components_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[invention_advantages] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(max) NOT NULL,
    [category] NVARCHAR(1000),
    [comparedTo] NVARCHAR(max),
    [improvementMetric] NVARCHAR(1000),
    [priority] INT NOT NULL CONSTRAINT [invention_advantages_priority_df] DEFAULT 0,
    [orderIndex] INT NOT NULL CONSTRAINT [invention_advantages_orderIndex_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [invention_advantages_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [invention_advantages_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[invention_examples] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(max) NOT NULL,
    [exampleType] NVARCHAR(1000),
    [scenario] NVARCHAR(max),
    [implementation] NVARCHAR(max),
    [results] NVARCHAR(max),
    [codeSnippet] NVARCHAR(max),
    [programmingLanguage] NVARCHAR(1000),
    [relatedFigureIds] NVARCHAR(1000),
    [orderIndex] INT NOT NULL CONSTRAINT [invention_examples_orderIndex_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [invention_examples_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [invention_examples_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[technical_challenges] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [challenge] NVARCHAR(max) NOT NULL,
    [solution] NVARCHAR(max) NOT NULL,
    [alternativeSolutions] NVARCHAR(max),
    [challengeType] NVARCHAR(1000),
    [wasSolved] BIT NOT NULL CONSTRAINT [technical_challenges_wasSolved_df] DEFAULT 1,
    [orderIndex] INT NOT NULL CONSTRAINT [technical_challenges_orderIndex_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [technical_challenges_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [technical_challenges_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[figures] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [figureNumber] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [briefDescription] NVARCHAR(max),
    [detailedDescription] NVARCHAR(max),
    [imageUrl] NVARCHAR(1000) NOT NULL,
    [thumbnailUrl] NVARCHAR(1000),
    [fileType] NVARCHAR(1000),
    [componentReferences] NVARCHAR(max),
    [orderIndex] INT NOT NULL CONSTRAINT [figures_orderIndex_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [figures_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [figures_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[gpt_analysis_logs] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [analysisType] NVARCHAR(1000) NOT NULL,
    [promptVersion] NVARCHAR(1000) NOT NULL,
    [inputData] NVARCHAR(max) NOT NULL,
    [promptUsed] NVARCHAR(max) NOT NULL,
    [rawResponse] NVARCHAR(max) NOT NULL,
    [parsedSuccessfully] BIT NOT NULL CONSTRAINT [gpt_analysis_logs_parsedSuccessfully_df] DEFAULT 1,
    [parseErrors] NVARCHAR(max),
    [model] NVARCHAR(1000) NOT NULL,
    [tokenCount] INT,
    [responseTime] INT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [gpt_analysis_logs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [gpt_analysis_logs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [invention_components_projectId_idx] ON [dbo].[invention_components]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [invention_advantages_projectId_idx] ON [dbo].[invention_advantages]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [invention_examples_projectId_idx] ON [dbo].[invention_examples]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [technical_challenges_projectId_idx] ON [dbo].[technical_challenges]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [figures_projectId_idx] ON [dbo].[figures]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [gpt_analysis_logs_projectId_idx] ON [dbo].[gpt_analysis_logs]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [gpt_analysis_logs_analysisType_idx] ON [dbo].[gpt_analysis_logs]([analysisType]);

-- AddForeignKey
ALTER TABLE [dbo].[inventions] ADD CONSTRAINT [inventions_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[technical_details] ADD CONSTRAINT [technical_details_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[invention_components] ADD CONSTRAINT [invention_components_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[invention_components] ADD CONSTRAINT [invention_components_parentComponentId_fkey] FOREIGN KEY ([parentComponentId]) REFERENCES [dbo].[invention_components]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[invention_advantages] ADD CONSTRAINT [invention_advantages_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[invention_examples] ADD CONSTRAINT [invention_examples_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[technical_challenges] ADD CONSTRAINT [technical_challenges_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[figures] ADD CONSTRAINT [figures_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
