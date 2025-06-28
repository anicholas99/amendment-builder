import { NextApiResponse, NextApiRequest } from 'next';
import { CustomApiRequest } from '@/types/api';
import { AuthenticatedRequest } from '@/types/middleware';
import { z, ZodError } from 'zod';
import { logger } from '@/lib/monitoring/logger';
import {
  projectIdQuerySchema,
  exclusionQuerySchema,
} from '@/lib/validation/schemas/shared/querySchemas';

import { ApplicationError, ErrorCode } from '@/lib/error';
import { safeJsonParse } from '@/utils/json-utils';
import {
  addProjectExclusions,
  findProjectExclusions,
  findProjectExclusionsMinimal,
  removeProjectExclusion,
  removeProjectExclusionById,
  getProjectTenantId,
} from '../../../../repositories/project';
import { ProjectExclusionMetadata } from '../../../../repositories/project/types';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

/**
 * API endpoint for managing patent exclusions for a project
 *
 * GET: Retrieve all exclusions for a project
 * POST: Add new exclusions (array of patent numbers)
 * DELETE: Remove a specific exclusion
 */

// Validation schema for request bodies
const requestSchema = z
  .object({
    // POST request fields
    patentNumbers: z.array(z.string()).optional(),
    patentNumber: z.string().optional(),
    // Metadata can be a string (JSON) or object with patent metadata fields
    metadata: z
      .union([
        z.string(), // JSON string
        z.record(z.unknown()), // Object with any fields
      ])
      .optional(),

    // DELETE request fields
    exclusionId: z.string().optional(),
  })
  .refine(
    data => {
      // For POST: require either patentNumbers or patentNumber
      // For DELETE: require either exclusionId or patentNumber
      return data.patentNumbers || data.patentNumber || data.exclusionId;
    },
    {
      message: 'Must provide patentNumbers, patentNumber, or exclusionId',
    }
  );

interface ExclusionsBody {
  patentNumbers?: string[];
  patentNumber?: string;
  metadata?: string | Record<string, unknown>;
  exclusionId?: string;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<void> {
  // Extract projectId from the URL
  const { projectId } = req.query as unknown as z.infer<
    typeof projectIdQuerySchema
  >;

  if (!projectId || typeof projectId !== 'string') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_REQUIRED_FIELD,
      'Project ID is required'
    );
  }

  // Handle different HTTP methods
  if (req.method === 'GET') {
    // Fetch exclusions - use optimized minimal query for better performance
    const exclusions = await findProjectExclusionsMinimal(projectId);

    // Transform to match expected API response format
    const transformedExclusions = exclusions.map(exc => ({
      id: exc.id,
      projectId: projectId,
      patentNumber: exc.excludedPatentNumber,
      createdAt: exc.createdAt.toISOString(),
      updatedAt: exc.createdAt.toISOString(), // Using createdAt since we don't fetch updatedAt
    }));

    res.status(200).json({
      exclusions: transformedExclusions,
      projectId,
    });
  } else if (req.method === 'POST') {
    // Add new exclusions - body is already validated by middleware
    const { patentNumbers, patentNumber, metadata } =
      req.body as ExclusionsBody;

    logger.info('Exclusions POST request body:', {
      body: req.body,
      patentNumbers,
      patentNumber,
      metadata,
      contentType: req.headers['content-type'],
    });

    let patentNumbersToAdd: string[] = [];
    let metadataMap: Record<string, ProjectExclusionMetadata> = {};

    // Parse the metadata if provided
    if (metadata && typeof metadata === 'object') {
      metadataMap = metadata as Record<string, ProjectExclusionMetadata>;
    } else if (metadata && typeof metadata === 'string') {
      const parsed =
        safeJsonParse<Record<string, ProjectExclusionMetadata>>(metadata);
      if (parsed === undefined) {
        throw new ApplicationError(
          ErrorCode.VALIDATION_FAILED,
          'Invalid JSON format in metadata field'
        );
      }
      metadataMap = parsed;
    }

    if (patentNumbers) {
      if (Array.isArray(patentNumbers)) {
        patentNumbersToAdd = patentNumbers.filter(Boolean);
      } else if (typeof patentNumbers === 'string') {
        patentNumbersToAdd = [patentNumbers];
      }
    } else if (patentNumber && typeof patentNumber === 'string') {
      patentNumbersToAdd = [patentNumber];
    }

    patentNumbersToAdd = patentNumbersToAdd.filter(
      pn => typeof pn === 'string' && pn.trim() !== ''
    );

    if (patentNumbersToAdd.length === 0) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        'Request must include a valid patentNumber string or a non-empty patentNumbers array'
      );
    }

    logger.debug('API Handler: Calling addProjectExclusions with:', {
      projectId,
      patentNumbersToAdd,
      metadataMap,
    });

    const result = await addProjectExclusions(
      projectId,
      patentNumbersToAdd,
      metadataMap
    );

    logger.debug('API Handler: Result from addProjectExclusions:', result);
    const responseJson = {
      message: `Added ${result.added} exclusions, skipped ${result.skipped}.`,
      added: result.added,
      skipped: result.skipped,
    };
    logger.debug('API Handler: Sending response:', responseJson);

    return res.status(201).json(responseJson);
  } else if (req.method === 'DELETE') {
    // Remove an exclusion - body is already validated by middleware
    // We can support either query param or body
    const exclusionId =
      (req.query.exclusionId as string) ||
      (req.body as ExclusionsBody).exclusionId;
    const patentNumber =
      (req.query.patentNumber as string) ||
      (req.body as ExclusionsBody).patentNumber;

    if (!exclusionId && !patentNumber) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        'Either exclusionId or patentNumber must be provided'
      );
    }

    let success = false;

    if (exclusionId) {
      // Delete by ID using repository function
      success = await removeProjectExclusionById(projectId, exclusionId);
    } else if (patentNumber) {
      // Delete by patent number using repository function
      success = await removeProjectExclusion(projectId, patentNumber);
    }

    if (!success) {
      logger.warn(
        `Exclusion not found for projectId=${projectId}, exclusionId=${exclusionId}, patentNumber=${patentNumber}`
      );
    }

    return res.status(200).json({
      message: 'Exclusion removal processed successfully',
      success: success,
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      `Method ${req.method} Not Allowed`
    );
  }
}

// SECURITY: This endpoint is tenant-protected using project-based resolution
// Users can only manage exclusions for projects within their own tenant
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: projectIdQuerySchema,
      body: requestSchema,
      bodyMethods: ['POST', 'DELETE'], // Both POST and DELETE need body validation
    },
    rateLimit: 'api',
  }
);
