import { apiFetch, clearApiCacheForUrl } from '@/lib/api/apiClient';
import { ProjectWorkspace } from '@/types/projectWorkspace';
import { API_ROUTES } from '@/constants/apiRoutes';

export const ProjectWorkspaceApiService = {
  /**
   * Fetches the entire project workspace.
   * @param projectId The ID of the project.
   */
  async getWorkspace(projectId: string): Promise<ProjectWorkspace> {
    const res = await apiFetch(API_ROUTES.PROJECTS.WORKSPACE(projectId));
    // The response is expected to be in the format { success: true, data: ProjectWorkspace }
    const responseJson = await res.json();
    return responseJson.data;
  },

  /**
   * Invalidates the workspace cache for a specific project.
   * Call this after any mutation to workspace data.
   * @param projectId The ID of the project.
   */
  invalidateWorkspaceCache(projectId: string): void {
    clearApiCacheForUrl(API_ROUTES.PROJECTS.WORKSPACE(projectId));
  },
};
