import { Prisma, Project } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/monitoring/logger';
import { ApplicationError, ErrorCode } from '@/lib/error';
import {
  basicProjectSelect,
  projectSelectWithDetails,
  type ProjectBasicInfo,
  type ProjectWithDetails,
} from './types';

/**
 * Finds a single project by its ID, ensuring it belongs to the specified tenant.
 * Includes related documents and saved prior art items.
 * @param projectId The ID of the project.
 * @param tenantId The ID of the tenant the project must belong to.
 * @returns A promise resolving to the project with documents and prior art, or null if not found/not in tenant.
 */
export async function findProjectById(
  projectId: string,
  tenantId: string
): Promise<ProjectWithDetails | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      tenantId: tenantId,
    },
    select: projectSelectWithDetails,
  });

  if (!project) {
    return null;
  }

  // Simply return the project - no migration tracking needed
  return project;
}

/**
 * Finds all projects for a specific user within a specific tenant.
 * Includes related documents.
 * @param tenantId The ID of the tenant.
 * @param userId The ID of the user.
 * @param options Optional Prisma findMany arguments (e.g., orderBy).
 * @returns A promise resolving to an array of projects with documents.
 */
export async function findProjectsByTenant(
  tenantId: string,
  userId: string,
  options?: Omit<Prisma.ProjectFindManyArgs, 'where' | 'select' | 'include'>
): Promise<ProjectBasicInfo[]> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  logger.info(
    '[findProjectsByTenant] Querying projects with soft delete filter',
    {
      tenantId,
      userId,
    }
  );

  return prisma.project.findMany({
    where: {
      tenantId: tenantId,
      userId: userId,
      deletedAt: null, // Explicitly exclude soft-deleted projects
    },
    select: basicProjectSelect,
    ...options,
  });
}

/**
 * Finds projects for a user within a tenant with pagination, filtering, and sorting.
 * This method performs database-level operations for optimal performance.
 * @param tenantId The ID of the tenant.
 * @param userId The ID of the user.
 * @param options Pagination and filtering options.
 * @returns A promise resolving to paginated projects with total count.
 */
export async function findProjectsByTenantPaginated(
  tenantId: string,
  userId: string,
  options: {
    skip: number;
    take: number;
    search?: string;
    filterBy?: 'all' | 'recent' | 'complete' | 'in-progress' | 'draft';
    orderBy?: Prisma.ProjectOrderByWithRelationInput;
  }
): Promise<{ projects: ProjectBasicInfo[]; total: number }> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  const { skip, take, search, filterBy, orderBy } = options;

  // Build the where clause
  const where: Prisma.ProjectWhereInput = {
    tenantId: tenantId,
    userId: userId,
    deletedAt: null,
  };

  // Add search filter
  if (search && search.trim()) {
    // SQL Server (the current provider) uses case-insensitive collation by default.
    // The `mode: 'insensitive'` option is not supported for this provider and causes
    // a Prisma validation error. We therefore omit it and rely on the database
    // collation to provide case-insensitive matching. If we later migrate to a
    // provider that supports the `mode` flag (e.g., PostgreSQL or MySQL), we can
    // revisit this implementation or detect the provider at runtime.

    where.name = {
      contains: search.trim(),
    };
  }

  // Add status filter
  if (filterBy && filterBy !== 'all') {
    // For now, we'll handle 'recent' filter
    // TODO: Implement complete/in-progress/draft filters based on document analysis
    if (filterBy === 'recent') {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      where.updatedAt = {
        gte: twoDaysAgo,
      };
    }
    // Note: For complete/in-progress/draft filters, we would need to join with documents
    // and analyze their content. This is complex and might require a different approach
    // or storing completion status as a computed field on the project.
  }

  logger.info(
    '[findProjectsByTenantPaginated] Querying projects with filters',
    {
      tenantId,
      userId,
      skip,
      take,
      search,
      filterBy,
    }
  );

  // Execute both queries in parallel for better performance
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      select: basicProjectSelect,
      skip,
      take,
      orderBy: orderBy || { updatedAt: 'desc' },
    }),
    prisma.project.count({ where }),
  ]);

  return { projects, total };
}

/**
 * Creates a new project without default documents.
 * Documents and ApplicationVersions are created on-demand when needed.
 * @param data Project creation data (name, status, etc.).
 * @param userId The ID of the user creating the project.
 * @param tenantId The ID of the tenant the project belongs to.
 * @returns A promise resolving to the newly created project.
 */
