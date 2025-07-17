/**
 * Cost Tracker for AI API Calls
 *
 * This utility tracks the cost of API calls for budget monitoring and reporting.
 */

// Pricing rates per 1000 tokens (as of 2024-2025)
import { logger } from '@/utils/clientLogger';
const PRICING = {
  // OpenAI models
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-4.1': { input: 0.002, output: 0.008 }, // $2.00/1M input, $8.00/1M output (July 2025)
  'gpt-4.1-mini': { input: 0.0004, output: 0.0016 }, // $0.40/1M input, $1.60/1M output
  'gpt-4.1-nano': { input: 0.0001, output: 0.0004 }, // $0.10/1M input, $0.40/1M output
  'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
  'text-embedding-ada-002': { input: 0.0001, output: 0 },

  // Default pricing for unknown models
  default: { input: 0.01, output: 0.02 },
};

// Cost tracking state
let totalCost = 0;
let operationCounts: Record<string, number> = {};
let tokenCounts: Record<string, number> = {};

/**
 * Track the cost of an API call
 * @param params Parameters for cost tracking
 * @returns The calculated cost in USD
 */
export function trackApiCost(params: {
  operation: string;
  tokenCount: number;
  model: string;
  serviceProvider?: 'openai' | 'azure';
  inputTokens?: number;
  outputTokens?: number;
}): number {
  const {
    operation,
    tokenCount,
    model,
    serviceProvider = 'openai',
    inputTokens,
    outputTokens,
  } = params;

  // Get pricing for this model, or use default
  const pricing = PRICING[model as keyof typeof PRICING] || PRICING.default;

  // Calculate cost based on token type split if provided
  let cost: number;
  if (inputTokens !== undefined && outputTokens !== undefined) {
    cost =
      (inputTokens / 1000) * pricing.input +
      (outputTokens / 1000) * pricing.output;
  } else {
    // Use a blended rate if token split is not provided
    const blendedRate = (pricing.input + pricing.output) / 2;
    cost = (tokenCount / 1000) * blendedRate;
  }

  // Update tracking data
  totalCost += cost;
  operationCounts[operation] = (operationCounts[operation] || 0) + 1;
  tokenCounts[model] = (tokenCounts[model] || 0) + tokenCount;

  // Log the cost
  logger.debug(
    `API Cost: $${cost.toFixed(4)} for ${operation} (${tokenCount} tokens with ${model})`
  );

  return cost;
}

/**
 * Get the current cost tracking summary
 * @returns A summary of cost tracking data
 */
export function getCostSummary() {
  return {
    totalCost,
    operationCounts,
    tokenCounts,
    formattedTotalCost: `$${totalCost.toFixed(2)}`,
  };
}

/**
 * Reset all cost tracking data
 */
export function resetCostTracking() {
  totalCost = 0;
  operationCounts = {};
  tokenCounts = {};
  logger.debug('Cost tracking data has been reset');
}

// Export the API
export default {
  trackApiCost,
  getCostSummary,
  resetCostTracking,
};
