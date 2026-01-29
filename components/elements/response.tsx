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
        "text-foreground",
        "[&_*]:text-foreground",
        "[&_p]:text-foreground [&_p]:leading-7 [&_p]:my-4",
        "[&_h1]:text-foreground [&_h1]:font-bold [&_h1]:text-2xl [&_h1]:mt-6 [&_h1]:mb-4",
        "[&_h2]:text-foreground [&_h2]:font-bold [&_h2]:text-xl [&_h2]:mt-5 [&_h2]:mb-3",
        "[&_h3]:text-foreground [&_h3]:font-bold [&_h3]:text-lg [&_h3]:mt-4 [&_h3]:mb-2",
        "[&_h4]:text-foreground [&_h4]:font-semibold [&_h4]:text-base [&_h4]:mt-3 [&_h4]:mb-2",
        "[&_ul]:text-foreground [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-4",
        "[&_ol]:text-foreground [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-4",
        "[&_li]:text-foreground [&_li]:my-1",
        "[&_blockquote]:text-foreground [&_blockquote]:border-l-4 [&_blockquote]:border-muted [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4",
        "[&_a]:text-blue-500 [&_a]:underline hover:[&_a]:text-blue-600",
        "[&_strong]:text-foreground [&_strong]:font-bold",
        "[&_em]:text-foreground [&_em]:italic",
        "[&_hr]:border-border [&_hr]:my-6",
        "[&_table]:text-foreground [&_table]:border-collapse [&_table]:w-full [&_table]:my-4",
        "[&_th]:text-foreground [&_th]:border [&_th]:border-border [&_th]:px-4 [&_th]:py-2 [&_th]:font-semibold [&_th]:bg-muted",
        "[&_td]:text-foreground [&_td]:border [&_td]:border-border [&_td]:px-4 [&_td]:py-2",
        "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className
      )}
      components={createMarkdownComponents()}
      {...props}
    >
      {children}
    </Streamdown>
  );
}
