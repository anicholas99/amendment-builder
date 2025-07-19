-- Add validation override tracking to amendment projects
-- This allows attorneys to proceed with export despite validation warnings

BEGIN TRY
    BEGIN TRANSACTION;

    -- Add validation override fields to amendment_projects
    ALTER TABLE [dbo].[amendment_projects] 
    ADD [validationOverridden] BIT NOT NULL DEFAULT 0;

    ALTER TABLE [dbo].[amendment_projects] 
    ADD [validationOverrideReason] NVARCHAR(1000) NULL;

    ALTER TABLE [dbo].[amendment_projects] 
    ADD [validationOverrideAt] DATETIME2 NULL;

    ALTER TABLE [dbo].[amendment_projects] 
    ADD [validationOverrideBy] NVARCHAR(450) NULL;

    -- Add validation summary snapshot at time of override
    ALTER TABLE [dbo].[amendment_projects] 
    ADD [validationSummary] NVARCHAR(MAX) NULL;

    -- Add index for tracking overrides
    CREATE INDEX [IX_amendment_projects_validationOverridden] 
    ON [dbo].[amendment_projects]([validationOverridden]) 
    WHERE [validationOverridden] = 1;

    -- Create validation results table for tracking individual claim validations
    CREATE TABLE [dbo].[claim_validations] (
        [id] NVARCHAR(450) NOT NULL,
        [claimId] NVARCHAR(450) NOT NULL,
        [projectId] NVARCHAR(450) NOT NULL,
        [tenantId] NVARCHAR(450) NOT NULL,
        [validationState] NVARCHAR(50) NOT NULL,
        [riskLevel] NVARCHAR(20) NULL,
        [message] NVARCHAR(1000) NULL,
        [details] NVARCHAR(MAX) NULL,
        [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_claim_validations] PRIMARY KEY CLUSTERED ([id] ASC)
    );

    -- Add indexes for claim validations
    CREATE INDEX [IX_claim_validations_claimId] 
    ON [dbo].[claim_validations]([claimId]);

    CREATE INDEX [IX_claim_validations_projectId] 
    ON [dbo].[claim_validations]([projectId]);

    CREATE INDEX [IX_claim_validations_tenantId] 
    ON [dbo].[claim_validations]([tenantId]);

    CREATE INDEX [IX_claim_validations_validationState] 
    ON [dbo].[claim_validations]([validationState]);

    -- Create composite index for common queries
    CREATE INDEX [IX_claim_validations_project_state] 
    ON [dbo].[claim_validations]([projectId], [validationState])
    INCLUDE ([riskLevel], [updatedAt]);

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;