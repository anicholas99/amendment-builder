import type { NextApiResponse } from 'next';
import { PriorArtReference } from '@/types/claimTypes';
import { createApiLogger } from '@/server/monitoring/apiLogger';
import { CustomApiRequest } from '@/types/api';
import { AuthenticatedRequest } from '@/types/middleware';
import { z } from 'zod';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { PatentServerService } from '@/server/services/patent.server-service';
import { SecurePresets } from '@/server/api/securePresets';

const apiLogger = createApiLogger('patbase-test-enrichment');

// Validation schema for patent enrichment testing
const bodySchema = z.object({
  patents: z
    .array(
      z.object({
        number: z.string().min(1),
        title: z.string().optional(),
        relevancy: z.number().optional(),
        relevance: z.number().optional(),
        authors: z.string().optional(),
        year: z.number().optional(),
        abstract: z.string().optional(),
        url: z.string().optional(),
        relevantText: z.string().optional(),
        CPCs: z.array(z.string()).optional(),
        IPCs: z.array(z.string()).optional(),
      })
    )
    .min(1, 'At least one patent is required'),
});

// Define request body type for patent enrichment testing
type TestEnrichmentBody = z.infer<typeof bodySchema>;

/**
 * API route handler to test the enrichPatentMetadata function.
 * Expects a POST request with body: { patents: { number: string, title: string }[] }
 */
const handler = async (
  req: CustomApiRequest<TestEnrichmentBody>,
  res: NextApiResponse
): Promise<void> => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    throw new ApplicationError(
      ErrorCode.VALIDATION_FAILED,
      `Method ${req.method} Not Allowed`
    );
  }

  // User is already authenticated via withAuth middleware
  const userId = req.user?.id;

  // Request body is validated by middleware
  const validationResult = bodySchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({
      error: 'Invalid request body',
      details: validationResult.error.flatten(),
    });
  }
  const { patents: inputPatents } = validationResult.data;

  // Map input to the PriorArtReference type expected by the service
  const patentsToEnrich: PriorArtReference[] = inputPatents.map(p => ({
    number: p.number || '',
    patentNumber: p.number || '',
    title: p.title || 'Test Title',
    source: 'PatBase' as const,
    relevance: p.relevance || p.relevancy || 0,
    authors: p.authors ? [p.authors] : undefined,
    year: p.year ? String(p.year) : undefined,
    abstract: p.abstract || undefined,
    url: p.url || undefined,
    relevantText: p.relevantText || undefined,
    CPCs: p.CPCs || undefined,
    IPCs: p.IPCs || undefined,
  }));

  apiLogger.info('[API Test Enrichment] Received request', {
    count: patentsToEnrich.length,
    userId,
  });

  // Call the service layer to handle the enrichment
  const enrichedResults =
    await PatentServerService.enrichPatents(patentsToEnrich);

  apiLogger.info('[API Test Enrichment] Enrichment complete', {
    resultsCount: enrichedResults.length,
    userId,
  });

  return res.status(200).json({
    success: true,
    data: {
      message: `Successfully enriched ${enrichedResults.length} patents.`,
      results: enrichedResults,
    },
  });
};

export default SecurePresets.adminGlobal(handler, {
  validate: {
    body: bodySchema,
  },
  rateLimit: 'api',
});
