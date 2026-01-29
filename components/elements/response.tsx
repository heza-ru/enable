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
        className
      )}
      components={createMarkdownComponents()}
      {...props}
    >
      {children}
    </Streamdown>
  );
}
