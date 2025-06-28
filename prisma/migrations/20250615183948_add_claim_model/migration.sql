BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[claims] (
    [id] NVARCHAR(1000) NOT NULL,
    [inventionId] NVARCHAR(1000) NOT NULL,
    [number] INT NOT NULL,
    [text] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [claims_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [claims_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [claims_inventionId_number_key] UNIQUE NONCLUSTERED ([inventionId],[number])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [claims_inventionId_idx] ON [dbo].[claims]([inventionId]);

-- AddForeignKey
ALTER TABLE [dbo].[claims] ADD CONSTRAINT [claims_inventionId_fkey] FOREIGN KEY ([inventionId]) REFERENCES [dbo].[inventions]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
