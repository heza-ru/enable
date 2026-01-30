"use client";

import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { toast } from "sonner";
import { useWindowSize } from "usehooks-ts";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { TemplateSelector } from "@/components/template-selector";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlusIcon } from "./icons";
import { useSidebar } from "./ui/sidebar";
import { VisibilitySelector, type VisibilityType } from "./visibility-selector";

function PureChatHeader({
  chatId,
  selectedVisibilityType,
  isReadonly,
  onTemplateSelect,
  onExportClick,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  onTemplateSelect?: (prompt: string) => void;
  onExportClick?: () => void;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();

  return (
    <header className="sticky top-0 z-10 flex items-center gap-1 border-b border-[#2a2836]/50 bg-background/80 px-2 py-1.5 backdrop-blur-lg transition-all duration-200 md:gap-2 md:px-4 md:py-2">
      <SidebarToggle />

      {(!open || windowWidth < 768) && (
        <Button
          className="order-2 h-8 px-2 md:order-1 md:ml-0 md:h-fit"
          onClick={() => {
            // Force a complete navigation to home which will create a new chat
            window.location.href = "/";
          }}
          size="icon"
          variant="outline"
        >
          <PlusIcon />
          <span className="sr-only md:not-sr-only md:ml-2">New Chat</span>
        </Button>
      )}

      {!isReadonly && (
        <>
          {/* Hide template selector on mobile to reduce clutter */}
          {onTemplateSelect && (
            <div className="hidden md:block">
              <TemplateSelector onSelectTemplate={onTemplateSelect} />
            </div>
          )}

          {/* Hide export button on mobile, show only on tablet+ */}
          {onExportClick && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="order-2 hidden md:flex md:order-3"
                    onClick={onExportClick}
                    size="sm"
                    variant="ghost"
                  >
                    <Download className="size-4" />
                    <span className="ml-2">Export</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export or share this conversation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Hide visibility selector on mobile */}
          <VisibilitySelector
            chatId={chatId}
            className="order-3 ml-auto hidden md:flex md:order-4"
            selectedVisibilityType={selectedVisibilityType}
          />
        </>
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.chatId === nextProps.chatId &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
    prevProps.isReadonly === nextProps.isReadonly
  );
});
