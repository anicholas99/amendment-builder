/**
 * File History Cache Manager Service
 * 
 * Manages cache invalidation for file history context when project data changes
 * Ensures security and proper cleanup of cached data
 * 
 * Follows established patterns: service layer, tenant isolation, proper error handling
 */

import { logger } from '@/server/logger';
import { FileHistoryContextBuilder } from './file-history-context-builder.server-service';

/**
 * Cache invalidation manager for file history context
 */
export class FileHistoryCacheManager {
  /**
   * Invalidate file history cache when office action is uploaded/updated
   */
  static async invalidateOnOfficeActionChange(
    projectId: string,
    tenantId: string,
    action: 'UPLOAD' | 'PARSE' | 'UPDATE' | 'DELETE'
  ): Promise<void> {
    try {
      logger.debug('[FileHistoryCacheManager] Invalidating cache for office action change', {
        projectId,
        tenantId,
        action,
      });

      // Invalidate project cache
      FileHistoryContextBuilder.invalidateProjectCache(projectId);

      logger.info('[FileHistoryCacheManager] Cache invalidated for office action change', {
        projectId,
        tenantId,
        action,
      });
    } catch (error) {
      logger.error('[FileHistoryCacheManager] Failed to invalidate cache on office action change', {
        projectId,
        tenantId,
        action,
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw - cache invalidation failures shouldn't break the main operation
    }
  }

  /**
   * Invalidate file history cache when amendment response is filed/updated
   */
  static async invalidateOnAmendmentResponseChange(
    projectId: string,
    tenantId: string,
    amendmentProjectId: string,
    action: 'CREATE' | 'UPDATE' | 'FILE' | 'DELETE'
  ): Promise<void> {
    try {
      logger.debug('[FileHistoryCacheManager] Invalidating cache for amendment response change', {
        projectId,
        tenantId,
        amendmentProjectId,
        action,
      });

      // Invalidate project cache
      FileHistoryContextBuilder.invalidateProjectCache(projectId);

      logger.info('[FileHistoryCacheManager] Cache invalidated for amendment response change', {
        projectId,
        tenantId,
        amendmentProjectId,
        action,
      });
    } catch (error) {
      logger.error('[FileHistoryCacheManager] Failed to invalidate cache on amendment response change', {
        projectId,
        tenantId,
        amendmentProjectId,
        action,
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw - cache invalidation failures shouldn't break the main operation
    }
  }

  /**
   * Invalidate file history cache when claims are updated
   */
  static async invalidateOnClaimChange(
    projectId: string,
    tenantId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE'
  ): Promise<void> {
    try {
      logger.debug('[FileHistoryCacheManager] Invalidating cache for claim change', {
        projectId,
        tenantId,
        action,
      });

      // Invalidate project cache
      FileHistoryContextBuilder.invalidateProjectCache(projectId);

      logger.info('[FileHistoryCacheManager] Cache invalidated for claim change', {
        projectId,
        tenantId,
        action,
      });
    } catch (error) {
      logger.error('[FileHistoryCacheManager] Failed to invalidate cache on claim change', {
        projectId,
        tenantId,
        action,
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw - cache invalidation failures shouldn't break the main operation
    }
  }

  /**
   * Invalidate file history cache when amendment project files are uploaded
   */
  static async invalidateOnAmendmentFileChange(
    projectId: string,
    tenantId: string,
    amendmentProjectId: string,
    fileType: string,
    action: 'UPLOAD' | 'UPDATE' | 'DELETE' | 'FILE'
  ): Promise<void> {
    try {
      logger.debug('[FileHistoryCacheManager] Invalidating cache for amendment file change', {
        projectId,
        tenantId,
        amendmentProjectId,
        fileType,
        action,
      });

      // Only invalidate for file types that affect prosecution history
      const significantFileTypes = [
        'filed_response',
        'draft_response',
        'argument_section',
        'amended_claims',
        'final_package'
      ];

      if (significantFileTypes.includes(fileType)) {
        FileHistoryContextBuilder.invalidateProjectCache(projectId);
        
        logger.info('[FileHistoryCacheManager] Cache invalidated for significant amendment file change', {
          projectId,
          tenantId,
          fileType,
          action,
        });
      } else {
        logger.debug('[FileHistoryCacheManager] Cache not invalidated for non-significant file type', {
          projectId,
          fileType,
        });
      }
    } catch (error) {
      logger.error('[FileHistoryCacheManager] Failed to invalidate cache on amendment file change', {
        projectId,
        tenantId,
        amendmentProjectId,
        fileType,
        action,
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw - cache invalidation failures shouldn't break the main operation
    }
  }

  /**
   * Invalidate cache for tenant (when tenant data changes)
   */
  static async invalidateForTenant(tenantId: string): Promise<void> {
    try {
      logger.debug('[FileHistoryCacheManager] Clearing cache stats for tenant operation', {
        tenantId,
      });

      // Note: We don't have a direct tenant-wide invalidation method
      // because our cache is project-scoped for security reasons
      // This method exists for future enhancement if needed

      const cacheStats = FileHistoryContextBuilder.getCacheStats();
      logger.info('[FileHistoryCacheManager] Current cache stats', {
        tenantId,
        cacheSize: cacheStats.size,
        maxSize: cacheStats.maxSize,
      });
    } catch (error) {
      logger.error('[FileHistoryCacheManager] Failed to handle tenant cache operation', {
        tenantId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  static getCacheStatistics(): {
    size: number;
    maxSize: number;
    ttlMs: number;
    hitRate?: number;
  } {
    return FileHistoryContextBuilder.getCacheStats();
  }

  /**
   * Validate cache health and cleanup if needed
   */
  static async performCacheHealthCheck(): Promise<{
    isHealthy: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const stats = this.getCacheStatistics();
      const issues: string[] = [];
      const recommendations: string[] = [];

      // Check cache size
      if (stats.size > stats.maxSize * 0.9) {
        issues.push('Cache approaching maximum capacity');
        recommendations.push('Consider increasing cache size or reducing TTL');
      }

      // Check if cache is completely full
      if (stats.size >= stats.maxSize) {
        issues.push('Cache at maximum capacity - LRU eviction active');
        recommendations.push('Increase cache size or implement more aggressive cleanup');
      }

      const isHealthy = issues.length === 0;

      logger.debug('[FileHistoryCacheManager] Cache health check completed', {
        isHealthy,
        cacheSize: stats.size,
        maxSize: stats.maxSize,
        issueCount: issues.length,
      });

      return {
        isHealthy,
        issues,
        recommendations,
      };
    } catch (error) {
      logger.error('[FileHistoryCacheManager] Cache health check failed', {
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        isHealthy: false,
        issues: ['Cache health check failed'],
        recommendations: ['Investigate cache implementation'],
      };
    }
  }
}

// ============ HOOK FUNCTIONS FOR INTEGRATION ============

/**
 * Call this when office actions are uploaded, parsed, or updated
 * Integrate with office action upload/processing endpoints
 */
export const invalidateOnOfficeActionChange = FileHistoryCacheManager.invalidateOnOfficeActionChange;

/**
 * Call this when amendment responses are created, updated, or filed
 * Integrate with amendment response endpoints
 */
export const invalidateOnAmendmentResponseChange = FileHistoryCacheManager.invalidateOnAmendmentResponseChange;

/**
 * Call this when claims are modified
 * Integrate with claim management endpoints
 */
export const invalidateOnClaimChange = FileHistoryCacheManager.invalidateOnClaimChange;

/**
 * Call this when amendment files are uploaded or modified
 * Integrate with amendment file upload endpoints
 */
export const invalidateOnAmendmentFileChange = FileHistoryCacheManager.invalidateOnAmendmentFileChange; 