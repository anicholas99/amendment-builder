/*
  Warnings:

  - You are about to drop the `ChatMessage` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[ChatMessage] DROP CONSTRAINT [ChatMessage_projectId_fkey];

-- AlterTable
ALTER TABLE [dbo].[project_documents] ADD [applicationNumber] NVARCHAR(1000);

-- DropTable
DROP TABLE [dbo].[ChatMessage];

-- CreateTable
CREATE TABLE [dbo].[chat_messages] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [metadata] NVARCHAR(max),
    [timestamp] DATETIME2 NOT NULL CONSTRAINT [chat_messages_timestamp_df] DEFAULT CURRENT_TIMESTAMP,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [chat_messages_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [chat_messages_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [chat_messages_projectId_timestamp_idx] ON [dbo].[chat_messages]([projectId], [timestamp]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [project_documents_applicationNumber_idx] ON [dbo].[project_documents]([applicationNumber]);

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
