import { NextApiRequest, NextApiResponse } from 'next';
import { createApiLogger } from '../../../lib/monitoring/apiLogger';
import {
  findTenantsByUserId,
  createTenantForUser,
  CreateTenantData,
} from '../../../repositories/tenantRepository';
import { CustomApiRequest } from '@/types/api';
import { AuthenticatedRequest } from '@/types/middleware';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { throwUnauthorized } from '@/middleware/errorHandling';
import { z } from 'zod';
import { safeJsonParse } from '@/utils/json-utils';
import { Prisma } from '@prisma/client';
import {
  SecurePresets,
  TenantResolvers,
} from '@/lib/api/securePresets';

const apiLogger = createApiLogger('tenants');

// Schema for tenant settings
const tenantSettingsSchema = z
  .object({
    maxUsers: z.number().optional(),
    maxProjects: z.number().optional(),
    features: z.array(z.string()).optional(),
    customBranding: z
      .object({
        primaryColor: z.string().optional(),
        logo: z.string().optional(),
      })
      .optional(),
    // Allow additional fields for flexibility
  })
  .passthrough();

// Define Zod schema for request body validation
const bodySchema = z.object({
  name: z.string().min(1, 'Tenant name is required').max(255).trim(),
  slug: z
    .string()
    .min(1, 'Tenant slug is required')
    .max(255)
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters, numbers, and hyphens'
    ),
  settings: tenantSettingsSchema.optional(),
});

// Define request body type from schema
type CreateTenantBody = z.infer<typeof bodySchema>;

const handler = async (
  req: CustomApiRequest<CreateTenantBody>,
  res: NextApiResponse
): Promise<void> => {
  apiLogger.logRequest(req);

  // User is guaranteed by middleware
  const { id: userId, email: userEmail } = (req as AuthenticatedRequest).user!;

  apiLogger.debug('Processing request for user', { userId, userEmail });

  switch (req.method) {
    case 'POST':
      const validationResult = bodySchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Invalid request body',
          details: validationResult.error.flatten(),
        });
      }
      const { name, slug, settings } = validationResult.data;

      // Deep clone settings if provided (using JSON serialization for simplicity)
      let clonedSettings: Prisma.InputJsonValue | undefined = undefined;
      if (settings) {
        const stringified = JSON.stringify(settings);
        const parsed = safeJsonParse(stringified);
        // This should never fail since we're parsing what we just stringified
        if (parsed === undefined) {
          apiLogger.error(
            'Unexpected error: Failed to parse stringified settings'
          );
          clonedSettings = settings as Prisma.InputJsonValue; // Fallback to original
        } else {
          clonedSettings = parsed as Prisma.InputJsonValue;
        }
      }

      // Validation is now handled by Zod middleware
      const tenantData: CreateTenantData = {
        name,
        slug,
        settings: clonedSettings,
      };
      apiLogger.debug('Creating new tenant', { userId, tenantData });

      try {
        const newTenant = await createTenantForUser(
          tenantData,
          userId,
          userEmail
        );

        apiLogger.info('Tenant created successfully', {
          userId,
          tenantId: newTenant.id,
          tenantName: newTenant.name,
        });

        const response = newTenant;
        apiLogger.logResponse(201, response);
        res.status(201).json(response);
        return;
      } catch (caughtError: unknown) {
        // Special handling for duplicate tenant
        if (
          caughtError instanceof Error &&
          caughtError.message.includes('already exists')
        ) {
          apiLogger.warn('Tenant already exists', {
            userId,
            error: caughtError,
          });
          throw new ApplicationError(
            ErrorCode.DB_DUPLICATE_ENTRY,
            'Tenant already exists'
          );
        }
        // Re-throw to let withErrorHandling middleware handle it
        throw caughtError;
      }

    case 'GET':
      const tenants = await findTenantsByUserId(userId);
      apiLogger.info('Tenants retrieved successfully', {
        userId,
        count: tenants.length,
      });

      const response = tenants;
      apiLogger.logResponse(200, response);
      res.status(200).json(response);
      return;

    default:
      apiLogger.warn('Method not allowed', { method: req.method });
      res.setHeader('Allow', ['POST', 'GET']);
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        `Method ${req.method} Not Allowed`
      );
  }
};

// Use the new admin-specific secure preset
export default SecurePresets.adminTenant(TenantResolvers.fromUser, handler);
