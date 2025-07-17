import { apiFetch } from '@/lib/api/apiClient';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/utils/clientLogger';
import { z } from 'zod';

// Re-export preference keys for use in components
export { UI_PREFERENCE_KEYS } from '@/constants/uiPreferences';

// Response schemas
const UIPreferencesResponseSchema = z.object({
  preferences: z.record(z.string(), z.unknown()),
});

const UIPreferencesUpdateResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  failedKeys: z.array(z.string()).optional(),
  results: z.record(z.string(), z.boolean()).optional(),
});

// Service class
export class UIPreferencesService {
  /**
   * Get all UI preferences for the current user
   */
  static async getPreferences(): Promise<Record<string, unknown>> {
    try {
      const response = await apiFetch(API_ROUTES.USER.PREFERENCES.UI);

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to fetch UI preferences: ${response.statusText}`
        );
      }

      const data = await response.json();
      const validated = UIPreferencesResponseSchema.parse(data);

      return validated.preferences;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to fetch UI preferences', { error });
      }

      // Return empty object on error to allow graceful degradation
      return {};
    }
  }

  /**
   * Update UI preferences for the current user
   * @param preferences Object containing preference key-value pairs to update
   */
  static async updatePreferences(
    preferences: Record<string, unknown>
  ): Promise<boolean> {
    try {
      const response = await apiFetch(API_ROUTES.USER.PREFERENCES.UI, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences }),
      });

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to update UI preferences: ${response.statusText}`
        );
      }

      const data = await response.json();
      const validated = UIPreferencesUpdateResponseSchema.parse(data);

      if (!validated.success && validated.failedKeys?.length) {
        if (process.env.NODE_ENV === 'development') {
          logger.warn('Some UI preferences failed to save', {
            failedKeys: validated.failedKeys,
          });
        }
      }

      return validated.success;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to update UI preferences', { error });
      }
      return false;
    }
  }

  /**
   * Update a single UI preference
   * @param key The preference key
   * @param value The preference value
   */
  static async updatePreference(key: string, value: unknown): Promise<boolean> {
    return this.updatePreferences({ [key]: value });
  }

  /**
   * Clear all UI preferences for the current user
   */
  static async clearPreferences(): Promise<boolean> {
    try {
      const response = await apiFetch(API_ROUTES.USER.PREFERENCES.UI, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new ApplicationError(
          ErrorCode.API_INVALID_RESPONSE,
          `Failed to clear UI preferences: ${response.statusText}`
        );
      }

      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to clear UI preferences', { error });
      }
      return false;
    }
  }
}
