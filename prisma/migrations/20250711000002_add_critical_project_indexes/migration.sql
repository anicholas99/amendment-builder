-- Add critical performance indexes for Project table
-- These indexes significantly improve query performance for project listing and filtering

-- Index for tenant-based queries
CREATE INDEX "idx_project_tenantId" ON "projects"("tenantId");

-- Index for user-based queries  
CREATE INDEX "idx_project_userId" ON "projects"("userId");

-- Composite index for tenant + user queries (common pattern)
CREATE INDEX "idx_project_tenantId_userId" ON "projects"("tenantId", "userId");

-- Index for sorting by update time within a tenant
CREATE INDEX "idx_project_tenantId_updatedAt" ON "projects"("tenantId", "updatedAt" DESC); 