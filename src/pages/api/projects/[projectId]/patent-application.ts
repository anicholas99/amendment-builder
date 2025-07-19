import { NextApiRequest, NextApiResponse } from 'next';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';

const UpdatePatentApplicationSchema = z.object({
  applicationNumber: z.string().trim().min(1, 'Application number is required'),
});

type UpdatePatentApplicationData = z.infer<typeof UpdatePatentApplicationSchema>;

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectId } = req.query;
  
  if (typeof projectId !== 'string') {
    throw new ApplicationError('Invalid project ID', 400, ErrorCode.INVALID_INPUT);
  }

  try {
    if (req.method === 'PUT') {
      // Update patent application
      const data = req.body as UpdatePatentApplicationData;
      
      // First check if a patent application already exists
      const existingApplication = await prisma.patentApplication.findUnique({
        where: { projectId }
      });

      let result;
      if (existingApplication) {
        // Update existing application
        result = await prisma.patentApplication.update({
          where: { projectId },
          data: {
            applicationNumber: data.applicationNumber,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new application
        result = await prisma.patentApplication.create({
          data: {
            projectId,
            applicationNumber: data.applicationNumber,
          },
        });
      }

      res.status(200).json({
        success: true,
        patentApplication: {
          id: result.id,
          projectId: result.projectId,
          applicationNumber: result.applicationNumber,
        },
      });
      return;
    }

    if (req.method === 'GET') {
      // Get patent application
      const application = await prisma.patentApplication.findUnique({
        where: { projectId },
      });

      if (!application) {
        res.status(200).json({ 
          success: true,
          patentApplication: null 
        });
        return;
      }

      res.status(200).json({
        success: true,
        patentApplication: {
          id: application.id,
          projectId: application.projectId,
          applicationNumber: application.applicationNumber,
          filingDate: application.filingDate,
          title: application.title,
          status: application.status,
        },
      });
      return;
    }

    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only GET and PUT requests are accepted.',
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error in patent application handler', {
      error: err,
      projectId,
    });
    throw error;
  }
}

export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      body: UpdatePatentApplicationSchema,
      method: 'PUT',
    },
  }
);