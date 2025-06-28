import { NextApiRequest, NextApiResponse } from 'next';
import { CustomApiRequest } from '@/types/api';
import { z } from 'zod';
import { logger } from '@/lib/monitoring/logger';
import { projectIdQuerySchema } from '@/lib/validation/schemas/shared/querySchemas';
import { PriorArtServerService } from '@/server/services/prior-art.server-service';
import { PriorArtDataToSave } from '@/types/domain/priorArt';
import { SecurePresets, TenantResolvers } from '@/lib/api/securePresets';

interface PriorArtBody {
  patentNumber?: string;
  title?: string;
  abstract?: string;
  url?: string;
  notes?: string;
  authors?: string;
  publicationDate?: string;
  savedCitationsData?: string;
  claim1?: string;
  summary?: string;
}

// Validation schema for request bodies
const requestSchema = z
  .object({
    // POST request fields
    patentNumber: z.string().optional(),
    title: z.string().optional(),
    abstract: z.string().optional(),
    url: z.string().optional(),
    notes: z.string().optional(),
    authors: z.string().optional(),
    publicationDate: z.string().optional(),
    savedCitationsData: z.string().optional(),
    claim1: z.string().optional(),
    summary: z.string().optional(),
  })
  .refine(
    data => {
      // For POST: require patentNumber
      return data.patentNumber;
    },
    {
      message: 'patentNumber is required',
    }
  );

/**
 * API handler for managing project prior art
 * Supports:
 * - GET: Retrieve all prior art for a project
 * - POST: Add new prior art to a project
 */
async function handler(
  req: CustomApiRequest<PriorArtBody>,
  res: NextApiResponse
): Promise<void> {
  const { projectId } = (req as any).validatedQuery as z.infer<
    typeof projectIdQuerySchema
  >;

  // User and tenant are guaranteed by middleware
  const { id: userId, tenantId } = req.user!;

  // TypeScript safety check - middleware guarantees this
  if (!tenantId) {
    throw new Error('Tenant ID is required but was not provided by middleware');
  }

  switch (req.method) {
    case 'GET':
      const priorArt = await PriorArtServerService.getPriorArtForProject(
        projectId,
        userId,
        tenantId
      );
      res.status(200).json({
        priorArt: priorArt,
        count: priorArt.length,
      });
      break;

    case 'POST':
      // Validation is handled by middleware, no need to check again
      const savedPriorArt = await PriorArtServerService.addPriorArtToProject(
        projectId,
        userId,
        tenantId,
        req.body as PriorArtDataToSave
      );
      res.status(201).json({
        success: true,
        savedPriorArt: savedPriorArt,
      });
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

// SECURITY: This endpoint is tenant-protected using project-based resolution
// Users can only manage prior art for projects within their own tenant
export default SecurePresets.tenantProtected(
  TenantResolvers.fromProject,
  handler,
  {
    validate: {
      query: projectIdQuerySchema,
      body: requestSchema,
      bodyMethods: ['POST'], // Apply body validation only to POST
    },
    rateLimit: 'api',
  }
);
