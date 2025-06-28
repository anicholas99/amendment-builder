/**
 * Business logic utilities for ProjectSidebar component
 * Extracted complex logic following the architectural blueprint
 */
import React from 'react';
import { logger } from '@/lib/monitoring/logger';
import {
  ProjectSidebarProject,
  DocumentType,
  NavigationTarget,
} from '../types/projectSidebar';

/**
 * Helper to safely parse JSON fields
 */
const safeJsonParse = (jsonString: string | undefined | null, defaultValue: any): any => {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    logger.debug('[transformProjectsForSidebar] Failed to parse JSON', { jsonString, error });
    return defaultValue;
  }
};

/**
 * Transform project data for sidebar consumption
 * Replaces the old structuredData approach with proper Invention model
 */
export const transformProjectsForSidebar = (
  projects: any[]
): ProjectSidebarProject[] => {
  return projects
    .filter(p => p.id !== undefined)
    .map(p => {
      const transformed = {
        id: p.id as string,
        name: p.name || 'Untitled Project',
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        documents: p.documents || [],
        invention: p.invention
          ? {
              id: p.invention.id,
              title: p.invention.title,
              summary: p.invention.summary,
              abstract: p.invention.abstract,
              description: p.invention.description,
              components: safeJsonParse(p.invention.componentsJson, []),
              features: safeJsonParse(p.invention.featuresJson, []),
              advantages: safeJsonParse(p.invention.advantagesJson, []),
              use_cases: safeJsonParse(p.invention.useCasesJson, []),
              background: safeJsonParse(p.invention.backgroundJson, null),
            }
          : null,
      };
      
      // Debug logging to see what data we're working with
      if (p.invention) {
        logger.debug('[transformProjectsForSidebar] Project invention data', {
          projectId: p.id,
          hasTitle: !!p.invention.title,
          hasFeatures: !!p.invention.featuresJson,
          featuresJson: p.invention.featuresJson?.substring(0, 100),
          parsedFeatures: transformed.invention?.features,
        });
      }
      
      return transformed;
    });
};

/**
 * Determine the current document type from router pathname
 */
export const getCurrentDocumentType = (
  pathname: string
): DocumentType | null => {
  if (pathname.includes('claim-refinement')) return 'claim-refinement';
  if (pathname.includes('technology')) return 'technology';
  if (pathname.includes('patent')) return 'patent';
  return null;
};

/**
 * Check if we're currently on a project detail page
 */
export const isProjectDetailPage = (pathname: string): boolean => {
  return pathname.includes('/projects/[projectId]');
};

/**
 * Build navigation path for project and document type
 */
export const buildNavigationPath = (
  tenant: string,
  projectId: string,
  documentType: DocumentType
): string => {
  return `/${tenant}/projects/${projectId}/${documentType}`;
};

/**
 * Build projects dashboard path
 */
export const buildDashboardPath = (tenant: string): string => {
  return `/${tenant}/projects`;
};

/**
 * Check if navigation requires project switching
 */
export const requiresProjectSwitch = (
  currentProjectId: string | null,
  targetProjectId: string
): boolean => {
  return currentProjectId !== targetProjectId;
};

/**
 * Determine if we're leaving a heavy component (claim-refinement)
 * and need transition delay
 */
export const needsTransitionDelay = (
  currentDocType: DocumentType | null,
  targetDocType: DocumentType
): boolean => {
  return (
    currentDocType === 'claim-refinement' &&
    targetDocType !== 'claim-refinement'
  );
};

/**
 * Create React Query cache data structure for projects
 */
export const createProjectsCacheData = (projects: ProjectSidebarProject[]) => {
  return {
    pages: [
      {
        projects: projects,
        pagination: {
          page: 1,
          limit: 20,
          hasNextPage: false,
          nextCursor: undefined,
        },
      },
    ],
    pageParams: [1],
  };
};

/**
 * Auto-expand logic for project sidebar
 */
