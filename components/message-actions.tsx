import equal from "fast-deep-equal";
import { memo, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { useCopyToClipboard } from "usehooks-ts";
import type { Vote } from "@/lib/db/schema";
import { type CostRecord, getCostByMessageId } from "@/lib/storage/cost-store";
import type { ChatMessage } from "@/lib/types";
import { Action, Actions } from "./elements/actions";
import { CopyIcon, PencilEditIcon, ThumbDownIcon, ThumbUpIcon } from "./icons";

function formatTimestamp(timestamp: string | number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTokens(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(2)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  if (count >= 10) return count.toString();
  // Show even small token counts (1-9 tokens)
  return count.toString();
}

export function PureMessageActions({
  chatId,
  message,
  vote,
  isLoading,
  setMode,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMode?: (mode: "view" | "edit") => void;
}) {
  const { mutate } = useSWRConfig();
  const [_, copyToClipboard] = useCopyToClipboard();
  const [costData, setCostData] = useState<CostRecord | null>(null);

  // Load cost data for assistant messages
  useEffect(() => {
    if (message.role === "assistant" && !isLoading) {
      getCostByMessageId(message.id)
        .then(setCostData)
        .catch((error) => {
          console.error("Failed to load cost data:", error);
        });
    }
  }, [message.id, message.role, isLoading]);

  if (isLoading) {
    return null;
  }

  const textFromParts = message.parts
    ?.filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();

  const handleCopy = async () => {
    if (!textFromParts) {
      toast.error("There's no text to copy!");
      return;
    }

    await copyToClipboard(textFromParts);
    toast.success("Copied to clipboard!");
  };

  const timestamp = message.metadata?.createdAt;

  // User messages get edit (on hover) and copy actions
  if (message.role === "user") {
    return (
      <div className="flex flex-col gap-1">
        <Actions className="-mr-0.5 justify-end">
          <div className="relative">
            {setMode && (
              <Action
                className="absolute top-0 -left-10 opacity-0 transition-opacity focus-visible:opacity-100 group-hover/message:opacity-100"
                data-testid="message-edit-button"
                onClick={() => setMode("edit")}
                tooltip="Edit"
              >
                <PencilEditIcon />
              </Action>
            )}
            <Action onClick={handleCopy} tooltip="Copy">
              <CopyIcon />
            </Action>
          </div>
        </Actions>
        {timestamp && (
          <div className="text-muted-foreground text-xs opacity-0 transition-opacity group-hover/message:opacity-100 text-right pr-1">
            {formatTimestamp(timestamp)}
          </div>
        )}
      </div>
    );
  }

  const totalTokens = costData
    ? costData.inputTokens + costData.outputTokens
    : 0;

  return (
    <div className="flex flex-col gap-1">
      <Actions className="-ml-0.5">
        <Action onClick={handleCopy} tooltip="Copy">
          <CopyIcon />
        </Action>
      </Actions>

      <div className="flex items-center gap-2 text-muted-foreground text-xs opacity-0 transition-opacity group-hover/message:opacity-100 pl-1">
        {timestamp && <span>{formatTimestamp(timestamp)}</span>}
        {costData && totalTokens > 0 && (
          <>
            <span>•</span>
            <span
              title={`${costData.inputTokens.toLocaleString()} in / ${costData.outputTokens.toLocaleString()} out`}
            >
              {formatTokens(totalTokens)} tokens
            </span>
            <span>•</span>
            <span>${costData.cost.toFixed(4)}</span>
          </>
        )}
      </div>
    </div>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (!equal(prevProps.vote, nextProps.vote)) {
      return false;
    }
    if (prevProps.isLoading !== nextProps.isLoading) {
      return false;
    }

    return true;
  }
);
