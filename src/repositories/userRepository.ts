import {
  Prisma,
  User,
  Project,
  ChatMessage,
  SearchHistory,
  UserTenant,
} from '@prisma/client';
// Import the function to get the client instance safely
import { prisma } from '../lib/prisma';
import { logger } from '@/server/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';

// Define the select clause for returning safe user data (excluding passwordHash etc.)
const userSelectSafe = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  email: true,
  name: true,
  role: true,
  isVerified: true,
  createdAt: true,
  lastLogin: true,
});

/**
 * Finds multiple users based on provided criteria.
 * @param options - Optional Prisma findMany arguments (where, orderBy, etc.). Defaults to selecting safe fields.
 * @returns A promise that resolves to an array of users.
 */
export async function findUsers(
  options?: Omit<Prisma.UserFindManyArgs, 'select'>
) {
  try {
    return prisma!.user.findMany({
      ...options,
      select: userSelectSafe, // Always ensure safe fields are selected
    });
  } catch (error) {
    logger.error('Error finding users:', { error });
    throw error;
  }
}

/**
 * Finds a single user by their email address.
 * @param email - The email address to search for.
 * @returns A promise that resolves to the user or null if not found.
 */
export async function findUserByEmail(email: string) {
  try {
    if (!email) {
      return null; // Avoid unnecessary db call if email is falsy
    }
    return prisma!.user.findUnique({
      where: { email: email.toLowerCase().trim() }, // Ensure email is compared consistently
    });
  } catch (error) {
    logger.error('Error finding user by email:', { email, error });
    throw error;
  }
}

/**
 * Creates a new user in the database.
 * @param userData - The data for the new user (must include email, name is optional).
 * @returns A promise that resolves to the newly created user, with safe fields selected.
 */
export async function createUser(userData: Prisma.UserCreateInput) {
  try {
    // Ensure required fields are present (although schema validation should also catch this)
    if (!userData.email) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'Email is required to create a user.'
      );
    }

    // Ensure email consistency and default name
    const processedData = {
      ...userData,
      email: userData.email.toLowerCase().trim(),
      name: userData.name || userData.email.split('@')[0],
    };

    return prisma!.user.create({
      data: processedData,
      select: userSelectSafe, // Return only safe fields
    });
  } catch (error) {
    logger.error('Error creating user:', { error });
    throw error;
  }
}

/**
 * Finds a single user by their ID.
 * @param id - The user ID to search for.
 * @param select - Optional selection criteria; defaults to safe fields.
 * @returns A promise that resolves to the user or null if not found.
 */
export async function findUserById(
  id: string,
  select: Prisma.UserSelect = userSelectSafe
) {
  try {
    if (!id) {
      return null; // Avoid unnecessary db call if id is falsy
    }
    return prisma!.user.findUnique({
      where: { id },
      select,
    });
  } catch (error) {
    logger.error('Error finding user by ID:', { id, error });
    throw error;
  }
}

/**
 * Updates an existing user in the database.
 * @param id - The ID of the user to update.
 * @param userData - The data to update for the user.
 * @param select - Optional selection criteria for the returned data; defaults to safe fields.
 * @returns A promise that resolves to the updated user, with the specified fields selected.
 */
export async function updateUser(
  id: string,
  userData: Prisma.UserUpdateInput,
  select: Prisma.UserSelect = userSelectSafe
) {
  try {
    if (!id) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'User ID is required for update'
      );
    }

    // If email is being updated, ensure consistency
    if (userData.email && typeof userData.email === 'string') {
      userData.email = userData.email.toLowerCase().trim();
    }

    return prisma!.user.update({
      where: { id },
      data: userData,
      select,
    });
  } catch (error) {
    logger.error('Error updating user:', { id, error });
    throw error;
  }
}

/**
 * Creates a user if it doesn't exist, or updates it if it does.
 * @param id - The ID of the user to upsert.
 * @param createData - The data for creating the user if it doesn't exist.
 * @param updateData - The data for updating the user if it exists.
 * @param select - Optional selection criteria for the returned data; defaults to safe fields.
 * @returns A promise that resolves to the upserted user, with the specified fields selected.
 */
