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
      "text-sm leading-relaxed",
      "break-words overflow-wrap-anywhere",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
