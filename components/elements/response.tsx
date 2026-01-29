"use client";

import type { ComponentProps } from "react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";
import { createMarkdownComponents } from "@/components/enhanced-code-block";

type ResponseProps = ComponentProps<typeof Streamdown>;

export function Response({ className, children, ...props }: ResponseProps) {
  return (
    <Streamdown
      className={cn(
        "prose prose-sm max-w-none dark:prose-invert",
        // Inherit text color from parent
        "[&]:text-inherit [&_*]:text-inherit",
        // Better spacing and typography like ChatGPT/Claude
        "[&_p]:leading-relaxed [&_p]:my-3",
        "[&_h1]:font-semibold [&_h1]:text-xl [&_h1]:mt-6 [&_h1]:mb-3",
        "[&_h2]:font-semibold [&_h2]:text-lg [&_h2]:mt-5 [&_h2]:mb-2",
        "[&_h3]:font-semibold [&_h3]:text-base [&_h3]:mt-4 [&_h3]:mb-2",
        "[&_ul]:my-3 [&_ul]:space-y-1.5",
        "[&_ol]:my-3 [&_ol]:space-y-1.5",
        "[&_li]:leading-relaxed",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-3",
        "[&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-muted [&_code]:text-sm [&_code]:font-mono",
        "[&>*:first-child]:mt-0",
        "[&>*:last-child]:mb-0",
        className
      )}
      components={createMarkdownComponents()}
      {...props}
    >
      {children}
    </Streamdown>
  );
}
