"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  {
    keys: ["Ctrl", "K"],
    description: "Open command palette",
    category: "Navigation",
  },
  {
    keys: ["Ctrl", "Shift", "/"],
    description: "Show keyboard shortcuts",
    category: "Navigation",
  },
  {
    keys: ["Ctrl", "N"],
    description: "New chat",
    category: "Navigation",
  },
  {
    keys: ["Ctrl", "B"],
    description: "Toggle sidebar",
    category: "Navigation",
  },

  // Editing
  {
    keys: ["Ctrl", "Enter"],
    description: "Send message",
    category: "Editing",
  },
  {
    keys: ["Shift", "Enter"],
    description: "New line in message",
    category: "Editing",
  },
  {
    keys: ["Escape"],
    description: "Cancel message edit or stop generation",
    category: "Editing",
  },

  // Chat Actions
  {
    keys: ["Ctrl", "C"],
    description: "Copy last response",
    category: "Chat Actions",
  },
  {
    keys: ["Ctrl", "E"],
    description: "Export conversation",
    category: "Chat Actions",
  },
  {
    keys: ["Ctrl", "R"],
    description: "Regenerate response",
    category: "Chat Actions",
  },

  // View
  {
    keys: ["Ctrl", ","],
    description: "Open settings",
    category: "View",
  },
  {
    keys: ["Ctrl", "Alt", "T"],
    description: "Toggle theme",
    category: "View",
  },
];

const KeyBadge = ({ keyName }: { keyName: string }) => (
  <kbd className="rounded border border-border bg-muted px-2 py-1 font-mono text-xs shadow-sm">
    {keyName}
  </kbd>
);

const ShortcutRow = ({ shortcut }: { shortcut: Shortcut }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm">{shortcut.description}</span>
    <div className="flex items-center gap-1">
      {shortcut.keys.map((key, index) => (
        <span className="flex items-center gap-1" key={index}>
          <KeyBadge keyName={key} />
          {index < shortcut.keys.length - 1 && (
            <span className="text-muted-foreground text-xs">+</span>
          )}
        </span>
      ))}
    </div>
  </div>
);

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate and use Enable more
            efficiently
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="mb-3 font-semibold text-sm uppercase text-muted-foreground">
                {category}
              </h3>
              <div className="space-y-1">
                {shortcuts
                  .filter((s) => s.category === category)
                  .map((shortcut, index) => (
                    <ShortcutRow key={index} shortcut={shortcut} />
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-muted-foreground text-sm">
            <strong>Tip:</strong> On Mac, use <KeyBadge keyName="Cmd" /> instead
            of <KeyBadge keyName="Ctrl" />
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useKeyboardShortcuts() {
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      // Ctrl/Cmd + Shift + / - Show keyboard shortcuts
      if (modifier && event.shiftKey && event.key === "?") {
        event.preventDefault();
        setShowShortcuts(true);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    showShortcuts,
    setShowShortcuts,
  };
}
