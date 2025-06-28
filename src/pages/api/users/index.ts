import { NextApiRequest, NextApiResponse } from 'next';
import { CustomApiRequest } from '@/types/api';
import { z } from 'zod';
// Import repository functions
import {
  findUsers,
  findUserByEmail,
  createUser,
} from '../../../repositories/userRepository';
import { createApiLogger } from '@/lib/monitoring/apiLogger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { AuthenticatedRequest } from '@/types/middleware';
import {
  SecurePresets,
  TenantResolvers,
} from '@/lib/api/securePresets';

// Initialize apiLogger
const apiLogger = createApiLogger('users');

// Define Zod schema for request body validation
const bodySchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  name: z.string().min(1).max(255).trim().optional(),
});

// Define request body type from schema
type CreateUserBody = z.infer<typeof bodySchema>;

// Ensure handler explicitly returns undefined (effectively void)
const handler = async (
  req: CustomApiRequest<CreateUserBody> & AuthenticatedRequest,
  res: NextApiResponse
): Promise<void> => {
  apiLogger.logRequest(req);
  
  // User is guaranteed by middleware
  const { id: requestingUserId } = req.user!;

  switch (req.method) {
    case 'GET':
      // Admin role check is now handled by middleware
      apiLogger.info('Attempting to fetch users list by ADMIN', {
        requestingUserId,
      });
      const users = await findUsers();
      apiLogger.info(`Found ${users.length} users`, { requestingUserId });
      apiLogger.logResponse(200, { count: users.length });
      res.status(200).json(users); // Set status and body
      return; // Return void

    case 'POST': {
      // Validate body for POST request
      const validationResult = bodySchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Invalid request body',
          details: validationResult.error.flatten(),
        });
      }
      const { email, name } = validationResult.data;

      apiLogger.info('Attempting to create user', { requestingUserId });

      // Email has already been validated and normalized by Zod
      const sanitizedEmail = email; // Already lowercase and trimmed by Zod
      const sanitizedName = name || email.split('@')[0];

      apiLogger.debug('Checking for existing user by email', {
        requestingUserId,
        sanitizedEmail,
      });
      const existingUser = await findUserByEmail(sanitizedEmail);

      if (existingUser) {
        apiLogger.warn('User with this email already exists', {
          requestingUserId,
          sanitizedEmail,
          existingUserId: existingUser.id,
        });
        throw new ApplicationError(
          ErrorCode.DB_DUPLICATE_ENTRY,
          'User with this email already exists'
        );
      }

      apiLogger.info('Creating new user record', {
        requestingUserId,
        sanitizedEmail,
        sanitizedName,
      });
      const user = await createUser({
        email: sanitizedEmail,
        name: sanitizedName,
      });
      apiLogger.info('User created successfully', {
        requestingUserId,
        userId: user.id,
        email: user.email,
      });

      apiLogger.logResponse(201, { userId: user.id });
      res.status(201).json(user); // Set status and body
      return; // Return void
    }

    default:
      apiLogger.warn('Method not allowed', {
        requestingUserId,
        method: req.method,
      });
      res.setHeader('Allow', ['GET', 'POST']);
      throw new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        `Method ${req.method} Not Allowed`
      );
    // No return needed as throw exits
  }
};

// Use the new admin-specific secure preset
export default SecurePresets.adminTenant(TenantResolvers.fromUser, handler);
