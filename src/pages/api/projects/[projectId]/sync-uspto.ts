import { NextApiRequest, NextApiResponse } from 'next';
import { SecurePresets, TenantResolvers } from '@/server/api/securePresets';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/server/logger';
import { fetchProsecutionHistory } from '@/lib/api/uspto/services/prosecutionHistoryService';
import { AuthenticatedRequest, RequestWithServices } from '@/types/middleware';

const SyncUSPTOSchema = z.object({
  applicationNumber: z.string().trim().min(1, 'Application number is required'),
});

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectId } = req.query;
  const authReq = req as AuthenticatedRequest & RequestWithServices;
  const { tenantId } = authReq.user!;
  
  if (typeof projectId !== 'string') {
    throw new ApplicationError(ErrorCode.INVALID_INPUT, 'Invalid project ID', 400);
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are accepted.',
    });
  }

  try {
    const { applicationNumber } = SyncUSPTOSchema.parse(req.body);
    
    logger.info('Starting USPTO sync', { 
      projectId, 
      applicationNumber,
      tenantId 
    });

    // First ensure we have a PatentApplication record
    const patentApp = await prisma.patentApplication.findUnique({
      where: { projectId }
    });

    if (!patentApp || patentApp.applicationNumber !== applicationNumber) {
      throw new ApplicationError(
        ErrorCode.PROJECT_NOT_FOUND,
        'Patent application not found or number mismatch', 
        404
      );
    }

    // Clean application number for USPTO API (remove formatting)
    const cleanAppNumber = applicationNumber.replace(/[^0-9]/g, '');
    
    // Fetch prosecution history from USPTO
    const prosecutionData = await fetchProsecutionHistory(cleanAppNumber);
    
    if (!prosecutionData.success || !prosecutionData.data) {
      throw new ApplicationError(
        ErrorCode.API_NETWORK_ERROR,
        'Failed to fetch USPTO data', 
        500
      );
    }

    const { documents } = prosecutionData.data;
    
    // Process office actions
    const officeActions = documents.filter(doc => 
      doc.category === 'office-action' || 
      doc.documentCode === 'CTNF' || // Non-Final Office Action
      doc.documentCode === 'CTFR' || // Final Office Action
      doc.documentCode === 'MCTNF' // Miscellaneous Communication to Applicant
    );

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update patent application with basic info if available
      if (prosecutionData.data.applicationData) {
        await tx.patentApplication.update({
          where: { projectId },
          data: {
            title: prosecutionData.data.applicationData.title || patentApp.title,
            filingDate: prosecutionData.data.applicationData.filingDate 
              ? new Date(prosecutionData.data.applicationData.filingDate)
              : patentApp.filingDate,
            status: prosecutionData.data.applicationData.status || patentApp.status,
            updatedAt: new Date(),
          }
        });
      }

      // Process each office action
      const createdOAs = [];
      for (const oaDoc of officeActions) {
        // Check if we already have this office action
        const existingOA = await tx.officeAction.findFirst({
          where: {
            projectId,
            oaNumber: oaDoc.documentCode,
            dateIssued: oaDoc.mailDate ? new Date(oaDoc.mailDate) : undefined,
          }
        });

        if (!existingOA) {
          const newOA = await tx.officeAction.create({
            data: {
              projectId,
              tenantId,
              oaNumber: oaDoc.documentCode,
              dateIssued: oaDoc.mailDate ? new Date(oaDoc.mailDate) : new Date(),
              originalFileName: oaDoc.description,
              status: 'COMPLETED',
              examinerRemarks: `${oaDoc.description} - ${oaDoc.documentCode}`,
              parsedJson: JSON.stringify({
                usptoDocument: oaDoc,
                category: oaDoc.category,
                importance: oaDoc.importance,
              }),
            }
          });
          createdOAs.push(newOA);

          // Create summary for the office action
          await tx.officeActionSummary.create({
            data: {
              officeActionId: newOA.id,
              summaryText: oaDoc.description || 'USPTO Office Action',
              keyIssues: JSON.stringify([]),
              rejectionBreakdown: JSON.stringify({}),
              totalClaimsRejected: 0, // Would need parsing to get actual count
              examinerTone: 'NEUTRAL',
              responseComplexity: 'MEDIUM',
            }
          });
        }
      }

      return {
        officeActionsCreated: createdOAs.length,
        totalDocuments: documents.length,
      };
    });

    logger.info('USPTO sync completed', { 
      projectId, 
      applicationNumber,
      cleanAppNumber,
      officeActionsCreated: result.officeActionsCreated,
      totalDocuments: result.totalDocuments,
    });

    res.status(200).json({
      success: true,
      message: 'USPTO data synced successfully',
      stats: {
        officeActionsCreated: result.officeActionsCreated,
        totalDocuments: result.totalDocuments,
      }
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error in USPTO sync', {
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
      body: SyncUSPTOSchema,
      method: 'POST',
    },
  }
);