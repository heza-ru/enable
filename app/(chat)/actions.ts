"use server";

import { cookies } from "next/headers";
import type { VisibilityType } from "@/components/visibility-selector";

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set("chat-model", model);
}

export async function generateTitleFromUserMessage({
  message: _message,
}: {
  message: unknown;
}) {
  // Enable is client-side only - title generation handled in browser
  return "New chat";
}

export async function deleteTrailingMessages({ id: _id }: { id: string }) {
  // Enable is client-side only - deletions handled in IndexedDB
}

export async function updateChatVisibility({
  chatId: _chatId,
  visibility: _visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  // Enable is client-side only - visibility handled in IndexedDB
}
