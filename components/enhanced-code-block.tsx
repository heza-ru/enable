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
    code({ inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : "";

      if (inline) {
        return (
          <code
            className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground"
            {...props}
          >
            {children}
          </code>
        );
      }

      return (
        <EnhancedCodeBlock language={language} showLineNumbers>
          {String(children).replace(/\n$/, "")}
        </EnhancedCodeBlock>
      );
    },
    p({ children, ...props }: any) {
      return (
        <p className="text-foreground leading-7 my-4" {...props}>
          {children}
        </p>
      );
    },
    h1({ children, ...props }: any) {
      return (
        <h1 className="text-foreground font-bold text-2xl mt-6 mb-4" {...props}>
          {children}
        </h1>
      );
    },
    h2({ children, ...props }: any) {
      return (
        <h2 className="text-foreground font-bold text-xl mt-5 mb-3" {...props}>
          {children}
        </h2>
      );
    },
    h3({ children, ...props }: any) {
      return (
        <h3 className="text-foreground font-bold text-lg mt-4 mb-2" {...props}>
          {children}
        </h3>
      );
    },
    h4({ children, ...props }: any) {
      return (
        <h4 className="text-foreground font-semibold text-base mt-3 mb-2" {...props}>
          {children}
        </h4>
      );
    },
    ul({ children, ...props }: any) {
      return (
        <ul className="text-foreground list-disc ml-6 my-4" {...props}>
          {children}
        </ul>
      );
    },
    ol({ children, ...props }: any) {
      return (
        <ol className="text-foreground list-decimal ml-6 my-4" {...props}>
          {children}
        </ol>
      );
    },
    li({ children, ...props }: any) {
      return (
        <li className="text-foreground my-1" {...props}>
          {children}
        </li>
      );
    },
    blockquote({ children, ...props }: any) {
      return (
        <blockquote className="text-foreground border-l-4 border-muted-foreground/30 pl-4 italic my-4" {...props}>
          {children}
        </blockquote>
      );
    },
    a({ children, href, ...props }: any) {
      return (
        <a className="text-blue-500 underline hover:text-blue-600" href={href} {...props}>
          {children}
        </a>
      );
    },
    strong({ children, ...props }: any) {
      return (
        <strong className="text-foreground font-bold" {...props}>
          {children}
        </strong>
      );
    },
    em({ children, ...props }: any) {
      return (
        <em className="text-foreground italic" {...props}>
          {children}
        </em>
      );
    },
    table({ children, ...props }: any) {
      return (
        <div className="overflow-x-auto my-4">
          <table className="text-foreground border-collapse w-full" {...props}>
            {children}
          </table>
        </div>
      );
    },
    thead({ children, ...props }: any) {
      return (
        <thead className="bg-muted" {...props}>
          {children}
        </thead>
      );
    },
    th({ children, ...props }: any) {
      return (
        <th className="text-foreground border border-border px-4 py-2 font-semibold text-left" {...props}>
          {children}
        </th>
      );
    },
    td({ children, ...props }: any) {
      return (
        <td className="text-foreground border border-border px-4 py-2" {...props}>
          {children}
        </td>
      );
    },
    hr({ ...props }: any) {
      return <hr className="border-border my-6" {...props} />;
    },
  };
}

// Keep the old function name for backward compatibility
export const createCodeRenderer = createMarkdownComponents;
