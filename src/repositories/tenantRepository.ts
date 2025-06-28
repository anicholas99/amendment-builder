import { prisma } from '../lib/prisma';
import { logger } from '@/lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';

import { Tenant, Prisma } from '@prisma/client'; // Import the Tenant and Prisma types

/**
 * Interface for tenant result from raw query
 */
export interface TenantResult {
  id: string;
  name: string;
  slug: string;
  settings: string | null;
}

/**
 * Find a tenant by its slug.
 *
 * @param slug - The slug of the tenant
 * @returns The tenant object or null if not found
 */
export async function findTenantBySlug(slug: string): Promise<Tenant | null> {
  try {
    logger.debug(`Repository: Finding tenant by slug: ${slug}`);

    const tenant = await prisma!.tenant.findUnique({
      where: { slug: slug },
    });

    if (!tenant) {
      logger.debug(`Repository: No tenant found for slug ${slug}`);
      return null;
    }

    logger.debug(`Repository: Found tenant for slug ${slug}: ${tenant.name}`);
    return tenant;
  } catch (error) {
    logger.error(`Repository error finding tenant by slug ${slug}:`, error);
    throw ApplicationError.fromUnknown(error, ErrorCode.DB_QUERY_ERROR);
  }
}

/**
 * Find a tenant by its ID.
 *
 * @param id - The ID of the tenant
 * @returns The tenant object or null if not found
 */
export async function findTenantById(id: string): Promise<Tenant | null> {
  try {
    logger.debug(`Repository: Finding tenant by ID: ${id}`);

    const tenant = await prisma!.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      logger.debug(`Repository: No tenant found for ID ${id}`);
      return null;
    }

    logger.debug(`Repository: Found tenant with ID ${id}: ${tenant.name}`);
    return tenant;
  } catch (error) {
    logger.error(`Repository: Error finding tenant by ID ${id}:`, error);
    throw ApplicationError.fromUnknown(error, ErrorCode.DB_QUERY_ERROR);
  }
}

/**
 * Get a user's active tenant.
 * Uses a raw SQL query to join tenants with user_tenants for the given user.
 *
 * @param userId - The ID of the user
 * @returns The active tenant or null if none found
 */
export async function getUserActiveTenant(
  userId: string
): Promise<TenantResult | null> {
  try {
    logger.debug(`Repository: Finding active tenant for user ID: ${userId}`);

    // SECURITY FIX: Use Prisma.sql for safe parameterized query to prevent SQL injection
    const userTenant = await prisma!.$queryRaw<TenantResult[]>(
      Prisma.sql`
        SELECT TOP 1 t.id, t.name, t.slug, t.settings
        FROM tenants t
        INNER JOIN user_tenants ut ON t.id = ut.tenantId
        WHERE ut.userId = ${userId}
      `
    );

    if (!userTenant || userTenant.length === 0) {
      logger.debug(`Repository: No active tenant found for user ${userId}`);
      return null;
    }

    logger.debug(
      `Repository: Found active tenant for user ${userId}: ${userTenant[0].name}`
    );
    return userTenant[0];
  } catch (error) {
    logger.error(
      `Repository error finding active tenant for user ${userId}:`,
      error
    );
    throw ApplicationError.fromUnknown(error, ErrorCode.DB_QUERY_ERROR);
  }
}

/**
 * Check if a user has access to a specific tenant
 *
 * @param userId - The ID of the user
 * @param tenantId - The ID of the tenant
 * @returns A boolean indicating whether the user has access to the tenant
 */
export async function checkUserTenantAccess(
  userId: string,
  tenantId: string
): Promise<boolean> {
  try {
    logger.debug(
      `Repository: Checking user ${userId} access to tenant ${tenantId}`
    );

    // Add detailed logging for the exact IDs being queried
    logger.debug(
      `Repository: Querying userTenant with userId: "${userId}", tenantId: "${tenantId}"`
    );

    const hasAccess = await prisma!.userTenant.findUnique({
      where: {
        userId_tenantId: {
          userId,
          tenantId,
        },
      },
    });

    logger.debug(
      `Repository: User ${userId} ${hasAccess ? 'has' : 'does not have'} access to tenant ${tenantId}`
    );
    return !!hasAccess;
  } catch (error) {
    logger.error(
      `Repository error checking tenant access for user ${userId} to tenant ${tenantId}:`,
      error
    );
    return false;
  }
}

/**
 * Store or update a user's active tenant preference
 *
 * @param userId - The ID of the user
 * @param tenantId - The ID of the tenant
 * @returns A boolean indicating success
 */
