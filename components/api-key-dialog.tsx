"use client";

import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  hasApiKey,
  isValidApiKeyFormat,
  storeApiKey,
} from "@/lib/storage/api-keys";
import { validateClaudeApiKey } from "@/lib/storage/validate-api-key";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeySet?: () => void;
}

export function ApiKeyDialog({
  open,
  onOpenChange,
  onKeySet,
}: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [password, setPassword] = useState("");
  const [storageMode, setStorageMode] = useState<"memory" | "encrypted">(
    "memory"
  );
  const [showKey, setShowKey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState<
    "idle" | "validating" | "valid" | "invalid"
  >("idle");
  const [validationMessage, setValidationMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter your API key");
      return;
    }

    if (!isValidApiKeyFormat(apiKey)) {
      toast.error(
        "Invalid API key format. Claude API keys start with 'sk-ant-'"
      );
      return;
    }

    setIsLoading(true);
    setValidationStatus("validating");
    setValidationMessage("Verifying with Claude API...");

    try {
      // Validate the API key against Claude API
      const result = await validateClaudeApiKey(apiKey);

      if (!result.valid) {
        setValidationStatus("invalid");
        setValidationMessage(result.error || "Invalid API key");
        toast.error(result.error || "Invalid API key");
        setIsLoading(false);
        return;
      }

      setValidationStatus("valid");
      setValidationMessage(`✓ Verified with model: ${result.model}`);

      // Validate password for encrypted mode
      if (storageMode === "encrypted") {
        if (!password) {
          toast.error("Password is required for encrypted storage");
          setPasswordError("Password is required");
          setIsLoading(false);
          return;
        }
        if (password.length < 8) {
          toast.error("Password must be at least 8 characters");
          setPasswordError("Password must be at least 8 characters");
          setIsLoading(false);
          return;
        }
      }

      // Store the key with password if encrypted mode
      await storeApiKey(apiKey, storageMode, storageMode === "encrypted" ? password : undefined);

      toast.success(`API key validated and stored securely! 
        ${storageMode === "encrypted" ? "Auto-clears after 4 hours." : "Clears on browser close."}`);

      // Clear form
      setApiKey("");
      setPassword("");
      setShowKey(false);
      setShowPassword(false);
      setValidationStatus("idle");
      setValidationMessage("");
      setPasswordError("");

      // Close dialog
      onOpenChange(false);

      // Notify parent
      onKeySet?.();
    } catch (error) {
      console.error("Failed to store API key:", error);
      setValidationStatus("invalid");
      setValidationMessage("Network error or timeout");
      toast.error("Failed to validate or store API key. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-primary" />
            <DialogTitle>Enter Your Claude API Key</DialogTitle>
          </div>
          <DialogDescription className="pt-2 space-y-2">
            <p>
              Enable requires your Claude API key to function. Your key is{" "}
              <strong>never sent to our servers</strong> - it's stored locally
              in your browser.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Claude API Key</Label>
            <div className="relative">
              <Input
                autoComplete="off"
                className={`pr-20 ${
                  validationStatus === "valid"
                    ? "border-green-500 focus-visible:ring-green-500"
                    : validationStatus === "invalid"
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                }`}
                id="api-key"
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setValidationStatus("idle");
                  setValidationMessage("");
                }}
                placeholder="sk-ant-..."
                type={showKey ? "text" : "password"}
                value={apiKey}
              />
              <div className="absolute top-1/2 right-1 -translate-y-1/2 flex items-center gap-1">
                {validationStatus === "validating" && (
                  <Loader2 className="size-4 animate-spin text-blue-500" />
                )}
                {validationStatus === "valid" && (
                  <CheckCircle2 className="size-4 text-green-500" />
                )}
                {validationStatus === "invalid" && (
                  <XCircle className="size-4 text-red-500" />
                )}
                <Button
                  className="size-8"
                  onClick={() => setShowKey(!showKey)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  {showKey ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Validation Message */}
            {validationMessage && (
              <div
                className={`flex items-start gap-2 text-xs rounded-md p-2 ${
                  validationStatus === "valid"
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : validationStatus === "invalid"
                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                }`}
              >
                {validationStatus === "validating" && (
                  <AlertCircle className="size-3.5 mt-0.5 flex-shrink-0" />
                )}
                {validationStatus === "valid" && (
                  <CheckCircle2 className="size-3.5 mt-0.5 flex-shrink-0" />
                )}
                {validationStatus === "invalid" && (
                  <XCircle className="size-3.5 mt-0.5 flex-shrink-0" />
                )}
                <span className="flex-1">{validationMessage}</span>
              </div>
            )}

            <p className="flex items-center gap-1 text-muted-foreground text-xs">
              <ExternalLink className="size-3" />
              <a
                className="underline hover:text-foreground"
                href="https://console.anthropic.com/settings/keys"
                rel="noopener noreferrer"
                target="_blank"
              >
                Get your API key from Anthropic Console
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storage-mode">Storage Mode</Label>
            <Select
              onValueChange={(value: "memory" | "encrypted") => {
                setStorageMode(value);
                setPasswordError("");
              }}
              value={storageMode}
            >
              <SelectTrigger id="storage-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="memory">
                  <div className="flex items-center gap-2">
                    <Shield className="size-3.5 text-green-500" />
                    <span>Memory Only (Most Secure)</span>
                  </div>
                </SelectItem>
                <SelectItem value="encrypted">
                  <div className="flex items-center gap-2">
                    <Shield className="size-3.5 text-blue-500" />
                    <span>Encrypted Storage (Persistent)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              {storageMode === "memory"
                ? "✓ Most secure: Cleared on browser close. Auto-clears after 15 min inactivity."
                : "⚠️ Requires password: Persists up to 4 hours. AES-256 encryption."}
            </p>
          </div>

          {/* Password field for encrypted mode */}
          {storageMode === "encrypted" && (
            <div className="space-y-2">
              <Label htmlFor="encryption-password">Encryption Password</Label>
              <div className="relative">
                <Input
                  autoComplete="new-password"
                  className={passwordError ? "border-red-500" : ""}
                  id="encryption-password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Enter a strong password (min 8 characters)"
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <Button
                  className="size-8 absolute top-1/2 right-1 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
              {passwordError && (
                <p className="text-xs text-red-600 dark:text-red-400">{passwordError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                This password encrypts your API key. You'll need it to access your key in future sessions.
              </p>
            </div>
          )}

          {/* Enhanced security warnings */}
          <div className={`space-y-2 rounded-lg border p-3 ${
            storageMode === "memory" 
              ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20"
              : "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20"
          }`}>
            <div className="flex items-center gap-2">
              <Shield className={`size-4 ${storageMode === "memory" ? "text-green-600" : "text-yellow-600"}`} />
              <p className="font-medium text-sm">Security Features:</p>
            </div>
            <ul className="ml-6 space-y-1 text-muted-foreground text-xs list-disc">
              <li>AES-256-GCM encryption with 250,000 PBKDF2 iterations</li>
              <li>Keys only sent to api.anthropic.com (never our servers)</li>
              <li>Auto-clears after {storageMode === "memory" ? "15" : "15"} minutes of inactivity</li>
              <li>{storageMode === "encrypted" ? "Maximum 4-hour session duration" : "Cleared immediately on browser close"}</li>
              <li>Session-based security with random IDs</li>
              <li>Protected by Content Security Policy headers</li>
            </ul>
          </div>

          {/* Warning for encrypted mode */}
          {storageMode === "encrypted" && (
            <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 text-red-600" />
                <p className="font-medium text-sm text-red-600 dark:text-red-400">Important Warnings:</p>
              </div>
              <ul className="ml-6 space-y-1 text-red-600 dark:text-red-400 text-xs list-disc">
                <li>Physical access to your computer = access to your key</li>
                <li>Malicious browser extensions could potentially access localStorage</li>
                <li>If you forget your password, you'll need to re-enter your API key</li>
                <li>Use "Memory Only" mode for maximum security</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            disabled={isLoading}
            onClick={handleSubmit}
            type="button"
            variant="default"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Validating...
              </>
            ) : (
              "Save API Key"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to check if API key is set
 */
export function useApiKey() {
  const [hasKey, setHasKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkKey = async () => {
    setIsLoading(true);
    const keyExists = hasApiKey();
    setHasKey(keyExists);
    setIsLoading(false);
  };

  const refreshKey = () => {
    checkKey();
  };

  // Check on mount
  useState(() => {
    checkKey();
  });

  return { hasKey, isLoading, refreshKey };
}
