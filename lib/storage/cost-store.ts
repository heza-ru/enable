"use client";

import { calculateCost } from "../ai/pricing";
import { generateUUID } from "../utils";
import {
  type CostRecord,
  getAll,
  getAllByIndex,
  put,
  STORES,
} from "./indexeddb";

/**
 * Export CostRecord type
 */
export type { CostRecord } from "./indexeddb";

/**
 * Save cost record for a message
 */
export async function saveCost(
  chatId: string,
  messageId: string,
  model: string,
  inputTokens: number,
  outputTokens: number
): Promise<CostRecord> {
  const { totalCost } = calculateCost(model, inputTokens, outputTokens);

  const costRecord: CostRecord = {
    id: generateUUID(),
    chatId,
    messageId,
    model,
    inputTokens,
    outputTokens,
    cost: totalCost,
    timestamp: Date.now(),
  };

  await put(STORES.COSTS, costRecord);
  return costRecord;
}

/**
 * Get cost record by message ID
 */
export async function getCostByMessageId(
  messageId: string
): Promise<CostRecord | null> {
  const costs = await getAllByIndex<CostRecord>(
    STORES.COSTS,
    "messageId",
    messageId
  );
  return costs[0] || null;
}

/**
 * Get all costs for a chat
 */
export async function getChatCosts(chatId: string): Promise<CostRecord[]> {
  return await getAllByIndex<CostRecord>(STORES.COSTS, "chatId", chatId);
}

/**
 * Get total cost for a chat
 */
export async function getChatCost(chatId: string): Promise<number> {
  const costs = await getChatCosts(chatId);
  return costs.reduce((sum, cost) => sum + cost.cost, 0);
}

/**
 * Get session cost (all costs from current session)
 * Session starts when app is opened
 */
const sessionStartTime = Date.now();

export async function getSessionCost(): Promise<number> {
  const allCosts = await getAll<CostRecord>(STORES.COSTS);
  const sessionCosts = allCosts.filter(
    (cost) => cost.timestamp >= sessionStartTime
  );
  return sessionCosts.reduce((sum, cost) => sum + cost.cost, 0);
}

/**
 * Get total cost across all chats
 */
export async function getTotalCost(): Promise<number> {
  const allCosts = await getAll<CostRecord>(STORES.COSTS);
  return allCosts.reduce((sum, cost) => sum + cost.cost, 0);
}

/**
 * Get cost breakdown by model
 */
export interface ModelCostBreakdown {
  model: string;
  totalCost: number;
  inputTokens: number;
  outputTokens: number;
  messageCount: number;
}

export async function getCostBreakdownByModel(): Promise<ModelCostBreakdown[]> {
  const allCosts = await getAll<CostRecord>(STORES.COSTS);

  const breakdown = new Map<string, ModelCostBreakdown>();

  for (const cost of allCosts) {
    const existing = breakdown.get(cost.model) || {
      model: cost.model,
      totalCost: 0,
      inputTokens: 0,
      outputTokens: 0,
      messageCount: 0,
    };

    breakdown.set(cost.model, {
      model: cost.model,
      totalCost: existing.totalCost + cost.cost,
      inputTokens: existing.inputTokens + cost.inputTokens,
      outputTokens: existing.outputTokens + cost.outputTokens,
      messageCount: existing.messageCount + 1,
    });
  }

  return Array.from(breakdown.values());
}

/**
 * Get cost history (daily aggregates)
 */
export interface DailyCost {
  date: string; // YYYY-MM-DD
  cost: number;
  inputTokens: number;
  outputTokens: number;
  messageCount: number;
}

export async function getDailyCostHistory(days = 30): Promise<DailyCost[]> {
  const allCosts = await getAll<CostRecord>(STORES.COSTS);
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;

  const recentCosts = allCosts.filter((cost) => cost.timestamp >= cutoff);

  const dailyMap = new Map<string, DailyCost>();

  for (const cost of recentCosts) {
    const date = new Date(cost.timestamp).toISOString().split("T")[0];

    const existing = dailyMap.get(date) || {
      date,
      cost: 0,
      inputTokens: 0,
      outputTokens: 0,
      messageCount: 0,
    };

    dailyMap.set(date, {
      date,
      cost: existing.cost + cost.cost,
      inputTokens: existing.inputTokens + cost.inputTokens,
      outputTokens: existing.outputTokens + cost.outputTokens,
      messageCount: existing.messageCount + 1,
    });
  }

  return Array.from(dailyMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

/**
 * Export cost data as CSV
 */
export async function exportCostDataAsCSV(): Promise<string> {
  const allCosts = await getAll<CostRecord>(STORES.COSTS);

  const headers = [
    "Date",
    "Chat ID",
    "Message ID",
    "Model",
    "Input Tokens",
    "Output Tokens",
    "Cost (USD)",
  ];

  const rows = allCosts.map((cost) => [
    new Date(cost.timestamp).toISOString(),
    cost.chatId,
    cost.messageId,
    cost.model,
    cost.inputTokens.toString(),
    cost.outputTokens.toString(),
    cost.cost.toFixed(6),
  ]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

  return csv;
}

/**
 * Get cost summary
 */
export interface CostSummary {
  totalCost: number;
  sessionCost: number;
  totalMessages: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  averageCostPerMessage: number;
  modelBreakdown: ModelCostBreakdown[];
}

export async function getCostSummary(): Promise<CostSummary> {
  const allCosts = await getAll<CostRecord>(STORES.COSTS);
  const sessionCost = await getSessionCost();
  const modelBreakdown = await getCostBreakdownByModel();

  const totalCost = allCosts.reduce((sum, cost) => sum + cost.cost, 0);
  const totalInputTokens = allCosts.reduce(
    (sum, cost) => sum + cost.inputTokens,
    0
  );
  const totalOutputTokens = allCosts.reduce(
    (sum, cost) => sum + cost.outputTokens,
    0
  );
  const totalMessages = allCosts.length;
  const averageCostPerMessage =
    totalMessages > 0 ? totalCost / totalMessages : 0;

  return {
    totalCost,
    sessionCost,
    totalMessages,
    totalInputTokens,
    totalOutputTokens,
    averageCostPerMessage,
    modelBreakdown,
  };
}