export async function setUserActiveTenant(
  userId: string,
  tenantId: string
): Promise<boolean> {
  try {
    logger.debug(
      `Repository: Setting active tenant ${tenantId} for user ${userId}`
    );

    await prisma!.userPreference.upsert({
      where: {
        userId_key: {
          userId,
          key: 'activeTenant',
        },
      },
      update: {
        value: tenantId,
      },
      create: {
        userId,
        key: 'activeTenant',
        value: tenantId,
      },
    });

    logger.debug(
      `Repository: Successfully set active tenant for user ${userId}`
    );
    return true;
  } catch (error) {
    logger.error(
      `Repository error setting active tenant for user ${userId}:`,
      error
    );
    return false;
  }
}

/**
 * Find all tenants associated with a user.
 * Uses a raw SQL query to join tenants with user_tenants for the given user.
 *
 * @param userId - The ID of the user
 * @returns An array of tenants the user belongs to
 */
export async function findTenantsByUserId(
  userId: string
): Promise<TenantResult[]> {
  try {
    logger.debug(`Repository: Finding all tenants for user ID: ${userId}`);

    // SECURITY FIX: Use Prisma.sql for safe parameterized query
    const userTenants = await prisma!.$queryRaw<TenantResult[]>(
      Prisma.sql`
        SELECT t.id, t.name, t.slug, t.settings
        FROM tenants t
        INNER JOIN user_tenants ut ON t.id = ut.tenantId
        WHERE ut.userId = ${userId}
      `
    );

    logger.debug(
      `Repository: Found ${userTenants.length} tenants for user ${userId}`
    );
    return userTenants;
  } catch (error) {
    logger.error(`Repository error finding tenants for user ${userId}:`, error);
    // Return empty array on error for graceful degradation
    return [];
  }
}

/**
 * Data required for creating a tenant.
 */
export interface CreateTenantData {
  name: string;
  slug: string;
  settings?: Prisma.InputJsonValue | undefined;
}

/**
 * Creates a new tenant, links it to the specified user, and creates an audit log entry.
 * Performs operations within a transaction.
 *
 * @param data - The data for the new tenant (name, slug, settings).
 * @param userId - The Auth0 ID (sub) of the user creating the tenant.
 * @param userEmail - The email of the user to connect.
 * @returns The newly created tenant object.
 * @throws Throws an error if the transaction fails.
 */
export async function createTenantForUser(
  data: CreateTenantData,
  userId: string,
  userEmail: string
): Promise<Tenant> {
  logger.debug(
    `Repository: Creating tenant for user ${userId} (${userEmail}) with slug ${data.slug}`
  );

  try {
    const newTenant = await prisma!.$transaction(async tx => {
      // 1. Create the tenant
      const tenant = await tx.tenant.create({
        data: {
          name: data.name,
          slug: data.slug,
          // Stringify settings if present, otherwise null
          settings: data.settings ? JSON.stringify(data.settings) : null,
        },
      });

      // 2. Connect the tenant to the user via the user's email
      // Important: Assumes the User record with this email already exists.
      // If the user might not exist, additional logic is needed here (e.g., find or create user).
      // We connect via User, which implicitly creates/updates the UserTenant join record.
      await tx.user.update({
        where: { email: userEmail },
        data: {
          tenants: {
            connect: { id: tenant.id }, // Connect to the newly created tenant
          },
        },
      });

      // 3. Log the tenant creation in the audit log (SKIPPED - Model not found in schema)
      logger.warn(
        `Repository: TenantAuditLog model not found in schema. Skipping audit log creation for tenant ${tenant.id}.`
      );
      /*
      await tx.tenantAuditLog.create({
        data: {
          action: 'CREATE',
          tenantId: tenant.id,
          userId: userId, // Use the Auth0 ID (sub) here
          details: { // Store relevant creation details
            name: data.name,
            slug: data.slug,
            settings: data.settings,
            createdBy: userEmail,
          } as Prisma.InputJsonValue, // Cast to InputJsonValue
        },
      });
      */

      return tenant;
    });

    logger.info(
      `Repository: Successfully created tenant ${newTenant.id} (${newTenant.slug}) for user ${userId}`
    );
    return newTenant;
  } catch (error) {
    logger.error(
      `Repository: Failed to create tenant for user ${userId} with slug ${data.slug}:`,
      error
    );
    // Handle potential errors, e.g., unique constraint violation on slug
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Unique constraint failed
        throw new ApplicationError(
          ErrorCode.DB_DUPLICATE_ENTRY,
          `Tenant slug "${data.slug}" already exists.`
        );
      }
      // Add more specific error handling if needed
    }
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      'Failed to create tenant due to a database error.'
    );
  }
}

