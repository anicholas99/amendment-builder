BEGIN TRY

BEGIN TRAN;

-- RenameIndex
EXEC SP_RENAME N'dbo.projects.idx_project_tenantId', N'projects_tenantId_idx', N'INDEX';

-- RenameIndex
EXEC SP_RENAME N'dbo.projects.idx_project_tenantId_updatedAt', N'projects_tenantId_updatedAt_idx', N'INDEX';

-- RenameIndex
EXEC SP_RENAME N'dbo.projects.idx_project_tenantId_userId', N'projects_tenantId_userId_idx', N'INDEX';

-- RenameIndex
EXEC SP_RENAME N'dbo.projects.idx_project_userId', N'projects_userId_idx', N'INDEX';

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
