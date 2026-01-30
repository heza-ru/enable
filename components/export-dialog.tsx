"use client";

import { CheckIcon, CopyIcon, DownloadIcon, ShareIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ChatMessage } from "@/lib/types";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: ChatMessage[];
  chatTitle?: string;
}

function formatMessageAsMarkdown(message: ChatMessage): string {
  const role = message.role === "user" ? "**You**" : "**Assistant**";

  // Handle both old and new message formats
  let textParts = "";
  if (message.parts && Array.isArray(message.parts)) {
    textParts = message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n\n");
  } else if (typeof (message as any).content === "string") {
    textParts = (message as any).content;
  }

  return `${role}:\n\n${textParts}`;
}

function formatMessagesAsMarkdown(
  messages: ChatMessage[],
  title?: string
): string {
  const header = title ? `# ${title}\n\n` : "# Chat Export\n\n";
  const timestamp = `*Exported on ${new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}*\n\n---\n\n`;

  const content = messages
    .map((msg) => formatMessageAsMarkdown(msg))
    .join("\n\n---\n\n");

  return header + timestamp + content;
}

function formatMessagesAsText(messages: ChatMessage[]): string {
  return messages
    .map((msg) => {
      const role = msg.role === "user" ? "You" : "Assistant";

      // Handle both old and new message formats
      let text = "";
      if (msg.parts && Array.isArray(msg.parts)) {
        text = msg.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("\n");
      } else if (typeof (msg as any).content === "string") {
        text = (msg as any).content;
      }

      return `${role}:\n${text}`;
    })
    .join("\n\n");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ExportDialog({
  open,
  onOpenChange,
  messages,
  chatTitle = "Chat",
}: ExportDialogProps) {
  const [_, copyToClipboard] = useCopyToClipboard();
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Safety check for messages
  if (!messages || !Array.isArray(messages)) {
    return (
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShareIcon className="size-5" />
              Export Conversation
            </DialogTitle>
            <DialogDescription>No messages to export</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const handleCopy = async (format: "markdown" | "text" | "json") => {
    try {
      let content: string;

      switch (format) {
        case "markdown":
          content = formatMessagesAsMarkdown(messages, chatTitle);
          break;
        case "text":
          content = formatMessagesAsText(messages);
          break;
        case "json":
          content = JSON.stringify(messages, null, 2);
          break;
        default:
          content = formatMessagesAsMarkdown(messages, chatTitle);
          break;
      }

      await copyToClipboard(content);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
      toast.success(`Copied as ${format.toUpperCase()}!`);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy. Please try again.");
    }
  };

  const handleDownload = (format: "markdown" | "text" | "json") => {
    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `${chatTitle.replace(/[^a-z0-9]/gi, "_")}_${timestamp}`;

      let content: string;
      let mimeType: string;
      let extension: string;

      switch (format) {
        case "markdown":
          content = formatMessagesAsMarkdown(messages, chatTitle);
          mimeType = "text/markdown";
          extension = "md";
          break;
        case "text":
          content = formatMessagesAsText(messages);
          mimeType = "text/plain";
          extension = "txt";
          break;
        case "json":
          content = JSON.stringify({ title: chatTitle, messages }, null, 2);
          mimeType = "application/json";
          extension = "json";
          break;
      }

      downloadFile(content, `${filename}.${extension}`, mimeType);
      toast.success(`Downloaded as ${extension.toUpperCase()}!`);
    } catch (error) {
      console.error("Failed to download:", error);
      toast.error("Failed to download. Please try again.");
    }
  };

  const exportOptions = [
    {
      id: "markdown" as const,
      label: "Markdown",
      description: "Export as formatted Markdown file",
      icon: "📝",
    },
    {
      id: "text" as const,
      label: "Plain Text",
      description: "Export as simple text file",
      icon: "📄",
    },
    {
      id: "json" as const,
      label: "JSON",
      description: "Export as structured JSON data",
      icon: "🔧",
    },
  ];

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShareIcon className="size-5" />
            Export Conversation
          </DialogTitle>
          <DialogDescription>
            Choose a format to export or copy your conversation
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {exportOptions.map((option, index) => (
            <div
              className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4 transition-all duration-300 hover:bg-muted/50 hover:shadow-md hover:scale-[1.02] animate-slide-in-bottom"
              key={option.id}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{option.icon}</span>
                <div>
                  <h4 className="font-medium text-sm">{option.label}</h4>
                  <p className="text-muted-foreground text-xs">
                    {option.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleCopy(option.id)}
                  size="sm"
                  variant="outline"
                >
                  {copiedFormat === option.id ? (
                    <CheckIcon className="size-4" />
                  ) : (
                    <CopyIcon className="size-4" />
                  )}
                </Button>
                <Button onClick={() => handleDownload(option.id)} size="sm">
                  <DownloadIcon className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-muted-foreground text-sm">
            💡 <strong>Tip:</strong> Markdown format preserves formatting and is
            great for documentation. JSON format is useful for importing into
            other tools.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useExportDialog() {
  const [showExport, setShowExport] = useState(false);

  return {
    showExport,
    setShowExport,
  };
}
