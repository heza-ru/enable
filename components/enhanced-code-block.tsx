"use client";

import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useCopyToClipboard } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EnhancedCodeBlockProps {
  children: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  startLine?: number;
}

export function EnhancedCodeBlock({
  children,
  language = "text",
  filename,
  showLineNumbers = true,
  startLine = 1,
}: EnhancedCodeBlockProps) {
  const [_, copyToClipboard] = useCopyToClipboard();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border border-[#2a2836] bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2">
        <div className="flex items-center gap-2">
          {filename && (
            <span className="font-mono text-xs text-zinc-400">{filename}</span>
          )}
          {language && (
            <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-400">
              {language}
            </span>
          )}
        </div>

        <Button
          className={cn(
            "h-8 gap-2 px-3 text-xs transition-all",
            copied && "bg-green-600 hover:bg-green-600"
          )}
          onClick={handleCopy}
          size="sm"
          variant="ghost"
        >
          {copied ? (
            <>
              <CheckIcon className="size-3" />
              Copied!
            </>
          ) : (
            "Copy code"
          )}
        </Button>
      </div>

      {/* Code Content */}
      <div className="relative">
        <SyntaxHighlighter
          codeTagProps={{
            style: {
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "0.875rem",
            },
          }}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
            fontSize: "0.875rem",
          }}
          language={language}
          lineNumberStyle={{
            minWidth: "3em",
            paddingRight: "1em",
            color: "#4b5563",
            userSelect: "none",
          }}
          PreTag="div"
          showLineNumbers={showLineNumbers}
          startingLineNumber={startLine}
          style={oneDark}
          wrapLines
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

// Hook into streamdown's markdown rendering
export function createMarkdownComponents() {
  return {
    // Custom paragraph renderer that prevents nesting issues
    p({ children, ...props }: any) {
      // Check if children contain block-level elements
      const hasBlockContent = Array.isArray(children) && children.some((child: any) => {
        return child?.type?.name === 'EnhancedCodeBlock' || 
               (child?.props?.className && child.props.className.includes('group relative'));
      });
      
      // If paragraph contains block elements, render as div instead
      if (hasBlockContent) {
        return <div className="my-3" {...props}>{children}</div>;
      }
      
      // Normal paragraph
      return <p {...props}>{children}</p>;
    },
    code({ inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : "";
      const code = String(children).replace(/\n$/, "");
      
      // Treat as inline if:
      // 1. Explicitly marked as inline
      // 2. No language specified and no newlines (likely inline code)
      // 3. Very short code without language
      const isInlineCode = 
        inline || 
        (!language && !code.includes('\n')) ||
        (!language && code.length < 60);

      if (isInlineCode) {
        return (
          <code
            className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
            {...props}
          >
            {children}
          </code>
        );
      }

      return (
        <EnhancedCodeBlock language={language} showLineNumbers>
          {code}
        </EnhancedCodeBlock>
      );
    },
  };
}

// Keep the old function name for backward compatibility
export const createCodeRenderer = createMarkdownComponents;
