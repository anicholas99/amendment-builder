/*
  Warnings:

  - You are about to drop the column `elementsJson` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `figuresJson` on the `inventions` table. All the data in the column will be lost.
  - You are about to drop the column `pendingFiguresJson` on the `inventions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE [dbo].[inventions] DROP COLUMN [elementsJson];
ALTER TABLE [dbo].[inventions] DROP COLUMN [figuresJson];
ALTER TABLE [dbo].[inventions] DROP COLUMN [pendingFiguresJson];