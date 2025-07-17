import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES, buildApiUrl } from '@/constants/apiRoutes';
import {
  ProjectData,
  CreateProjectData,
  UpdateProjectData,
  transformProject,
} from '@/types/project';
import {
  ProjectsListResponseSchema,
  ProjectsListResponse,
  ProjectResponseSchema,
  ProjectVersionsResponseSchema,
  ProjectVersionsResponse,
  ProjectDataResponse,
  AddSavedPriorArtResponse,
  PriorArtAnalysisResponse,
} from '@/types/api/responses';
import { validateApiResponse } from '@/lib/validation/apiValidation';
import { ClaimSyncData } from '@/types/api/claim-elements';
import { PriorArtDataToSave } from '@/types/domain/priorArt';
import { ClaimData } from '@/types/claimTypes';

// Extended request options for cache control
interface ExtendedRequestInit extends RequestInit {
  skipCache?: boolean;
}

const PROJECTS_PAGE_SIZE = 20;

export interface ProjectsQueryParams {
  pageParam?: unknown;
  search?: string;
  filterBy?: 'all' | 'recent' | 'complete' | 'in-progress' | 'draft';
  sortBy?: 'name' | 'created' | 'modified' | 'recent';
  sortOrder?: 'asc' | 'desc';
}

export const ProjectApiService = {
  async getProjects({
    pageParam = 1,
    search,
    filterBy = 'all',
    sortBy = 'modified',
    sortOrder = 'desc',
  }: ProjectsQueryParams): Promise<ProjectsListResponse> {
    const page = typeof pageParam === 'number' ? pageParam : 1;
    const url = buildApiUrl(API_ROUTES.PROJECTS.LIST, {
      page,
      limit: PROJECTS_PAGE_SIZE,
      ...(search && { search }),
      filterBy,
      sortBy,
      sortOrder,
    });
    const response = await apiFetch(url);
    const json = await response.json();
    return validateApiResponse(json, ProjectsListResponseSchema);
  },

  async getProject(projectId: string): Promise<ProjectData> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    const response = await apiFetch(API_ROUTES.PROJECTS.BY_ID(projectId));
    const json = await response.json();
    const validated = validateApiResponse(json, ProjectResponseSchema);
    return transformProject(validated);
  },

  async createProject(data: CreateProjectData): Promise<ProjectDataResponse> {
    const response = await apiFetch(API_ROUTES.PROJECTS.CREATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const json = (await response.json()) as unknown;
    return validateApiResponse(json, ProjectResponseSchema);
  },

  async deleteProject(projectId: string): Promise<null | { success: boolean }> {
    const response = await apiFetch(API_ROUTES.PROJECTS.DELETE(projectId), {
      method: 'DELETE',
    });
    if (response.status === 204) {
      return null;
    }
    const json = (await response.json()) as { success: boolean };
    return json;
  },

  async updateProject(
    projectId: string,
    data: UpdateProjectData
  ): Promise<ProjectDataResponse> {
    const response = await apiFetch(API_ROUTES.PROJECTS.UPDATE(projectId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const json = (await response.json()) as unknown;
    return validateApiResponse(json, ProjectResponseSchema);
  },

  async setActiveProject(
    projectId: string
  ): Promise<{ success: boolean; activeProjectId: string }> {
    const response = await apiFetch(API_ROUTES.PROJECTS.ACTIVE, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activeProjectId: projectId }),
    });
    const json = (await response.json()) as {
      success: boolean;
      activeProjectId: string;
    };
    return json;
  },

  async clearActiveProject(): Promise<{ success: boolean }> {
    const response = await apiFetch(API_ROUTES.PROJECTS.ACTIVE, {
      method: 'DELETE',
    });
    const json = (await response.json()) as { success: boolean };
    return json;
  },

  async saveFullContent(
    projectId: string,
    payload: { content: string; type?: string }
  ): Promise<{ success: boolean; documentId?: string }> {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.FULL_CONTENT(projectId),
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    const json = (await response.json()) as {
      success: boolean;
      documentId?: string;
    };
    return json;
  },

  async processInvention(
    projectId: string,
    text: string,
    uploadedFigures?: Array<{
      id: string;
      assignedNumber: string;
      url: string;
      fileName: string;
    }>
  ): Promise<{ success: boolean; inventionId?: string }> {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.PROCESS_INVENTION(projectId),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textInput: text,
          uploadedFigures,
        }),
      }
    );
    const json = (await response.json()) as {
      success: boolean;
      inventionId?: string;
    };
    return json;
  },

  async generatePatent(
    projectId: string,
    versionName?: string,
    selectedRefs?: string[]
  ): Promise<{ success: boolean; versionId?: string; documentId?: string }> {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.VERSIONS.GENERATE_PATENT(projectId),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionName, selectedRefs }),
      }
    );
    const json = (await response.json()) as {
      success: boolean;
      versionId?: string;
      documentId?: string;
    };
    return json;
  },

  async createVersion(
    projectId: string,
    payload: { name: string; sections?: Record<string, string> }
  ): Promise<{
    id: string;
    name: string;
    createdAt: string;
    projectId: string;
    userId: string;
  }> {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.VERSIONS.CREATE(projectId),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    const json = (await response.json()) as {
      id: string;
      name: string;
      createdAt: string;
      projectId: string;
      userId: string;
    };
    return json;
  },

  async updateDocument(
    projectId: string,
    versionId: string,
    payload: { documentId: string; content: string; type: string }
  ): Promise<{ success: boolean; documentId: string }> {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.VERSIONS.DOCUMENT(projectId, versionId),
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    const json = (await response.json()) as {
      success: boolean;
      documentId: string;
    };
    return json;
  },

  async updatePatentSection(
    projectId: string,
    versionId: string,
    sectionType: string,
    content: string
  ): Promise<{ success: boolean; documentId: string }> {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.VERSIONS.DOCUMENTS(projectId, versionId),
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: sectionType,
          content,
        }),
      }
    );
    const json = (await response.json()) as {
      success: boolean;
      documentId: string;
    };
    return json;
  },

  async getLatestVersion(projectId: string): Promise<{
    id: string;
    name: string | null;
    createdAt: string;
    projectId: string;
    userId: string;
  } | null> {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.VERSIONS.LATEST(projectId)
    );
    if (!response.ok && response.status === 404) {
      return null;
    }
    const json = (await response.json()) as {
      id: string;
      name: string | null;
      createdAt: string;
      projectId: string;
      userId: string;
    };
    return json;
  },

  async getVersion(
    projectId: string,
    versionId: string
  ): Promise<{
    id: string;
    name: string | null;
    createdAt: string;
    projectId: string;
    userId: string;
  }> {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.VERSIONS.BY_ID(projectId, versionId)
    );
    const json = (await response.json()) as {
      id: string;
      name: string | null;
      createdAt: string;
      projectId: string;
      userId: string;
    };
    return json;
  },

  async deleteVersion(
    projectId: string,
    versionId: string
  ): Promise<{ success: boolean }> {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.VERSIONS.BY_ID(projectId, versionId),
      {
        method: 'DELETE',
      }
    );
    if (response.status === 204) {
      return { success: true };
    }
    const json = (await response.json()) as { success: boolean };
    return json;
  },

  async resetApplicationVersions(
    projectId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.VERSIONS.RESET(projectId),
      {
        method: 'POST',
      }
    );
    const json = (await response.json()) as {
      success: boolean;
      message: string;
    };
    return json;
  },

  async getProjectVersions(
    projectId: string
  ): Promise<ProjectVersionsResponse> {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.VERSIONS.LIST(projectId)
    );
    const json = await response.json();
    return validateApiResponse(json, ProjectVersionsResponseSchema);
  },

  async getDocumentContent(
    projectId: string,
    versionId: string,
    type: 'patent'
  ): Promise<{ content: string; type: string } | null> {
    const url = buildApiUrl(
      API_ROUTES.PROJECTS.VERSIONS.DOCUMENT(projectId, versionId),
      { type }
    );
    const response = await apiFetch(url);
    if (!response.ok) return null;
    const json = (await response.json()) as { content: string; type: string };
    return json;
  },

  // Claim-related methods
  async getClaims(projectId: string): Promise<ClaimData[]> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Add cache-busting timestamp to ensure fresh data
    const cacheBuster = Date.now();
    const url = `${API_ROUTES.PROJECTS.CLAIMS.LIST(projectId)}?_t=${cacheBuster}`;

    // Bypass RequestManager cache to ensure we always fetch the latest claim data
    const response = await apiFetch(url, {
      skipCache: true,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    } as ExtendedRequestInit);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch claims: ${response.status} ${response.statusText}`
      );
    }

    const json = await response.json();

    // Handle standardized API response format
    if (json.success && json.data) {
      return json.data.claims || [];
    }

    // Fallback for non-standardized response (backward compatibility)
    if (json.claims && Array.isArray(json.claims)) {
      return json.claims;
    }

    return [];
  },

  async patchClaim(claimId: string, text: string): Promise<ClaimData> {
    if (!claimId) {
      throw new Error('Claim ID is required');
    }
    // Using the generic claim details endpoint for patching
    const response = await apiFetch(API_ROUTES.CLAIMS.DETAILS(claimId), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    const json = (await response.json()) as ClaimData;
    return json;
  },

  async addClaim(
    projectId: string,
    newClaim: { number: number; text: string }
  ): Promise<{ claims: ClaimData[] }> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    // API expects payload shape: { claims: [ { number, text } ] }
    const response = await apiFetch(
      API_ROUTES.PROJECTS.CLAIMS.LIST(projectId),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ claims: [newClaim] }),
      }
    );
    const json = await response.json();

    // Handle standardized API response format
    if (json.success && json.data) {
      return { claims: json.data.claims || [] };
    }

    // Fallback for non-standardized response (backward compatibility)
    if (json.claims && Array.isArray(json.claims)) {
      return { claims: json.claims };
    }

    return { claims: [] };
  },

  // Claim sync methods
  async getClaimSync(projectId: string): Promise<ClaimSyncData> {
    const response = await apiFetch(API_ROUTES.PROJECTS.CLAIM_SYNC(projectId), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to get claim sync data: ${text}`);
    }

    const json = await response.json();

    // Handle standardized API response format
    if (json.success && json.data) {
      return json.data;
    }

    // Fallback for non-standardized response (backward compatibility)
    return json;
  },

  /**
   * Save claim sync data to the backend.
   *
   * @param projectId - The project ID
   * @param data - The sync data containing parsedElements (string array), searchQueries, and lastSyncedClaim
   * @returns Promise with the API response
   */
  async saveClaimSync(
    projectId: string,
    data: {
      parsedElements: string[]; // V2 format (strings only)
      searchQueries: string[];
      lastSyncedClaim: string;
    }
  ): Promise<{ success: boolean }> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    const response = await apiFetch(API_ROUTES.PROJECTS.CLAIM_SYNC(projectId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const json = (await response.json()) as { success: boolean };
    return json;
  },

  // Prior art methods
  async savePriorArt(
    projectId: string,
    reference: PriorArtDataToSave
  ): Promise<AddSavedPriorArtResponse> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    const response = await apiFetch(
      API_ROUTES.PROJECTS.PRIOR_ART.CREATE(projectId),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reference),
      }
    );
    const json = (await response.json()) as AddSavedPriorArtResponse;
    return json;
  },

  async removePriorArt(
    projectId: string,
    priorArtId: string
  ): Promise<{ success: boolean }> {
    if (!projectId || !priorArtId) {
      throw new Error('Project ID and Prior Art ID are required');
    }
    const response = await apiFetch(
      API_ROUTES.PROJECTS.PRIOR_ART.BY_ID(projectId, priorArtId),
      {
        method: 'DELETE',
      }
    );
    if (response.status === 204) {
      return { success: true };
    }
    const json = (await response.json()) as { success: boolean };
    return json;
  },

  async analyzePriorArt(
    projectId: string,
    searchHistoryId: string,
    selectedReferenceNumbers: string[],
    forceRefresh: boolean,
    claim1Text: string
  ): Promise<PriorArtAnalysisResponse> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    const response = await apiFetch(API_ROUTES.PRIOR_ART.ANALYZE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        searchHistoryId,
        selectedReferenceNumbers,
        forceRefresh,
        claim1Text,
      }),
    });
    const json = (await response.json()) as PriorArtAnalysisResponse;
    return json;
  },
};
