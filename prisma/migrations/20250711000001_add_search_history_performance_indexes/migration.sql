-- Add performance indexes for search history queries
-- These indexes significantly improve query performance for project-based searches

-- Create index for finding search history by project and ordering by timestamp
-- Check if index exists before creating
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_search_history_project_timestamp' AND object_id = OBJECT_ID('search_history'))
BEGIN
    CREATE INDEX idx_search_history_project_timestamp 
    ON search_history (projectId, timestamp DESC)
    WHERE projectId IS NOT NULL;
END;

-- Create index for finding search history by user and ordering by timestamp
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_search_history_user_timestamp' AND object_id = OBJECT_ID('search_history'))
BEGIN
    CREATE INDEX idx_search_history_user_timestamp 
    ON search_history (userId, timestamp DESC)
    WHERE userId IS NOT NULL;
END;

-- Create index for citation extraction status queries
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_search_history_citation_status' AND object_id = OBJECT_ID('search_history'))
BEGIN
    CREATE INDEX idx_search_history_citation_status 
    ON search_history (citationExtractionStatus)
    WHERE citationExtractionStatus IS NOT NULL;
END;

-- Create composite index for project + citation status queries
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_search_history_project_citation' AND object_id = OBJECT_ID('search_history'))
BEGIN
    CREATE INDEX idx_search_history_project_citation 
    ON search_history (projectId, citationExtractionStatus)
    WHERE projectId IS NOT NULL AND citationExtractionStatus IS NOT NULL;
END; 