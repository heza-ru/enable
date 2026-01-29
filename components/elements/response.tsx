"use client";

import type { ComponentProps } from "react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";
import { createCodeRenderer } from "@/components/enhanced-code-block";

type ResponseProps = ComponentProps<typeof Streamdown>;

export function Response({ className, children, ...props }: ResponseProps) {
  return (
    <Streamdown
      className={cn(
        "size-full text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_code]:whitespace-pre-wrap [&_code]:break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_p]:text-foreground [&_li]:text-foreground [&_span]:text-foreground",
        className
      )}
      components={createCodeRenderer()}
      {...props}
    >
      {children}
    </Streamdown>
  );
}
