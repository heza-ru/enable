/**
 * Claude 4.5 Models for Enable
 * All models use Anthropic's Claude API
 */

export const DEFAULT_CHAT_MODEL = "claude-sonnet-4-5";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  pricing: {
    input: string; // Display string
    output: string; // Display string
  };
};

export const chatModels: ChatModel[] = [
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    description: "Fast and affordable, great for everyday tasks",
    pricing: {
      input: "$1/MTok",
      output: "$5/MTok",
    },
  },
  {
    id: "claude-sonnet-4-5",
    name: "Claude Sonnet 4.5",
    provider: "anthropic",
    description: "Best balance of speed, intelligence, and cost (recommended)",
    pricing: {
      input: "$3/MTok",
      output: "$15/MTok",
    },
  },
  {
    id: "claude-opus-4-5",
    name: "Claude Opus 4.5",
    provider: "anthropic",
    description: "Most capable model for complex tasks",
    pricing: {
      input: "$5/MTok",
      output: "$25/MTok",
    },
  },
];

// Group models by provider for UI (currently all Claude)
export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);

/**
 * Get model by ID
 */
export function getModelById(id: string): ChatModel | undefined {
  return chatModels.find((model) => model.id === id);
}

/**
 * Validate if model ID is supported
 */
export function isValidModel(id: string): boolean {
  return chatModels.some((model) => model.id === id);
}
