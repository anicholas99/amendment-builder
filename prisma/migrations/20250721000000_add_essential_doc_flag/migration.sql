-- Add isEssentialDoc flag to ProjectDocument table
-- This marks USPTO documents that are essential for AI amendment drafting

-- Add the column with default false
ALTER TABLE [dbo].[ProjectDocument] 
ADD [isEssentialDoc] BIT NOT NULL CONSTRAINT [DF_ProjectDocument_isEssentialDoc] DEFAULT 0;

-- Drop the default constraint after adding (keeps column but removes default)
ALTER TABLE [dbo].[ProjectDocument] 
DROP CONSTRAINT [DF_ProjectDocument_isEssentialDoc];