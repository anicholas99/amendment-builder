BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000),
    [passwordHash] NVARCHAR(1000),
    [salt] NVARCHAR(1000),
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [users_role_df] DEFAULT 'USER',
    [avatarUrl] NVARCHAR(1000),
    [isVerified] BIT NOT NULL CONSTRAINT [users_isVerified_df] DEFAULT 0,
    [verificationToken] NVARCHAR(1000),
    [resetToken] NVARCHAR(1000),
    [resetTokenExpiry] DATETIME2,
    [lastLogin] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email]),
    CONSTRAINT [users_verificationToken_key] UNIQUE NONCLUSTERED ([verificationToken]),
    CONSTRAINT [users_resetToken_key] UNIQUE NONCLUSTERED ([resetToken])
);

-- CreateTable
CREATE TABLE [dbo].[accounts] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [provider] NVARCHAR(1000) NOT NULL,
    [providerAccountId] NVARCHAR(1000) NOT NULL,
    [refresh_token] TEXT,
    [access_token] TEXT,
    [expires_at] INT,
    [token_type] NVARCHAR(1000),
    [scope] NVARCHAR(1000),
    [id_token] TEXT,
    [session_state] NVARCHAR(1000),
    CONSTRAINT [accounts_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [accounts_provider_providerAccountId_key] UNIQUE NONCLUSTERED ([provider],[providerAccountId])
);

