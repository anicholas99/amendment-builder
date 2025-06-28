-- CreateTable
CREATE TABLE [dbo].[draft_documents] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(MAX),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [draft_documents_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [draft_documents_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [draft_documents_projectId_type_key] UNIQUE NONCLUSTERED ([projectId],[type])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [draft_documents_projectId_idx] ON [dbo].[draft_documents]([projectId]);

-- AddForeignKey
ALTER TABLE [dbo].[draft_documents] ADD CONSTRAINT [draft_documents_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing data from latest version documents to draft documents
-- This will copy the FULL_CONTENT document from the latest version of each project
INSERT INTO [dbo].[draft_documents] ([id], [projectId], [type], [content], [createdAt], [updatedAt])
SELECT 
    NEWID() as id,
    av.projectId,
    d.type,
    d.content,
    GETDATE() as createdAt,
    GETDATE() as updatedAt
FROM [dbo].[documents] d
INNER JOIN [dbo].[application_versions] av ON d.applicationVersionId = av.id
WHERE d.type = 'FULL_CONTENT'
AND av.createdAt = (
    SELECT MAX(av2.createdAt)
    FROM [dbo].[application_versions] av2
    WHERE av2.projectId = av.projectId
);

-- Also copy individual section documents
INSERT INTO [dbo].[draft_documents] ([id], [projectId], [type], [content], [createdAt], [updatedAt])
SELECT 
    NEWID() as id,
    av.projectId,
    d.type,
    d.content,
    GETDATE() as createdAt,
    GETDATE() as updatedAt
FROM [dbo].[documents] d
INNER JOIN [dbo].[application_versions] av ON d.applicationVersionId = av.id
WHERE d.type != 'FULL_CONTENT'
AND av.createdAt = (
    SELECT MAX(av2.createdAt)
    FROM [dbo].[application_versions] av2
    WHERE av2.projectId = av.projectId
)
AND NOT EXISTS (
    SELECT 1 
    FROM [dbo].[draft_documents] dd 
    WHERE dd.projectId = av.projectId 
    AND dd.type = d.type
); 