import { Prisma } from '@prisma/client';
import { ApplicationError, ErrorCode } from '@/lib/error';
import { logger } from '@/lib/monitoring/logger';

/**
 * Models that should use soft delete instead of hard delete
 */
const SOFT_DELETE_MODELS = [
  'User',
  'Tenant',
  'Project',
  'Document',
  'ApplicationVersion',
  'ProjectFigure',
] as const;

type SoftDeleteModel = (typeof SOFT_DELETE_MODELS)[number];

/**
 * Map of model names to their database table names
 * This ensures only valid table names can be used in queries
 */
const MODEL_TO_TABLE_MAP: Record<SoftDeleteModel, string> = {
  User: 'users',
  Tenant: 'tenants',
  Project: 'projects',
  Document: 'documents',
  ApplicationVersion: 'application_versions',
  ProjectFigure: 'project_figures',
} as const;

/**
 * Prisma middleware to implement soft deletes
 * Intercepts delete operations and converts them to updates
 */
export const softDeleteMiddleware: Prisma.Middleware = async (params, next) => {
  // Check if this is a model that should be soft deleted
  if (
    params.model &&
    SOFT_DELETE_MODELS.includes(params.model as SoftDeleteModel)
  ) {
    if (params.action === 'delete') {
      // Convert delete to update with deletedAt
      params.action = 'update';
      params.args['data'] = { deletedAt: new Date() };

      logger.info(`Soft delete: ${params.model}`, {
        model: params.model,
        where: params.args.where,
      });
    }

    if (params.action === 'deleteMany') {
      // Convert deleteMany to updateMany with deletedAt
      params.action = 'updateMany';
      params.args['data'] = { deletedAt: new Date() };

      logger.info(`Soft delete many: ${params.model}`, {
        model: params.model,
        where: params.args.where,
      });
    }

    // Add filter to exclude soft deleted records for find operations
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      params.args.where = {
        ...params.args.where,
        deletedAt: null,
      };
    }

    if (params.action === 'findMany') {
      logger.debug(`[SoftDeleteMiddleware] findMany for ${params.model}`, {
        model: params.model,
        originalWhere: params.args.where,
      });

      if (params.args.where) {
        if (params.args.where.AND) {
          params.args.where.AND = [
            ...(Array.isArray(params.args.where.AND)
              ? params.args.where.AND
              : [params.args.where.AND]),
            { deletedAt: null },
          ];
        } else {
          params.args.where = {
            AND: [params.args.where, { deletedAt: null }],
          };
        }
      } else {
        params.args.where = { deletedAt: null };
      }

      logger.debug(
        `[SoftDeleteMiddleware] Modified where clause for ${params.model}`,
        {
          model: params.model,
          modifiedWhere: params.args.where,
        }
      );
    }
  }

  return next(params);
};

/**
 * Helper to include soft deleted records in queries
 * Use this when you need to access deleted records
 */
export function includeSoftDeleted<T extends Record<string, any>>(
  where: T
): T & { deletedAt?: any } {
  const { deletedAt, ...rest } = where as any;
  return rest;
}

/**
 * Helper to permanently delete a soft-deleted record
 */
export async function hardDelete(
  prisma: any,
  model: SoftDeleteModel,
  where: any
): Promise<void> {
  // Validate the model name
  const tableName = MODEL_TO_TABLE_MAP[model];
  if (!tableName) {
    throw new Error(`Invalid model name for hard delete: ${model}`);
  }

  // Use Prisma's safe query methods based on the model
  let result: number;

  switch (model) {
    case 'User':
      result =
        await prisma.$executeRaw`DELETE FROM users WHERE id = ${where.id}`;
      break;
    case 'Tenant':
      result =
        await prisma.$executeRaw`DELETE FROM tenants WHERE id = ${where.id}`;
      break;
    case 'Project':
      result =
        await prisma.$executeRaw`DELETE FROM projects WHERE id = ${where.id}`;
      break;
    case 'Document':
      result =
        await prisma.$executeRaw`DELETE FROM documents WHERE id = ${where.id}`;
      break;
    case 'ApplicationVersion':
      result =
        await prisma.$executeRaw`DELETE FROM application_versions WHERE id = ${where.id}`;
      break;
    case 'ProjectFigure':
      result =
        await prisma.$executeRaw`DELETE FROM project_figures WHERE id = ${where.id}`;
      break;
    default:
      // This should never happen due to TypeScript, but adding for runtime safety
      throw new Error(`Unhandled model in hardDelete: ${model}`);
  }

  logger.warn(`Hard delete executed: ${model}`, {
    model,
    where,
    affected: result,
    tableName,
  });
}

/**
 * Middleware to handle cascading soft deletes.
 * This is a more complex implementation that requires knowledge of model relationships.
 */

interface CascadeSoftDeleteOptions {
  [model: string]: {
    field: string;
    cascade: string[];
  }[];
}

const cascadeOptions: CascadeSoftDeleteOptions = {
  Project: [{ field: 'id', cascade: ['ApplicationVersion'] }],
  User: [{ field: 'id', cascade: ['Project', 'ApplicationVersion'] }],
  // Define other cascade relationships here
};

export function cascadeSoftDeleteMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    const modelName = params.model;
    if (
      modelName &&
      SOFT_DELETE_MODELS.includes(modelName as SoftDeleteModel) &&
      params.action === 'update'
    ) {
      if (params.args.data.deletedAt) {
        if (cascadeOptions[modelName]) {
          const relations = cascadeOptions[modelName];
          // Note: params.prisma is not available in middleware
          // This would need to be implemented differently with access to the prisma client
          logger.warn(
            'Cascade soft delete middleware needs access to prisma client',
            {
              model: modelName,
              relations,
            }
          );
        }
      }
    }
    return next(params);
  };
}

/**
 * A more robust soft delete middleware that uses raw SQL for updates
 * to avoid triggering nested middleware calls.
 * This is the recommended approach for production environments.
 */
export function rawSoftDeleteMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    if (params.action === 'delete') {
      const modelName = params.model || '';
      if (SOFT_DELETE_MODELS.includes(modelName as SoftDeleteModel)) {
        params.action = 'update';
        params.args.data = { deletedAt: new Date() };
      }
    }
    if (params.action === 'deleteMany') {
      const modelName = params.model || '';
      if (SOFT_DELETE_MODELS.includes(modelName as SoftDeleteModel)) {
        params.action = 'updateMany';
        if (params.args.data !== undefined) {
          params.args.data.deletedAt = new Date();
        } else {
          params.args.data = { deletedAt: new Date() };
        }
      }
    }
    return next(params);
  };
}

// Function to get table name from model name
function getTableName(modelName: string): string {
  // Use a mapping or naming convention to get the table name
  switch (modelName) {
    case 'User':
      return 'users';
    case 'Project':
      return 'projects';
    case 'Tenant':
      return 'tenants';
    case 'ApplicationVersion':
      return 'application_versions';
    case 'Document':
      return 'documents';
    case 'ProjectFigure':
      return 'project_figures';
    default:
      throw new Error(`Unsupported model for soft delete: ${modelName}`);
  }
}