/**
 * Ensures that a user-tenant relationship exists.
 * Checks if the relationship exists; if not, creates it with the specified role.
 *
 * @param userId - The ID of the user
 * @param tenantId - The ID of the tenant
 * @param role - The role to assign (defaults to 'member')
 * @returns A promise resolving to a boolean indicating if a new relationship was created
 */
export async function ensureUserTenantAccess(
  userId: string,
  tenantId: string,
  role: string = 'member'
): Promise<boolean> {
  try {
    logger.debug(
      `Repository: Ensuring user ${userId} has access to tenant ${tenantId}`
    );

    // Check if relationship already exists
    const existingRelationship = await prisma!.userTenant.findUnique({
      where: {
        userId_tenantId: {
          userId,
          tenantId,
        },
      },
    });

    if (existingRelationship) {
      logger.debug(
        `Repository: User ${userId} already has access to tenant ${tenantId}`
      );
      return false; // No new relationship created
    }

    // Create new relationship
    await prisma!.userTenant.create({
      data: {
        userId,
        tenantId,
        role,
      },
    });

    logger.info(
      `Repository: Created new relationship between user ${userId} and tenant ${tenantId} with role ${role}`
    );
    return true; // New relationship created
  } catch (error) {
    logger.error(
      `Repository: Error ensuring tenant access for user ${userId} to tenant ${tenantId}:`,
      error
    );
    throw ApplicationError.fromUnknown(error, ErrorCode.DB_QUERY_ERROR);
  }
}

/**
 * Tenant Repository
 *
 * Centralized tenant access functions following the repository pattern.
 * Used by API routes for secure tenant resolution.
 */

/**
 * Resolve tenant ID from project ID
 * Used by withTenantGuard middleware for security checks
 */
export async function resolveTenantIdFromProject(
  projectId: string
): Promise<string | null> {
  if (!projectId) {
    logger.warn(
      '[tenantRepository] Project ID is required for tenant resolution'
    );
    return null;
  }

  try {
    const project = await prisma!.project.findUnique({
      where: { id: projectId },
      select: { tenantId: true },
    });

    if (!project) {
      logger.warn('[tenantRepository] Project not found', { projectId });
      return null;
    }

    logger.debug('[tenantRepository] Tenant resolved successfully', {
      projectId: projectId.substring(0, 8) + '...',
      tenantId: project.tenantId?.substring(0, 8) + '...',
    });

    return project.tenantId;
  } catch (error) {
    logger.error('[tenantRepository] Failed to resolve tenant from project', {
      projectId: projectId.substring(0, 8) + '...',
      error,
    });
    return null;
  }
}

/**
 * Resolve tenant ID from search history ID
 * Used when API routes need tenant context from search operations
 */
export async function resolveTenantIdFromSearchHistory(
  searchHistoryId: string
): Promise<string | null> {
  if (!searchHistoryId) {
    logger.warn(
      '[tenantRepository] Search history ID is required for tenant resolution'
    );
    return null;
  }

  try {
    const searchHistory = await prisma!.searchHistory.findUnique({
      where: { id: searchHistoryId },
      select: {
        project: {
          select: { tenantId: true },
        },
      },
    });

    if (!searchHistory?.project) {
      logger.warn('[tenantRepository] Search history or project not found', {
        searchHistoryId,
      });
      return null;
    }

    logger.debug('[tenantRepository] Tenant resolved from search history', {
      searchHistoryId: searchHistoryId.substring(0, 8) + '...',
      tenantId: searchHistory.project.tenantId?.substring(0, 8) + '...',
    });

    return searchHistory.project.tenantId;
  } catch (error) {
    logger.error(
      '[tenantRepository] Failed to resolve tenant from search history',
      {
        searchHistoryId: searchHistoryId.substring(0, 8) + '...',
        error,
      }
    );
    return null;
  }
}

/**
 * Resolve tenant ID from citation job ID
 * Used when API routes need tenant context from citation operations
 */
export async function resolveTenantIdFromCitationJob(
  citationJobId: string
): Promise<string | null> {
  if (!citationJobId) {
    logger.warn(
      '[tenantRepository] Citation job ID is required for tenant resolution'
    );
    return null;
  }

  try {
    const citationJob = await prisma!.citationJob.findUnique({
      where: { id: citationJobId },
      select: {
        searchHistory: {
          select: {
            project: {
              select: { tenantId: true },
            },
          },
        },
      },
    });

    if (!citationJob?.searchHistory?.project) {
      logger.warn(
        '[tenantRepository] Citation job, search history, or project not found',
        { citationJobId }
      );
      return null;
    }

    logger.debug('[tenantRepository] Tenant resolved from citation job', {
      citationJobId: citationJobId.substring(0, 8) + '...',
      tenantId:
        citationJob.searchHistory.project.tenantId?.substring(0, 8) + '...',
    });

    return citationJob.searchHistory.project.tenantId;
  } catch (error) {
    logger.error(
      '[tenantRepository] Failed to resolve tenant from citation job',
      {
        citationJobId: citationJobId.substring(0, 8) + '...',
        error,
      }
    );
    return null;
  }
}

