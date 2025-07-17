import { Project } from '@prisma/client';
import { logger } from '@/server/logger';
import { apiFetch } from '@/lib/api/apiClient';
import { ApplicationError, ErrorCode } from '@/lib/error';
import {
  ApplicationVersionWithDocuments,
  ApplicationVersionBasic,
} from '@/types/versioning';
import { API_ROUTES, buildApiUrl } from '@/constants/apiRoutes';

/**
 * Interface for creating a new version
 */
interface CreateVersionData {
  name?: string;
  sections: Record<string, string>;
}

interface ActiveProjectPrefs {
  activeProject?: string; // Property is optional
}

/**
 * Projects API Client
 *
 * Centralized client for all project-related API operations
 */

/**
 * Get list of projects with optional pagination
 */
async function getProjects(page = 1, limit = 20): Promise<Project[]> {
  try {
    const url = buildApiUrl(API_ROUTES.PROJECTS.LIST, { page, limit });
    const response = await apiFetch(url);

    if (!response.ok) {
      throw new ApplicationError(
        ErrorCode.API_INVALID_RESPONSE,
        `Failed to fetch projects: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.data || data || [];
  } catch (error) {
    logger.error('Error fetching projects:', error);
    return [];
  }
}

/**
 * Get a single project by ID
 */
async function getProjectById(projectId: string): Promise<Project | null> {
  try {
    const response = await apiFetch(API_ROUTES.PROJECTS.BY_ID(projectId));

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new ApplicationError(
        ErrorCode.API_INVALID_RESPONSE,
        `Failed to fetch project: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    logger.error('Error fetching project:', error);
    return null;
  }
}

/**
 * Create a new project
 */
async function createProject(projectData: Partial<Project>): Promise<Project> {
  const response = await apiFetch(API_ROUTES.PROJECTS.CREATE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    throw new ApplicationError(
      ErrorCode.API_INVALID_RESPONSE,
      `Failed to create project: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Update an existing project
 */
async function updateProject(
  project: Partial<Project> & { id: string }
): Promise<Project> {
  const response = await apiFetch(API_ROUTES.PROJECTS.UPDATE(project.id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });

  if (!response.ok) {
    throw new ApplicationError(
      ErrorCode.API_INVALID_RESPONSE,
      `Failed to update project: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Delete a project by ID
 */
async function deleteProject(projectId: string): Promise<void> {
  await apiFetch(API_ROUTES.PROJECTS.DELETE(projectId), { method: 'DELETE' });
}

/**
 * Set the active project preference
 */
async function setActiveProject(projectId: string | null): Promise<void> {
  if (projectId) {
    await apiFetch(API_ROUTES.USER.PREFERENCES.ACTIVE_PROJECT, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    });
  } else {
    await apiFetch(API_ROUTES.USER.PREFERENCES.ACTIVE_PROJECT, {
      method: 'DELETE',
    });
  }
}

/**
 * Get the active project preference
 */
async function getActiveProject(): Promise<string | null> {
  try {
    const response = await apiFetch(API_ROUTES.USER.PREFERENCES.ACTIVE_PROJECT);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new ApplicationError(
        ErrorCode.API_INVALID_RESPONSE,
        `Failed to fetch active project: ${response.statusText}`
      );
    }

    const data = (await response.json()) as { projectId: string | null };
    return data.projectId;
  } catch (error) {
    logger.error('Error fetching active project:', error);
    return null;
  }
}

/**
 * Set the active document preference
 */
async function setActiveDocument(
  documentId: string | null,
  documentType: 'application' | 'figures' = 'application'
): Promise<void> {
  await apiFetch(API_ROUTES.USER.PREFERENCES.ACTIVE_DOCUMENT, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, documentType }),
  });
}

/**
 * Get the active document preference
 */
async function getActiveDocument(): Promise<{
  documentId: string | null;
  documentType: 'application' | 'figures';
} | null> {
  try {
    const response = await apiFetch(
      API_ROUTES.USER.PREFERENCES.ACTIVE_DOCUMENT
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new ApplicationError(
        ErrorCode.API_INVALID_RESPONSE,
        `Failed to fetch active document: ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    logger.error('Error fetching active document:', error);
    return null;
  }
}

/**
 * Get the latest version of a project
 */
async function getLatestProjectVersion(
  projectId: string
): Promise<ApplicationVersionWithDocuments | null> {
  try {
    const url = buildApiUrl(API_ROUTES.PROJECTS.VERSIONS.LIST(projectId), {
      latest: true,
    });
    const response = await apiFetch(url);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new ApplicationError(
        ErrorCode.API_INVALID_RESPONSE,
        `Failed to fetch latest version: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Error fetching latest project version:', error);
    return null;
  }
}

/**
 * Get a specific project version
 */
async function getProjectVersion(
  projectId: string,
  versionId: string
): Promise<ApplicationVersionWithDocuments | null> {
  try {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.VERSIONS.BY_ID(projectId, versionId)
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new ApplicationError(
        ErrorCode.API_INVALID_RESPONSE,
        `Failed to fetch version: ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    logger.error('Error fetching project version:', error);
    return null;
  }
}

/**
 * Get all versions of a project
 */
async function getProjectVersions(
  projectId: string
): Promise<ApplicationVersionBasic[]> {
  try {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.VERSIONS.LIST(projectId)
    );

    if (!response.ok) {
      throw new ApplicationError(
        ErrorCode.API_INVALID_RESPONSE,
        `Failed to fetch versions: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    logger.error('Error fetching project versions:', error);
    return [];
  }
}

/**
 * Create a new project version
 */
async function createProjectVersion(
  projectId: string,
  versionData: CreateVersionData
): Promise<ApplicationVersionWithDocuments> {
  const response = await apiFetch(
    API_ROUTES.PROJECTS.VERSIONS.CREATE(projectId),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(versionData),
    }
  );

  if (!response.ok) {
    throw new ApplicationError(
      ErrorCode.API_INVALID_RESPONSE,
      `Failed to create version: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Update a project version
 */
async function updateProjectVersion(
  projectId: string,
  versionId: string,
  updates: Partial<ApplicationVersionWithDocuments>
): Promise<ApplicationVersionWithDocuments> {
  const response = await apiFetch(
    API_ROUTES.PROJECTS.VERSIONS.BY_ID(projectId, versionId),
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }
  );

  if (!response.ok) {
    throw new ApplicationError(
      ErrorCode.API_INVALID_RESPONSE,
      `Failed to update version: ${response.statusText}`
    );
  }

  return response.json();
}

// Export the API client
export const projectsApi = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  setActiveProject,
  getActiveProject,
  setActiveDocument,
  getActiveDocument,
  getLatestProjectVersion,
  getProjectVersion,
  getProjectVersions,
  createProjectVersion,
  updateProjectVersion,
};
