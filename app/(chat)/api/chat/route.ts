import { geolocation } from "@vercel/functions";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
} from "ai";
import { type RequestHints, systemPrompt } from "@/lib/ai/prompts";
import { getLanguageModel } from "@/lib/ai/providers";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { isProductionEnvironment } from "@/lib/constants";
import { ChatSDKError } from "@/lib/errors";
import type { ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";
import { type PostRequestBody, postRequestBodySchema } from "./schema";

export const maxDuration = 60;

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    const {
      message,
      messages,
      selectedChatModel,
      context,
      userPersonalization,
      userName,
      userRole,
    } = requestBody;

    // Get API key from request headers (set by client)
    const apiKey = request.headers.get("x-api-key");

    console.log("[Chat API] Request received:", {
      hasApiKey: !!apiKey,
      model: selectedChatModel,
      hasMessage: !!message,
      hasMessages: !!messages,
      messageCount: messages?.length || (message ? 1 : 0),
      hasContext: !!context,
      hasUserPersonalization: !!userPersonalization,
      userName,
      userRole,
      userPersonalization,
      context,
    });

    if (!apiKey) {
      console.error("[Chat API] No API key provided");
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    const isToolApprovalFlow = Boolean(messages);

    const uiMessages = isToolApprovalFlow
      ? (messages as ChatMessage[])
      : message
        ? ([message] as ChatMessage[])
        : [];

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    const isReasoningModel =
      selectedChatModel.includes("reasoning") ||
      selectedChatModel.includes("thinking");

    const modelMessages = await convertToModelMessages(uiMessages);

    const stream = createUIMessageStream({
      originalMessages: isToolApprovalFlow ? uiMessages : undefined,
      execute: async ({ writer: dataStream }) => {
        console.log("[Chat API] Starting streamText call...");
        try {
          const result = streamText({
            model: getLanguageModel(
              selectedChatModel,
              apiKey
            ) as unknown as Parameters<typeof streamText>[0]["model"],
            system: systemPrompt({
              selectedChatModel,
              requestHints,
              context,
              userPersonalization,
              userName,
              userRole,
            }),
            messages: modelMessages,
            stopWhen: stepCountIs(5),
            experimental_activeTools: isReasoningModel ? [] : ["getWeather"],
            providerOptions: isReasoningModel
              ? {
                  anthropic: {
                    thinking: { type: "enabled", budgetTokens: 10_000 },
                  },
                }
              : undefined,
            tools: {
              getWeather,
            },
            experimental_telemetry: {
              isEnabled: isProductionEnvironment,
              functionId: "stream-text",
            },
          });

          console.log(
            "[Chat API] StreamText created, merging to dataStream..."
          );
          dataStream.merge(result.toUIMessageStream({ sendReasoning: true }));
        } catch (error) {
          console.error("[Chat API] Error in streamText:", error);
          throw error;
        }
      },
      generateId: generateUUID,
      onFinish: async () => {
        console.log("[Chat API] Stream finished");
        // Client-side will handle saving to IndexedDB
      },
      onError: (error) => {
        console.error("[Chat API] Stream error:", error);
        return "Oops, an error occurred!";
      },
    });

    return createUIMessageStreamResponse({
      stream,
    });
  } catch (error) {
    const vercelId = request.headers.get("x-vercel-id");

    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    if (error instanceof Error && error.message?.includes("API key")) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    console.error("Unhandled error in chat API:", error, { vercelId });
    return new ChatSDKError("offline:chat").toResponse();
  }
}

export async function DELETE(request: Request) {
  // Enable is client-side only - deletions handled in IndexedDB
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
