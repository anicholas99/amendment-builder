BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[project_collaborators] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [project_collaborators_role_df] DEFAULT 'viewer',
    [invitedBy] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [project_collaborators_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [project_collaborators_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [project_collaborators_projectId_userId_key] UNIQUE NONCLUSTERED ([projectId],[userId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [project_collaborators_userId_idx] ON [dbo].[project_collaborators]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [project_collaborators_projectId_idx] ON [dbo].[project_collaborators]([projectId]);

-- AddForeignKey
ALTER TABLE [dbo].[project_collaborators] ADD CONSTRAINT [project_collaborators_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[project_collaborators] ADD CONSTRAINT [project_collaborators_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[project_collaborators] ADD CONSTRAINT [project_collaborators_invitedBy_fkey] FOREIGN KEY ([invitedBy]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