export const calculateAutoExpandIndices = (
  projects: ProjectSidebarProject[],
  activeProjectId: string | null,
  currentExpandedIndices: number[]
): number[] => {
  if (!activeProjectId) return currentExpandedIndices;

  const activeIndex = projects.findIndex(p => p.id === activeProjectId);

  // Only auto-expand if no projects are currently expanded (initial state)
  if (activeIndex !== -1 && currentExpandedIndices.length === 0) {
    return [activeIndex];
  }

  return currentExpandedIndices;
};

/**
 * Validate project exists in list
 */
export const validateProjectExists = (
  projects: ProjectSidebarProject[],
  projectId: string
): boolean => {
  return projects.some(p => p.id === projectId);
};

/**
 * Find project by ID with null safety
 */
export const findProjectById = (
  projects: ProjectSidebarProject[],
  projectId: string | null
): ProjectSidebarProject | null => {
  if (!projectId) return null;
  return projects.find(p => p.id === projectId) || null;
};

/**
 * Safe event object creation for project clicks
 * Prevents circular reference issues
 */
export const createSafeClickEvent = (): React.MouseEvent => {
  return {
    stopPropagation: () => {
      // Intentionally prevent event bubbling
    },
    preventDefault: () => {
      // Intentionally prevent default behavior
    },
  } as React.MouseEvent;
};

/**
 * Logging utilities for sidebar operations
 */
export const logSidebarOperation = (
  operation: string,
  data: Record<string, any>
): void => {
  logger.debug(`[ProjectSidebar] ${operation}`, data);
};

export const logNavigationOperation = (
  operation: string,
  target: NavigationTarget
): void => {
  logger.debug(`[ProjectSidebar Navigation] ${operation}`, { ...target });
};

/**
 * Error handling utilities
 */
export const handleNavigationError = (
  error: unknown,
  operation: string,
  context: Record<string, any>
): void => {
  logger.error(`Error during ${operation}:`, error);
  logSidebarOperation(`${operation} failed`, { error, ...context });
};

/**
 * Debounce utility for rapid operations using async patterns
 * Avoids setTimeout in favor of queueMicrotask and timing
 */
export const createDebouncer = () => {
  let isDebouncing = false;
  let pendingFn: (() => void) | null = null;

  return (fn: () => void, delayMs: number = 50) => {
    pendingFn = fn;

    if (!isDebouncing) {
      isDebouncing = true;
      const start = performance.now();

      const check = () => {
        if (performance.now() - start >= delayMs) {
          isDebouncing = false;
          if (pendingFn) {
            const currentFn = pendingFn;
            pendingFn = null;
            currentFn();
          }
        } else {
          queueMicrotask(check);
        }
      };

      queueMicrotask(check);
    }
  };
};

/**
 * URL synchronization utilities
 */
export const shouldSyncActiveProject = (
  routerProjectId: string | undefined,
  isProjectDetailPage: boolean,
  lastSyncedProjectId: string | null
): boolean => {
  return !!(
    routerProjectId &&
    typeof routerProjectId === 'string' &&
    isProjectDetailPage &&
    routerProjectId !== lastSyncedProjectId
  );
};

/**
 * Project list validation utilities
 */
export const shouldRefetchProjects = (
  routerProjectId: string | undefined,
  projects: ProjectSidebarProject[],
  isPendingDelete: boolean,
  isCreating: boolean
): boolean => {
  return !!(
    routerProjectId &&
    typeof routerProjectId === 'string' &&
    !projects.find(p => p.id === routerProjectId) &&
    !isPendingDelete &&
    !isCreating
  );
};

/**
 * Document type normalization
 */
export const normalizeDocumentType = (documentType: string): DocumentType => {
  switch (documentType) {
    case 'technology':
      return 'technology';
    case 'claim-refinement':
      return 'claim-refinement';
    default:
      return 'patent';
  }
};
