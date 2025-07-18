BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[job_queue] (
    [id] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [payload] NVARCHAR(max) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [job_queue_status_df] DEFAULT 'PENDING',
    [attempts] INT NOT NULL CONSTRAINT [job_queue_attempts_df] DEFAULT 0,
    [maxAttempts] INT NOT NULL CONSTRAINT [job_queue_maxAttempts_df] DEFAULT 3,
    [lastError] NVARCHAR(max),
    [scheduledAt] DATETIME2 NOT NULL CONSTRAINT [job_queue_scheduledAt_df] DEFAULT CURRENT_TIMESTAMP,
    [startedAt] DATETIME2,
    [completedAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [job_queue_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [job_queue_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[patent_applications] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [applicationNumber] NVARCHAR(1000),
    [filingDate] DATETIME2,
    [title] NVARCHAR(1000),
    [inventors] NVARCHAR(max),
    [assignee] NVARCHAR(1000),
    [artUnit] NVARCHAR(1000),
    [examinerName] NVARCHAR(1000),
    [examinerId] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [patent_applications_status_df] DEFAULT 'PENDING',
    [metadata] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [patent_applications_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [patent_applications_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [patent_applications_projectId_key] UNIQUE NONCLUSTERED ([projectId])
);

-- CreateTable
CREATE TABLE [dbo].[patent_claim_versions] (
    [id] NVARCHAR(1000) NOT NULL,
    [applicationId] NVARCHAR(1000) NOT NULL,
    [officeActionId] NVARCHAR(1000),
    [versionNumber] INT NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [patent_claim_versions_status_df] DEFAULT 'ACTIVE',
    [effectiveDate] DATETIME2 NOT NULL,
    [source] NVARCHAR(1000) NOT NULL,
    [claimsJson] NVARCHAR(max) NOT NULL,
    [claim1Hash] NVARCHAR(1000),
    [elementAnalysisJson] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [patent_claim_versions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [patent_claim_versions_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [patent_claim_versions_applicationId_versionNumber_key] UNIQUE NONCLUSTERED ([applicationId],[versionNumber])
);

-- CreateTable
CREATE TABLE [dbo].[rejection_analysis_results] (
    [id] NVARCHAR(1000) NOT NULL,
    [rejectionId] NVARCHAR(1000) NOT NULL,
    [officeActionId] NVARCHAR(1000) NOT NULL,
    [analysisType] NVARCHAR(1000) NOT NULL,
    [strengthScore] FLOAT(53),
    [priorArtMapping] NVARCHAR(max),
    [suggestedStrategy] NVARCHAR(1000),
    [reasoning] NVARCHAR(max),
    [confidenceScore] FLOAT(53),
    [modelVersion] NVARCHAR(1000),
    [agentVersion] NVARCHAR(1000),
    [model] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [rejection_analysis_results_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [rejection_analysis_results_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [rejection_analysis_results_rejectionId_key] UNIQUE NONCLUSTERED ([rejectionId])
);

-- CreateTable
CREATE TABLE [dbo].[office_action_summaries] (
    [id] NVARCHAR(1000) NOT NULL,
    [officeActionId] NVARCHAR(1000) NOT NULL,
    [summaryText] NVARCHAR(max) NOT NULL,
    [keyIssues] NVARCHAR(max) NOT NULL,
    [rejectionBreakdown] NVARCHAR(max) NOT NULL,
    [totalClaimsRejected] INT NOT NULL,
    [allowedClaims] NVARCHAR(max),
    [strategyHint] NVARCHAR(1000),
    [claimImpactMap] NVARCHAR(max),
    [examinerTone] NVARCHAR(1000),
    [responseComplexity] NVARCHAR(1000),
    [num102Rejections] INT NOT NULL CONSTRAINT [office_action_summaries_num102Rejections_df] DEFAULT 0,
    [num103Rejections] INT NOT NULL CONSTRAINT [office_action_summaries_num103Rejections_df] DEFAULT 0,
    [num101Rejections] INT NOT NULL CONSTRAINT [office_action_summaries_num101Rejections_df] DEFAULT 0,
    [num112Rejections] INT NOT NULL CONSTRAINT [office_action_summaries_num112Rejections_df] DEFAULT 0,
    [numOtherRejections] INT NOT NULL CONSTRAINT [office_action_summaries_numOtherRejections_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [office_action_summaries_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [office_action_summaries_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [office_action_summaries_officeActionId_key] UNIQUE NONCLUSTERED ([officeActionId])
);

-- CreateTable
CREATE TABLE [dbo].[strategy_recommendations] (
    [id] NVARCHAR(1000) NOT NULL,
    [officeActionId] NVARCHAR(1000) NOT NULL,
    [applicationId] NVARCHAR(1000) NOT NULL,
    [overallStrategy] NVARCHAR(1000) NOT NULL,
    [priorityActions] NVARCHAR(max) NOT NULL,
    [estimatedDifficulty] NVARCHAR(1000) NOT NULL,
    [successProbability] FLOAT(53),
    [keyArguments] NVARCHAR(max),
    [amendmentFocus] NVARCHAR(max),
    [alternativeOptions] NVARCHAR(max),
    [reasoning] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [strategy_recommendations_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [strategy_recommendations_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [job_queue_type_status_scheduledAt_idx] ON [dbo].[job_queue]([type], [status], [scheduledAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [job_queue_status_createdAt_idx] ON [dbo].[job_queue]([status], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [patent_applications_projectId_idx] ON [dbo].[patent_applications]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [patent_applications_applicationNumber_idx] ON [dbo].[patent_applications]([applicationNumber]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [patent_claim_versions_applicationId_idx] ON [dbo].[patent_claim_versions]([applicationId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [patent_claim_versions_officeActionId_idx] ON [dbo].[patent_claim_versions]([officeActionId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [patent_claim_versions_claim1Hash_idx] ON [dbo].[patent_claim_versions]([claim1Hash]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [rejection_analysis_results_rejectionId_idx] ON [dbo].[rejection_analysis_results]([rejectionId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [rejection_analysis_results_officeActionId_idx] ON [dbo].[rejection_analysis_results]([officeActionId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [office_action_summaries_officeActionId_idx] ON [dbo].[office_action_summaries]([officeActionId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [office_action_summaries_num102Rejections_num103Rejections_num101Rejections_num112Rejections_idx] ON [dbo].[office_action_summaries]([num102Rejections], [num103Rejections], [num101Rejections], [num112Rejections]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [strategy_recommendations_officeActionId_idx] ON [dbo].[strategy_recommendations]([officeActionId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [strategy_recommendations_applicationId_idx] ON [dbo].[strategy_recommendations]([applicationId]);

-- AddForeignKey
ALTER TABLE [dbo].[patent_applications] ADD CONSTRAINT [patent_applications_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[patent_claim_versions] ADD CONSTRAINT [patent_claim_versions_applicationId_fkey] FOREIGN KEY ([applicationId]) REFERENCES [dbo].[patent_applications]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[patent_claim_versions] ADD CONSTRAINT [patent_claim_versions_officeActionId_fkey] FOREIGN KEY ([officeActionId]) REFERENCES [dbo].[office_actions]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[rejection_analysis_results] ADD CONSTRAINT [rejection_analysis_results_rejectionId_fkey] FOREIGN KEY ([rejectionId]) REFERENCES [dbo].[rejections]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[rejection_analysis_results] ADD CONSTRAINT [rejection_analysis_results_officeActionId_fkey] FOREIGN KEY ([officeActionId]) REFERENCES [dbo].[office_actions]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[office_action_summaries] ADD CONSTRAINT [office_action_summaries_officeActionId_fkey] FOREIGN KEY ([officeActionId]) REFERENCES [dbo].[office_actions]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[strategy_recommendations] ADD CONSTRAINT [strategy_recommendations_officeActionId_fkey] FOREIGN KEY ([officeActionId]) REFERENCES [dbo].[office_actions]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[strategy_recommendations] ADD CONSTRAINT [strategy_recommendations_applicationId_fkey] FOREIGN KEY ([applicationId]) REFERENCES [dbo].[patent_applications]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
