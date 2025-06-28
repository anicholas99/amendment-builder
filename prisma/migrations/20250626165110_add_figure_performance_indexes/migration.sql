-- Add performance indexes for figure-related queries

-- Index for figure queries by project (improves getFiguresWithElements)
-- This index optimizes queries that filter by projectId and deletedAt
CREATE INDEX "IX_ProjectFigure_ProjectId_DeletedAt_DisplayOrder" ON "project_figures" ("projectId", "deletedAt", "displayOrder");

-- Index for figure element lookups
-- This helps when loading elements for specific figures
CREATE INDEX "IX_FigureElement_FigureId" ON "figure_elements" ("figureId");

-- Index for element lookups by project and key
-- This helps with element queries across the project
CREATE INDEX "IX_Element_ProjectId_ElementKey" ON "elements" ("projectId", "elementKey");

-- Composite index for figure status queries
-- This helps filter figures by status (PENDING, ASSIGNED, UPLOADED)
CREATE INDEX "IX_ProjectFigure_ProjectId_Status" ON "project_figures" ("projectId", "status");

-- Index for figureKey lookups
-- This helps when finding specific figures by their key
CREATE INDEX "IX_ProjectFigure_ProjectId_FigureKey" ON "project_figures" ("projectId", "figureKey"); 