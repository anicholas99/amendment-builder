BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[claim_set_versions] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [claimData] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [claim_set_versions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [claim_set_versions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [claim_set_versions_projectId_idx] ON [dbo].[claim_set_versions]([projectId]);

-- AddForeignKey
ALTER TABLE [dbo].[claim_set_versions] ADD CONSTRAINT [claim_set_versions_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
