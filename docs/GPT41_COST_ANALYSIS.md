# GPT-4.1 Cost Analysis for Patent Drafter AI

## Updated Pricing (July 2025)

### GPT-4.1 Family Pricing
| Model | Input (per 1M tokens) | Cached Input | Output (per 1M tokens) |
|-------|----------------------|--------------|----------------------|
| GPT-4.1 | $2.00 | $0.50 | $8.00 |
| GPT-4.1 mini | $0.40 | $0.10 | $1.60 |
| GPT-4.1 nano | $0.10 | $0.025 | $0.40 |

### Cost Per 1K Tokens (Used in Code)
| Model | Input | Output |
|-------|-------|--------|
| GPT-4.1 | $0.002 | $0.008 |
| GPT-4.1 mini | $0.0004 | $0.0016 |
| GPT-4.1 nano | $0.0001 | $0.0004 |

## Cost Impact Analysis

### Previous vs Current Pricing
- **Previous GPT-4 Turbo**: $0.01 input / $0.03 output per 1K tokens
- **Current GPT-4.1**: $0.002 input / $0.008 output per 1K tokens
- **Reduction**: 80% cheaper on input, 73% cheaper on output

### Typical Session Costs

#### Simple Query (1-2 iterations)
- **Tokens**: ~2K input, 1K output
- **Cost**: $0.002 × 2 + $0.008 × 1 = $0.012

#### Complex Multi-Tool Operation (5-8 iterations)
- **Tokens**: ~15K input, 5K output
- **Cost**: $0.002 × 15 + $0.008 × 5 = $0.070

#### Heavy Analysis (10-15 iterations)
- **Tokens**: ~30K input, 10K output
- **Cost**: $0.002 × 30 + $0.008 × 10 = $0.140

## Cost Optimization Strategies

### 1. Use Cached Input When Possible
- Repeated system prompts can use cached pricing (75% discount)
- Consider structuring conversations to reuse identical prompts

### 2. Model Selection
- **GPT-4.1**: Best for complex reasoning and analysis
- **GPT-4.1 mini**: 80% cheaper, suitable for simpler tasks
- **GPT-4.1 nano**: 95% cheaper, ideal for basic operations

### 3. Iteration Management
- Current limit: 15 iterations
- Warning threshold: $0.10 per session
- Most operations complete in 3-5 iterations

### 4. Token Optimization
- Minimize tool response sizes
- Use concise system prompts
- Return only necessary data from tools

## Implementation Details

### Cost Tracking
The system tracks costs per iteration and logs:
- Per-iteration costs
- Cumulative session costs
- Token usage breakdown
- High-cost warnings (>$0.10)

### Example Cost Log
```
[ChatAgentFunctions] Iteration cost tracking {
  iteration: 3,
  inputTokens: 2500,
  outputTokens: 800,
  cost: "0.0114",  // $0.002 × 2.5 + $0.008 × 0.8
  cumulativeCost: "0.0342"
}
```

## Recommendations

1. **Monitor Usage Patterns**: Track which operations consistently hit high costs
2. **Consider Mini/Nano Models**: For simpler operations, switching models can save 80-95%
3. **Optimize Tool Outputs**: Reduce verbosity in tool responses
4. **Cache Common Queries**: Implement caching for frequently repeated operations
5. **Set Budget Alerts**: Consider implementing daily/monthly budget tracking

## Cost Comparison with Competitors

GPT-4.1 is now significantly more cost-effective than many alternatives:
- 5-10x cheaper than Claude 3 Opus
- Comparable to GPT-3.5 Turbo but with GPT-4 capabilities
- Massive 1M token context window without extra fees 