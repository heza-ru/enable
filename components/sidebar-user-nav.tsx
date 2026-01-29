"use client";

import { ChevronUp, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SettingsDialog } from "./settings-dialog";

export function SidebarUserNav() {
  const { setTheme, resolvedTheme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="h-10 bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              data-testid="settings-nav-button"
            >
              <Settings className="size-4" />
              <span className="truncate">Settings</span>
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-popper-anchor-width)"
            data-testid="settings-nav-menu"
            side="top"
          >
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setShowSettings(true)}
            >
              <Settings className="mr-2 size-4" />
              Open Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer"
              data-testid="settings-nav-item-theme"
              onSelect={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              {`Toggle ${resolvedTheme === "light" ? "dark" : "light"} mode`}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      {/* Comprehensive Settings Dialog */}
      {showSettings && (
        <SettingsDialog
          onClose={() => setShowSettings(false)}
          open={showSettings}
        />
      )}
    </SidebarMenu>
  );
}
