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
import { Response } from "./elements/response";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "./elements/tool";
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

  console.log("[Message] Rendering message:", {
    messageId: message.id,
    role: message.role,
    partsCount: message.parts?.length,
    parts: message.parts?.map(p => ({ type: p.type, keys: Object.keys(p || {}) })),
  });

  useDataStream();

  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn("group w-full animate-in slide-in-from-bottom-2 duration-300", {
        "is-user": isUser,
        "is-assistant": isAssistant,
      })}
      data-role={message.role}
      data-testid={`message-${message.role}`}
    >
      <div
        className={cn("flex w-full items-start gap-2 md:gap-3", {
          "justify-end": isUser && mode !== "edit",
          "justify-start": isAssistant,
        })}
      >
        <div
          className={cn("flex flex-col", {
            "gap-2 md:gap-4": message.parts?.some(
              (p) => p.type === "text" && extractPartText(p)?.trim()
            ),
            "w-full":
              (isAssistant &&
                (message.parts?.some(
                  (p) => p.type === "text" && extractPartText(p)?.trim()
                ) ||
                  message.parts?.some((p) => p.type.startsWith("tool-")))) ||
              mode === "edit",
            "max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]":
              isUser && mode !== "edit",
          })}
        >
          {attachmentsFromMessage.length > 0 && (
            <div className="flex flex-row justify-end gap-2" data-testid="message-attachments">
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

            console.log("[Part]", index, "type:", type, "part:", part);

            if (type === "reasoning") {
              const reasoningText = extractPartText(part);
              const hasContent = reasoningText?.trim().length > 0;
              const isStreaming = "state" in (part as any) && (part as any).state === "streaming";
              if (hasContent || isStreaming) {
                return (
                  <MessageReasoning
                    isLoading={isLoading || isStreaming}
                    key={key}
                    reasoning={reasoningText || ""}
                  />
                );
              }
            }

            if (type === "text") {
              if (mode === "view") {
                const raw = extractPartText(part);
                const textContent = sanitizeText(raw);
                const isStreamingPart = "state" in (part as any) && (part as any).state === "streaming";

                const looksLikeMarkdown = (s: string) =>
                  /(^#{1,6}\s)|(```)|(`[^`])|(\*\*)|(\[.+\]\(.+\))|(!\[)/m.test(s);

                const looksLikeCsv = (s: string) => {
                  if (!s) return false;
                  const lines = s.split(/\r?\n/).filter((l) => l.trim().length > 0);
                  if (lines.length < 2) return false;
                  const counts = lines.slice(0, Math.min(5, lines.length)).map((l) => l.split(",").length);
                  const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
                  return avg >= 2 && Math.min(...counts) / Math.max(...counts) >= 0.5;
                };

                const looksLikeEmail = (s: string) => {
                  return /(From:|To:|Subject:)/i.test(s);
                };

                console.log("[Text Render]", {
                  role: message.role,
                  len: textContent?.length,
                  preview: textContent?.substring(0, 60),
                  csv: looksLikeCsv(textContent),
                  email: looksLikeEmail(textContent),
                  md: looksLikeMarkdown(textContent),
                });

                // Use direct div with minimal styling for assistant to ensure visibility
                const content = looksLikeCsv(textContent) ? (
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
                  <div className="whitespace-pre-wrap text-sm">{textContent}</div>
                );

                if (isUser) {
                  return (
                    <div
                      key={key}
                      className="w-fit max-w-[100%] rounded-2xl bg-blue-500 px-3 py-2 text-right text-white"
                    >
                      {content}
                    </div>
                  );
                } else {
                  return (
                    <div key={key} className="w-full text-left text-foreground">
                      {content}
                    </div>
                  );
                }
              }

              if (mode === "edit") {
                return (
                  <div className="flex w-full flex-row items-start gap-3" key={key}>
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
              const approvalId = (part as { approval?: { id: string } }).approval?.id;
              const isDenied =
                state === "output-denied" ||
                (state === "approval-responded" &&
                  (part as { approval?: { approved?: boolean } }).approval?.approved === false);
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
                      <ToolHeader state="output-denied" type="tool-getWeather" />
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
                      {(state === "input-available" || state === "approval-requested") && (
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
                    Error: {String(part.output.error)}
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
                    Error: {String(part.output.error)}
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
                    {state === "input-available" && <ToolInput input={part.input} />}
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
                              result={part.output as { id: string; title: string; kind: any }}
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
