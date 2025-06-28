import { NextApiResponse } from 'next';
import {
  getHealthCheckService,
  HealthStatus,
} from '@/lib/monitoring/health-check';
import { logger } from '@/lib/monitoring/logger';
import { z } from 'zod';
import { AuthenticatedRequest } from '@/types/middleware';
import { SecurePresets } from '@/lib/api/securePresets';

// Query schema for health endpoint
const healthQuerySchema = z.object({
  detailed: z.coerce.boolean().optional().default(false),
});

type HealthQueryParams = z.infer<typeof healthQuerySchema>;

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: System health check
 *     description: Comprehensive health check for all system components
 *     tags: [System]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: detailed
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include detailed health information
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, degraded, unhealthy]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                 uptime:
 *                   type: number
 *                   description: System uptime in seconds
 *                 checks:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                         enum: [healthy, degraded, unhealthy]
 *                       message:
 *                         type: string
 *                       duration:
 *                         type: number
 *                       details:
 *                         type: object
 *       503:
 *         description: System is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<void> {
  const healthService = getHealthCheckService();
  const health = await healthService.checkHealth();

  const { detailed } = healthQuerySchema.parse(req.query);

  // Simple health response for load balancers
  if (!detailed) {
    const statusCode = health.status === HealthStatus.HEALTHY ? 200 : 503;
    res.status(statusCode).json({
      status: health.status,
      timestamp: health.timestamp,
    });
    return;
  }

  // Detailed health response
  const statusCode =
    health.status === HealthStatus.HEALTHY
      ? 200
      : health.status === HealthStatus.DEGRADED
        ? 200
        : 503;

  // Log unhealthy or degraded status
  if (health.status !== HealthStatus.HEALTHY) {
    logger.warn('System health check failed', {
      status: health.status,
      failedChecks: Object.entries(health.checks)
        .filter(([_, check]) => check.status !== HealthStatus.HEALTHY)
        .map(([name, check]) => ({ name, ...check })),
    });
  }

  res.status(statusCode).json(health);
}

// Use SecurePresets for a public endpoint
export default SecurePresets.public(handler);
