/**
 * Claude 4.5 Pricing
 * Source: https://platform.claude.com/docs/en/about-claude/pricing
 * Last updated: January 2026
 */

export interface ModelPricing {
  input: number; // Cost per token
  output: number; // Cost per token
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface CostBreakdown {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  inputTokens: number;
  outputTokens: number;
}

// Pricing in USD per million tokens (MTok)
export const CLAUDE_PRICING: Record<string, ModelPricing> = {
  // Claude 4.5 models
  "claude-sonnet-4-5": {
    input: 3.0 / 1_000_000, // $3 per MTok
    output: 15.0 / 1_000_000, // $15 per MTok
  },
  "claude-haiku-4-5": {
    input: 1.0 / 1_000_000, // $1 per MTok
    output: 5.0 / 1_000_000, // $5 per MTok
  },
  "claude-opus-4-5": {
    input: 5.0 / 1_000_000, // $5 per MTok
    output: 25.0 / 1_000_000, // $25 per MTok
  },

  // Backward compatibility for gateway format
  "anthropic/claude-sonnet-4-5": {
    input: 3.0 / 1_000_000,
    output: 15.0 / 1_000_000,
  },
  "anthropic/claude-haiku-4-5": {
    input: 1.0 / 1_000_000,
    output: 5.0 / 1_000_000,
  },
  "anthropic/claude-opus-4-5": {
    input: 5.0 / 1_000_000,
    output: 25.0 / 1_000_000,
  },
};

/**
 * Calculate cost for a given model and token usage
 */
export function calculateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): CostBreakdown {
  const pricing = CLAUDE_PRICING[modelId];

  if (!pricing) {
    console.warn(`No pricing found for model: ${modelId}`);
    return {
      inputCost: 0,
      outputCost: 0,
      totalCost: 0,
      inputTokens,
      outputTokens,
    };
  }

  const inputCost = inputTokens * pricing.input;
  const outputCost = outputTokens * pricing.output;
  const totalCost = inputCost + outputCost;

  return {
    inputCost,
    outputCost,
    totalCost,
    inputTokens,
    outputTokens,
  };
}

/**
 * Format cost as USD string
 */
export function formatCost(cost: number): string {
  if (cost === 0) return "$0.00";

  // For very small costs, show in cents
  if (cost < 0.01) {
    const cents = cost * 100;
    return `$${cents.toFixed(4)}`;
  }

  return `$${cost.toFixed(4)}`;
}

/**
 * Extract token usage from Claude API response
 * Works with AI SDK v6 response structure
 */
export function extractTokenUsage(response: any): TokenUsage | null {
  try {
    // AI SDK v6: Check experimental_providerMetadata first (new structure)
    if (response?.experimental_providerMetadata?.anthropic?.usage) {
      const usage = response.experimental_providerMetadata.anthropic.usage;
      return {
        inputTokens: usage.input_tokens || 0,
        outputTokens: usage.output_tokens || 0,
      };
    }

    // Fallback: Direct usage object (older structure)
    if (response?.usage) {
      return {
        inputTokens:
          response.usage.input_tokens || response.usage.inputTokens || 0,
        outputTokens:
          response.usage.output_tokens || response.usage.outputTokens || 0,
      };
    }

    // Additional fallback: Top-level token fields
    if (
      response?.inputTokens !== undefined ||
      response?.outputTokens !== undefined
    ) {
      return {
        inputTokens: response.inputTokens || 0,
        outputTokens: response.outputTokens || 0,
      };
    }

    console.warn(
      "No token usage data found in response:",
      Object.keys(response || {})
    );
    return null;
  } catch (error) {
    console.error("Failed to extract token usage:", error);
    return null;
  }
}

/**
 * Get readable model name from model ID
 */
export function getModelDisplayName(modelId: string): string {
  const modelMap: Record<string, string> = {
    "claude-sonnet-4-5": "Claude Sonnet 4.5",
    "claude-haiku-4-5": "Claude Haiku 4.5",
    "claude-opus-4-5": "Claude Opus 4.5",
    "anthropic/claude-sonnet-4-5": "Claude Sonnet 4.5",
    "anthropic/claude-haiku-4-5": "Claude Haiku 4.5",
    "anthropic/claude-opus-4-5": "Claude Opus 4.5",
  };

  return modelMap[modelId] || modelId;
}
