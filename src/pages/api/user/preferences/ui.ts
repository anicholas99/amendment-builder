import { NextApiResponse } from 'next';
import { z } from 'zod';
import { CustomApiRequest } from '@/types/api';
import { logger } from '@/server/logger';
import { AuthenticatedRequest } from '@/types/middleware';
import {
  getUserPreference,
  setUserPreference,
  deleteUserPreference,
} from '@/repositories/userPreferenceRepository';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { SecurePresets } from '@/server/api/securePresets';
import { UI_PREFERENCE_KEYS } from '@/constants/uiPreferences';

// Define valid preference value types
const PreferenceValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z
    .object({
      width: z.number().optional(),
      height: z.number().optional(),
      scale: z.number().optional(),
      zoom: z.number().optional(),
      enabled: z.boolean().optional(),
    })
    .passthrough(), // Allow additional properties for future extensibility
]);

// Validation schema for preferences
const uiPreferenceSchema = z.object({
  preferences: z.record(z.string(), PreferenceValueSchema).refine(
    prefs => {
      // Validate each preference key is valid
      const validKeys = Object.values(UI_PREFERENCE_KEYS) as string[];
      return Object.keys(prefs).every(key => validKeys.includes(key));
    },
    { message: 'Invalid preference key' }
  ),
});

// Type for the request body
interface UIPreferencesBody {
  preferences: Record<string, string | number | boolean | Record<string, any>>;
}

const baseHandler = async (
  req: CustomApiRequest<UIPreferencesBody> & AuthenticatedRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method } = req;
  const { id: userId } = req.user!;

  switch (method) {
    case 'GET': {
      try {
        // Get all UI preferences for the user
        const preferences: Record<string, any> = {};

        // Fetch all UI preference keys
        for (const key of Object.values(UI_PREFERENCE_KEYS)) {
          const value = await getUserPreference(userId, key);
          if (value !== null) {
            try {
              // Try to parse as JSON first (for complex values)
              preferences[key] = JSON.parse(value);
            } catch {
              // If not JSON, use as string
              preferences[key] = value;
            }
          }
        }

        return res.status(200).json({
          success: true,
          data: { preferences },
        });
      } catch (error) {
        logger.error('Failed to fetch UI preferences', { error, userId });
        throw new ApplicationError(
          ErrorCode.INTERNAL_ERROR,
          'Failed to fetch UI preferences'
        );
      }
    }

    case 'PUT':
    case 'PATCH': {
      // Body is already validated by middleware
      const { preferences } = req.body;

      try {
        const results: Record<string, boolean> = {};

        // Set each preference
        for (const [key, value] of Object.entries(preferences)) {
          // Store complex values as JSON strings
          const valueToStore =
            typeof value === 'object' ? JSON.stringify(value) : String(value);

          const success = await setUserPreference(userId, key, valueToStore);
          results[key] = success;
        }

        // Check if any preferences failed to save
        const failedKeys = Object.entries(results)
          .filter(([_, success]) => !success)
          .map(([key]) => key);

        if (failedKeys.length > 0) {
          logger.warn('Some UI preferences failed to save', {
            userId,
            failedKeys,
          });
          return res.status(207).json({
            success: false,
            data: {
              message: 'Some preferences failed to save',
              failedKeys,
              results,
            },
          });
        }

        return res.status(200).json({
          success: true,
          data: {
            message: 'UI preferences updated successfully',
          },
        });
      } catch (error) {
        logger.error('Failed to update UI preferences', { error, userId });
        throw new ApplicationError(
          ErrorCode.INTERNAL_ERROR,
          'Failed to update UI preferences'
        );
      }
    }

    case 'DELETE': {
      try {
        // Delete all UI preferences
        const results: Record<string, boolean> = {};

        for (const key of Object.values(UI_PREFERENCE_KEYS)) {
          const success = await deleteUserPreference(userId, key);
          results[key] = success;
        }

        return res.status(200).json({
          success: true,
          data: {
            message: 'UI preferences cleared successfully',
            results,
          },
        });
      } catch (error) {
        logger.error('Failed to delete UI preferences', { error, userId });
        throw new ApplicationError(
          ErrorCode.INTERNAL_ERROR,
          'Failed to delete UI preferences'
        );
      }
    }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'PATCH', 'DELETE']);
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        `Method ${method} Not Allowed`
      );
  }
};

// Export the handler with security presets
// UI preferences are user-specific, not tenant-specific
export default SecurePresets.userPrivate(baseHandler, {
  validate: {
    body: uiPreferenceSchema,
    bodyMethods: ['PUT', 'PATCH'],
  },
  rateLimit: 'api',
});
