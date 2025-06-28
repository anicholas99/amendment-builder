BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[citation_matches] ADD [referenceApplicant] NVARCHAR(max),
[referenceAssignee] NVARCHAR(max),
[referencePublicationDate] NVARCHAR(1000),
[referenceTitle] NVARCHAR(max);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
