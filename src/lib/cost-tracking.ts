import { logger } from '@/utils/clientLogger';
// Define a type for tracking API costs
export interface CostTracker {
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  calls: Array<{
    operation: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    inputCost: number;
    outputCost: number;
    callCost: number;
  }>;
}

// Define pricing constants (dollars per million tokens)
const MODEL_PRICING: {
  [key: string]: { input: number; output: number };
} = {
  'gpt-4o': {
    input: 2.5,
    output: 10.0,
  },
  'gpt-4.1': {
    input: 2.0, // $2.00 per 1M tokens (July 2025)
    output: 8.0, // $8.00 per 1M tokens
  },
  'gpt-4.1-mini': {
    input: 0.4, // $0.40 per 1M tokens
    output: 1.6, // $1.60 per 1M tokens
  },
  'gpt-4.1-nano': {
    input: 0.1, // $0.10 per 1M tokens
    output: 0.4, // $0.40 per 1M tokens
  },
  'gpt-3.5-turbo': {
    input: 0.15,
    output: 0.6,
  },
  // Add other models as needed
};

/**
 * Creates a new cost tracker instance
 */
export function createCostTracker(): CostTracker {
  return {
    inputTokens: 0,
    outputTokens: 0,
    inputCost: 0,
    outputCost: 0,
    totalCost: 0,
    calls: [],
  };
}

/**
 * Calculate cost for a specific API call and update the cost tracker
 */
export function trackApiCallCost(
  costTracker: CostTracker,
  operation: string,
  model: string,
  inputTokens: number,
  outputTokens: number
): void {
  // Get pricing for the model
  const pricing = MODEL_PRICING[model] || MODEL_PRICING['gpt-4o']; // Default to gpt-4o pricing

  // Calculate costs
  const inputCost = (inputTokens / 1000000) * pricing.input;
  const outputCost = (outputTokens / 1000000) * pricing.output;
  const callCost = inputCost + outputCost;

  // Add to tracker
  costTracker.inputTokens += inputTokens;
  costTracker.outputTokens += outputTokens;
  costTracker.inputCost += inputCost;
  costTracker.outputCost += outputCost;
  costTracker.totalCost += callCost;

  // Add call details
  costTracker.calls.push({
    operation,
    model,
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    callCost,
  });

  // Log individual call cost
  logger.info(
    `[COST] ${operation} using ${model}: ${inputTokens} input tokens ($${inputCost.toFixed(4)}), ${outputTokens} output tokens ($${outputCost.toFixed(4)}), total $${callCost.toFixed(4)}`
  );
}

/**
 * Generate a summary of costs
 */
export function getCostSummary(
  costTracker: CostTracker,
  searchId: string | null,
  processTime: number
): string {
  let summary = '=========================================\n';
  summary += `AI SUGGESTION COST SUMMARY FOR SEARCH #${searchId || 'unknown'}\n`;
  summary += '=========================================\n';
  summary += `Total API calls: ${costTracker.calls.length}\n`;
  summary += `Total input tokens: ${costTracker.inputTokens} ($${costTracker.inputCost.toFixed(4)})\n`;
  summary += `Total output tokens: ${costTracker.outputTokens} ($${costTracker.outputCost.toFixed(4)})\n`;
  summary += `Total cost: $${costTracker.totalCost.toFixed(4)}\n`;
  summary += `Processing time: ${processTime.toFixed(2)} seconds\n`;
  summary += '=========================================';

  return summary;
}
