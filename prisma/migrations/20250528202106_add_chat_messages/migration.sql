BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[chat_messages] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000),
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [chat_messages_role_df] DEFAULT 'ASSISTANT',
    [content] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [chat_messages_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [chat_messages_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [chat_messages_projectId_idx] ON [dbo].[chat_messages]([projectId]);

-- AddForeignKey
ALTER TABLE [dbo].[chat_messages] ADD CONSTRAINT [chat_messages_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
