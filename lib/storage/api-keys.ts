"use client";

/**
 * Client-side API key management for Enable
 * Keys are stored either in memory only or encrypted in localStorage
 * Never logged or sent to any server except api.anthropic.com
 */

const STORAGE_KEY = "enable_api_key_encrypted";
const STORAGE_MODE_KEY = "enable_storage_mode";
const LAST_ACTIVITY_KEY = "enable_last_activity";
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

type StorageMode = "memory" | "encrypted";

// In-memory storage (cleared on page refresh)
let memoryApiKey: string | null = null;

/**
 * Encrypt a string using Web Crypto API (AES-GCM)
 */
async function encrypt(text: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // Derive key from password
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  // Combine salt + iv + encrypted data
  const combined = new Uint8Array(
    salt.length + iv.length + encrypted.byteLength
  );
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt a string using Web Crypto API (AES-GCM)
 */
async function decrypt(
  encryptedText: string,
  password: string
): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Decode base64
  const combined = Uint8Array.from(atob(encryptedText), (c) => c.charCodeAt(0));

  // Extract salt, iv, and encrypted data
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const data = combined.slice(28);

  // Derive key from password
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return decoder.decode(decrypted);
}

/**
 * Simple password derivation from browser fingerprint
 * This is NOT cryptographically secure, just basic obfuscation
 */
function getBrowserFingerprint(): string {
  return `${navigator.userAgent}-${window.screen.width}-${window.screen.height}`;
}

/**
 * Store API key in memory or encrypted localStorage
 */
export async function storeApiKey(
  apiKey: string,
  mode: StorageMode = "memory"
): Promise<void> {
  if (mode === "memory") {
    memoryApiKey = apiKey;
    localStorage.setItem(STORAGE_MODE_KEY, "memory");
    localStorage.removeItem(STORAGE_KEY);
  } else {
    const password = getBrowserFingerprint();
    const encrypted = await encrypt(apiKey, password);
    localStorage.setItem(STORAGE_KEY, encrypted);
    localStorage.setItem(STORAGE_MODE_KEY, "encrypted");
    memoryApiKey = null;
  }

  updateLastActivity();
}

/**
 * Retrieve API key from memory or encrypted localStorage
 */
export async function getApiKey(): Promise<string | null> {
  checkInactivity();

  const mode = localStorage.getItem(STORAGE_MODE_KEY) as StorageMode | null;

  if (mode === "memory") {
    updateLastActivity();
    return memoryApiKey;
  }

  if (mode === "encrypted") {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) return null;

    try {
      const password = getBrowserFingerprint();
      const decrypted = await decrypt(encrypted, password);
      updateLastActivity();
      return decrypted;
    } catch (error) {
      console.error("Failed to decrypt API key:", error);
      clearApiKey();
      return null;
    }
  }

  return null;
}

/**
 * Clear API key from all storage
 */
export function clearApiKey(): void {
  memoryApiKey = null;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_MODE_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
}

/**
 * Check if API key exists
 */
export function hasApiKey(): boolean {
  const mode = localStorage.getItem(STORAGE_MODE_KEY);

  if (mode === "memory") {
    return memoryApiKey !== null;
  }

  if (mode === "encrypted") {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  return false;
}

/**
 * Get storage mode
 */
export function getStorageMode(): StorageMode | null {
  return localStorage.getItem(STORAGE_MODE_KEY) as StorageMode | null;
}

/**
 * Update last activity timestamp
 */
function updateLastActivity(): void {
  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
}

/**
 * Check for inactivity and clear key if timeout exceeded
 */
function checkInactivity(): void {
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
  if (!lastActivity) return;

  const timeSinceActivity = Date.now() - Number.parseInt(lastActivity, 10);

  if (timeSinceActivity > INACTIVITY_TIMEOUT) {
    clearApiKey();
  }
}

/**
 * Validate API key format (basic check)
 */
export function isValidApiKeyFormat(key: string): boolean {
  // Claude API keys start with "sk-ant-"
  return key.startsWith("sk-ant-") && key.length > 20;
}

/**
 * Clear API key on window unload
 */
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    const mode = getStorageMode();
    if (mode === "memory") {
      clearApiKey();
    }
  });

  // Periodic inactivity check
  setInterval(checkInactivity, 60 * 1000); // Check every minute
}
