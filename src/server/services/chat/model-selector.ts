/**
 * Model Selector - Manages AI model pricing and optimal selection
 *
 * This module handles:
 * - Model pricing configurations
 * - Optimal model selection based on tool complexity
 * - Cost estimation and tracking
 */

import { env } from '@/config/env';
import { environment } from '@/config/environment';
import { ToolRegistry } from './tool-registry';

export interface ModelPricing {
  input: number; // Cost per 1K input tokens
  output: number; // Cost per 1K output tokens
}

export interface ModelCost {
  inputTokens: number;
  outputTokens: number;
  cost: number;
  model: string;
}

export class ModelSelector {
  /**
   * Model pricing per 1K tokens (updated July 2025) - Only 4.1 models
   */
  private static readonly MODEL_PRICING: Record<string, ModelPricing> = {
    'gpt-4.1': { input: 0.002, output: 0.008 }, // $2.00/1M input, $8.00/1M output
    'gpt-4.1-mini': { input: 0.0004, output: 0.0016 }, // $0.40/1M input, $1.60/1M output
    'gpt-4.1-nano': { input: 0.0001, output: 0.0004 }, // $0.10/1M input, $0.40/1M output
  };

  /**
   * Get default model based on provider configuration
   */
  static getDefaultModel(): string {
    return env.AI_PROVIDER === 'azure'
      ? environment.azure.openai.deploymentName
      : 'gpt-4.1';
  }

  /**
   * Determine optimal model based on the tools being used
   * This helps reduce costs by using cheaper models for simple operations
   */
  static getOptimalModel(toolNames: string[]): string {
    const hasComplexTool = toolNames.some(
      name => ToolRegistry.getToolComplexity(name) === 'complex'
    );

    if (hasComplexTool) {
      // Use best 4.1 model for complex operations
      return this.getDefaultModel();
    }

    const hasMediumTool = toolNames.some(
      name => ToolRegistry.getToolComplexity(name) === 'medium'
    );

    if (hasMediumTool) {
      // Use mid-tier 4.1 model for medium complexity
      return 'gpt-4.1-mini';
    }

    // Use most efficient 4.1 model for simple operations
    return 'gpt-4.1-nano';
  }

  /**
   * Calculate cost for a given model and token usage
   */
  static calculateCost(
    model: string,
    inputTokens: number,
    outputTokens: number
  ): ModelCost {
    const pricing = this.MODEL_PRICING[model] || this.MODEL_PRICING['gpt-4.1'];
    const cost =
      (inputTokens / 1000) * pricing.input +
      (outputTokens / 1000) * pricing.output;

    return {
      inputTokens,
      outputTokens,
      cost,
      model,
    };
  }

  /**
   * Estimate tokens from text (rough approximation)
   * OpenAI uses ~4 characters per token on average
   */
  static estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Get pricing information for a model
   */
  static getModelPricing(model: string): ModelPricing {
    return this.MODEL_PRICING[model] || this.MODEL_PRICING['gpt-4.1'];
  }

  /**
   * Check if cost exceeds warning threshold
   */
  static shouldWarnAboutCost(totalCost: number): boolean {
    return totalCost > 0.1; // Warn if session cost exceeds $0.10
  }
}
