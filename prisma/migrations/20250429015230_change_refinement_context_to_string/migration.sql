BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[RefinementSession] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [contextJson] NVARCHAR(max) NOT NULL CONSTRAINT [RefinementSession_contextJson_df] DEFAULT '{}',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RefinementSession_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [RefinementSession_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RefinementSession_projectId_key] UNIQUE NONCLUSTERED ([projectId])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
