import { NextApiRequest } from 'next';
import { auditLogRepository } from '@/repositories/auditLogRepository';
import { AuthenticatedRequest } from '@/types/middleware';
import { logger } from '@/server/logger';

export interface AuditContext {
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  success?: boolean;
  errorMessage?: string;
}

export class AuditService {
  /**
   * Log an audit event from an API request
   */
  static async logApiAction(
    req: AuthenticatedRequest | NextApiRequest,
    context: AuditContext
  ): Promise<void> {
    try {
      const user = 'user' in req && req.user ? req.user : null;
      const startTime = Date.now();

      // Extract IP address (handle proxies)
      const forwarded = req.headers['x-forwarded-for'];
      const ipAddress =
        typeof forwarded === 'string'
          ? forwarded.split(',')[0].trim()
          : req.socket?.remoteAddress || 'unknown';

      // Extract user agent
      const userAgent = req.headers['user-agent'] || 'unknown';

      await auditLogRepository.create({
        userId: user?.id,
        tenantId: user?.tenantId,
        action: context.action,
        resourceType: context.resourceType,
        resourceId: context.resourceId,
        method: req.method,
        path: req.url,
        statusCode: context.success === false ? 400 : 200, // Will be updated by response
        duration: Date.now() - startTime,
        ipAddress,
        userAgent,
        metadata: context.metadata ? JSON.stringify(context.metadata) : null,
        success: context.success !== false,
        errorMessage: context.errorMessage,
        timestamp: new Date(),
      });
    } catch (error) {
      // Audit logging should never break the application
      logger.error('Failed to create audit log', { error, context });
    }
  }

  /**
   * Log a successful login
   */
  static async logLogin(
    req: NextApiRequest,
    userId: string,
    tenantId?: string
  ): Promise<void> {
    await this.logApiAction(req, {
      action: 'user.login',
      resourceType: 'user',
      resourceId: userId,
      metadata: { tenantId },
      success: true,
    });
  }

  /**
   * Log a failed login attempt
   */
  static async logFailedLogin(
    req: NextApiRequest,
    email: string,
    reason: string
  ): Promise<void> {
    await this.logApiAction(req, {
      action: 'user.login.failed',
      resourceType: 'user',
      metadata: { email, reason },
      success: false,
      errorMessage: reason,
    });
  }

  /**
   * Log project operations
   */
  static async logProjectAction(
    req: AuthenticatedRequest,
    action: 'create' | 'update' | 'delete' | 'view',
    projectId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logApiAction(req, {
      action: `project.${action}`,
      resourceType: 'project',
      resourceId: projectId,
      metadata,
      success: true,
    });
  }

  /**
   * Log claim operations
   */
  static async logClaimAction(
    req: AuthenticatedRequest,
    action: 'create' | 'update' | 'delete',
    claimId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logApiAction(req, {
      action: `claim.${action}`,
      resourceType: 'claim',
      resourceId: claimId,
      metadata,
      success: true,
    });
  }

  /**
   * Log data export operations
   */
  static async logDataExport(
    req: AuthenticatedRequest,
    exportType: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logApiAction(req, {
      action: 'data.export',
      resourceType: 'data',
      metadata: { exportType, ...metadata },
      success: true,
    });
  }

  /**
   * Log data deletion operations
   */
  static async logDataDeletion(
    req: AuthenticatedRequest,
    deletionType: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logApiAction(req, {
      action: 'data.delete',
      resourceType: 'data',
      metadata: { deletionType, ...metadata },
      success: true,
    });
  }

  /**
   * Log admin operations
   */
  static async logAdminAction(
    req: AuthenticatedRequest,
    action: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logApiAction(req, {
      action: `admin.${action}`,
      resourceType: 'admin',
      metadata,
      success: true,
    });
  }

  /**
   * Log security events
   */
  static async logSecurityEvent(
    req: NextApiRequest | AuthenticatedRequest,
    event: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logApiAction(req, {
      action: `security.${event}`,
      resourceType: 'security',
      metadata,
      success: true,
    });
  }
}
