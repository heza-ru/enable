import { type NextRequest, NextResponse } from "next/server";

/**
 * API Route to validate Claude API keys
 * This proxies the validation request to avoid CORS issues
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { valid: false, error: "API key is required" },
        { status: 400 }
      );
    }

    // Validate format
    if (!apiKey.startsWith("sk-ant-")) {
      return NextResponse.json(
        {
          valid: false,
          error: "Invalid API key format. Claude keys start with 'sk-ant-'",
        },
        { status: 400 }
      );
    }

    // Make a minimal test request to Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 10,
        messages: [
          {
            role: "user",
            content: "Test",
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle specific error types
      if (response.status === 401) {
        return NextResponse.json({
          valid: false,
          error: "Invalid API key. Please check your key and try again.",
        });
      }

      if (response.status === 429) {
        return NextResponse.json({
          valid: false,
          error: "Rate limit exceeded. Please try again in a moment.",
        });
      }

      if (response.status === 403) {
        return NextResponse.json({
          valid: false,
          error: "API key does not have permission to access this resource.",
        });
      }

      return NextResponse.json({
        valid: false,
        error: errorData.error?.message || `API error (${response.status})`,
      });
    }

    const data = await response.json();

    // Successful response
    return NextResponse.json({
      valid: true,
      model: data.model || "claude-sonnet-4-5",
    });
  } catch (error) {
    console.error("API validation error:", error);

    return NextResponse.json(
      {
        valid: false,
        error: "Failed to validate API key. Please try again.",
      },
      { status: 500 }
    );
  }
}
