import { z } from 'zod';
import { CITATION_THRESHOLDS } from '@/config/citationExtractionConfig';
import { auth0UserIdSchema } from '@/lib/validation/schemas/auth';

export const createCitationJobSchema = z.object({
  searchHistoryId: z.string().uuid('Invalid Search History ID.'),
  filterReferenceNumber: z.string().optional(),
  searchInputs: z.array(z.string()),
  threshold: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .default(CITATION_THRESHOLDS.default),
  // userId is injected by the middleware, so it's optional in the request body
  // Uses proper Auth0 ID validation
  userId: auth0UserIdSchema.optional(),
});

export type CreateCitationJobBody = z.infer<typeof createCitationJobSchema>;
