"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { ChatHeader } from "@/components/chat-header";
import { ExportDialog } from "@/components/export-dialog";
import { useArtifactSelector } from "@/hooks/use-artifact";
import { useAutoResume } from "@/hooks/use-auto-resume";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { extractTokenUsage } from "@/lib/ai/pricing";
import type { Vote } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import { getApiKey } from "@/lib/storage/api-keys";
import {
  createChat,
  getChat,
  getMessagesByChatId,
  saveMessage,
  updateChatTitle,
} from "@/lib/storage/chat-store";
import { saveCost } from "@/lib/storage/cost-store";
import {
  getPersonalizationPrompt,
  getUserName,
  getUserProfile,
  getUserRole,
} from "@/lib/storage/user-profile";
import type { Attachment, ChatMessage } from "@/lib/types";
import { fetcher, fetchWithErrorHandlers, generateUUID } from "@/lib/utils";
import { Artifact } from "./artifact";
import type { ContextData } from "./context-panel";
import { useDataStream } from "./data-stream-provider";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";
import { toast } from "./toast";
import type { VisibilityType } from "./visibility-selector";

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  autoResume,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
}) {
  const router = useRouter();

  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      // When user navigates back/forward, refresh to sync with URL
      router.refresh();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);
  const { setDataStream } = useDataStream();

  const [input, setInput] = useState<string>("");
  const [currentModelId, setCurrentModelId] = useState(initialChatModel);
  const currentModelIdRef = useRef(currentModelId);

  // Helper to map user role to persona type
  const mapRoleToPersona = (
    role: string | null
  ): "solution-consultant" | "sales-engineer" | "generic" => {
    if (!role) return "generic";
    const normalized = role.toLowerCase().replace(/\s+/g, "-");
    if (normalized === "solution-consultant") return "solution-consultant";
    if (normalized === "sales-engineer") return "sales-engineer";
    return "generic";
  };

  // Context state - Load from user profile
  const [context, setContext] = useState<ContextData>(() => {
    const userRole = getUserRole();
    return {
      persona: mapRoleToPersona(userRole),
      customer: "",
      industry: "",
      scope: "",
    };
  });
  const contextRef = useRef(context);

  // User personalization and identity
  const [userPersonalization, setUserPersonalization] = useState<
    string | undefined
  >(undefined);
  const userPersonalizationRef = useRef(userPersonalization);
  const [userName, setUserName] = useState<string | null>(null);
  const userNameRef = useRef(userName);
  const [userRole, setUserRole] = useState<string | null>(null);
  const userRoleRef = useRef(userRole);

  // Load user profile data on mount
  useEffect(() => {
    const personalization = getPersonalizationPrompt();
    const fullProfile = getUserProfile();
    const loadedUserRole = getUserRole();
    const loadedUserName = getUserName();

    console.log("[User Profile] Loaded on mount:", {
      name: loadedUserName,
      role: loadedUserRole,
      personalization,
      fullProfile,
    });

    // Update context with user's role
    if (loadedUserRole) {
      setContext((prev) => ({
        ...prev,
        persona: mapRoleToPersona(loadedUserRole),
      }));
    }

    // Set all user profile data
    setUserPersonalization(personalization || undefined);
    userPersonalizationRef.current = personalization || undefined;
    setUserName(loadedUserName);
    userNameRef.current = loadedUserName;
    setUserRole(loadedUserRole);
    userRoleRef.current = loadedUserRole;
  }, [mapRoleToPersona]);

  // Create chat in IndexedDB on mount and load messages
  useEffect(() => {
    const initialize = async () => {
      // Create chat in IndexedDB if it doesn't exist
      const existingChat = await getChat(id);
      if (existingChat) {
        // Load existing messages from IndexedDB if no initial messages provided
        if (initialMessages.length === 0) {
          const storedMessages = await getMessagesByChatId(id);
          if (storedMessages.length > 0) {
            console.log(
              "[Chat] Loading",
              storedMessages.length,
              "messages from IndexedDB"
            );
            // Use stored messages directly (they're already in ChatMessage format)
            setMessages(storedMessages as ChatMessage[]);
          }
        }
      } else {
        await createChat("New chat", initialChatModel, id);
      }
    };
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, initialChatModel, initialMessages.length]); // Only run when chat id changes

  useEffect(() => {
    currentModelIdRef.current = currentModelId;
  }, [currentModelId]);

  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  useEffect(() => {
    userPersonalizationRef.current = userPersonalization;
  }, [userPersonalization]);

  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  useEffect(() => {
    userRoleRef.current = userRole;
  }, [userRole]);

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
    addToolApprovalResponse,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    generateId: generateUUID,
    sendAutomaticallyWhen: ({ messages: currentMessages }) => {
      const lastMessage = currentMessages.at(-1);
      const shouldContinue =
        lastMessage?.parts?.some(
          (part) =>
            "state" in part &&
            part.state === "approval-responded" &&
            "approval" in part &&
            (part.approval as { approved?: boolean })?.approved === true
        ) ?? false;
      return shouldContinue;
    },
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: async (url, options) => {
        // Get API key and add to headers
        const apiKey = await getApiKey();
        if (!apiKey) {
          toast({
            type: "error",
            description: "API key is missing. Please check Settings.",
          });
          throw new Error("API key is required");
        }

        const headers = {
          ...options?.headers,
          "x-api-key": apiKey,
        };

        return fetchWithErrorHandlers(url, { ...options, headers });
      },
      prepareSendMessagesRequest(request) {
        // ALWAYS send full conversation history for proper context
        console.log("[Chat] Sending messages to API:", {
          messageCount: request.messages.length,
          lastMessageRole: request.messages.at(-1)?.role,
        });

        return {
          body: {
            id: request.id,
            messages: request.messages, // Send full conversation history
            selectedChatModel: currentModelIdRef.current,
            selectedVisibilityType: visibilityType,
            context: contextRef.current,
            userPersonalization: userPersonalizationRef.current,
            userName: userNameRef.current,
            userRole: userRoleRef.current,
            ...request.body,
          },
        };
      },
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
    },
    onFinish: async ({ messages: finishedMessages }) => {
      // Save messages to IndexedDB
      for (const msg of finishedMessages) {
        await saveMessage({
          chatId: id,
          id: msg.id,
          role: msg.role,
          parts: (msg.parts || []) as any,
          createdAt: Date.now(),
        });
      }

      // Extract and save cost information
      try {
        const assistantMessage = finishedMessages.find(
          (m) => m.role === "assistant"
        );
        if (assistantMessage) {
          // Try to extract token usage from message (cast to any to access metadata)
          const messageWithMetadata = assistantMessage as any;
          const tokenUsage = messageWithMetadata.experimental_providerMetadata
            ? extractTokenUsage(
                messageWithMetadata.experimental_providerMetadata
              )
            : null;

          if (tokenUsage) {
            await saveCost(
              id,
              assistantMessage.id,
              currentModelIdRef.current,
              tokenUsage.inputTokens,
              tokenUsage.outputTokens
            );
            console.log("[Cost Tracking] Cost saved:", {
              inputTokens: tokenUsage.inputTokens,
              outputTokens: tokenUsage.outputTokens,
            });
          }
        }
      } catch (error) {
        console.error("Failed to save cost:", error);
      }

      // Auto-generate title from first user message
      try {
        const chat = await getChat(id);
        if (chat && chat.title === "New chat") {
          const firstUserMessage = finishedMessages.find(
            (m) => m.role === "user"
          );
          if (firstUserMessage?.parts) {
            const textPart = firstUserMessage.parts.find(
              (p: any) => p.type === "text"
            );
            if (textPart && "text" in textPart) {
              const messageText = textPart.text as string;
              const title =
                messageText.length > 50
                  ? `${messageText.slice(0, 50).trim()}...`
                  : messageText.trim();
              await updateChatTitle(id, title);
              router.refresh();
            }
          }
        }
      } catch (error) {
        console.error("Failed to generate title:", error);
      }
    },
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        toast({ type: "error", description: error.message });
      }
    },
  });

  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: "user" as const,
        parts: [{ type: "text", text: query }],
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, "", `/chat/${id}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id]);

  const { data: votes } = useSWR<Vote[]>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher
  );

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [chatTitle, setChatTitle] = useState("New chat");

  // Load chat title
  useEffect(() => {
    const loadChatTitle = async () => {
      const chat = await getChat(id);
      if (chat?.title) {
        setChatTitle(chat.title);
      }
    };
    loadChatTitle();
  }, [id]);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    // Focus the input after setting the value
    setTimeout(() => {
      const inputElement = document.querySelector("textarea");
      inputElement?.focus();
    }, 100);
  };

  const handleTemplateSelect = (templatePrompt: string) => {
    setInput(templatePrompt);
    // Focus the input after setting the value
    setTimeout(() => {
      const inputElement = document.querySelector("textarea");
      inputElement?.focus();
    }, 100);
  };

  return (
    <>
      <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
        <ChatHeader
          chatId={id}
          isReadonly={isReadonly}
          onExportClick={() => setShowExportDialog(true)}
          onTemplateSelect={handleTemplateSelect}
          selectedVisibilityType={initialVisibilityType}
        />

        <Messages
          addToolApprovalResponse={addToolApprovalResponse}
          chatId={id}
          isArtifactVisible={isArtifactVisible}
          isReadonly={isReadonly}
          messages={messages}
          onSuggestionClick={handleSuggestionClick}
          regenerate={regenerate}
          selectedModelId={initialChatModel}
          setMessages={setMessages}
          status={status}
          votes={votes}
        />

        <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl flex-col gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
          {!isReadonly && (
            <MultimodalInput
              attachments={attachments}
              chatId={id}
              input={input}
              messages={messages}
              onModelChange={setCurrentModelId}
              selectedModelId={currentModelId}
              selectedVisibilityType={visibilityType}
              sendMessage={sendMessage}
              setAttachments={setAttachments}
              setInput={setInput}
              setMessages={setMessages}
              status={status}
              stop={stop}
            />
          )}
        </div>
      </div>

      <Artifact
        addToolApprovalResponse={addToolApprovalResponse}
        attachments={attachments}
        chatId={id}
        input={input}
        isReadonly={isReadonly}
        messages={messages}
        regenerate={regenerate}
        selectedModelId={currentModelId}
        selectedVisibilityType={visibilityType}
        sendMessage={sendMessage}
        setAttachments={setAttachments}
        setInput={setInput}
        setMessages={setMessages}
        status={status}
        stop={stop}
        votes={votes}
      />

      <ExportDialog
        chatTitle={chatTitle}
        messages={messages}
        onOpenChange={setShowExportDialog}
        open={showExportDialog}
      />
    </>
  );
}
