/**
 * ASMB Data API Endpoint
 * 
 * Gathers all data required for Amendment Submission Boilerplate (ASMB) generation
 * by joining data from multiple sources in the database.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { withAuth } from '@/middleware/auth';
import { withTenantGuard } from '@/middleware/authorization';
import { apiResponse } from '@/utils/api/responses';
import { logger } from '@/server/logger';
import { prisma } from '@/lib/prisma';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { ASMBDataService } from '@/services/api/asmbDataService';

const querySchema = z.object({
  projectId: z.string(),
  officeActionId: z.string(),
  submissionType: z.enum(['AMENDMENT', 'CONTINUATION', 'RCE']).optional().default('AMENDMENT'),
});

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return apiResponse.methodNotAllowed(res, ['GET']);
  }

  try {
    // Validate query parameters
    const { projectId, officeActionId, submissionType } = querySchema.parse({
      ...req.query,
      submissionType: req.query.submissionType || 'AMENDMENT',
    });

    logger.info('Fetching ASMB data', {
      projectId,
      officeActionId,
      submissionType,
    });

    // Get all related data in one query
    const officeAction = await prisma.officeAction.findUnique({
      where: { id: officeActionId },
      include: {
        project: {
          include: {
            invention: true,
            patentApplication: true,
            user: true,
            tenant: true,
          },
        },
      },
    });

    if (!officeAction) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Office Action not found'
      );
    }

    const { project } = officeAction;
    const { invention, patentApplication, user, tenant } = project;

    // Parse inventors from invention or patent application
    let inventors: string[] = [];
    if (invention?.inventorsJson) {
      try {
        const parsed = JSON.parse(invention.inventorsJson);
        inventors = Array.isArray(parsed) ? parsed : [];
             } catch (error) {
         logger.warn('Failed to parse inventors JSON from invention', { error });
       }
    }
    
    // Fallback to patent application inventors
    if (inventors.length === 0 && patentApplication?.inventors) {
      try {
        const parsed = JSON.parse(patentApplication.inventors);
        inventors = Array.isArray(parsed) ? parsed : [];
             } catch (error) {
         logger.warn('Failed to parse inventors JSON from patent application', { error });
       }
    }

    // Get title from multiple sources (priority: invention > patent application > project)
    const title = invention?.title || patentApplication?.title || project?.name;

    // Parse tenant settings for firm information
    let firmSettings: any = {};
    if (tenant?.settings) {
      try {
        firmSettings = JSON.parse(tenant.settings);
             } catch (error) {
         logger.warn('Failed to parse tenant settings', { error });
       }
    }

    // Calculate response deadline
    const mailingDate = officeAction.dateIssued;
    const responseDeadline = ASMBDataService.calculateResponseDeadline(mailingDate || undefined);

    // Generate submission statement
    const submissionStatement = ASMBDataService.generateSubmissionStatement(
      submissionType,
      mailingDate || undefined
    );

    // Build correspondence address from tenant settings or defaults
    const correspondenceAddress = firmSettings.correspondenceAddress || {
      name: tenant?.name || '[FIRM NAME]',
      address: ['[ADDRESS LINE 1]', '[ADDRESS LINE 2]'],
      city: '[CITY]',
      state: '[STATE]',
      zipCode: '[ZIP CODE]',
    };

    // Assemble ASMB data
    const asmbData = {
      // Application Information
      applicationNumber: officeAction.applicationNumber || patentApplication?.applicationNumber,
      filingDate: patentApplication?.filingDate?.toISOString(),
      title,
      inventors,
      
      // Examiner Information
      examinerName: officeAction.examinerId 
        ? `${officeAction.examinerId}` 
        : patentApplication?.examinerName,
      examinerId: officeAction.examinerId || patentApplication?.examinerId,
      artUnit: officeAction.artUnit || patentApplication?.artUnit,
      
      // Office Action Information
      officeActionNumber: officeAction.oaNumber,
      mailingDate: mailingDate?.toISOString(),
      responseDeadline: responseDeadline?.toISOString(),
      
      // Attorney/Firm Information
      attorneyName: user?.name || firmSettings.attorneyName || '[ATTORNEY NAME]',
      firmName: tenant?.name || '[FIRM NAME]',
      customerNumber: firmSettings.customerNumber,
      docketNumber: firmSettings.docketNumber || project?.name,
      
      // Submission Information
      submissionType,
      submissionStatement,
      
      // Contact Information
      correspondenceAddress,
    };

         logger.info('ASMB data assembled successfully', {
       projectId,
       officeActionId,
       hasApplicationNumber: !!asmbData.applicationNumber,
       hasExaminer: !!asmbData.examinerName,
       inventorCount: inventors.length,
     });

    return apiResponse.ok(res, asmbData);

  } catch (error) {
         logger.error('Failed to fetch ASMB data', {
       error: error instanceof Error ? error.message : String(error),
       projectId: req.query.projectId,
       officeActionId: req.query.officeActionId,
     });

    if (error instanceof ApplicationError) {
      return apiResponse.serverError(res, error);
    }

    return apiResponse.serverError(res, new Error('Failed to fetch ASMB data'));
  }
}

// Tenant resolution for security
const resolveTenantId = async (req: NextApiRequest): Promise<string | null> => {
  const { projectId } = req.query;
  const project = await prisma.project.findUnique({
    where: { id: String(projectId) },
    select: { tenantId: true },
  });
  return project?.tenantId || null;
};

export default withAuth(withTenantGuard(resolveTenantId)(handler)); 