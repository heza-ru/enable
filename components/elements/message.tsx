import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type MessageContentProps = HTMLAttributes<HTMLDivElement>;

export const MessageContent = ({
  children,
  className,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(
      "text-sm",
      "break-words whitespace-pre-wrap",
      "text-left text-foreground",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
