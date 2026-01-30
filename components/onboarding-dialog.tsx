"use client";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Target,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { isValidApiKeyFormat, storeApiKey } from "@/lib/storage/api-keys";
import { saveUserProfile, type UserRole } from "@/lib/storage/user-profile";
import { validateClaudeApiKey } from "@/lib/storage/validate-api-key";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "./ui/textarea";

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

interface OnboardingDialogProps {
  open: boolean;
  onComplete: () => void;
  googleUser?: GoogleUser | null;
}

const ROLES: Array<{
  value: UserRole;
  icon: typeof Briefcase;
  description: string;
}> = [
  {
    value: "Solutions Consultant",
    icon: Briefcase,
    description: "Strategic partner driving ROI conversations and business outcomes",
  },
  {
    value: "Sales Engineer",
    icon: Target,
    description: "Technical expert handling integrations, POCs, and security validation",
  },
];

const PERSONALIZATION_EXAMPLES = [
  "Be concise and action-oriented",
  "Focus on ROI and business outcomes",
  "Use technical depth when explaining features",
  "Always include real customer examples",
  "Emphasize security and compliance",
];

export function OnboardingDialog({
  open,
  onComplete,
  googleUser,
}: OnboardingDialogProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(googleUser?.name || "");
  const [role, setRole] = useState<UserRole | null>(null);
  const [personalizationPrompt, setPersonalizationPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [storageMode, setStorageMode] = useState<"memory" | "encrypted">(
    "memory"  // Changed to memory mode (most secure) as default
  );
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<
    "idle" | "validating" | "valid" | "invalid"
  >("idle");
  const [validationMessage, setValidationMessage] = useState("");

  const handleNext = async () => {
    if (step === 1) {
      if (!name.trim()) {
        toast.error("Please enter your name");
        return;
      }
      if (!role) {
        toast.error("Please select your role");
        return;
      }
    }

    if (step === 3 && apiKey.trim()) {
      // Only validate if API key is provided
      if (!isValidApiKeyFormat(apiKey)) {
        toast.error("Invalid API key format. Claude keys start with 'sk-ant-'");
        return;
      }

      // Validate API key against Claude API
      setIsValidating(true);
      setValidationStatus("validating");
      setValidationMessage("Verifying with Claude API...");

      try {
        const result = await validateClaudeApiKey(apiKey);

        if (!result.valid) {
          setValidationStatus("invalid");
          setValidationMessage(result.error || "Invalid API key");
          toast.error(result.error || "Invalid API key");
          setIsValidating(false);
          return;
        }

        setValidationStatus("valid");
        setValidationMessage(`✓ Verified with model: ${result.model}`);
        toast.success("API key validated successfully!");
      } catch (error) {
        setValidationStatus("invalid");
        setValidationMessage("Network error or timeout");
        console.error("Validation error:", error);
        toast.error("Failed to validate API key");
        setIsValidating(false);
        return;
      } finally {
        setIsValidating(false);
      }
    }

    setStep(step + 1);
  };

  const handleSkipApiKey = () => {
    setApiKey("");
    setValidationStatus("idle");
    setValidationMessage("");
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleComplete = async () => {
    try {
      // Save user profile
      saveUserProfile({
        name: name.trim(),
        role: role!,
        personalizationPrompt: personalizationPrompt.trim(),
      });

      // Save API key only if provided
      if (apiKey.trim()) {
        // Only allow memory mode in onboarding (encrypted requires password)
        if (storageMode === "encrypted") {
          toast.error("Encrypted storage requires password. Using memory mode instead.");
          await storeApiKey(apiKey, "memory");
        } else {
          await storeApiKey(apiKey, storageMode);
        }
      }

      toast.success(
        apiKey.trim()
          ? `Welcome, ${name}! Enable is ready to assist you.`
          : `Welcome, ${name}! You can add your API key in Settings.`
      );
      
      // Trigger profile update event to refresh greeting (no page reload needed)
      window.dispatchEvent(new Event('profileUpdated'));
      
      onComplete();
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to complete setup. Please try again.");
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center">
            {step === 1 && (
              <DialogTitle className="flex items-center justify-center gap-2 text-2xl font-semibold">
                <span>Welcome to</span>
                <img
                  alt="Enable Logo"
                  className="h-8 w-auto object-contain inline-block"
                  src="/logo.svg"
                />
                <span>enable</span>
              </DialogTitle>
            )}
            {step !== 1 && (
              <DialogTitle className="text-2xl font-semibold">
                {step === 2 && "Personalize Your Experience"}
                {step === 3 && "Connect Your Claude API"}
                {step === 4 && "Review Your Profile"}
              </DialogTitle>
            )}
          </div>
          <DialogDescription className="text-center text-base">
            {step === 1 && "Let's get to know you"}
            {step === 2 && "Help Enable understand how to assist you best"}
            {step === 3 && "Your API key is stored securely on your device"}
            {step === 4 && "Confirm your details and start using Enable"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                className={`h-2 w-12 rounded-full transition-all duration-300 ${
                  s <= step ? "bg-primary" : "bg-muted/50"
                }`}
                key={s}
              />
            ))}
          </div>

          {/* Step 1: Identity */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  autoFocus
                  id="name"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Alex Smith"
                  value={name}
                />
              </div>

              <div className="space-y-3">
                <Label>Your Role</Label>
                <div className="grid gap-3">
                  {ROLES.map((r) => {
                    const Icon = r.icon;
                    return (
                      <Card
                        className={`cursor-pointer border-2 p-4 transition-all hover:border-primary ${
                          role === r.value
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                        key={r.value}
                        onClick={() => setRole(r.value)}
                      >
                        <div className="flex items-start gap-3">
                          <Icon
                            className={`size-5 ${
                              role === r.value
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{r.value}</div>
                            <div className="text-muted-foreground text-sm">
                              {r.description}
                            </div>
                          </div>
                          {role === r.value && (
                            <Check className="size-5 text-primary" />
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Personalization */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="personalization">
                  Guide how Enable should respond to you (Optional)
                </Label>
                <Textarea
                  className="min-h-[120px]"
                  id="personalization"
                  onChange={(e) => setPersonalizationPrompt(e.target.value)}
                  placeholder="e.g., Be concise and focus on ROI metrics"
                  value={personalizationPrompt}
                />
                <p className="text-muted-foreground text-xs">
                  This helps Enable tailor responses to your preferences. You
                  can edit this anytime in Settings.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">
                  Example preferences:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {PERSONALIZATION_EXAMPLES.map((example) => (
                    <Button
                      key={example}
                      onClick={() => {
                        setPersonalizationPrompt((prev) =>
                          prev ? `${prev}\n${example}` : example
                        );
                      }}
                      size="sm"
                      variant="outline"
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: API Key */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <Key className="size-5 text-primary" />
                  <div className="flex-1 space-y-1 text-sm">
                    <p className="font-medium">Why do I need an API key?</p>
                    <p className="text-muted-foreground">
                      Enable is 100% client-side and uses your own Claude API
                      key. Your key is stored securely on your device and never
                      sent to any server except Anthropic's API.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">
                  Claude API Key{" "}
                  <span className="text-muted-foreground">(Optional)</span>
                </Label>
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
                    placeholder="sk-ant-... (can add later in Settings)"
                    type={showApiKey ? "text" : "password"}
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
                      onClick={() => setShowApiKey(!showApiKey)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      {showApiKey ? (
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

                <p className="text-muted-foreground text-xs">
                  Get your API key at{" "}
                  <a
                    className="text-primary underline"
                    href="https://console.anthropic.com/settings/keys"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    console.anthropic.com
                    <ExternalLink className="ml-1 inline size-3" />
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage-mode">Storage Mode</Label>
                <Select
                  onValueChange={(value) =>
                    setStorageMode(value as "memory" | "encrypted")
                  }
                  value={storageMode}
                >
                  <SelectTrigger id="storage-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="memory">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          Memory (Session Only)
                        </span>
                        <span className="text-muted-foreground text-xs">
                          Cleared when you close the tab
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="encrypted">
                      <div className="flex flex-col">
                        <span className="font-medium">Encrypted Storage</span>
                        <span className="text-muted-foreground text-xs">
                          Persists across sessions (recommended)
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <Card className="p-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Name
                    </Label>
                    <p className="font-medium">{name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Role
                    </Label>
                    <p className="font-medium">{role}</p>
                  </div>
                  {personalizationPrompt && (
                    <div>
                      <Label className="text-muted-foreground text-xs">
                        Personalization
                      </Label>
                      <p className="text-sm">{personalizationPrompt}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      API Key
                    </Label>
                    {apiKey ? (
                      <>
                        <p className="font-medium">
                          {apiKey.substring(0, 12)}...
                          {apiKey.substring(apiKey.length - 4)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Stored{" "}
                          {storageMode === "memory"
                            ? "in memory"
                            : "encrypted locally"}
                        </p>
                      </>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        Not configured (add later in Settings)
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm">
                  <strong>All data is stored locally</strong> on your device.
                  Nothing is sent to any server except your conversations with
                  Claude.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-[#2a2836]/30 pt-6">
          <div>
            {step > 1 && (
              <Button
                className="gap-2"
                onClick={handleBack}
                size="sm"
                variant="ghost"
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
            )}
          </div>

          <div className="text-muted-foreground text-sm font-medium">
            Step {step} of 4
          </div>

          <div className="flex items-center gap-2">
            {step === 3 && (
              <Button
                className="text-muted-foreground"
                onClick={handleSkipApiKey}
                size="sm"
                variant="ghost"
              >
                Skip for now
              </Button>
            )}
            {step < 4 ? (
              <Button
                className="gap-2"
                disabled={isValidating}
                onClick={handleNext}
                size="sm"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    {step === 3 && apiKey.trim()
                      ? "Next"
                      : step === 3
                        ? "Skip"
                        : "Next"}
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button className="gap-2" onClick={handleComplete} size="sm">
                <Check className="size-4" />
                Complete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
