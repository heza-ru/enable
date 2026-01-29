"use client";

import { generateUUID } from "../utils";
import {
  type Chat,
  del,
  deleteMany,
  get,
  getAll,
  getAllByIndex,
  type Message,
  put,
  STORES,
} from "./indexeddb";

/**
 * Create a new chat
 */
export async function createChat(
  title: string,
  model: string,
  id?: string
): Promise<Chat> {
  const chat: Chat = {
    id: id || generateUUID(),
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    model,
    visibility: "private",
    totalCost: 0,
  };

  await put(STORES.CHATS, chat);
  return chat;
}

/**
 * Get chat by ID
 */
export async function getChat(id: string): Promise<Chat | null> {
  return await get<Chat>(STORES.CHATS, id);
}

/**
 * Get all chats, sorted by updated date (most recent first)
 */
export async function getAllChats(): Promise<Chat[]> {
  const chats = await getAll<Chat>(STORES.CHATS);
  return chats.sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Update chat
 */
export async function updateChat(
  id: string,
  updates: Partial<Chat>
): Promise<void> {
  const chat = await getChat(id);
  if (!chat) {
    throw new Error(`Chat ${id} not found`);
  }

  const updated: Chat = {
    ...chat,
    ...updates,
    updatedAt: Date.now(),
  };

  await put(STORES.CHATS, updated);
}

/**
 * Update chat title
 */
export async function updateChatTitle(
  id: string,
  title: string
): Promise<void> {
  await updateChat(id, { title });
}

/**
 * Delete chat and all its messages
 */
export async function deleteChat(id: string): Promise<void> {
  // Delete chat
  await del(STORES.CHATS, id);

  // Delete all messages for this chat
  const messages = await getMessagesByChatId(id);
  const messageIds = messages.map((m) => m.id);
  await deleteMany(STORES.MESSAGES, messageIds);

  // Delete all cost records for this chat
  const costs = await getAllByIndex(STORES.COSTS, "chatId", id);
  const costIds = costs.map((c: any) => c.id);
  await deleteMany(STORES.COSTS, costIds);
}

/**
 * Delete all chats
 */
export async function deleteAllChats(): Promise<void> {
  const chats = await getAllChats();
  const chatIds = chats.map((c) => c.id);

  // Delete all chats
  await deleteMany(STORES.CHATS, chatIds);

  // Delete all messages
  const messages = await getAll<Message>(STORES.MESSAGES);
  const messageIds = messages.map((m) => m.id);
  await deleteMany(STORES.MESSAGES, messageIds);

  // Delete all costs
  const costs = await getAll(STORES.COSTS);
  const costIds = costs.map((c: any) => c.id);
  await deleteMany(STORES.COSTS, costIds);
}

/**
 * Save a message
 */
export async function saveMessage(message: Message): Promise<void> {
  await put(STORES.MESSAGES, message);

  // Update chat's updatedAt
  const chat = await getChat(message.chatId);
  if (chat) {
    await updateChat(message.chatId, { updatedAt: Date.now() });
  }
}

/**
 * Save multiple messages
 */
export async function saveMessages(messages: Message[]): Promise<void> {
  for (const message of messages) {
    await saveMessage(message);
  }
}

/**
 * Get messages by chat ID, sorted by creation time
 */
export async function getMessagesByChatId(chatId: string): Promise<Message[]> {
  const messages = await getAllByIndex<Message>(
    STORES.MESSAGES,
    "chatId",
    chatId
  );
  return messages.sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Get message by ID
 */
export async function getMessage(id: string): Promise<Message | null> {
  return await get<Message>(STORES.MESSAGES, id);
}

/**
 * Update message
 */
export async function updateMessage(
  id: string,
  updates: Partial<Message>
): Promise<void> {
  const message = await getMessage(id);
  if (!message) {
    throw new Error(`Message ${id} not found`);
  }

  const updated: Message = {
    ...message,
    ...updates,
  };

  await put(STORES.MESSAGES, updated);
}

/**
 * Delete message
 */
export async function deleteMessage(id: string): Promise<void> {
  await del(STORES.MESSAGES, id);
}

/**
 * Get chat count
 */
export async function getChatCount(): Promise<number> {
  const chats = await getAllChats();
  return chats.length;
}

/**
 * Get message count for a chat
 */
export async function getMessageCount(chatId: string): Promise<number> {
  const messages = await getMessagesByChatId(chatId);
  return messages.length;
}

/**
 * Search chats by title
 */
export async function searchChats(query: string): Promise<Chat[]> {
  const chats = await getAllChats();
  const lowerQuery = query.toLowerCase();

  return chats.filter((chat) => chat.title.toLowerCase().includes(lowerQuery));
}

/**
 * Get recent chats (last N chats)
 */
export async function getRecentChats(limit = 20): Promise<Chat[]> {
  const chats = await getAllChats();
  return chats.slice(0, limit);
}

/**
 * Group chats by date
 */
export interface GroupedChats {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
}

export async function getGroupedChats(): Promise<GroupedChats> {
  const chats = await getAllChats();
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const oneWeekMs = 7 * oneDayMs;
  const oneMonthMs = 30 * oneDayMs;

  const grouped: GroupedChats = {
    today: [],
    yesterday: [],
    lastWeek: [],
    lastMonth: [],
    older: [],
  };

  for (const chat of chats) {
    const age = now - chat.updatedAt;

    if (age < oneDayMs) {
      grouped.today.push(chat);
    } else if (age < 2 * oneDayMs) {
      grouped.yesterday.push(chat);
    } else if (age < oneWeekMs) {
      grouped.lastWeek.push(chat);
    } else if (age < oneMonthMs) {
      grouped.lastMonth.push(chat);
    } else {
      grouped.older.push(chat);
    }
  }

  return grouped;
}
