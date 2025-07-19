import type { NextApiResponse } from 'next';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { SecurePresets } from '@/server/api/securePresets';
import { AuthenticatedRequest } from '@/types/middleware';
import { apiResponse } from '@/utils/api/responses';
import { environment } from '@/config/environment';

const apiLogger = createApiLogger('uspto-test-config');

/**
 * USPTO Configuration Test Endpoint
 * Tests if USPTO API configuration is properly loaded
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  apiLogger.logRequest(req);

  if (req.method !== 'GET') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      `Method ${req.method} not allowed`
    );
  }

  try {
    // Check USPTO configuration
    const usptoConfig = {
      hasApiKey: !!environment.uspto?.apiKey,
      apiKeyLength: environment.uspto?.apiKey?.length || 0,
      apiUrl: environment.uspto?.apiUrl || 'not set',
      
      // Check raw environment variable
      rawEnvHasKey: !!process.env.USPTO_ODP_API_KEY,
      rawEnvKeyLength: process.env.USPTO_ODP_API_KEY?.length || 0,
      
      // Check other related configs
      nodeEnv: process.env.NODE_ENV,
      hasAuth0Secret: !!process.env.AUTH0_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    };

    apiLogger.info('USPTO configuration check', usptoConfig);

    return apiResponse.ok(res, {
      success: true,
      data: usptoConfig,
    });
  } catch (error) {
    apiLogger.errorSafe('Failed to check USPTO configuration', error as Error);
    throw error;
  }
}

// SECURITY: This endpoint requires authentication
export default SecurePresets.userPrivate(handler, {
  rateLimit: 'api',
});