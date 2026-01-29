"use client";

import { useState } from "react";
import type { VisibilityType } from "@/components/visibility-selector";

export function useChatVisibility({
  chatId: _chatId,
  initialVisibilityType,
}: {
  chatId: string;
  initialVisibilityType: VisibilityType;
}) {
  // Enable is client-side only - all chats are private by default
  const [visibilityType, setVisibilityType] = useState<VisibilityType>(
    initialVisibilityType
  );

  return { visibilityType, setVisibilityType };
}
