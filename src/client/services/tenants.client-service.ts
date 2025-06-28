import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  settings?: Record<string, unknown>;
}

export class TenantsApiService {
  static async getUserTenants(): Promise<Tenant[]> {
    const response = await apiFetch(API_ROUTES.TENANTS.USER);
    if (!response.ok) {
      throw new Error(`Failed to fetch user tenants: ${response.status}`);
    }
    const data = await response.json();
    return data.tenants || [];
  }

  static async setActiveTenant(tenantId: string): Promise<void> {
    const response = await apiFetch(API_ROUTES.TENANTS.ACTIVE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to set active tenant: ${response.status}`);
    }
  }

  static async switchTenant(tenantId: string): Promise<void> {
    const response = await apiFetch(API_ROUTES.AUTH.SWITCH_TENANT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId }),
    });

    if (!response.ok) {
      throw new Error(`Tenant switch failed: ${response.status}`);
    }
  }

  static async createProject(
    tenantSlug: string,
    projectData: any
  ): Promise<any> {
    const response = await apiFetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-slug': tenantSlug,
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create project: ${response.status}`);
    }

    return response.json();
  }
}
