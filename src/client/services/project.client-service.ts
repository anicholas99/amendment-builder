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
} from '@/types/api/responses';
import { validateApiResponse } from '@/lib/validation/apiValidation';
import { ClaimSyncData } from '@/types/api/claim-elements';

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

  async createProject(data: CreateProjectData) {
    const response = await apiFetch(API_ROUTES.PROJECTS.CREATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteProject(projectId: string) {
    const response = await apiFetch(API_ROUTES.PROJECTS.DELETE(projectId), {
      method: 'DELETE',
    });
    if (response.status === 204) {
      return null;
    }
    return response.json();
  },

  async updateProject(projectId: string, data: UpdateProjectData) {
    const response = await apiFetch(API_ROUTES.PROJECTS.UPDATE(projectId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async setActiveProject(projectId: string) {
    const response = await apiFetch(API_ROUTES.PROJECTS.ACTIVE, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activeProjectId: projectId }),
    });
    return response.json();
  },

  async clearActiveProject() {
    const response = await apiFetch(API_ROUTES.PROJECTS.ACTIVE, {
      method: 'DELETE',
    });
    return response.json();
  },

  async saveFullContent(
    projectId: string,
    payload: { content: string; type?: string }
  ) {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.FULL_CONTENT(projectId),
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    return response.json();
  },

  async processInvention(projectId: string, text: string) {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.PROCESS_INVENTION(projectId),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textInput: text }),
      }
    );
    return response.json();
  },

  async generatePatent(
    projectId: string,
    versionName?: string,
    selectedRefs?: string[]
  ) {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.VERSIONS.GENERATE_PATENT(projectId),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionName, selectedRefs }),
      }
    );
    return response.json();
  },

  async createVersion(
    projectId: string,
    payload: { name: string; sections?: Record<string, string> }
  ) {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.VERSIONS.CREATE(projectId),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    return response.json();
  },

  async updateDocument(
    projectId: string,
    versionId: string,
    payload: { documentId: string; content: string; type: string }
  ) {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.VERSIONS.DOCUMENT(projectId, versionId),
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    return response.json();
  },

  async updatePatentSection(
    projectId: string,
    versionId: string,
    sectionType: string,
    content: string
  ) {
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
    return response.json();
  },

  async getLatestVersion(projectId: string) {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.VERSIONS.LATEST(projectId)
    );
    return response.json();
  },

  async getVersion(projectId: string, versionId: string) {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.VERSIONS.BY_ID(projectId, versionId)
    );
    return response.json();
  },

  async deleteVersion(projectId: string, versionId: string) {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.VERSIONS.BY_ID(projectId, versionId),
      {
        method: 'DELETE',
      }
    );
    if (response.status === 204) {
      return { success: true };
    }
    return response.json();
  },

  async resetApplicationVersions(projectId: string) {
    const response = await apiFetch(
      API_ROUTES.PROJECTS.VERSIONS.RESET(projectId),
      {
        method: 'POST',
      }
    );
    return response.json();
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
  ) {
    const url = buildApiUrl(
      API_ROUTES.PROJECTS.VERSIONS.DOCUMENT(projectId, versionId),
      { type }
    );
    const response = await apiFetch(url);
    if (!response.ok) return null;
    return response.json();
  },

  // Claim-related methods
  async getClaims(projectId: string) {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    // Bypass RequestManager cache to ensure we always fetch the latest claim data
    const response = await apiFetch(
      API_ROUTES.PROJECTS.CLAIMS.LIST(projectId),
      { skipCache: true } as any // `skipCache` is a RequestManager extension to RequestInit
    );
    const json = await response.json();
    return json.claims || [];
  },

  async patchClaim(claimId: string, text: string) {
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
    return response.json();
  },

  async addClaim(
    projectId: string,
    newClaim: { number: number; text: string }
  ) {
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
    return response.json();
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

    return response.json();
  },

  /**
   * Save claim sync data to the backend.
   * Automatically transforms parsedElements from V1 format (objects with text property)
   * to V2 format (string array) as required by the API.
   *
   * @param projectId - The project ID
   * @param data - The sync data containing parsedElements (either format), searchQueries, and lastSyncedClaim
   * @returns Promise with the API response
   */
  async saveClaimSync(
    projectId: string,
    data: {
      parsedElements: (string | { text: string })[]; // V1 format (objects) or V2 format (strings)
      searchQueries: string[];
      lastSyncedClaim: string;
    }
  ) {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Transform parsedElements to V2 format (array of strings)
    const transformedData = {
      ...data,
      parsedElements: data.parsedElements.map(element => {
        // If element is already a string, use it directly
        if (typeof element === 'string') {
          return element;
        }
        // If element is an object with a text property, extract the text
        if (element && typeof element === 'object' && 'text' in element) {
          return element.text;
        }
        // Fallback: convert to string
        return String(element);
      }),
    };

    const response = await apiFetch(API_ROUTES.PROJECTS.CLAIM_SYNC(projectId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData),
    });
    return response.json();
  },

  // Prior art methods
  async savePriorArt(projectId: string, reference: any) {
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
    return response.json();
  },

  async removePriorArt(projectId: string, priorArtId: string) {
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
    return response.json();
  },

  async analyzePriorArt(
    projectId: string,
    searchHistoryId: string,
    selectedReferenceNumbers: string[],
    forceRefresh: boolean,
    claim1Text: string
  ) {
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
    return response.json();
  },
};
