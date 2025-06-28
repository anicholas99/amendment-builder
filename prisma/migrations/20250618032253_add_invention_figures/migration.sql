BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Element] (
    [id] NVARCHAR(1000) NOT NULL,
    [inventionId] NVARCHAR(1000) NOT NULL,
    [label] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Element_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Element_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Element_inventionId_label_key] UNIQUE NONCLUSTERED ([inventionId],[label])
);

-- CreateTable
CREATE TABLE [dbo].[InventionFigure] (
    [id] NVARCHAR(1000) NOT NULL,
    [inventionId] NVARCHAR(1000) NOT NULL,
    [figureKey] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000),
    [description] NVARCHAR(max),
    [view] NVARCHAR(1000),
    [order] INT,
    [projectFigureId] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [InventionFigure_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [InventionFigure_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [InventionFigure_projectFigureId_key] UNIQUE NONCLUSTERED ([projectFigureId]),
    CONSTRAINT [InventionFigure_inventionId_figureKey_key] UNIQUE NONCLUSTERED ([inventionId],[figureKey])
);

-- CreateTable
CREATE TABLE [dbo].[FigureElement] (
    [figureId] NVARCHAR(1000) NOT NULL,
    [elementId] NVARCHAR(1000) NOT NULL,
    [callout] NVARCHAR(max),
    CONSTRAINT [FigureElement_pkey] PRIMARY KEY CLUSTERED ([figureId],[elementId])
);

-- AddForeignKey
ALTER TABLE [dbo].[Element] ADD CONSTRAINT [Element_inventionId_fkey] FOREIGN KEY ([inventionId]) REFERENCES [dbo].[inventions]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[InventionFigure] ADD CONSTRAINT [InventionFigure_inventionId_fkey] FOREIGN KEY ([inventionId]) REFERENCES [dbo].[inventions]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[InventionFigure] ADD CONSTRAINT [InventionFigure_projectFigureId_fkey] FOREIGN KEY ([projectFigureId]) REFERENCES [dbo].[project_figures]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FigureElement] ADD CONSTRAINT [FigureElement_figureId_fkey] FOREIGN KEY ([figureId]) REFERENCES [dbo].[InventionFigure]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FigureElement] ADD CONSTRAINT [FigureElement_elementId_fkey] FOREIGN KEY ([elementId]) REFERENCES [dbo].[Element]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
