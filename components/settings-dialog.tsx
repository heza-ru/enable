"use client";

import {
  Key,
  MessageSquare,
  Palette,
  RotateCcw,
  Settings,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { clearApiKey } from "@/lib/storage/api-keys";
import { deleteAllChats } from "@/lib/storage/chat-store";
import {
  clearUserProfile,
  getUserProfile,
  type UserRole,
  updateUserProfile,
} from "@/lib/storage/user-profile";
import {
  applyTheme,
  getStoredTheme,
  saveTheme,
  type ThemeName,
  themes,
} from "@/lib/themes";
import { toast } from "./toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";

interface SettingsDialogProps {
  open?: boolean;
  onClose?: () => void;
  onResetOnboarding?: () => void;
}

const ROLES: UserRole[] = ["Solution Consultant", "Sales Engineer"];

export function SettingsDialog({
  open: controlledOpen,
  onClose,
  onResetOnboarding,
}: SettingsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (onClose) {
      if (!newOpen) onClose();
    } else {
      setInternalOpen(newOpen);
    }
  };
  const [profile, setProfile] = useState(getUserProfile());

  const [name, setName] = useState(profile?.name || "");
  const [role, setRole] = useState<UserRole>(
    profile?.role || "Solution Consultant"
  );
  const [personalizationPrompt, setPersonalizationPrompt] = useState(
    profile?.personalizationPrompt || ""
  );

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const [showClearApiKeyConfirm, setShowClearApiKeyConfirm] = useState(false);

  const {
    theme: nextTheme,
    resolvedTheme,
    setTheme: setNextTheme,
  } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>(
    getStoredTheme()
  );

  // Reload profile when dialog opens
  useEffect(() => {
    if (open) {
      const currentProfile = getUserProfile();
      setProfile(currentProfile);
      setName(currentProfile?.name || "");
      setRole(currentProfile?.role || "Solution Consultant");
      setPersonalizationPrompt(currentProfile?.personalizationPrompt || "");
      setSelectedTheme(getStoredTheme());
    }
  }, [open]);

  const handleThemeChange = (themeName: ThemeName) => {
    setSelectedTheme(themeName);
    saveTheme(themeName);

    // Apply theme colors based on resolved mode (handles system preference)
    const mode = resolvedTheme === "dark" ? "dark" : "light";
    applyTheme(themeName, mode);

    toast({
      type: "success",
      description: `${themes[themeName].name} theme applied`,
    });
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast({ type: "error", description: "Name cannot be empty" });
      return;
    }

    try {
      updateUserProfile({
        name: name.trim(),
        role,
        personalizationPrompt: personalizationPrompt.trim(),
      });

      toast({ type: "success", description: "Settings saved successfully" });
      handleOpenChange(false);

      // Reload page to apply changes
      window.location.reload();
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({ type: "error", description: "Failed to save settings" });
    }
  };

  const handleResetOnboarding = () => {
    try {
      clearUserProfile();
      toast({
        type: "success",
        description: "Onboarding reset. Reload to start fresh.",
      });
      setShowResetConfirm(false);
      handleOpenChange(false);

      if (onResetOnboarding) {
        onResetOnboarding();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to reset onboarding:", error);
      toast({ type: "error", description: "Failed to reset onboarding" });
    }
  };

  const handleClearHistory = async () => {
    try {
      await deleteAllChats();
      toast({ type: "success", description: "Chat history cleared" });
      setShowClearHistoryConfirm(false);

      // Redirect to home and refresh to update sidebar
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to clear history:", error);
      toast({ type: "error", description: "Failed to clear chat history" });
    }
  };

  const handleClearApiKey = () => {
    try {
      clearApiKey();
      toast({ type: "success", description: "API key cleared" });
      setShowClearApiKeyConfirm(false);
    } catch (error) {
      console.error("Failed to clear API key:", error);
      toast({ type: "error", description: "Failed to clear API key" });
    }
  };

  return (
    <>
      <Dialog onOpenChange={handleOpenChange} open={open}>
        {controlledOpen === undefined && (
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost">
              <Settings className="size-4" />
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px] bg-card dark:bg-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="size-5" />
              Settings
            </DialogTitle>
            <DialogDescription>
              Manage your profile, personalization, and preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Profile Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Profile</h3>
              </div>

              <div className="space-y-3 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="settings-name">Display Name</Label>
                  <Input
                    id="settings-name"
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    value={name}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings-role">Role</Label>
                  <Select
                    onValueChange={(value) => setRole(value as UserRole)}
                    value={role}
                  >
                    <SelectTrigger id="settings-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Theme Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="size-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Appearance</h3>
              </div>

              <div className="space-y-3 pl-6">
                <div className="space-y-2">
                  <Label>Color Theme</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {Object.values(themes).map((theme) => (
                      <button
                        className={`group relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:scale-105 ${
                          selectedTheme === theme.id
                            ? "border-primary bg-primary/5"
                            : "border-[#2a2836] hover:border-primary/50"
                        }`}
                        key={theme.id}
                        onClick={() => handleThemeChange(theme.id)}
                        type="button"
                      >
                        <div className="flex w-full gap-1">
                          <div
                            className="h-6 flex-1 rounded"
                            style={{
                              background: `hsl(${theme.colors.dark.primary})`,
                            }}
                          />
                          <div
                            className="h-6 flex-1 rounded"
                            style={{
                              background: `hsl(${theme.colors.dark.accent})`,
                            }}
                          />
                        </div>
                        <span className="text-center text-xs font-medium">
                          {theme.name}
                        </span>
                        {selectedTheme === theme.id && (
                          <div className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <svg
                              className="size-3"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M5 13l4 4L19 7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Choose a color theme for the interface. Themes adapt to
                    light/dark mode.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Personalization Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Personalization</h3>
              </div>

              <div className="space-y-2 pl-6">
                <Label htmlFor="settings-personalization">
                  Guide how Enable should respond to you
                </Label>
                <Textarea
                  className="min-h-[120px]"
                  id="settings-personalization"
                  onChange={(e) => setPersonalizationPrompt(e.target.value)}
                  placeholder="e.g., Be concise, focus on ROI, include examples..."
                  value={personalizationPrompt}
                />
                <p className="text-muted-foreground text-xs">
                  This personalizes Enable's responses based on your
                  preferences. Changes apply immediately.
                </p>
              </div>
            </div>

            <Separator />

            {/* Utilities Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <RotateCcw className="size-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Utilities</h3>
              </div>

              <div className="space-y-2 pl-6">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="size-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Clear Chat History</p>
                      <p className="text-muted-foreground text-xs">
                        Delete all conversations from local storage
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowClearHistoryConfirm(true)}
                    size="sm"
                    variant="outline"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Key className="size-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Clear API Key</p>
                      <p className="text-muted-foreground text-xs">
                        Remove stored Claude API key
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowClearApiKeyConfirm(true)}
                    size="sm"
                    variant="outline"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                  <div className="flex items-center gap-3">
                    <RotateCcw className="size-4 text-destructive" />
                    <div>
                      <p className="font-medium text-sm text-destructive">
                        Reset Onboarding
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Clear profile and restart onboarding flow
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowResetConfirm(true)}
                    size="sm"
                    variant="destructive"
                  >
                    <RotateCcw className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 border-t pt-4">
            <Button onClick={() => handleOpenChange(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialogs */}
      <AlertDialog onOpenChange={setShowResetConfirm} open={showResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Onboarding?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear your profile and restart the onboarding flow. Your
              chat history and API key will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetOnboarding}>
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={setShowClearHistoryConfirm}
        open={showClearHistoryConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Chat History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your conversations from local
              storage. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearHistory}>
              Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        onOpenChange={setShowClearApiKeyConfirm}
        open={showClearApiKeyConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your stored Claude API key. You'll need to enter
              it again to continue using Enable.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearApiKey}>
              Clear Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
