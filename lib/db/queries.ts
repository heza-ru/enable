import "server-only";

import type { Chat, DBMessage, Suggestion, User } from "./schema";

// Enable is client-side only - all database operations are stubbed
// Real data is stored in IndexedDB on the client

export async function getUser(_email: string): Promise<User[]> {
  return [];
}

export async function createUser(_params: unknown): Promise<User> {
  return {} as User;
}

export async function createGuestUser(): Promise<User> {
  return {} as User;
}

export async function getChatById(_params: {
  id: string;
}): Promise<Chat | null> {
  return null;
}

export async function getChatsByUserId(_params: unknown): Promise<Chat[]> {
  return [];
}

export async function saveChat(_params: unknown): Promise<void> {
  // No-op: client-side storage only
}

export async function updateChatTitleById(_params: unknown): Promise<void> {
  // No-op: client-side storage only
}

export async function updateChatVisibilityById(
  _params: unknown
): Promise<void> {
  // No-op: client-side storage only
}

export async function deleteChatById(_params: { id: string }): Promise<void> {
  // No-op: client-side storage only
}

export async function deleteAllChatsByUserId(_params: unknown): Promise<void> {
  // No-op: client-side storage only
}

export async function getMessagesByChatId(_params: {
  id: string;
}): Promise<DBMessage[]> {
  return [];
}

export async function getMessageById(_params: {
  id: string;
}): Promise<DBMessage[]> {
  return [];
}

export async function saveMessages(_params: unknown): Promise<void> {
  // No-op: client-side storage only
}

export async function updateMessage(_params: unknown): Promise<void> {
  // No-op: client-side storage only
}

export async function deleteMessagesByChatIdAfterTimestamp(
  _params: unknown
): Promise<void> {
  // No-op: client-side storage only
}

export async function getMessageCountByUserId(
  _params: unknown
): Promise<number> {
  return 0;
}

export async function voteMessage(_params: unknown): Promise<void> {
  // No-op: client-side storage only
}

export async function getVotesByChatId(_params: unknown): Promise<unknown[]> {
  return [];
}

export async function getDocumentById(_params: {
  id: string;
}): Promise<{ userId?: string; [key: string]: unknown } | null> {
  return null;
}

export async function getDocumentsById(_params: {
  id: string;
}): Promise<Array<{ userId?: string; [key: string]: unknown }>> {
  return [];
}

export async function saveDocument(_params: unknown): Promise<void> {
  // No-op: client-side storage only
}

export async function deleteDocumentsByIdAfterTimestamp(
  _params: unknown
): Promise<void> {
  // No-op: client-side storage only
}

export async function saveSuggestions(_params: unknown): Promise<void> {
  // No-op: client-side storage only
}

export async function getSuggestionsByDocumentId(_params: {
  documentId: string;
}): Promise<Suggestion[]> {
  return [];
}

export async function createStreamId(_params: unknown): Promise<void> {
  // No-op: client-side storage only
}

export async function getStreamById(_params: {
  id: string;
}): Promise<unknown | null> {
  return null;
}

export async function deleteStreamById(_params: { id: string }): Promise<void> {
  // No-op: client-side storage only
}
