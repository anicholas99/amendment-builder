/*
  Warnings:

  - You are about to drop the `Element` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FigureElement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InventionFigure` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Element] DROP CONSTRAINT [Element_inventionId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[FigureElement] DROP CONSTRAINT [FigureElement_elementId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[FigureElement] DROP CONSTRAINT [FigureElement_figureId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[InventionFigure] DROP CONSTRAINT [InventionFigure_inventionId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[InventionFigure] DROP CONSTRAINT [InventionFigure_projectFigureId_fkey];

-- AlterTable
ALTER TABLE [dbo].[project_figures] ADD [displayOrder] INT NOT NULL CONSTRAINT [project_figures_displayOrder_df] DEFAULT 0,
[title] NVARCHAR(1000);

-- DropTable
DROP TABLE [dbo].[Element];

-- DropTable
DROP TABLE [dbo].[FigureElement];

-- DropTable
DROP TABLE [dbo].[InventionFigure];

-- CreateTable
CREATE TABLE [dbo].[elements] (
    [id] NVARCHAR(1000) NOT NULL,
    [projectId] NVARCHAR(1000) NOT NULL,
    [elementKey] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [elements_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [elements_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [elements_projectId_elementKey_key] UNIQUE NONCLUSTERED ([projectId],[elementKey])
);

-- CreateTable
CREATE TABLE [dbo].[figure_elements] (
    [id] NVARCHAR(1000) NOT NULL,
    [figureId] NVARCHAR(1000) NOT NULL,
    [elementId] NVARCHAR(1000) NOT NULL,
    [calloutDescription] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [figure_elements_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [figure_elements_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [figure_elements_figureId_elementId_key] UNIQUE NONCLUSTERED ([figureId],[elementId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [elements_projectId_idx] ON [dbo].[elements]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [figure_elements_figureId_idx] ON [dbo].[figure_elements]([figureId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [figure_elements_elementId_idx] ON [dbo].[figure_elements]([elementId]);

-- AddForeignKey
ALTER TABLE [dbo].[elements] ADD CONSTRAINT [elements_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[projects]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[figure_elements] ADD CONSTRAINT [figure_elements_figureId_fkey] FOREIGN KEY ([figureId]) REFERENCES [dbo].[project_figures]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[figure_elements] ADD CONSTRAINT [figure_elements_elementId_fkey] FOREIGN KEY ([elementId]) REFERENCES [dbo].[elements]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
