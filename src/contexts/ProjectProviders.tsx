/**
 * ProjectProviders
 *
 * Central location for all project-related context providers.
 * Uses individual project contexts for better separation of concerns.
 */

import React from 'react';
import { ProjectDataProvider, ProjectAutosaveProvider } from './index';
import { ActiveDocumentProvider } from './ActiveDocumentContext';

interface ProjectProvidersProps {
  children: React.ReactNode;
}

/**
 * Provider structure:
 *
 * 1. ProjectDataProvider - Manages core project data and active project state
 * 2. ProjectAutosaveProvider - Handles project content and autosave (depends on ProjectDataProvider)
 * 3. ProjectRelatedDataProvider - Manages related data like search history (depends on ProjectDataProvider)
 * 4. ActiveDocumentProvider - Independent, manages active document state
 * 5. VersioningProvider - Independent, manages versioning state
 *
 * The split project contexts provide better separation of concerns and performance
 * compared to the previous UnifiedProjectContext.
 */
export function ProjectProviders({ children }: ProjectProvidersProps) {
  return (
    <ProjectDataProvider>
      <ProjectAutosaveProvider>
        <ActiveDocumentProvider>{children}</ActiveDocumentProvider>
      </ProjectAutosaveProvider>
    </ProjectDataProvider>
  );
}