export async function upsertUser(
  id: string,
  createData: Prisma.UserCreateInput,
  updateData: Prisma.UserUpdateInput = {},
  select: Prisma.UserSelect = userSelectSafe
) {
  try {
    if (!id) {
      throw new ApplicationError(
        ErrorCode.VALIDATION_REQUIRED_FIELD,
        'User ID is required for upsert'
      );
    }

    // Ensure email consistency
    if (createData.email && typeof createData.email === 'string') {
      createData.email = createData.email.toLowerCase().trim();
    }

    // If email is being updated, ensure consistency
    if (updateData.email && typeof updateData.email === 'string') {
      updateData.email = updateData.email.toLowerCase().trim();
    }

    return prisma!.user.upsert({
      where: { id },
      create: createData,
      update: updateData,
      select,
    });
  } catch (error) {
    logger.error('Error upserting user:', { id, error });
    throw error;
  }
}

// New GDPR-related types and functions
export interface UserExportData {
  user: User | null;
  projects: Project[];
  chatMessages: ChatMessage[];
  searchHistory: SearchHistory[];
  privacySettings: unknown | null;
}

/**
 * Find a user by ID with optional related data for GDPR export
 */
export async function findUserByIdWithRelations(
  userId: string,
  includeRelations: boolean = false
): Promise<User | null> {
  try {
    return await prisma!.user.findUnique({
      where: { id: userId },
      include: includeRelations
        ? {
            tenants: {
              include: {
                tenant: true,
              },
            },
          }
        : undefined,
    });
  } catch (error) {
    logger.error('Error finding user by ID with relations:', { userId, error });
    throw error;
  }
}

/**
 * Export all user data for GDPR compliance
 */
