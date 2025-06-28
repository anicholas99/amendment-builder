import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { AppSession } from '@/lib/auth/getSession';

export class AuthApiService {
  static async getSession(): Promise<AppSession | null> {
    const response = await apiFetch(API_ROUTES.AUTH.SESSION);
    if (response.ok) {
      return response.json();
    }
    if (response.status === 401) {
      return null;
    }
    throw new Error(`Session fetch failed: ${response.status}`);
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
}