export async function createProject(
  data: Pick<
    Prisma.ProjectUncheckedCreateInput,
    'name' | 'status' | 'textInput'
  >,
  userId: string,
  tenantId: string
): Promise<ProjectBasicInfo> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    // Simply create the project without any transaction or additional records
    const projectData: Prisma.ProjectUncheckedCreateInput = {
      name: data.name,
      userId: userId,
      tenantId: tenantId,
      status: data.status || 'draft',
      textInput: data.textInput || '',
    };

    const createdProject = await prisma.project.create({
      data: projectData,
      select: basicProjectSelect,
    });

    return createdProject;
  } catch (error) {
    // Handle Prisma-specific errors and convert to application errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error('Database error creating project', {
        error: error,
        code: error.code,
        userId,
        tenantId,
      });

      // Handle specific Prisma error codes
      if (error.code === 'P2002') {
        // Unique constraint violation
        const field = error.meta?.target;
        throw new ApplicationError(
          ErrorCode.DB_DUPLICATE_ENTRY,
          `A project with this ${field || 'name'} already exists. Cause: ${error.message}`
        );
      } else if (error.code === 'P2003') {
        // Foreign key constraint violation
        throw new ApplicationError(
          ErrorCode.DB_CONSTRAINT_VIOLATION,
          `Invalid tenant or user reference. Cause: ${error.message}`
        );
      }

      // Generic database error for other Prisma errors
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        `Failed to create project due to a database error. Cause: ${error.message}`
      );
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Creates a new project and its default associated documents within a transaction.
 * @deprecated Use createProject() instead for better performance. Documents should be created on-demand.
 * @param data Project creation data (name, status, etc.).
 * @param userId The ID of the user creating the project.
 * @param tenantId The ID of the tenant the project belongs to.
 * @returns A promise resolving to the newly created project with documents.
 */
export async function createProjectWithDocuments(
  data: Pick<
    Prisma.ProjectUncheckedCreateInput,
    'name' | 'status' | 'textInput'
  >,
  userId: string,
  tenantId: string
): Promise<ProjectBasicInfo> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    const newProjectResult = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. Prepare Project Data
        const projectData: Prisma.ProjectUncheckedCreateInput = {
          name: data.name,
          userId: userId,
          tenantId: tenantId,
          status: data.status || 'draft',
          textInput: data.textInput || '',
        };

        // 2. Create the Project
        const createdProject = await tx.project.create({
          data: projectData,
        });

        // 3. Create the Initial Application Version
        const initialVersion = await tx.applicationVersion.create({
          data: {
            projectId: createdProject.id,
            userId: userId,
            name: 'Initial Setup', // Default name for the very first version state
          },
        });

        // 4. Create Default Documents linked to the Initial Version
        //    in the standard order
        const defaultDocsData = [
          { type: 'TITLE', content: '' }, // From standard order
          { type: 'FIELD', content: '' }, // Added, From standard order
          { type: 'BACKGROUND', content: '' }, // From standard order
          { type: 'SUMMARY', content: '' }, // From standard order
          { type: 'BRIEF_DESCRIPTION_OF_THE_DRAWINGS', content: '' }, // Added, From standard order (Underscores for type)
          { type: 'DETAILED_DESCRIPTION', content: '' }, // Added, From standard order (Underscores for type)
          { type: 'CLAIM_SET', content: '' }, // Using CLAIM_SET assuming it maps to CLAIMS. From standard order.
          { type: 'ABSTRACT', content: '' }, // From standard order
          // Removed: { type: 'FIGURES', content: '' }
          // Removed: { type: 'DESCRIPTION', content: '' } (Replaced by DETAILED_DESCRIPTION)
        ].map(doc => ({ ...doc, applicationVersionId: initialVersion.id }));

        await tx.document.createMany({
          data: defaultDocsData,
        });

        // 5. Fetch the created project with BASIC info to return
        const result = await tx.project.findUnique({
          where: { id: createdProject.id },
          select: basicProjectSelect,
        });

        if (!result) {
          // This should ideally not happen if creation succeeded
          throw new ApplicationError(
            ErrorCode.DB_QUERY_ERROR,
            'Failed to fetch newly created project within transaction.'
          );
        }
        return result;
      }
    );

    // Ensure result exists before returning
    if (!newProjectResult) {
      throw new ApplicationError(
        ErrorCode.DB_TRANSACTION_FAILED,
        'Project creation transaction failed unexpectedly.'
      );
    }
    return newProjectResult;
  } catch (error) {
    // Handle Prisma-specific errors and convert to application errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error('Database error creating project', {
        error: error,
        code: error.code,
        userId,
        tenantId,
      });

      // Handle specific Prisma error codes
      if (error.code === 'P2002') {
        // Unique constraint violation
        const field = error.meta?.target;
        throw new ApplicationError(
          ErrorCode.DB_DUPLICATE_ENTRY,
          `A project with this ${field || 'name'} already exists. Cause: ${error.message}`
        );
      } else if (error.code === 'P2003') {
        // Foreign key constraint violation
        throw new ApplicationError(
          ErrorCode.DB_CONSTRAINT_VIOLATION,
          `Invalid tenant or user reference. Cause: ${error.message}`
        );
      }

      // Generic database error for other Prisma errors
      throw new ApplicationError(
        ErrorCode.DB_QUERY_ERROR,
        `Failed to create project due to a database error. Cause: ${error.message}`
      );
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Finds the ID of the most recently updated project for a specific user within a specific tenant.
 * @param userId The ID of the user.
 * @param tenantId The ID of the tenant.
 * @returns A promise resolving to the project ID or null if no projects found.
 */
