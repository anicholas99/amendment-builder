BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[inventions] ADD [backgroundJson] NVARCHAR(max),
[definitionsJson] NVARCHAR(max),
[elementsJson] NVARCHAR(max),
[featuresJson] NVARCHAR(max),
[futureDirectionsJson] NVARCHAR(max),
[novelty] NVARCHAR(max),
[patentCategory] NVARCHAR(1000),
[processStepsJson] NVARCHAR(max),
[summary] NVARCHAR(max),
[technicalImplementationJson] NVARCHAR(max),
[useCasesJson] NVARCHAR(max);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
