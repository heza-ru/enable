"use client";

import { Briefcase, Building2, Target, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
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

export interface ContextData {
  persona: "solution-consultant" | "sales-engineer" | "generic";
  customer?: string;
  industry?: string;
  scope?: string;
}

const PERSONAS = {
  "solution-consultant": {
    label: "Solution Consultant",
    icon: Briefcase,
    description: "Focus on business value and customer outcomes",
  },
  "sales-engineer": {
    label: "Sales Engineer",
    icon: Target,
    description: "Focus on technical validation and POCs",
  },
  generic: {
    label: "Generic Assistant",
    icon: Building2,
    description: "General AI assistant mode",
  },
};

interface ContextPanelProps {
  context: ContextData;
  onChange: (context: ContextData) => void;
}

export function ContextPanel({ context, onChange }: ContextPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localContext, setLocalContext] = useState<ContextData>(context);

  useEffect(() => {
    setLocalContext(context);
  }, [context]);

  const handleSave = () => {
    onChange(localContext);
    setIsExpanded(false);
  };

  const currentPersona = PERSONAS[localContext.persona];
  const PersonaIcon = currentPersona.icon;

  if (!isExpanded) {
    return (
      <Card className="mb-2 border-primary/20 bg-primary/5 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PersonaIcon className="size-4 text-primary" />
            <div className="flex flex-col">
              <span className="font-medium text-sm">
                {currentPersona.label}
              </span>
              {localContext.customer && (
                <span className="text-muted-foreground text-xs">
                  {localContext.customer}
                  {localContext.industry && ` • ${localContext.industry}`}
                </span>
              )}
            </div>
          </div>
          <Button onClick={() => setIsExpanded(true)} size="sm" variant="ghost">
            Edit Context
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-2 border-primary/30 bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Context Settings</h3>
        <Button
          onClick={() => setIsExpanded(false)}
          size="icon"
          variant="ghost"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Persona Selector */}
        <div className="space-y-2">
          <Label htmlFor="persona">Persona</Label>
          <Select
            onValueChange={(value) =>
              setLocalContext({
                ...localContext,
                persona: value as ContextData["persona"],
              })
            }
            value={localContext.persona}
          >
            <SelectTrigger id="persona">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PERSONAS).map(([key, persona]) => {
                const Icon = persona.icon;
                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Icon className="size-4" />
                      <div className="flex flex-col">
                        <span>{persona.label}</span>
                        <span className="text-muted-foreground text-xs">
                          {persona.description}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Customer Name */}
        <div className="space-y-2">
          <Label htmlFor="customer">Customer Name (Optional)</Label>
          <Input
            id="customer"
            onChange={(e) =>
              setLocalContext({ ...localContext, customer: e.target.value })
            }
            placeholder="e.g., Acme Corp"
            value={localContext.customer || ""}
          />
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <Label htmlFor="industry">Industry (Optional)</Label>
          <Input
            id="industry"
            onChange={(e) =>
              setLocalContext({ ...localContext, industry: e.target.value })
            }
            placeholder="e.g., Healthcare, Retail"
            value={localContext.industry || ""}
          />
        </div>

        {/* Scope/Context */}
        <div className="space-y-2">
          <Label htmlFor="scope">Scope/Context (Optional)</Label>
          <Textarea
            className="min-h-[80px]"
            id="scope"
            onChange={(e) =>
              setLocalContext({ ...localContext, scope: e.target.value })
            }
            placeholder="e.g., POC for employee onboarding, 500+ users"
            value={localContext.scope || ""}
          />
        </div>

        <Button className="w-full" onClick={handleSave}>
          Save Context
        </Button>
      </div>
    </Card>
  );
}
