import { logger } from '@/server/logger';
import { prisma } from '@/lib/prisma';

interface ToolUsageMetrics {
  toolName: string;
  executionTime: number;
  success: boolean;
  projectId?: string;
  tenantId?: string;
  timestamp: Date;
  errorType?: string;
  inputSize?: number;
  outputSize?: number;
}

interface ToolPerformanceStats {
  toolName: string;
  totalCalls: number;
  successRate: number;
  averageExecutionTime: number;
  p95ExecutionTime: number;
  errorTypes: Record<string, number>;
  lastUsed: Date;
}

/**
 * Service for tracking and analyzing tool usage patterns
 * This helps identify optimization opportunities and performance bottlenecks
 */
export class ToolAnalyticsService {
  private static metricsBuffer: ToolUsageMetrics[] = [];
  private static readonly BUFFER_SIZE = 100;
  private static readonly FLUSH_INTERVAL = 60000; // 1 minute
  private static flushTimer: NodeJS.Timeout | null = null;

  /**
   * Track tool execution metrics
   */
  static async trackToolExecution(
    toolName: string,
    startTime: number,
    success: boolean,
    context?: {
      projectId?: string;
      tenantId?: string;
      error?: Error;
      inputSize?: number;
      outputSize?: number;
    }
  ): Promise<void> {
    const executionTime = Date.now() - startTime;

    const metric: ToolUsageMetrics = {
      toolName,
      executionTime,
      success,
      projectId: context?.projectId,
      tenantId: context?.tenantId,
      timestamp: new Date(),
      errorType: context?.error?.constructor.name,
      inputSize: context?.inputSize,
      outputSize: context?.outputSize,
    };

    // Add to buffer
    this.metricsBuffer.push(metric);

    // Log slow operations immediately
    if (executionTime > 5000) {
      logger.warn('[ToolAnalytics] Slow tool execution detected', {
        toolName,
        executionTime,
        success,
      });
    }

    // Flush buffer if it's full
    if (this.metricsBuffer.length >= this.BUFFER_SIZE) {
      await this.flushMetrics();
    }

    // Start flush timer if not already running
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(
        () => this.flushMetrics(),
        this.FLUSH_INTERVAL
      );
    }
  }

  /**
   * Flush metrics buffer to persistent storage
   */
  private static async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const metricsToFlush = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      // In production, this would write to a time-series database
      // For now, just log aggregated stats
      const aggregated = this.aggregateMetrics(metricsToFlush);

      logger.info('[ToolAnalytics] Flushing tool metrics', {
        totalMetrics: metricsToFlush.length,
        tools: Object.keys(aggregated),
      });

      // Log each tool's performance
      Object.entries(aggregated).forEach(([tool, stats]) => {
        logger.info(`[ToolAnalytics] Tool performance: ${tool}`, { ...stats });
      });
    } catch (error) {
      logger.error('[ToolAnalytics] Failed to flush metrics', { error });
      // Re-add metrics to buffer for retry
      this.metricsBuffer.unshift(...metricsToFlush);
    }

    // Clear timer
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Aggregate metrics for analysis
   */
  private static aggregateMetrics(
    metrics: ToolUsageMetrics[]
  ): Record<string, ToolPerformanceStats> {
    const grouped = metrics.reduce(
      (acc, metric) => {
        if (!acc[metric.toolName]) {
          acc[metric.toolName] = [];
        }
        acc[metric.toolName].push(metric);
        return acc;
      },
      {} as Record<string, ToolUsageMetrics[]>
    );

    const stats: Record<string, ToolPerformanceStats> = {};

    Object.entries(grouped).forEach(([toolName, toolMetrics]) => {
      const executionTimes = toolMetrics
        .map(m => m.executionTime)
        .sort((a, b) => a - b);
      const successCount = toolMetrics.filter(m => m.success).length;
      const errorTypes = toolMetrics
        .filter(m => !m.success && m.errorType)
        .reduce(
          (acc, m) => {
            acc[m.errorType!] = (acc[m.errorType!] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

      stats[toolName] = {
        toolName,
        totalCalls: toolMetrics.length,
        successRate: (successCount / toolMetrics.length) * 100,
        averageExecutionTime:
          executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length,
        p95ExecutionTime:
          executionTimes[Math.floor(executionTimes.length * 0.95)] || 0,
        errorTypes,
        lastUsed: toolMetrics[toolMetrics.length - 1].timestamp,
      };
    });

    return stats;
  }

  /**
   * Get real-time performance stats for all tools
   */
  static async getToolPerformanceStats(timeRange?: {
    start: Date;
    end: Date;
  }): Promise<Record<string, ToolPerformanceStats>> {
    // In a real implementation, this would query from persistent storage
    // For now, return stats from current buffer
    return this.aggregateMetrics(this.metricsBuffer);
  }

  /**
   * Identify tools that might benefit from optimization
   */
  static async getOptimizationCandidates(): Promise<{
    slowTools: string[];
    frequentlyFailingTools: string[];
    highVolumeTools: string[];
  }> {
    const stats = await this.getToolPerformanceStats();

    const slowTools = Object.values(stats)
      .filter(s => s.averageExecutionTime > 3000)
      .map(s => s.toolName);

    const frequentlyFailingTools = Object.values(stats)
      .filter(s => s.successRate < 90)
      .map(s => s.toolName);

    const highVolumeTools = Object.values(stats)
      .sort((a, b) => b.totalCalls - a.totalCalls)
      .slice(0, 5)
      .map(s => s.toolName);

    return {
      slowTools,
      frequentlyFailingTools,
      highVolumeTools,
    };
  }

  /**
   * Calculate estimated cost for tool usage
   */
  static calculateToolCost(
    toolName: string,
    inputTokens: number,
    outputTokens: number,
    model: string = 'gpt-4.1'
  ): number {
    // Import pricing from chat service - only 4.1 models
    const pricing = {
      'gpt-4.1': { input: 0.002, output: 0.008 },
      'gpt-4.1-mini': { input: 0.0004, output: 0.0016 },
      'gpt-4.1-nano': { input: 0.0001, output: 0.0004 },
    };

    const modelPricing =
      pricing[model as keyof typeof pricing] || pricing['gpt-4.1'];
    return (
      (inputTokens / 1000) * modelPricing.input +
      (outputTokens / 1000) * modelPricing.output
    );
  }
}
