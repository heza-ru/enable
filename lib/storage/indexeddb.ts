"use client";

/**
 * IndexedDB Storage for Enable
 * Local-first architecture - all data stored in browser
 */

const DB_NAME = "enable-db";
const DB_VERSION = 2; // Incremented to add documents store

// Store names
export const STORES = {
  CHATS: "chats",
  MESSAGES: "messages",
  SETTINGS: "settings",
  COSTS: "costs",
  DOCUMENTS: "documents",
} as const;

export interface Chat {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  model: string;
  visibility: "private" | "public";
  totalCost: number;
}

export interface Message {
  id: string;
  chatId: string;
  role: "user" | "assistant" | "system";
  parts: Array<{
    type: string;
    content: any;
  }>;
  attachments?: any[];
  createdAt: number;
  tokens?: {
    input: number;
    output: number;
  };
  cost?: number;
}

export interface Settings {
  id: string;
  selectedModel?: string;
  costTracking?: boolean;
  showMessageCosts?: boolean;
  currentPersona?: string;
  contextLayers?: {
    customer?: string;
    industry?: string;
    scope?: string;
    customContext?: string;
  };
}

export interface CostRecord {
  id: string;
  chatId: string;
  messageId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  timestamp: number;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  kind: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Initialize IndexedDB
 */
function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Chats store
      if (!db.objectStoreNames.contains(STORES.CHATS)) {
        const chatStore = db.createObjectStore(STORES.CHATS, { keyPath: "id" });
        chatStore.createIndex("createdAt", "createdAt", { unique: false });
        chatStore.createIndex("updatedAt", "updatedAt", { unique: false });
      }

      // Messages store
      if (!db.objectStoreNames.contains(STORES.MESSAGES)) {
        const messageStore = db.createObjectStore(STORES.MESSAGES, {
          keyPath: "id",
        });
        messageStore.createIndex("chatId", "chatId", { unique: false });
        messageStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      // Settings store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: "id" });
      }

      // Costs store
      if (!db.objectStoreNames.contains(STORES.COSTS)) {
        const costsStore = db.createObjectStore(STORES.COSTS, {
          keyPath: "id",
        });
        costsStore.createIndex("chatId", "chatId", { unique: false });
        costsStore.createIndex("messageId", "messageId", { unique: false });
        costsStore.createIndex("timestamp", "timestamp", { unique: false });
      }

      // Documents store
      if (!db.objectStoreNames.contains(STORES.DOCUMENTS)) {
        const documentsStore = db.createObjectStore(STORES.DOCUMENTS, {
          keyPath: "id",
        });
        documentsStore.createIndex("createdAt", "createdAt", { unique: false });
        documentsStore.createIndex("updatedAt", "updatedAt", { unique: false });
        documentsStore.createIndex("userId", "userId", { unique: false });
      }
    };
  });
}

/**
 * Get database instance
 */
let dbInstance: IDBDatabase | null = null;

async function getDB(): Promise<IDBDatabase> {
  if (dbInstance && dbInstance.version === DB_VERSION) {
    return dbInstance;
  }

  dbInstance = await initDB();
  return dbInstance;
}

/**
 * Generic get operation
 */
export async function get<T>(
  storeName: string,
  key: string
): Promise<T | null> {
  try {
    const db = await getDB();
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Failed to get from ${storeName}:`, error);
    return null;
  }
}

/**
 * Generic put operation
 */
export async function put<T>(storeName: string, value: T): Promise<void> {
  try {
    const db = await getDB();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(value);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Failed to put to ${storeName}:`, error);
    throw error;
  }
}

/**
 * Generic delete operation
 */
export async function del(storeName: string, key: string): Promise<void> {
  try {
    const db = await getDB();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Failed to delete from ${storeName}:`, error);
    throw error;
  }
}

/**
 * Get all records from a store
 */
export async function getAll<T>(storeName: string): Promise<T[]> {
  try {
    const db = await getDB();
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Failed to get all from ${storeName}:`, error);
    return [];
  }
}

/**
 * Get all records from an index
 */
export async function getAllByIndex<T>(
  storeName: string,
  indexName: string,
  query?: IDBValidKey | IDBKeyRange
): Promise<T[]> {
  try {
    const db = await getDB();
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = query ? index.getAll(query) : index.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Failed to get all by index from ${storeName}:`, error);
    return [];
  }
}

/**
 * Clear all data from a store
 */
export async function clearStore(storeName: string): Promise<void> {
  try {
    const db = await getDB();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Failed to clear ${storeName}:`, error);
    throw error;
  }
}

/**
 * Delete multiple records by keys
 */
export async function deleteMany(
  storeName: string,
  keys: string[]
): Promise<void> {
  try {
    const db = await getDB();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    await Promise.all(
      keys.map(
        (key) =>
          new Promise<void>((resolve, reject) => {
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          })
      )
    );
  } catch (error) {
    console.error(`Failed to delete many from ${storeName}:`, error);
    throw error;
  }
}

/**
 * Export all data (for backup)
 */
export async function exportAllData(): Promise<{
  chats: Chat[];
  messages: Message[];
  settings: Settings[];
  costs: CostRecord[];
  documents: Document[];
}> {
  const [chats, messages, settings, costs, documents] = await Promise.all([
    getAll<Chat>(STORES.CHATS),
    getAll<Message>(STORES.MESSAGES),
    getAll<Settings>(STORES.SETTINGS),
    getAll<CostRecord>(STORES.COSTS),
    getAll<Document>(STORES.DOCUMENTS),
  ]);

  return { chats, messages, settings, costs, documents };
}

/**
 * Import data (from backup)
 */
export async function importAllData(data: {
  chats?: Chat[];
  messages?: Message[];
  settings?: Settings[];
  costs?: CostRecord[];
  documents?: Document[];
}): Promise<void> {
  const db = await getDB();

  // Import in a single transaction
  const transaction = db.transaction(
    [
      STORES.CHATS,
      STORES.MESSAGES,
      STORES.SETTINGS,
      STORES.COSTS,
      STORES.DOCUMENTS,
    ],
    "readwrite"
  );

  const promises: Promise<void>[] = [];

  // Import chats
  if (data.chats) {
    const chatStore = transaction.objectStore(STORES.CHATS);
    for (const chat of data.chats) {
      promises.push(
        new Promise((resolve, reject) => {
          const request = chatStore.put(chat);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
      );
    }
  }

  // Import messages
  if (data.messages) {
    const messageStore = transaction.objectStore(STORES.MESSAGES);
    for (const message of data.messages) {
      promises.push(
        new Promise((resolve, reject) => {
          const request = messageStore.put(message);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
      );
    }
  }

  // Import settings
  if (data.settings) {
    const settingsStore = transaction.objectStore(STORES.SETTINGS);
    for (const setting of data.settings) {
      promises.push(
        new Promise((resolve, reject) => {
          const request = settingsStore.put(setting);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
      );
    }
  }

  // Import costs
  if (data.costs) {
    const costsStore = transaction.objectStore(STORES.COSTS);
    for (const cost of data.costs) {
      promises.push(
        new Promise((resolve, reject) => {
          const request = costsStore.put(cost);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
      );
    }
  }

  // Import documents
  if (data.documents) {
    const documentsStore = transaction.objectStore(STORES.DOCUMENTS);
    for (const document of data.documents) {
      promises.push(
        new Promise((resolve, reject) => {
          const request = documentsStore.put(document);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
      );
    }
  }

  await Promise.all(promises);
}
