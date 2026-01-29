"use client";

import {
  Clipboard,
  Code,
  FileText,
  Mail,
  Play,
  Presentation,
  Shield,
  Sparkles,
  Target,
} from "lucide-react";
import {
  STRUCTURED_TEMPLATES,
  type TemplateCategory,
} from "@/lib/templates/structured-outputs";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  presentations: "Presentations",
  emails: "Emails",
  demos: "Demos & Sales",
  technical: "Technical",
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  presentation: Presentation,
  target: Target,
  mail: Mail,
  "file-text": FileText,
  play: Play,
  shield: Shield,
  clipboard: Clipboard,
  code: Code,
};

interface TemplateSelectorProps {
  onSelectTemplate: (prompt: string) => void;
}

export function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  // Group templates by category
  const groupedTemplates = STRUCTURED_TEMPLATES.reduce(
    (acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    },
    {} as Record<TemplateCategory, typeof STRUCTURED_TEMPLATES>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost">
          <Sparkles className="size-4" />
          <span className="ml-2 hidden md:inline">Templates</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Sparkles className="size-4" />
          Structured Output Templates
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {Object.entries(groupedTemplates).map(([category, templates]) => (
          <DropdownMenuGroup key={category}>
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              {CATEGORY_LABELS[category as TemplateCategory]}
            </DropdownMenuLabel>
            {templates.map((template) => {
              const Icon = ICON_MAP[template.icon] || FileText;
              return (
                <DropdownMenuItem
                  className="cursor-pointer"
                  key={template.id}
                  onSelect={() => onSelectTemplate(template.prompt)}
                >
                  <Icon className="mr-2 size-4" />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{template.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {template.description}
                    </span>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
