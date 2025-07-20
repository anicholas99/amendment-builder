BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[amendment_projects] ADD [validationOverridden] BIT NOT NULL CONSTRAINT [amendment_projects_validationOverridden_df] DEFAULT 0,
[validationOverrideAt] DATETIME2,
[validationOverrideBy] NVARCHAR(1000),
[validationOverrideReason] NVARCHAR(1000),
[validationSummary] NVARCHAR(max);

-- AlterTable
ALTER TABLE [dbo].[patent_applications] ADD [examiner] NVARCHAR(1000);

-- CreateTable
CREATE TABLE [dbo].[prosecution_events] (
    [id] NVARCHAR(1000) NOT NULL,
    [applicationId] NVARCHAR(1000) NOT NULL,
    [eventType] NVARCHAR(1000) NOT NULL,
    [eventDate] DATETIME2 NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [documentId] NVARCHAR(1000),
    [metadata] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [prosecution_events_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [prosecution_events_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[claim_validations] (
    [id] NVARCHAR(1000) NOT NULL,
    [claimId] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [tenantId] NVARCHAR(1000) NOT NULL,
    [validationState] NVARCHAR(1000) NOT NULL,
    [riskLevel] NVARCHAR(1000),
    [message] NVARCHAR(1000),
    [details] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [claim_validations_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [claim_validations_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [prosecution_events_applicationId_idx] ON [dbo].[prosecution_events]([applicationId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [prosecution_events_eventType_idx] ON [dbo].[prosecution_events]([eventType]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [prosecution_events_eventDate_idx] ON [dbo].[prosecution_events]([eventDate]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [prosecution_events_applicationId_eventDate_idx] ON [dbo].[prosecution_events]([applicationId], [eventDate]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [claim_validations_claimId_idx] ON [dbo].[claim_validations]([claimId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [claim_validations_projectId_idx] ON [dbo].[claim_validations]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [claim_validations_tenantId_idx] ON [dbo].[claim_validations]([tenantId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [claim_validations_validationState_idx] ON [dbo].[claim_validations]([validationState]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [IX_claim_validations_project_state] ON [dbo].[claim_validations]([projectId], [validationState]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [amendment_projects_validationOverridden_idx] ON [dbo].[amendment_projects]([validationOverridden]);

-- AddForeignKey
ALTER TABLE [dbo].[prosecution_events] ADD CONSTRAINT [prosecution_events_applicationId_fkey] FOREIGN KEY ([applicationId]) REFERENCES [dbo].[patent_applications]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
