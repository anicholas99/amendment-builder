import { prisma } from '@/lib/prisma';
import { enhancedLogger as logger } from './enhanced-logger';
import { performance } from 'perf_hooks';
import { environment } from '@/config/environment';
import { healthRepository } from '@/repositories/healthRepository';

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

export interface HealthCheckResult {
  status: HealthStatus;
  message?: string;
  duration?: number;
  details?: Record<string, unknown>;
}

export interface SystemHealth {
  status: HealthStatus;
  timestamp: string;
  version: string;
  uptime: number;
  checks: Record<string, HealthCheckResult>;
}

export abstract class BaseHealthCheck {
  abstract name: string;
  abstract timeout: number;

  async check(): Promise<HealthCheckResult> {
    const startTime = performance.now();

    try {
      const timeoutPromise = new Promise<HealthCheckResult>((_, reject) => {
        setTimeout(
          () =>
            reject(new Error(`Health check timeout after ${this.timeout}ms`)),
          this.timeout
        );
      });

      const checkPromise = this.performCheck();

      const result = await Promise.race([checkPromise, timeoutPromise]);
      const duration = performance.now() - startTime;

      return { ...result, duration };
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.error(`Health check failed: ${this.name}`, { error, duration });

      return {
        status: HealthStatus.UNHEALTHY,
        message: error instanceof Error ? error.message : 'Unknown error',
        duration,
      };
    }
  }

  protected abstract performCheck(): Promise<HealthCheckResult>;
}

// Database health check
export class DatabaseHealthCheck extends BaseHealthCheck {
  name = 'database';
  timeout = 5000;

  constructor() {
    super();
  }

