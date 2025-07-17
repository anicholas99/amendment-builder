-- CreateTable
CREATE TABLE [dbo].[saved_citations] (
    [id] NVARCHAR(1000) NOT NULL,
    [savedPriorArtId] NVARCHAR(1000) NOT NULL,
    [elementText] NVARCHAR(max) NOT NULL,
    [citationText] NVARCHAR(max) NOT NULL,
    [location] NVARCHAR(255),
    [reasoning] NVARCHAR(max),
    [displayOrder] INT NOT NULL CONSTRAINT [saved_citations_displayOrder_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [saved_citations_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [saved_citations_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [saved_citations_savedPriorArtId_idx] ON [dbo].[saved_citations]([savedPriorArtId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [saved_citations_displayOrder_idx] ON [dbo].[saved_citations]([displayOrder]);

-- AddForeignKey
ALTER TABLE [dbo].[saved_citations] ADD CONSTRAINT [saved_citations_savedPriorArtId_fkey] FOREIGN KEY ([savedPriorArtId]) REFERENCES [dbo].[saved_prior_art]([id]) ON DELETE CASCADE ON UPDATE CASCADE; 