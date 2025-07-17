-- Search History Performance Indexes
-- Run this script in SQL Server Management Studio or Azure Data Studio

-- Index 1: Project + Timestamp (most common query pattern)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_search_history_project_timestamp' AND object_id = OBJECT_ID('search_history'))
BEGIN
    CREATE INDEX idx_search_history_project_timestamp 
    ON search_history (projectId, timestamp DESC)
    WHERE projectId IS NOT NULL;
    PRINT 'Created index: idx_search_history_project_timestamp';
END
ELSE
BEGIN
    PRINT 'Index already exists: idx_search_history_project_timestamp';
END;

-- Index 2: User + Timestamp
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_search_history_user_timestamp' AND object_id = OBJECT_ID('search_history'))
BEGIN
    CREATE INDEX idx_search_history_user_timestamp 
    ON search_history (userId, timestamp DESC)
    WHERE userId IS NOT NULL;
    PRINT 'Created index: idx_search_history_user_timestamp';
END
ELSE
BEGIN
    PRINT 'Index already exists: idx_search_history_user_timestamp';
END;

-- Index 3: Citation Extraction Status
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_search_history_citation_status' AND object_id = OBJECT_ID('search_history'))
BEGIN
    CREATE INDEX idx_search_history_citation_status 
    ON search_history (citationExtractionStatus)
    WHERE citationExtractionStatus IS NOT NULL;
    PRINT 'Created index: idx_search_history_citation_status';
END
ELSE
BEGIN
    PRINT 'Index already exists: idx_search_history_citation_status';
END;

-- Index 4: Project + Citation Status (composite)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_search_history_project_citation' AND object_id = OBJECT_ID('search_history'))
BEGIN
    CREATE INDEX idx_search_history_project_citation 
    ON search_history (projectId, citationExtractionStatus)
    WHERE projectId IS NOT NULL AND citationExtractionStatus IS NOT NULL;
    PRINT 'Created index: idx_search_history_project_citation';
END
ELSE
BEGIN
    PRINT 'Index already exists: idx_search_history_project_citation';
END;

-- Verify indexes were created
SELECT 
    i.name AS IndexName,
    i.type_desc AS IndexType,
    i.is_unique AS IsUnique,
    i.has_filter AS HasFilter
FROM sys.indexes i
INNER JOIN sys.objects o ON i.object_id = o.object_id
WHERE o.name = 'search_history'
AND i.name LIKE 'idx_search_history%'
ORDER BY i.name; 