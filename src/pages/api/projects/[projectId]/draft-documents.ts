import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/auth';
import { withTenantGuard } from '@/middleware/authorization';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { AuthenticatedApiRequest } from '@/types/api';
import { prisma } from '@/lib/prisma';

async function handler(req: AuthenticatedApiRequest, res: NextApiResponse) {
  const { projectId } = req.query;
  const { amendmentProjectId } = req.query;
  const { user, tenantId } = req;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!prisma) {
      throw new ApplicationError(
        ErrorCode.DB_CONNECTION_ERROR,
        'Database client is not initialized.'
      );
    }

    // Build query conditions
    const whereConditions: any = {
      projectId: String(projectId),
    };

    // If amendmentProjectId is provided, filter by it
    if (amendmentProjectId) {
      whereConditions.amendmentProjectId = String(amendmentProjectId);
    }

    // Fetch draft documents
    const draftDocuments = await prisma.draftDocument.findMany({
      where: whereConditions,
      orderBy: [
        { type: 'asc' },
        { updatedAt: 'desc' }
      ],
      select: {
        id: true,
        projectId: true,
        amendmentProjectId: true,
        type: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      documents: draftDocuments.map(doc => ({
        ...doc,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      })),
      meta: {
        projectId: String(projectId),
        amendmentProjectId: amendmentProjectId ? String(amendmentProjectId) : null,
        total: draftDocuments.length,
      },
    });

  } catch (error) {
    if (error instanceof ApplicationError) {
      return res.status(error.statusCode || 400).json({
        error: error.code,
        message: error.message,
      });
    }

    return res.status(500).json({
      error: ErrorCode.INTERNAL_ERROR,
      message: 'Failed to fetch draft documents',
    });
  }
}

// Tenant resolution for security
const resolveTenantId = async (req: NextApiRequest): Promise<string | null> => {
  const { projectId } = req.query;
  
  if (!prisma) return null;
  
  const project = await prisma.project.findUnique({
    where: { id: String(projectId) },
    select: { tenantId: true }
  });
  
  return project?.tenantId || null;
};

export default withAuth(withTenantGuard(resolveTenantId)(handler)); 