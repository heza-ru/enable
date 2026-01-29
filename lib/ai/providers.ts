/**
 * Claude Provider for Enable
 * Direct integration with Anthropic's Claude API
 */

import { createAnthropic } from "@ai-sdk/anthropic";

const THINKING_SUFFIX_REGEX = /-thinking$/;

/**
 * Create Anthropic provider with API key
 * This is called for each request with the user's API key from headers
 */
export function createClaudeProvider(apiKey: string) {
  return createAnthropic({
    apiKey,
  });
}

/**
 * Get language model with API key
 * For client-side use, API key is passed from request headers
 */
export function getLanguageModel(modelId: string, apiKey?: string) {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  const anthropic = createClaudeProvider(apiKey);

  // For reasoning models, strip the -thinking suffix but don't wrap
  // The model itself handles reasoning naturally
  const cleanModelId = modelId.replace(THINKING_SUFFIX_REGEX, "");

  return anthropic(cleanModelId);
}

/**
 * Get title generation model (uses Haiku for cost efficiency)
 */
export function getTitleModel(apiKey?: string) {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  const anthropic = createClaudeProvider(apiKey);
  return anthropic("claude-haiku-4-5");
}

/**
 * Get artifact generation model (uses Haiku for speed)
 */
export function getArtifactModel(apiKey?: string) {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  const anthropic = createClaudeProvider(apiKey);
  return anthropic("claude-haiku-4-5");
}

/**
 * Validate API key format
 */
export function isValidApiKey(key: string): boolean {
  return key.startsWith("sk-ant-") && key.length > 20;
}