  protected async performCheck(): Promise<HealthCheckResult> {
    try {
      const isConnected = await healthRepository.isConnected();
      if (!isConnected) {
        throw new Error('Database connection failed via repository check.');
      }

      const tenantCount = await healthRepository.getTenantCount();

      return {
        status: HealthStatus.HEALTHY,
        message: 'Database is responsive',
        details: {
          connected: true,
          tenantCount,
        },
      };
    } catch (error) {
      return {
        status: HealthStatus.UNHEALTHY,
        message: 'Database connection failed',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}

// Redis health check (if Redis is configured)
export class RedisHealthCheck extends BaseHealthCheck {
  name = 'redis';
  timeout = 3000;

  constructor(private redisUrl?: string) {
    super();
  }

  protected async performCheck(): Promise<HealthCheckResult> {
    if (!this.redisUrl) {
      return {
        status: HealthStatus.HEALTHY,
        message: 'Redis not configured (using in-memory fallback)',
      };
    }

    // Since we don't have Redis client imported, we'll check if the service is reachable
    try {
      const url = new URL(this.redisUrl);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      try {
        const response = await fetch(
          `http://${url.hostname}:${url.port || 6379}`,
          {
            signal: controller.signal,
          }
        ).catch(() => null);
        clearTimeout(timeoutId);

        return {
          status: response ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
          message: response
            ? 'Redis is reachable'
            : 'Redis unreachable, using fallback',
        };
      } finally {
        clearTimeout(timeoutId);
      }
    } catch {
      return {
        status: HealthStatus.DEGRADED,
        message: 'Redis check failed, using in-memory fallback',
      };
    }
  }
}

// External API health check
export class ExternalAPIHealthCheck extends BaseHealthCheck {
  name = 'external-apis';
  timeout = 10000;

  protected async performCheck(): Promise<HealthCheckResult> {
    const checks = {
      auth0: await this.checkAuth0(),
      openai: await this.checkOpenAI(),
      cardinal: await this.checkCardinal(),
    };

    const failedChecks = Object.entries(checks).filter(
      ([_, result]) => !result.healthy
    );

    if (failedChecks.length === 0) {
      return {
        status: HealthStatus.HEALTHY,
        message: 'All external APIs are responsive',
        details: checks,
      };
    } else if (failedChecks.length < Object.keys(checks).length) {
      return {
        status: HealthStatus.DEGRADED,
        message: `${failedChecks.length} external API(s) are unreachable`,
        details: checks,
      };
    } else {
      return {
        status: HealthStatus.UNHEALTHY,
        message: 'All external APIs are unreachable',
        details: checks,
      };
    }
  }

  private async checkAuth0(): Promise<{ healthy: boolean; message: string }> {
    try {
      const domain = environment.auth.domain;
      if (!domain) {
        return { healthy: false, message: 'Auth0 domain not configured' };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(
          `https://${domain}/.well-known/openid-configuration`,
          {
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);

        return {
          healthy: response.ok,
          message: 'Auth0 is responsive',
        };
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      return {
        healthy: false,
        message: 'Auth0 health check failed',
      };
    }
  }

  private async checkOpenAI(): Promise<{ healthy: boolean; message: string }> {
    try {
      const apiKey = environment.openai.apiKey;
      if (!apiKey) {
        return { healthy: false, message: 'OpenAI API key not configured' };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        // Check OpenAI API status endpoint
        const response = await fetch(
          'https://status.openai.com/api/v2/status.json',
          {
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          return {
            healthy: data?.status?.indicator === 'none',
            message: data?.status?.description || 'OpenAI status unknown',
          };
        } else {
          return {
            healthy: false,
            message: 'OpenAI status check failed',
          };
        }
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      return {
        healthy: false,
        message: 'OpenAI health check failed',
      };
    }
  }

  private async checkCardinal(): Promise<{
    healthy: boolean;
    message: string;
  }> {
    try {
      const baseUrl = environment.cardinal.apiBaseUrl;
      if (!baseUrl) {
        return { healthy: false, message: 'Cardinal API URL not configured' };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        // Assuming Cardinal has a health endpoint
        const response = await fetch(`${baseUrl}/health`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        return {
          healthy: response.status < 500,
          message:
            response.status < 500
              ? 'Cardinal API is responsive'
              : 'Cardinal API error',
        };
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      return {
        healthy: false,
        message: 'Cardinal API health check failed',
      };
    }
  }
}

// Storage health check
export class StorageHealthCheck extends BaseHealthCheck {
  name = 'storage';
  timeout = 5000;

  protected async performCheck(): Promise<HealthCheckResult> {
    try {
      const storageType = environment.storage.type;

      if (storageType === 'azure') {
        // Check Azure Blob Storage
        const connectionString = environment.azure.storageConnectionString;
        if (!connectionString) {
          return {
            status: HealthStatus.UNHEALTHY,
            message: 'Azure Storage connection string not configured',
          };
        }

        // Simple check - we'd need to import Azure SDK for a real check
        return {
          status: HealthStatus.HEALTHY,
          message: 'Azure Storage configured',
          details: { type: 'azure' },
        };
      }

      // Local storage check
      const fs = await import('fs/promises');
      const dataDir = './data';

      try {
        await fs.access(dataDir, fs.constants.R_OK | fs.constants.W_OK);
        return {
          status: HealthStatus.HEALTHY,
          message: 'Local storage is accessible',
          details: { type: 'local', path: dataDir },
        };
      } catch {
        return {
          status: HealthStatus.UNHEALTHY,
          message: 'Local storage directory not accessible',
          details: { type: 'local', path: dataDir },
        };
      }
    } catch (error) {
      return {
        status: HealthStatus.UNHEALTHY,
        message: 'Storage health check failed',
      };
    }
  }
}

// Memory health check
export class MemoryHealthCheck extends BaseHealthCheck {
  name = 'memory';
  timeout = 1000;

  protected async performCheck(): Promise<HealthCheckResult> {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const rssMB = Math.round(memoryUsage.rss / 1024 / 1024);

    const heapPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    let status = HealthStatus.HEALTHY;
    let message = 'Memory usage is normal';

    if (heapPercentage > 90) {
      status = HealthStatus.UNHEALTHY;
      message = 'Critical memory usage';
    } else if (heapPercentage > 75) {
      status = HealthStatus.DEGRADED;
      message = 'High memory usage';
    }

    return {
      status,
      message,
      details: {
        heapUsedMB,
        heapTotalMB,
        rssMB,
        heapPercentage: Math.round(heapPercentage),
      },
    };
  }
}

// Main health check orchestrator
export class HealthCheckService {
  private checks: BaseHealthCheck[] = [];

  constructor() {
    this.initializeChecks();
  }

  private initializeChecks() {
    this.checks = [
      new DatabaseHealthCheck(),
      new RedisHealthCheck(environment.redis.url),
      new ExternalAPIHealthCheck(),
      new StorageHealthCheck(),
      new MemoryHealthCheck(),
    ];
  }

  async checkHealth(): Promise<SystemHealth> {
    const startTime = performance.now();
    const results: Record<string, HealthCheckResult> = {};

    // Run all checks in parallel
    const checkPromises = this.checks.map(async check => {
      const result = await check.check();
      results[check.name] = result;
    });

    await Promise.all(checkPromises);

    // Determine overall system status
    const statuses = Object.values(results).map(r => r.status);
    let overallStatus = HealthStatus.HEALTHY;

    if (statuses.includes(HealthStatus.UNHEALTHY)) {
      overallStatus = HealthStatus.UNHEALTHY;
    } else if (statuses.includes(HealthStatus.DEGRADED)) {
      overallStatus = HealthStatus.DEGRADED;
    }

    const totalDuration = performance.now() - startTime;

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: environment.version,
      uptime: process.uptime(),
      checks: results,
    };
  }

  async close() {
    // No longer responsible for disconnecting its own client
    // The main prisma client is managed globally
  }
}

// Singleton instance
let healthCheckService: HealthCheckService | null = null;

export function getHealthCheckService(): HealthCheckService {
  if (!healthCheckService) {
    healthCheckService = new HealthCheckService();
  }
  return healthCheckService;
}
