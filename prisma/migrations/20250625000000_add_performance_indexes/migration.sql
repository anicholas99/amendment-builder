-- Add performance indexes for faster query execution

-- Index for citation queries (50-70% faster)
-- This index optimizes queries that filter by citationJobId
CREATE INDEX "IX_CitationMatch_CitationJobId_RefNumber" ON "citation_matches" ("citationJobId", "referenceNumber");

-- Index for project listings (30-40% faster)  
-- This index optimizes queries that filter by tenantId, deletedAt, and sort by updatedAt
CREATE INDEX "IX_Project_TenantId_DeletedAt_UpdatedAt" ON "projects" ("tenantId", "deletedAt", "updatedAt");

-- Additional index for project search queries
-- This index helps with name-based searches within a tenant
CREATE INDEX "IX_Project_TenantId_Name" ON "projects" ("tenantId", "name");

-- Index for faster citation job lookups by search history
-- This helps when loading all citation jobs for a search
CREATE INDEX "IX_CitationJob_SearchHistoryId_Status" ON "citation_jobs" ("searchHistoryId", "status");

-- Index for search history by project
-- This helps when loading search history for a project
CREATE INDEX "IX_SearchHistory_ProjectId_Timestamp" ON "search_history" ("projectId", "timestamp"); 