export async function exportUserData(userId: string): Promise<UserExportData> {
  try {
    // Get project IDs first to avoid inline .then() calls
    const userProjects = await prisma!.project.findMany({
      where: { userId },
      select: { id: true },
    });
    const projectIds = userProjects.map(p => p.id);

    const [user, projects, chatMessages, searchHistory, privacySettings] =
      await Promise.all([
        prisma!.user.findUnique({
          where: { id: userId },
          include: {
            tenants: {
              include: {
                tenant: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        }),
        prisma!.project.findMany({
          where: {
            userId,
          },
          include: {
            searchHistory: true, // Example: include related search history
          },
        }),
        prisma!.chatMessage.findMany({
          where: {
            projectId: {
              in: projectIds,
            },
          },
          orderBy: {
            timestamp: 'asc',
          },
        }),
        prisma!.searchHistory.findMany({
          where: {
            projectId: {
              in: projectIds,
            },
          },
          orderBy: {
            timestamp: 'desc',
          },
        }),
        prisma!.userPrivacy.findUnique({
          where: { userId },
        }),
      ]);

    return {
      user,
      projects,
      chatMessages,
      searchHistory,
      privacySettings: privacySettings || null,
    };
  } catch (error) {
    logger.error('Error exporting user data:', { userId, error });
    throw error;
  }
}

/**
 * Anonymize or delete all user data based on tenant settings
 */
export async function deleteUserData(
  userId: string,
  tenantId: string
): Promise<void> {
  try {
    const tenant = await prisma!.tenant.findUnique({ where: { id: tenantId } });

    if (!tenant) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        'Tenant not found during user deletion.'
      );
    }

    // Check tenant settings for data retention policy
    // Since dataRetentionPolicy field doesn't exist, we'll default to soft delete
    // unless tenant settings specify otherwise
    const tenantSettings = tenant.settings ? JSON.parse(tenant.settings) : {};
    const isHardDelete =
      tenantSettings.dataRetentionPolicy === 'DELETE_IMMEDIATELY';

    await prisma!.$transaction(async tx => {
      // Find all projects associated with the user
      const projects = await tx.project.findMany({
        where: { userId },
        select: { id: true },
      });
      const projectIds = projects.map(p => p.id);

      // Handle related data first
      // ChatMessage doesn't have userId, so we need to delete by projectIds
      await tx.chatMessage.deleteMany({
        where: { projectId: { in: projectIds } },
      });
      await tx.searchHistory.deleteMany({
        where: { projectId: { in: projectIds } },
      });
      await tx.userPrivacy.deleteMany({ where: { userId } });

      // Now handle the user itself
      if (isHardDelete) {
        await tx.user.delete({ where: { id: userId } });
      } else {
        await tx.user.update({
          where: { id: userId },
          data: {
            email: `anonymized-${userId}@example.com`,
            name: 'Anonymized User',
            passwordHash: null,
            isVerified: false,
            role: 'USER', // or a specific 'ANONYMIZED' role
            deletedAt: new Date(),
          },
        });
      }
    });
  } catch (error) {
    logger.error('Error deleting user data:', { userId, error });
    throw error;
  }
}

/**
 * Get all users
 * Note: Use with caution, might be slow with many users.
 */
export async function getAllUsers(): Promise<SafeUser[]> {
  try {
    return await prisma!.user.findMany({
      select: userSelectSafe,
    });
  } catch (error) {
    logger.error('Error fetching all users:', { error });
    throw error;
  }
}

/**
 * Updates privacy consent for a user.
 * @param userId - The ID of the user.
 * @param consent - The consent settings to update.
 * @returns The updated privacy settings record.
 */
export async function updateUserConsent(
  userId: string,
  consent: {
    dataProcessingConsent?: boolean;
    marketingConsent?: boolean;
    analyticsConsent?: boolean;
    thirdPartyConsent?: boolean;
    dataRetentionDays?: number;
  }
): Promise<unknown> {
  try {
    return await prisma!.userPrivacy.upsert({
      where: { userId },
      create: {
        userId,
        dataProcessingConsent: consent.dataProcessingConsent ?? false,
        marketingConsent: consent.marketingConsent ?? false,
        dataRetentionDays: consent.dataRetentionDays ?? 365,
        consentedAt: consent.dataProcessingConsent ? new Date() : undefined,
      },
      update: {
        dataProcessingConsent: consent.dataProcessingConsent,
        marketingConsent: consent.marketingConsent,
        dataRetentionDays: consent.dataRetentionDays,
        consentedAt: consent.dataProcessingConsent ? new Date() : undefined,
      },
    });
  } catch (error) {
    logger.error('Error updating user consent:', { userId, error });
    throw error;
  }
}

/**
 * Retrieves privacy settings for a user.
 * @param userId - The ID of the user.
 * @returns The user's privacy settings or null if not found.
 */
export async function getUserPrivacySettings(
  userId: string
): Promise<any | null> {
  try {
    const settings = await prisma!.userPrivacy.findUnique({
      where: { userId },
    });
    return settings || null;
  } catch (error) {
    logger.error('Error retrieving user privacy settings:', { userId, error });
    throw error;
  }
}

// Define a type for the safe user data returned by queries
export type SafeUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isVerified: boolean;
  lastLogin: Date | null;
  createdAt: Date;
};

/**
 * Get all users in a tenant with their user details
 * @param tenantId The tenant ID
 * @returns Array of users in the tenant
 */
export async function getUsersInTenant(tenantId: string): Promise<SafeUser[]> {
  try {
    logger.debug('Getting users for tenant', { tenantId });

    const tenantUsers = await prisma!.userTenant.findMany({
      where: { tenantId },
      include: {
        user: {
          select: userSelectSafe,
        },
      },
    });

    const users = tenantUsers.map(tu => tu.user);
    logger.debug(`Found ${users.length} users in tenant ${tenantId}`);
    return users;
  } catch (error) {
    logger.error('Error getting users in tenant:', { tenantId, error });
    throw error;
  }
}

/**
 * Check if a user exists in a tenant
 * @param userId The user ID
 * @param tenantId The tenant ID
 * @returns True if user is in the tenant
 */
export async function isUserInTenant(
  userId: string,
  tenantId: string
): Promise<boolean> {
  try {
    logger.debug('Checking if user is in tenant', { userId, tenantId });

    const userTenant = await prisma!.userTenant.findFirst({
      where: {
        userId,
        tenantId,
      },
    });

    const exists = !!userTenant;
    logger.debug(
      `User ${userId} ${exists ? 'is' : 'is not'} in tenant ${tenantId}`
    );
    return exists;
  } catch (error) {
    logger.error('Error checking user tenant membership:', {
      userId,
      tenantId,
      error,
    });
    return false;
  }
}
