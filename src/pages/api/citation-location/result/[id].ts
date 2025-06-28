import { NextApiResponse } from 'next';
import { z } from 'zod';
import axios from 'axios';
import https from 'https';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { safeStringify } from '@/lib/monitoring/logger';
import {
  updateCitationMatchLocationSuccess,
  updateCitationMatchLocationFailure,
} from '../../../../repositories/citationRepository';
import { AuthenticatedRequest } from '@/types/middleware';
import { environment } from '@/config/environment';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

// Initialize apiLogger
const apiLogger = createApiLogger('citation-location/result/:id');

// External API endpoint for citation location results
const EXTERNAL_LOCATION_RESULT_API =
  'https://aiapi.qa.cardinal-holdings.com/semantic-search/citation/location/result';

// Create a custom HTTPS agent (reuse if defined elsewhere)
const httpsAgent = new https.Agent({
  rejectUnauthorized: environment.isProduction,
});

// Query validation schema for path parameter
const querySchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid numeric ID format'),
});

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  apiLogger.logRequest(req); // Log request start

  // The query is already validated by middleware
  const { id } = req.query;
  const externalLocationJobId = parseInt(id as string, 10);

  // Tenant security is handled by the middleware with the new fromCitationLocationJob resolver

  const apiKey = environment.aiapi.apiKey;
  if (!apiKey) {
    apiLogger.error('Configuration Error: AIAPI_API_KEY not configured', {
      externalLocationJobId,
    });
    throw new ApplicationError(
      ErrorCode.ENV_VAR_MISSING,
      'Internal configuration error: API key missing'
    );
  }

  apiLogger.info(`Fetching result from external API`, {
    externalLocationJobId,
  });

  // --- Call External API ---
  const externalApiResponse = await axios.get(
    `${EXTERNAL_LOCATION_RESULT_API}/${externalLocationJobId}`,
    {
      headers: {
        Accept: 'application/json', // Ensure we ask for JSON
        ApiKey: apiKey,
      },
      httpsAgent,
      timeout: 15000, // Add a reasonable timeout
    }
  );

  const externalData = externalApiResponse.data;
  apiLogger.debug(`External API response received`, {
    externalLocationJobId,
    status: externalApiResponse.status,
    // Use safeStringify to avoid circular references
    data: safeStringify(externalData).substring(0, 500),
  });

  // --- Handle External Response Status ---
  const externalStatus = externalData?.status; // Expected: 0 (Processing), 1 (Success), 2 (Failure)

  if (externalStatus === 1) {
    // Success
    apiLogger.info(`External job completed successfully.`, {
      externalLocationJobId,
    });
    const locationResultData = externalData.result; // The actual location data object
    if (locationResultData) {
      try {
        // Use native JSON stringify here since we're storing in database
        const locationDataString = JSON.stringify(locationResultData);
        apiLogger.info('Attempting to update CitationMatch (Success)', {
          externalLocationJobId,
        });
        await updateCitationMatchLocationSuccess(
          externalLocationJobId,
          locationDataString
        );
        apiLogger.info(
          `Successfully updated CitationMatch with COMPLETED status and results.`,
          {
            externalLocationJobId,
          }
        );
      } catch (dbError: unknown) {
        const dbErr =
          dbError instanceof Error ? dbError : new Error(String(dbError));
        apiLogger.error(
          `Failed to update CitationMatch in DB after successful external job.`,
          {
            externalLocationJobId,
            errorMessage: dbErr.message,
            errorName: dbErr.name,
          }
        );
      }
    } else {
      apiLogger.warn(
        `External job succeeded (status 1) but returned no result data.`,
        {
          externalLocationJobId,
        }
      );
      try {
        apiLogger.warn(
          'Attempting to mark CitationMatch as FAILED (Success with no data)',
          {
            externalLocationJobId,
          }
        );
        await updateCitationMatchLocationFailure(
          externalLocationJobId,
          'External job succeeded but returned no data.'
        );
      } catch (dbError: unknown) {
        const dbFailErr =
          dbError instanceof Error ? dbError : new Error(String(dbError));
        apiLogger.error(
          'Failed to update DB after success-with-no-data scenario.',
          {
            externalLocationJobId,
            errorMessage: dbFailErr.message,
            errorName: dbFailErr.name,
          }
        );
      }
    }
  } else if (externalStatus === 2) {
    // Failure
    const errorMessage = `External job failed (status code 2).`;
    apiLogger.warn(errorMessage, { externalLocationJobId });
    try {
      apiLogger.warn('Attempting to update CitationMatch (Failure)', {
        externalLocationJobId,
      });
      await updateCitationMatchLocationFailure(
        externalLocationJobId,
        errorMessage
      );
      apiLogger.info(`Successfully updated CitationMatch with FAILED status.`, {
        externalLocationJobId,
      });
    } catch (dbError: unknown) {
      const dbErr =
        dbError instanceof Error ? dbError : new Error(String(dbError));
      apiLogger.error(
        `Failed to update CitationMatch in DB after failed external job.`,
        {
          externalLocationJobId,
          errorMessage: dbErr.message,
          errorName: dbErr.name,
        }
      );
    }
  } else {
    // Processing (status 0) or Unknown status
    apiLogger.info(
      `External job is still processing or has unknown status (${externalStatus}). No DB update.`,
      { externalLocationJobId }
    );
  }

  // --- Return Original External Response ---
  apiLogger.logResponse(200, externalData);
  return res.status(200).json(externalData);
};

// Use the new secure preset
export default SecurePresets.tenantProtected(
  TenantResolvers.fromCitationLocationJob,
  handler,
  {
    validate: {
      query: querySchema,
    },
  }
);