export async function findMostRecentProjectIdForTenantUser(
  userId: string,
  tenantId: string
): Promise<string | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    logger.debug(
      `Repository: Finding most recent project ID for user ${userId} in tenant ${tenantId}`
    );
    const recentProject = await prisma.project.findFirst({
      where: {
        userId: userId,
        tenantId: tenantId, // Added tenantId to the query
        deletedAt: null, // Ensure we don't return soft-deleted projects
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
      },
    });
    logger.debug(
      `Repository: Found most recent project ID for tenant user: ${recentProject?.id ?? 'none'}`
    );
    return recentProject?.id ?? null;
  } catch (error) {
    logger.error(
      `Repository error finding most recent project for user ${userId} in tenant ${tenantId}:`,
      { error: error instanceof Error ? error : new Error(String(error)) }
    );
    // Throw an error instead of returning null
    const cause = error instanceof Error ? error : new Error(String(error));
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to get most recent project. Cause: ${cause.message}`
    );
  }
}

/**
 * Finds a single project by its ID, ensuring it belongs to the specified user and tenant.
 * Returns the full Project model if found and authorized.
 * @param projectId The ID of the project.
 * @param userId The ID of the user the project must belong to.
 * @param tenantId The ID of the tenant the project must belong to.
 * @returns A promise resolving to the project, or null if not found or not authorized (user/tenant mismatch) or on error.
 */
export async function findProjectByIdForTenantUser(
  projectId: string,
  userId: string,
  tenantId: string
): Promise<Project | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  try {
    logger.debug(
      `Repository: Finding project ${projectId} for user ${userId} in tenant ${tenantId}`
    );
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: userId,
        tenantId: tenantId, // Added tenantId to the query
        deletedAt: null, // Exclude soft-deleted projects
      },
      // No specific select here, so it will return the full Project model
      // Adjust with a select object if only specific fields are needed
    });

    if (!project) {
      logger.warn(
        `Repository: Project ${projectId} not found for user ${userId} in tenant ${tenantId}.`
      );
      return null;
    }

    logger.debug(
      `Repository: Project ${projectId} found for user ${userId} in tenant ${tenantId}.`
    );
    return project;
  } catch (error) {
    logger.error(
      `Repository error finding project ${projectId} for user ${userId} in tenant ${tenantId}:`,
      { error: error instanceof Error ? error : new Error(String(error)) }
    );
    // Throw an error instead of returning null
    const cause = error instanceof Error ? error : new Error(String(error));
    throw new ApplicationError(
      ErrorCode.DB_QUERY_ERROR,
      `Failed to find project. Cause: ${cause.message}`
    );
  }
}

export async function findProjectByIdAndTenant(
  projectId: string,
  tenantId: string
): Promise<ProjectWithDetails | null> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      tenantId: tenantId,
    },
    select: projectSelectWithDetails,
  });

  if (!project) {
    return null;
  }

  // Simply return the project - no migration tracking needed
  return project;
}

/**
 * Gets the complete workspace data for a project including invention, claims, and figures
 * @param projectId The ID of the project
 * @param tenantId The ID of the tenant
 * @returns A promise resolving to the workspace data or null if not found
 */
export async function getProjectWorkspace(
  projectId: string,
  tenantId: string
): Promise<any> {
  if (!prisma) {
    throw new ApplicationError(
      ErrorCode.DB_CONNECTION_ERROR,
      'Database client is not initialized.'
    );
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      tenantId: tenantId,
      deletedAt: null,
    },
    include: {
      invention: {
        include: {
          claims: true,
        },
      },
    },
  });

  if (!project) {
    return null;
  }

  // Get the project figures
  const figures = await prisma.projectFigure.findMany({
    where: {
      projectId: projectId,
      deletedAt: null,
    },
    orderBy: {
      displayOrder: 'asc',
    },
  });

  return {
    invention: project.invention,
    claims: project.invention?.claims || [],
    figures: figures,
  };
}
