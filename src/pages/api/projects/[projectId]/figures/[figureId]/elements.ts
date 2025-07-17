import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { figureRepository } from '@/repositories/figure';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { z } from 'zod';
import { apiResponse } from '@/utils/api/responses';

const apiLogger = createApiLogger('figure-elements');

// Request body validation for adding element
const addElementSchema = z.object({
  elementKey: z.string(),
  elementName: z.string(),
  calloutDescription: z.string().optional(),
});

// Request body validation for updating callout
const updateCalloutSchema = z.object({
  elementKey: z.string(),
  calloutDescription: z.string(),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { projectId, figureId } = req.query;

  if (!projectId || typeof projectId !== 'string') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_REQUIRED_FIELD,
      'Project ID is required'
    );
  }

  if (!figureId || typeof figureId !== 'string') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_REQUIRED_FIELD,
      'Figure ID is required'
    );
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, figureId);
    case 'POST':
      return handlePost(req, res, figureId, projectId);
    case 'DELETE':
      return handleDelete(req, res, figureId);
    case 'PATCH':
      return handlePatch(req, res, figureId);
    default:
      return apiResponse.methodNotAllowed(res, [
        'GET',
        'POST',
        'DELETE',
        'PATCH',
      ]);
  }
}

async function handleGet(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  figureId: string
) {
  try {
    apiLogger.info('Fetching elements for figure', { figureId });

    const elements = await figureRepository.getElementsForFigure(figureId);

    apiLogger.info('Successfully fetched elements for figure', {
      figureId,
      elementCount: elements.length,
    });

    return apiResponse.ok(res, { elements });
  } catch (error) {
    apiLogger.error('Failed to fetch elements for figure', { error, figureId });
    throw error;
  }
}

async function handlePost(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  figureId: string,
  projectId: string
) {
  try {
    const body = addElementSchema.parse(req.body);

    apiLogger.info('Adding element to figure', {
      figureId,
      projectId,
      elementKey: body.elementKey,
    });

    const result = await figureRepository.addElementToFigure(
      figureId,
      projectId,
      body
    );

    apiLogger.info('Successfully added element to figure', {
      figureId,
      elementKey: body.elementKey,
    });

    return apiResponse.created(res, { success: true, result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: error.errors,
      });
    }
    apiLogger.error('Failed to add element to figure', { error, figureId });
    throw error;
  }
}

async function handleDelete(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  figureId: string
) {
  try {
    const { elementKey } = req.query;

    if (!elementKey || typeof elementKey !== 'string') {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Element key is required'
      );
    }

    apiLogger.info('Removing element from figure', {
      figureId,
      elementKey,
    });

    await figureRepository.removeElementFromFigure(figureId, elementKey);

    apiLogger.info('Successfully removed element from figure', {
      figureId,
      elementKey,
    });

    return apiResponse.ok(res, { success: true });
  } catch (error) {
    apiLogger.error('Failed to remove element from figure', {
      error,
      figureId,
    });
    throw error;
  }
}

async function handlePatch(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  figureId: string
) {
  try {
    const body = updateCalloutSchema.parse(req.body);

    apiLogger.info('Updating element callout', {
      figureId,
      elementKey: body.elementKey,
    });

    const result = await figureRepository.updateElementCallout(
      figureId,
      body.elementKey,
      body.calloutDescription
    );

    apiLogger.info('Successfully updated element callout', {
      figureId,
      elementKey: body.elementKey,
    });

    return apiResponse.ok(res, { success: true, result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: error.errors,
      });
    }
    apiLogger.error('Failed to update element callout', { error, figureId });
    throw error;
  }
}

// SECURITY: This endpoint is tenant-protected using project-based resolution
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    rateLimit: 'api',
  }
);
