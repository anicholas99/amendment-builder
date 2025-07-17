/**
 * Cost Tracker - Tracks token usage and costs for AI operations
 *
 * This module manages:
 * - Token counting and estimation
 * - Cost calculation across iterations
 * - Cost warnings and thresholds
 */

import { logger } from '@/server/logger';
import { ModelSelector } from './model-selector';

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface CostSummary {
  totalIterations: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCost: number;
  averageCostPerIteration: number;
  model: string;
}

export class CostTracker {
  private totalInputTokens: number = 0;
  private totalOutputTokens: number = 0;
  private totalCost: number = 0;
  private iterations: number = 0;
  private model: string;

  constructor(model: string) {
    this.model = model;
  }

  /**
   * Add token usage for an iteration
   */
  addIteration(tokens: TokenUsage): void {
    this.iterations++;
    this.totalInputTokens += tokens.inputTokens;
    this.totalOutputTokens += tokens.outputTokens;

    const iterationCost = ModelSelector.calculateCost(
      this.model,
      tokens.inputTokens,
      tokens.outputTokens
    );

    this.totalCost += iterationCost.cost;

    logger.info('[CostTracker] Iteration cost tracking', {
      iteration: this.iterations,
      inputTokens: tokens.inputTokens,
      outputTokens: tokens.outputTokens,
      cost: iterationCost.cost.toFixed(4),
      cumulativeCost: this.totalCost.toFixed(4),
    });
  }

  /**
   * Get cost summary
   */
  getSummary(projectId?: string, sessionId?: string): CostSummary {
    const summary: CostSummary = {
      totalIterations: this.iterations,
      totalInputTokens: this.totalInputTokens,
      totalOutputTokens: this.totalOutputTokens,
      totalTokens: this.totalInputTokens + this.totalOutputTokens,
      totalCost: this.totalCost,
      averageCostPerIteration:
        this.iterations > 0 ? this.totalCost / this.iterations : 0,
      model: this.model,
    };

    if (this.totalCost > 0) {
      logger.info('[CostTracker] Session cost summary', {
        ...summary,
        totalCost: summary.totalCost.toFixed(4),
        averageCostPerIteration: summary.averageCostPerIteration.toFixed(4),
        projectId,
        sessionId,
      });

      // Warn if cost is high
      if (ModelSelector.shouldWarnAboutCost(this.totalCost)) {
        logger.warn('[CostTracker] High session cost detected', {
          totalCost: this.totalCost.toFixed(4),
          iterations: this.iterations,
          recommendation: 'Consider optimizing prompts or reducing iterations',
        });
      }
    }

    return summary;
  }

  /**
   * Estimate tokens from conversation messages
   */
  static estimateConversationTokens(
    messages: Array<{
      content?: string;
      function_call?: { arguments?: string };
    }>
  ): number {
    return Math.ceil(
      messages.reduce(
        (acc, msg) =>
          acc +
          (msg.content?.length || 0) +
          (msg.function_call?.arguments?.length || 0),
        0
      ) / 4
    );
  }

  /**
   * Check if we should warn about high iteration count
   */
  static shouldWarnAboutIterations(iterations: number): boolean {
    return iterations >= 10;
  }

  /**
   * Reset tracker for new session
   */
  reset(): void {
    this.totalInputTokens = 0;
    this.totalOutputTokens = 0;
    this.totalCost = 0;
    this.iterations = 0;
  }
}
