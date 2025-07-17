BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[ai_audit_logs] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [tenantId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [operation] NVARCHAR(1000) NOT NULL,
    [toolName] NVARCHAR(1000),
    [model] NVARCHAR(1000) NOT NULL,
    [prompt] NVARCHAR(max) NOT NULL,
    [response] NVARCHAR(max) NOT NULL,
    [tokenUsage] NVARCHAR(max) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [errorMessage] NVARCHAR(max),
    [humanReviewed] BIT NOT NULL CONSTRAINT [ai_audit_logs_humanReviewed_df] DEFAULT 0,
    [reviewedBy] NVARCHAR(1000),
    [reviewedAt] DATETIME2,
    [exportedAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ai_audit_logs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ai_audit_logs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ai_audit_logs_projectId_createdAt_idx] ON [dbo].[ai_audit_logs]([projectId], [createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ai_audit_logs_tenantId_userId_idx] ON [dbo].[ai_audit_logs]([tenantId], [userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ai_audit_logs_operation_createdAt_idx] ON [dbo].[ai_audit_logs]([operation], [createdAt]);

-- AddForeignKey
ALTER TABLE [dbo].[ai_audit_logs] ADD CONSTRAINT [ai_audit_logs_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ai_audit_logs] ADD CONSTRAINT [ai_audit_logs_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[tenants]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ai_audit_logs] ADD CONSTRAINT [ai_audit_logs_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
