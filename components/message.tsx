"use client";
import type { UseChatHelpers } from "@ai-sdk/react";
import { useState } from "react";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { cn, sanitizeText, extractPartText } from "@/lib/utils";
import { SpreadsheetEditor } from "./sheet-editor";
import { useDataStream } from "./data-stream-provider";
import { DocumentToolResult } from "./document";
import { DocumentPreview } from "./document-preview";
import { MessageContent } from "./elements/message";
import { Response } from "./elements/response";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "./elements/tool";
import { SparklesIcon } from "./icons";
import { MessageActions } from "./message-actions";
import { MessageEditor } from "./message-editor";
import { MessageReasoning } from "./message-reasoning";
import { MessageSkeleton } from "./message-skeleton";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";

const PurePreviewMessage = ({
  addToolApprovalResponse,
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  regenerate,
  isReadonly,
  requiresScrollPadding: _requiresScrollPadding,
}: {
  addToolApprovalResponse: UseChatHelpers<ChatMessage>["addToolApprovalResponse"];
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  requiresScrollPadding: boolean;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  const attachmentsFromMessage = message.parts.filter(
    (part) => part.type === "file"
  );

  useDataStream();

  // Check if the message content container should render
  const hasTextContent = message.parts?.some(
    (p) => p.type === "text" && p.text?.trim()
  );
  const hasStreamingText = message.parts?.some(
    (p) => p.type === "text" && "state" in p && (p as any).state === "streaming"
  );
  const hasAttachments = attachmentsFromMessage.length > 0;
  // Render if there's content, attachments, edit mode, OR currently streaming
  const shouldRenderContentContainer = 
    hasTextContent || 
    hasStreamingText ||
    hasAttachments || 
    mode === "edit" ||
    isLoading;

  return (
    <div
      className="w-full py-1.5 animate-slide-in-bottom md:py-2"
      data-role={message.role}
      data-testid={`message-${message.role}`}
    >
      <div className="flex flex-col gap-2 md:gap-3">
        {shouldRenderContentContainer && (
          <>
            {attachmentsFromMessage.length > 0 && (
            <div
              className="flex flex-row justify-end gap-2"
              data-testid={"message-attachments"}
            >
              {attachmentsFromMessage.map((attachment) => (
                <PreviewAttachment
                  attachment={{
                    name: attachment.filename ?? "file",
                    contentType: attachment.mediaType,
                    url: attachment.url,
                  }}
                  key={attachment.url}
                />
              ))}
            </div>
          )}

          {message.parts?.map((part, index) => {
            const { type } = part;
            const key = `message-${message.id}-part-${index}`;

            if (type === "reasoning") {
              const hasContent = part.text?.trim().length > 0;
              const isStreaming = "state" in part && part.state === "streaming";
              if (hasContent || isStreaming) {
                return (
                  <MessageReasoning
                    isLoading={isLoading || isStreaming}
                    key={key}
                    reasoning={part.text || ""}
                  />
                );
              }
            }

            if (type === "text") {
              if (mode === "view") {
                const raw = extractPartText(part);
                const textContent = sanitizeText(raw);
                
                // Greyscale bubble styling for both user and assistant messages
                return (
                  <div key={key} className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}>
                    <MessageContent
                  className={cn(
                    "w-fit max-w-[85%] rounded-2xl px-4 py-2.5",
                    {
                      "bg-zinc-700 dark:bg-zinc-700 text-white":
                        message.role === "user",
                      "bg-zinc-900 dark:bg-zinc-900 text-zinc-50":
                        message.role === "assistant",
                    }
                  )}
                      data-testid="message-content"
                    >
                      <Response>{textContent}</Response>
                    </MessageContent>
                  </div>
                );
              }

              if (mode === "edit") {
                return (
                  <div
                    className="flex w-full flex-row items-start gap-3"
                    key={key}
                  >
                    <div className="size-8" />
                    <div className="min-w-0 flex-1">
                      <MessageEditor
                        key={message.id}
                        message={message}
                        regenerate={regenerate}
                        setMessages={setMessages}
                        setMode={setMode}
                      />
                    </div>
                  </div>
                );
              }
            }

            if (type === "tool-webSearch" || type === "tool-webFetch") {
              const { toolCallId, state } = part;
              
              // Only show loading state - hide completed tool results
              // The AI will summarize the information in its text response
              if (state === "input-streaming" || state === "input-available") {
                return (
                  <div className="w-full max-w-md" key={toolCallId}>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-muted-foreground text-sm">
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                      <span>{type === "tool-webSearch" ? "Searching..." : "Fetching content..."}</span>
                    </div>
                  </div>
                );
              }

              // Don't show completed tool results - they clutter the UI
              // The AI's response will contain the summarized information
              return null;
            }

            if (type === "tool-getWeather") {
              const { toolCallId, state } = part;
              const approvalId = (part as { approval?: { id: string } })
                .approval?.id;
              const isDenied =
                state === "output-denied" ||
                (state === "approval-responded" &&
                  (part as { approval?: { approved?: boolean } }).approval
                    ?.approved === false);
              const widthClass = "w-[min(100%,450px)]";

              if (state === "output-available") {
                return (
                  <div className={widthClass} key={toolCallId}>
                    <Weather weatherAtLocation={part.output} />
                  </div>
                );
              }

              if (isDenied) {
                return (
                  <div className={widthClass} key={toolCallId}>
                    <Tool className="w-full" defaultOpen={true}>
                      <ToolHeader
                        state="output-denied"
                        type="tool-getWeather"
                      />
                      <ToolContent>
                        <div className="px-4 py-3 text-muted-foreground text-sm">
                          Weather lookup was denied.
                        </div>
                      </ToolContent>
                    </Tool>
                  </div>
                );
              }

              if (state === "approval-responded") {
                return (
                  <div className={widthClass} key={toolCallId}>
                    <Tool className="w-full" defaultOpen={true}>
                      <ToolHeader state={state} type="tool-getWeather" />
                      <ToolContent>
                        <ToolInput input={part.input} />
                      </ToolContent>
                    </Tool>
                  </div>
                );
              }

              return (
                <div className={widthClass} key={toolCallId}>
                  <Tool className="w-full" defaultOpen={true}>
                    <ToolHeader state={state} type="tool-getWeather" />
                    <ToolContent>
                      {(state === "input-available" ||
                        state === "approval-requested") && (
                        <ToolInput input={part.input} />
                      )}
                      {state === "approval-requested" && approvalId && (
                        <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
                          <button
                            className="rounded-md px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
                            onClick={() => {
                              addToolApprovalResponse({
                                id: approvalId,
                                approved: false,
                                reason: "User denied weather lookup",
                              });
                            }}
                            type="button"
                          >
                            Deny
                          </button>
                          <button
                            className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground text-sm transition-colors hover:bg-primary/90"
                            onClick={() => {
                              addToolApprovalResponse({
                                id: approvalId,
                                approved: true,
                              });
                            }}
                            type="button"
                          >
                            Allow
                          </button>
                        </div>
                      )}
                    </ToolContent>
                  </Tool>
                </div>
              );
            }

            if (type === "tool-createDocument") {
              const { toolCallId, state } = part;

              // Show loading state for document creation
              if (state === "input-streaming" || state === "input-available") {
                const kindLabel = part.input && "kind" in part.input 
                  ? part.input.kind === "presentation" ? "presentation" 
                  : part.input.kind === "code" ? "code" 
                  : part.input.kind === "sheet" ? "spreadsheet"
                  : "document"
                  : "document";

                return (
                  <div className="w-[min(100%,600px)]" key={toolCallId}>
                    <Tool className="w-full" defaultOpen={true}>
                      <ToolHeader state={state} type={type} />
                      <ToolContent>
                        <div className="flex items-center gap-2 px-4 py-3 text-muted-foreground text-sm">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                          <span>Creating {kindLabel}...</span>
                        </div>
                        {state === "input-available" && <ToolInput input={part.input} />}
                      </ToolContent>
                    </Tool>
                  </div>
                );
              }

              if (part.output && "error" in part.output) {
                return (
                  <div
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
                    key={toolCallId}
                  >
                    Error creating document: {String(part.output.error)}
                  </div>
                );
              }

              return (
                <DocumentPreview
                  isReadonly={isReadonly}
                  key={toolCallId}
                  result={part.output}
                />
              );
            }

            if (type === "tool-updateDocument") {
              const { toolCallId, state } = part;

              // Show loading state for document updates
              if (state === "input-streaming" || state === "input-available") {
                return (
                  <div className="w-[min(100%,600px)]" key={toolCallId}>
                    <Tool className="w-full" defaultOpen={true}>
                      <ToolHeader state={state} type={type} />
                      <ToolContent>
                        <div className="flex items-center gap-2 px-4 py-3 text-muted-foreground text-sm">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                          <span>Updating document...</span>
                        </div>
                        {state === "input-available" && <ToolInput input={part.input} />}
                      </ToolContent>
                    </Tool>
                  </div>
                );
              }

              if (part.output && "error" in part.output) {
                return (
                  <div
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
                    key={toolCallId}
                  >
                    Error updating document: {String(part.output.error)}
                  </div>
                );
              }

              return (
                <div className="relative" key={toolCallId}>
                  <DocumentPreview
                    args={{ ...part.output, isUpdate: true }}
                    isReadonly={isReadonly}
                    result={part.output}
                  />
                </div>
              );
            }

            if (type === "tool-requestSuggestions") {
              const { toolCallId, state } = part;

              return (
                <Tool defaultOpen={true} key={toolCallId}>
                  <ToolHeader state={state} type="tool-requestSuggestions" />
                  <ToolContent>
                    {state === "input-available" && (
                      <ToolInput input={part.input} />
                    )}
                    {state === "output-available" && (
                      <ToolOutput
                        errorText={undefined}
                        output={
                          "error" in part.output ? (
                            <div className="rounded border p-2 text-red-500">
                              Error: {String(part.output.error)}
                            </div>
                          ) : (
                            <DocumentToolResult
                              isReadonly={isReadonly}
                              result={
                                part.output as {
                                  id: string;
                                  title: string;
                                  kind: any;
                                }
                              }
                              type="request-suggestions"
                            />
                          )
                        }
                      />
                    )}
                  </ToolContent>
                </Tool>
              );
            }

            return null;
          })}

          {!isReadonly && (
            <MessageActions
              chatId={chatId}
              isLoading={isLoading}
              key={`action-${message.id}`}
              message={message}
              setMode={setMode}
              vote={vote}
            />
          )}
          </>
        )}
      </div>
    </div>
  );
};

