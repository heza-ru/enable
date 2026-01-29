"use client";

import { motion } from "framer-motion";
import {
  Calculator,
  FileText,
  Lightbulb,
  MessageSquare,
  Presentation,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface PromptSuggestion {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const suggestions: PromptSuggestion[] = [
  {
    icon: <FileText className="size-5" />,
    title: "Generate the monthly income statement",
    description: "Create comprehensive financial reports",
  },
  {
    icon: <Presentation className="size-5" />,
    title: "Generate a demo script for Whatfix",
    description: "Prepare engaging product demonstrations",
  },
  {
    icon: <Calculator className="size-5" />,
    title: "Provide a 12-month cash flow forecast",
    description: "Plan financial projections",
  },
  {
    icon: <Shield className="size-5" />,
    title: "Handle objections about accessibility",
    description: "Address customer concerns effectively",
  },
  {
    icon: <TrendingUp className="size-5" />,
    title: "Generate quarterly profit and loss statement",
    description: "Track business performance",
  },
  {
    icon: <Users className="size-5" />,
    title: "Create a competitive comparison",
    description: "Analyze market positioning",
  },
  {
    icon: <Lightbulb className="size-5" />,
    title: "Design a customer success plan",
    description: "Ensure adoption and value delivery",
  },
  {
    icon: <MessageSquare className="size-5" />,
    title: "Draft discovery questions for prospects",
    description: "Uncover customer needs and pain points",
  },
];

interface PromptSuggestionsProps {
  onSuggestionClick?: (title: string) => void;
}

export function PromptSuggestions({
  onSuggestionClick,
}: PromptSuggestionsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {suggestions.map((suggestion, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          initial={{ opacity: 0, y: 10 }}
          key={suggestion.title}
          transition={{ delay: 0.1 * index }}
        >
          <Card className="group cursor-pointer border border-[#2a2836] bg-card p-4 transition-all hover:border-primary hover:bg-accent">
            <Button
              className="h-auto w-full justify-start p-0 text-left"
              onClick={() => onSuggestionClick?.(suggestion.title)}
              variant="ghost"
            >
              <div className="flex w-full items-start gap-3">
                <div className="mt-0.5 text-muted-foreground transition-colors group-hover:text-primary">
                  {suggestion.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="font-medium text-sm leading-tight">
                    {suggestion.title}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {suggestion.description}
                  </div>
                </div>
              </div>
            </Button>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