-- CreateTable
CREATE TABLE [dbo].[projects] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [textInput] NVARCHAR(max),
    [userId] NVARCHAR(1000) NOT NULL,
    [tenantId] NVARCHAR(1000) NOT NULL,
    [structuredData] NVARCHAR(max),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [projects_status_df] DEFAULT 'DRAFT',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [projects_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [projects_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[user_preferences] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [key] NVARCHAR(1000) NOT NULL,
    [value] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [user_preferences_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [user_preferences_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [user_preferences_userId_key_key] UNIQUE NONCLUSTERED ([userId],[key])
);

-- CreateTable
CREATE TABLE [dbo].[sessions] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [token] NVARCHAR(1000) NOT NULL,
    [expiresAt] DATETIME2 NOT NULL,
    [ipAddress] NVARCHAR(1000),
    [userAgent] NVARCHAR(max),
    [lastActivity] DATETIME2 NOT NULL CONSTRAINT [sessions_lastActivity_df] DEFAULT CURRENT_TIMESTAMP,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [sessions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [expires] DATETIME2 NOT NULL,
    [sessionToken] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [sessions_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [sessions_token_key] UNIQUE NONCLUSTERED ([token]),
    CONSTRAINT [sessions_sessionToken_key] UNIQUE NONCLUSTERED ([sessionToken])
);

-- CreateTable
CREATE TABLE [dbo].[tenants] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(max),
    [settings] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [tenants_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [tenants_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [tenants_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[user_tenants] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [tenantId] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [user_tenants_role_df] DEFAULT 'USER',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [user_tenants_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [user_tenants_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [user_tenants_userId_tenantId_key] UNIQUE NONCLUSTERED ([userId],[tenantId])
);

-- CreateTable
CREATE TABLE [dbo].[search_history] (
    [id] NVARCHAR(1000) NOT NULL,
    [query] NVARCHAR(max) NOT NULL,
    [timestamp] DATETIME2 NOT NULL CONSTRAINT [search_history_timestamp_df] DEFAULT CURRENT_TIMESTAMP,
    [results] NVARCHAR(max),
    [projectId] NVARCHAR(1000),
    [userId] NVARCHAR(1000),
    [citationJobIds] NVARCHAR(max),
    [citationJobReferenceMap] NVARCHAR(max),
    [citationResults] NVARCHAR(max),
    [citationStatus] NVARCHAR(1000),
    [searchData] NVARCHAR(max),
    [parsedElements] NVARCHAR(max),
    [suggestionStatus] NVARCHAR(1000),
    CONSTRAINT [search_history_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[citation_jobs] (
    [id] NVARCHAR(1000) NOT NULL,
    [searchHistoryId] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [citation_jobs_status_df] DEFAULT 'PENDING',
    [externalJobId] INT,
    [referenceNumber] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [citation_jobs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [startedAt] DATETIME2,
    [completedAt] DATETIME2,
    [error] NVARCHAR(max),
    CONSTRAINT [citation_jobs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[citation_results] (
    [id] NVARCHAR(1000) NOT NULL,
    [citationJobId] NVARCHAR(1000) NOT NULL,
    [resultsData] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [citation_results_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [citation_results_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [citation_results_citationJobId_key] UNIQUE NONCLUSTERED ([citationJobId])
);

-- CreateTable
CREATE TABLE [dbo].[project_exclusions] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [excludedPatentNumber] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [project_exclusions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [project_exclusions_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [project_exclusions_projectId_excludedPatentNumber_key] UNIQUE NONCLUSTERED ([projectId],[excludedPatentNumber])
);

-- CreateTable
CREATE TABLE [dbo].[ai_suggestions] (
    [id] NVARCHAR(1000) NOT NULL,
    [searchHistoryId] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [ai_suggestions_status_df] DEFAULT 'ACTIVE',
    [metadata] NVARCHAR(max),
    [feedback] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ai_suggestions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ai_suggestions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[saved_prior_art] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [patentNumber] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000),
    [abstract] NVARCHAR(max),
    [url] NVARCHAR(1000),
    [notes] NVARCHAR(max),
    [authors] NVARCHAR(1000),
    [publicationDate] NVARCHAR(1000),
    [savedAt] DATETIME2 NOT NULL CONSTRAINT [saved_prior_art_savedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [saved_prior_art_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [saved_prior_art_projectId_patentNumber_key] UNIQUE NONCLUSTERED ([projectId],[patentNumber])
);

-- CreateTable
CREATE TABLE [dbo].[project_images] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [url] NVARCHAR(1000) NOT NULL,
    [caption] NVARCHAR(1000),
    [order] INT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [project_images_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [project_images_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[application_versions] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [application_versions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [application_versions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[documents] (
    [id] NVARCHAR(1000) NOT NULL,
    [applicationVersionId] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [documents_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [documents_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [user_preferences_userId_idx] ON [dbo].[user_preferences]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [sessions_userId_idx] ON [dbo].[sessions]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [sessions_token_idx] ON [dbo].[sessions]([token]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [search_history_projectId_idx] ON [dbo].[search_history]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [search_history_userId_idx] ON [dbo].[search_history]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [citation_jobs_searchHistoryId_idx] ON [dbo].[citation_jobs]([searchHistoryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [project_exclusions_projectId_idx] ON [dbo].[project_exclusions]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ai_suggestions_searchHistoryId_idx] ON [dbo].[ai_suggestions]([searchHistoryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [saved_prior_art_projectId_idx] ON [dbo].[saved_prior_art]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [project_images_projectId_idx] ON [dbo].[project_images]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [application_versions_projectId_idx] ON [dbo].[application_versions]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [application_versions_userId_idx] ON [dbo].[application_versions]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [documents_applicationVersionId_idx] ON [dbo].[documents]([applicationVersionId]);

-- AddForeignKey
ALTER TABLE [dbo].[accounts] ADD CONSTRAINT [accounts_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[projects] ADD CONSTRAINT [projects_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[tenants]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[projects] ADD CONSTRAINT [projects_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[user_preferences] ADD CONSTRAINT [user_preferences_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[sessions] ADD CONSTRAINT [sessions_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[user_tenants] ADD CONSTRAINT [user_tenants_tenantId_fkey] FOREIGN KEY ([tenantId]) REFERENCES [dbo].[tenants]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[user_tenants] ADD CONSTRAINT [user_tenants_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[search_history] ADD CONSTRAINT [fk_searchhistory_user] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[search_history] ADD CONSTRAINT [fk_searchhistory_project] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[citation_jobs] ADD CONSTRAINT [citation_jobs_searchHistoryId_fkey] FOREIGN KEY ([searchHistoryId]) REFERENCES [dbo].[search_history]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[citation_results] ADD CONSTRAINT [citation_results_citationJobId_fkey] FOREIGN KEY ([citationJobId]) REFERENCES [dbo].[citation_jobs]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[project_exclusions] ADD CONSTRAINT [project_exclusions_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ai_suggestions] ADD CONSTRAINT [ai_suggestions_searchHistoryId_fkey] FOREIGN KEY ([searchHistoryId]) REFERENCES [dbo].[search_history]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[saved_prior_art] ADD CONSTRAINT [saved_prior_art_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[project_images] ADD CONSTRAINT [project_images_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[application_versions] ADD CONSTRAINT [application_versions_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[application_versions] ADD CONSTRAINT [application_versions_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[documents] ADD CONSTRAINT [documents_applicationVersionId_fkey] FOREIGN KEY ([applicationVersionId]) REFERENCES [dbo].[application_versions]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