export const PreviewMessage = PurePreviewMessage;

export const ThinkingMessage = ({ 
  message 
}: { 
  message?: ChatMessage 
}) => {
  // Detect if a tool is being called
  const activeTool = message?.parts?.find(
    (part) => "state" in part && 
    (part.state === "input-streaming" || part.state === "input-available")
  );

  const getActivityMessage = () => {
    if (!activeTool || !("type" in activeTool)) {
      return "Thinking";
    }

    const toolType = activeTool.type as string;
    
    if (toolType === "tool-webSearch") return "Searching the web";
    if (toolType === "tool-webFetch") return "Fetching content";
    if (toolType === "tool-createDocument") {
      const input = activeTool.input as any;
      if (input?.kind === "presentation") return "Creating presentation";
      if (input?.kind === "code") return "Generating code";
      if (input?.kind === "sheet") return "Creating spreadsheet";
      return "Creating document";
    }
    if (toolType === "tool-updateDocument") return "Updating document";
    if (toolType === "tool-getWeather") return "Getting weather";
    if (toolType === "tool-requestSuggestions") return "Generating suggestions";
    
    return "Thinking";
  };

  const activityMessage = getActivityMessage();

  return (
    <div
      className="flex items-center gap-2 text-muted-foreground text-sm py-2"
      data-role="assistant"
      data-testid="message-assistant-loading"
    >
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      <span>{activityMessage}</span>
      <span className="inline-flex">
        <span className="animate-pulse">.</span>
        <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
        <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
      </span>
    </div>
  );
};
