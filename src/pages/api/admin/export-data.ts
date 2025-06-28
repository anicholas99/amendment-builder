import { NextApiResponse } from 'next';
import { projectsApi } from '@/lib/api/clients/projects';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { CustomApiRequest } from '@/types/api';
import { AuthenticatedRequest } from '@/types/middleware';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

const apiLogger = createApiLogger('export-data');

// Define request body type (empty for this GET endpoint)
interface EmptyBody {}

async function handler(
  req: CustomApiRequest<EmptyBody> & AuthenticatedRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
  apiLogger.logRequest(req);

  apiLogger.info('Fetching all projects for export');
  // Get all projects through API
  const projects = await projectsApi.getProjects();
  apiLogger.info('Successfully fetched projects', {
    count: projects?.length || 0,
  });

  // Return the projects data
  const response = { projects };
  apiLogger.logResponse(200, { count: projects?.length || 0 });
  res.status(200).json(response);
}

// Use the new admin-specific secure preset
export default SecurePresets.adminTenant(TenantResolvers.fromUser, handler);
