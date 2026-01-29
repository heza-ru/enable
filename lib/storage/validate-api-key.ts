/**
 * Validate Claude API Key
 * Tests the API key against Claude's API to ensure it works
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  model?: string;
}

/**
 * Validate API key by making a test request to Claude API
 * Uses the latest Claude API specifications from https://platform.claude.com/docs
 */
export async function validateClaudeApiKey(
  apiKey: string
): Promise<ValidationResult> {
  if (!apiKey || !apiKey.trim()) {
    return {
      valid: false,
      error: "API key is empty",
    };
  }

  // Format validation - Claude keys should start with sk-ant-
  if (!apiKey.startsWith("sk-ant-")) {
    return {
      valid: false,
      error: "Invalid API key format. Claude keys start with 'sk-ant-'",
    };
  }

  try {
    // Use Next.js API route as proxy to avoid CORS issues
    const response = await fetch("/api/validate-key", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey,
      }),
    });

    const data = await response.json();

    // Return the validation result from the API route
    return data;
  } catch (error) {
    console.error("API validation error:", error);

    // Network or other errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        valid: false,
        error: "Network error. Please check your internet connection.",
      };
    }

    return {
      valid: false,
      error: "Failed to validate API key. Please try again.",
    };
  }
}