/**
 * Check if a user has admin access to a tenant
 * @param userId The user ID
 * @param tenantId The tenant ID
 * @returns True if user has admin role in the tenant
 */
export async function checkUserTenantAdminAccess(
  userId: string,
  tenantId: string
): Promise<boolean> {
  try {
    logger.debug(
      `Repository: Checking admin access for user ${userId} to tenant ${tenantId}`
    );

    const userTenant = await prisma!.userTenant.findFirst({
      where: {
        userId,
        tenantId,
        role: 'ADMIN',
      },
    });

    const hasAdminAccess = !!userTenant;
    logger.debug(
      `Repository: User ${userId} ${hasAdminAccess ? 'has' : 'does not have'} admin access to tenant ${tenantId}`
    );
    return hasAdminAccess;
  } catch (error) {
    logger.error(
      `Repository error checking admin access for user ${userId} to tenant ${tenantId}:`,
      error
    );
    return false;
  }
}

/**
 * Update tenant settings
 * @param tenantId The tenant ID
 * @param data Update data for the tenant
 * @returns The updated tenant
 */
export async function updateTenant(
  tenantId: string,
  data: {
    name?: string;
    settings?: any;
  }
): Promise<Tenant> {
  try {
    logger.debug(`Repository: Updating tenant ${tenantId}`);

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.settings !== undefined) {
      updateData.settings = JSON.stringify(data.settings);
    }

    const updated = await prisma!.tenant.update({
      where: { id: tenantId },
      data: updateData,
    });

    logger.info(`Repository: Successfully updated tenant ${tenantId}`);
    return updated;
  } catch (error) {
    logger.error(`Repository error updating tenant ${tenantId}:`, error);
    throw ApplicationError.fromUnknown(error, ErrorCode.DB_QUERY_ERROR);
  }
}

/**
 * Count admin users in a tenant
 * @param tenantId The tenant ID
 * @returns Number of admin users
 */
export async function countTenantAdmins(tenantId: string): Promise<number> {
  try {
    logger.debug(`Repository: Counting admins for tenant ${tenantId}`);

    const count = await prisma!.userTenant.count({
      where: {
        tenantId,
        role: 'ADMIN',
      },
    });

    logger.debug(`Repository: Found ${count} admins in tenant ${tenantId}`);
    return count;
  } catch (error) {
    logger.error(
      `Repository error counting admins for tenant ${tenantId}:`,
      error
    );
    throw ApplicationError.fromUnknown(error, ErrorCode.DB_QUERY_ERROR);
  }
}

/**
 * Get user tenant relationship
 * @param userId The user ID
 * @param tenantId The tenant ID
 * @returns The user tenant relationship or null
 */
export async function getUserTenantRelationship(
  userId: string,
  tenantId: string
): Promise<{ userId: string; tenantId: string; role: string } | null> {
  try {
    logger.debug(
      `Repository: Getting user tenant relationship for user ${userId} and tenant ${tenantId}`
    );

    const relationship = await prisma!.userTenant.findUnique({
      where: {
        userId_tenantId: {
          userId,
          tenantId,
        },
      },
    });

    if (relationship) {
      logger.debug(
        `Repository: Found relationship with role ${relationship.role}`
      );
    } else {
      logger.debug(`Repository: No relationship found`);
    }

    return relationship;
  } catch (error) {
    logger.error(`Repository error getting user tenant relationship:`, error);
    return null;
  }
}

/**
 * Remove user from tenant
 * @param userId The user ID to remove
 * @param tenantId The tenant ID
 * @returns True if removed successfully
 */
export async function removeUserFromTenant(
  userId: string,
  tenantId: string
): Promise<boolean> {
  try {
    logger.debug(`Repository: Removing user ${userId} from tenant ${tenantId}`);

    await prisma!.userTenant.delete({
      where: {
        userId_tenantId: {
          userId,
          tenantId,
        },
      },
    });

    logger.info(
      `Repository: Successfully removed user ${userId} from tenant ${tenantId}`
    );
    return true;
  } catch (error) {
    logger.error(
      `Repository error removing user ${userId} from tenant ${tenantId}:`,
      error
    );
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      // Record not found
      return false;
    }
    throw ApplicationError.fromUnknown(error, ErrorCode.DB_QUERY_ERROR);
  }
}
