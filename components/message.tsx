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

  const attachmentsFromMessage = message.parts?.filter(
    (part) => part.type === "file"
  ) || [];

  console.log("[Message] Rendering message:", {
    messageId: message.id,
    role: message.role,
    parts: message.parts,
    partsCount: message.parts?.length,
    hasParts: !!message.parts,
  });

  useDataStream();
  
  // Safety check: if no parts array, try to create one from legacy content field
  const messageParts = message.parts || [];
  if (messageParts.length === 0 && (message as any).content) {
    console.log("[Message] No parts found, using legacy content field");
    messageParts.push({
      type: "text",
      text: (message as any).content,
    } as any);
  }

  return (
    <div
      className={cn("group fade-in w-full animate-in duration-300 slide-in-from-bottom-2", {
        "is-user": message.role === "user",
        "is-assistant": message.role === "assistant",
      })}
      data-role={message.role}
      data-testid={`message-${message.role}`}
    >
      <div
        className={cn("flex w-full items-start gap-2 md:gap-3", {
          "justify-end": message.role === "user" && mode !== "edit",
          "justify-start": message.role === "assistant",
        })}
      >
        <div
          className={cn("flex flex-col", {
            "gap-2 md:gap-4": message.parts?.some(
              (p) => p.type === "text" && p.text?.trim()
            ),
            "w-full":
              (message.role === "assistant" &&
                (message.parts?.some(
                  (p) => p.type === "text" && p.text?.trim()
                ) ||
                  message.parts?.some((p) => p.type.startsWith("tool-")))) ||
              mode === "edit",
            "max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]":
              message.role === "user" && mode !== "edit",
          })}
        >
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

          {messageParts.map((part, index) => {
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
                const isStreamingPart =
                  typeof part === "object" && "state" in part &&
                  (part as any).state === "streaming";

                const looksLikeMarkdown = (s: string) =>
                  /(^#{1,6}\s)|(```)|(`[^`])|(\*\*)|(\[.+\]\(.+\))|(!\[)/m.test(s);

                const looksLikeCsv = (s: string) => {
                  if (!s) return false;
                  const lines = s.split(/\r?\n/).filter((l) => l.trim().length > 0);
                  if (lines.length < 2) return false;
                  const counts = lines.slice(0, Math.min(5, lines.length)).map((l) => l.split(",").length);
                  // If most of the lines have more than 1 column and counts are similar
                  const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
                  return avg >= 2 && Math.min(...counts) / Math.max(...counts) >= 0.5;
                };

                const looksLikeEmail = (s: string) => {
                  if (!s) return false;
                  const hasHeaders = /(From:|To:|Subject:)/i.test(s);
                  // also check for typical email separators
                  return hasHeaders;
                };

                console.log("[Message Debug] Text part:", {
                  role: message.role,
                  textContent,
                  textLength: textContent?.length,
                  part,
                  partType: type,
                  isStreamingPart,
                  looksLikeMarkdown: looksLikeMarkdown(textContent),
                });
                
                // Skip rendering if text is empty or just whitespace (unless streaming)
                if (!isStreamingPart && (!textContent || !textContent.trim())) {
                  console.log("[Message Debug] Skipping empty text part");
                  return null;
                }

                return (
                  <div key={key}>
                    {message.role === "user" ? (
                      <MessageContent
                        className="w-fit rounded-2xl px-3 py-2 text-white"
                        style={{ backgroundColor: "#006cff" }}
                        data-testid="message-content"
                      >
                        {looksLikeCsv(textContent) ? (
                          <div className="p-2">
                            <div className="mb-2 text-xs text-muted-foreground">Spreadsheet</div>
                            <div className="h-64 overflow-hidden rounded border">
                              <SpreadsheetEditor
                                content={textContent}
                                saveContent={() => null}
                                currentVersionIndex={0}
                                isCurrentVersion={true}
                                status={isStreamingPart ? "streaming" : "idle"}
                              />
                            </div>
                          </div>
                        ) : looksLikeEmail(textContent) ? (
                          <div className="rounded-lg border p-3">
                            <div className="mb-2 text-sm font-medium">Email</div>
                            <pre className="whitespace-pre-wrap text-sm">{textContent}</pre>
                          </div>
                        ) : isStreamingPart || looksLikeMarkdown(textContent) ? (
                          <Response>{textContent}</Response>
                        ) : (
                          <span data-testid="message-text">{textContent}</span>
                        )}
                      </MessageContent>
                    ) : (
                      <MessageContent
                        className="text-foreground"
                        data-testid="message-content"
                      >
                        {looksLikeCsv(textContent) ? (
                          <div className="p-2">
                            <div className="mb-2 text-xs text-muted-foreground">Spreadsheet</div>
                            <div className="h-64 overflow-hidden rounded border">
                              <SpreadsheetEditor
                                content={textContent}
                                saveContent={() => null}
                                currentVersionIndex={0}
                                isCurrentVersion={true}
                                status={isStreamingPart ? "streaming" : "idle"}
                              />
                            </div>
                          </div>
                        ) : looksLikeEmail(textContent) ? (
                          <div className="rounded-lg border p-3">
                            <div className="mb-2 text-sm font-medium">Email</div>
                            <pre className="whitespace-pre-wrap text-sm">{textContent}</pre>
                          </div>
                        ) : isStreamingPart || looksLikeMarkdown(textContent) ? (
                          <Response>{textContent}</Response>
                        ) : (
                          <span data-testid="message-text">{textContent}</span>
                        )}
                      </MessageContent>
                    )}
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
              const { toolCallId } = part;

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
              const { toolCallId } = part;

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
        </div>
      </div>
    </div>
  );
};

export const PreviewMessage = PurePreviewMessage;

export const ThinkingMessage = () => {
  return (
    <div
      className="group/message fade-in w-full animate-in duration-300 slide-in-from-bottom-2"
      data-role="assistant"
      data-testid="message-assistant-loading"
    >
      <MessageSkeleton />
    </div>
  );
};
