/**
 * API Endpoint: Link USPTO Application to Project
 * 
 * POST /api/projects/:projectId/link-uspto
 * 
 * Links a USPTO application to a project by:
 * 1. Storing all documents in ProjectDocument table
 * 2. Downloading and OCRing essential documents only
 * 3. Making documents available for AI context
 * 
 * This uses the simplified approach with only ProjectDocument table.
 */

import { NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/types/middleware';
import { SecurePresets } from '@/middleware/securePresets';
import { TenantResolvers } from '@/middleware/tenantResolvers';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';
import { z } from 'zod';
import { USPTOLinkingService } from '@/server/services/usptoLinking.server-service';
import { prisma } from '@/lib/prisma';

// Request validation schema
const linkUSPTOSchema = z.object({
  applicationNumber: z.string()
    .min(1, 'Application number is required')
    .regex(/^\d{2}\/?\d{3},?\d{3}$|^\d{8}$/, 'Invalid USPTO application number format'),
});

type LinkUSPTORequest = z.infer<typeof linkUSPTOSchema>;

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  const { projectId } = req.query;
  const tenantId = req.tenantId!;
  const userId = req.user.id;

  if (!projectId || typeof projectId !== 'string') {
    throw new ApplicationError(
      ErrorCode.VALIDATION_REQUIRED_FIELD,
      'Project ID is required'
    );
  }

  try {
    // Validate request body
    const validatedData = linkUSPTOSchema.parse(req.body);
    const { applicationNumber } = validatedData;

    logger.info('[API] Linking USPTO application to project', {
      projectId,
      applicationNumber,
      tenantId,
      userId,
    });

    // Verify project exists and user has access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        tenantId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        patentApplication: {
          select: {
            id: true,
            applicationNumber: true,
          }
        }
      }
    });

    if (!project) {
      throw new ApplicationError(
        ErrorCode.NOT_FOUND,
        'Project not found'
      );
    }

    // Check if USPTO is already linked
    const cleanAppNumber = applicationNumber.replace(/[^0-9]/g, '');
    if (project.patentApplication?.applicationNumber === cleanAppNumber) {
      logger.info('[API] USPTO application already linked', {
        projectId,
        applicationNumber: cleanAppNumber,
      });
      
      // Check if we have documents
      const docCount = await prisma.projectDocument.count({
        where: {
          projectId,
          fileType: 'uspto-document',
          applicationNumber: cleanAppNumber,
        }
      });
      
      return res.status(200).json({
        success: true,
        data: {
          message: 'USPTO application already linked to this project',
          applicationNumber: cleanAppNumber,
          documentsStored: docCount,
        }
      });
    }

    // Check if project already has a different patent application
    if (project.patentApplication?.applicationNumber && 
        project.patentApplication.applicationNumber !== cleanAppNumber) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        `Project already linked to application ${project.patentApplication.applicationNumber}`
      );
    }

    // Create patent application record if it doesn't exist
    if (!project.patentApplication) {
      await prisma.patentApplication.create({
        data: {
          projectId,
          applicationNumber: cleanAppNumber,
          status: 'PENDING',
        }
      });
    }

    // Link USPTO application and process documents
    const linkingResult = await USPTOLinkingService.linkUSPTOToProject(
      projectId,
      cleanAppNumber,
      tenantId,
      userId
    );

    logger.info('[API] USPTO linking completed', {
      projectId,
      applicationNumber: cleanAppNumber,
      result: linkingResult,
    });

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        applicationNumber: cleanAppNumber,
        totalDocuments: linkingResult.totalDocuments,
        documentsStored: linkingResult.documentsStored,
        essentialDocuments: linkingResult.essentialDocuments,
        essentialProcessed: linkingResult.essentialProcessed,
        errors: linkingResult.errors,
      }
    });

  } catch (error) {
    logger.error('[API] Failed to link USPTO application', {
      projectId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      });
    }

    if (error instanceof ApplicationError) {
      return res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to link USPTO application',
    });
  }
}

// Apply security middleware
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    rateLimit: 'ai', // Use AI rate limit since this involves OCR
    validate: {
      body: linkUSPTOSchema,
    },
  }
);